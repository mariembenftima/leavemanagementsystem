import {
  Controller,
  Get,
  Req,
  UseGuards,
  NotFoundException,
  UnauthorizedException,
  Param,
  Post,
  Body,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../users/roleguard';
import { Roles } from '../users/roledecorator';

import { ProfileService } from './profile.service';
import { LeaveBalancesService } from 'src/leave-balances/leave-balances.service';
import { AuthenticatedRequest } from '../auth/types/authenticated-request';

import { CreateProfileDto } from './types/dtos/create-profile.dto';
import { UserRole } from 'src/users/types/enums/user-role.enum';

import { User } from '../users/entities/users.entity';
import { TeamEntity } from 'src/teams/entities/team.entity';
import { EmployeeProfile } from './entities/employee-profile.entity';
import { Activity } from './entities/activity.entity';

import {
  DashboardResponseDto,
  DashboardActivityDto,
} from './types/dtos/dashboard-response.dto';
import { plainToInstance } from 'class-transformer';
import { UserProfileResponseDto } from './types/dtos/user-profile-response.dto';

@ApiTags('profile')
@Controller('profile')
export class ProfileController {
  constructor(
    private readonly leaveBalancesService: LeaveBalancesService,
    private readonly profileService: ProfileService,
  ) {}

  // ===============================================================
  // DASHBOARD
  // ===============================================================

  @Get('dashboard')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get dashboard data for the current user' })
  @ApiResponse({ status: 200, type: DashboardResponseDto })
  async getDashboardData(
    @Req() req: AuthenticatedRequest,
  ): Promise<DashboardResponseDto> {
    const user = req.user;
    if (!user?.userId) {
      throw new UnauthorizedException('Missing user in JWT payload');
    }

    const userEntity = this.toUserEntity(user);

    const [profileData, leaveBalance, performance] = await Promise.all([
      this.profileService.getProfile(user.userId, userEntity).catch(() => null),
      this.leaveBalancesService.findByUserId(user.userId).catch(() => ({})),
      this.profileService.performanceRepository
        ?.getLatestPerformance(user.userId)
        .catch(() => null),
    ]);

    let recentActivities: DashboardActivityDto[] = [];

    if (profileData?.id) {
      const rawActivities: Activity[] =
        await this.profileService.activityRepository
          ?.getRecentActivities(profileData.id, 5)
          .catch((): Activity[] => []);

      recentActivities = rawActivities.map((activity: Activity) => ({
        title: this.getActivityTitle(activity.activityType),
        description: activity.description ?? '',
        date: this.formatDate(activity.activityDate ?? activity.createdAt),
      }));
    }

    return this.buildDashboardResponse({
      user,
      profileData,
      leaveBalance,
      performance,
      recentActivities,
    });
  }

  // ===============================================================
  // GET CURRENT USER PROFILE
  // ===============================================================

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user profile' })
  async getMyProfile(@Req() req: AuthenticatedRequest) {
    const user = req.user;

    if (!user?.userId) {
      throw new UnauthorizedException('Invalid user token');
    }

    const profile = await this.profileService.getProfile(
      user.userId,
      this.toUserEntity(user),
    );

    if (!profile) {
      throw new NotFoundException(
        `Profile not found for user ID: ${user.userId}`,
      );
    }

    return profile;
  }

  // ===============================================================
  // ADMIN / HR GET PROFILE BY ID
  // ===============================================================

  @Get(':userId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.HR)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get a profile by user ID (Admin/HR only)' })
  async getProfileById(
    @Param('userId') userId: string,
    @Req() req: AuthenticatedRequest,
  ) {
    const requester = req.user;

    if (!requester) {
      throw new UnauthorizedException('User not found in request');
    }

    const profile = await this.profileService.getProfile(
      userId,
      this.toUserEntity(requester),
    );

    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    return profile;
  }

  // ===============================================================
  // CREATE EMPLOYEE PROFILE (HR ONLY)
  // ===============================================================

  @Post(':userId/employee-profile')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.HR)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create employee profile for a user (HR only)' })
  async createEmployeeProfile(
    @Param('userId') userId: string,
    @Body() dto: CreateProfileDto,
    @Req() req: AuthenticatedRequest,
  ) {
    const requester = req.user;

    if (!requester) {
      throw new UnauthorizedException('User not found in request');
    }

    return this.profileService.createProfile(
      userId,
      dto,
      this.toUserEntity(requester),
    );
  }

  // ===============================================================
  // PRIVATE HELPERS
  // ===============================================================

  private toUserEntity(auth: {
    userId: string;
    email: string;
    roles: string[];
  }): User {
    if (!auth.userId) {
      throw new UnauthorizedException('User ID is required');
    }

    return {
      id: auth.userId,
      email: auth.email,
      roles: auth.roles,
      username: '',
      fullname: '',
      phoneNumber: '',
      password: '',
      isActive: false,
      teamId: 0,
      team: new TeamEntity(),
      createdAt: new Date(),
      updatedAt: new Date(),
      leaveBalances: [],
    } as User;
  }

  private buildDashboardResponse(data: {
    user: { userId: string; email: string; roles: string[] };
    profileData: EmployeeProfile | null;
    leaveBalance: Record<string, any>;
    performance: Performance;
    recentActivities: DashboardActivityDto[];
  }): DashboardResponseDto {
    const { user, profileData, leaveBalance, performance, recentActivities } =
      data;

    return {
      user: plainToInstance(UserProfileResponseDto, profileData?.user, {
        excludeExtraneousValues: true,
      }),

      employeeInfo: {
        department: profileData?.department ?? 'N/A',
        designation: profileData?.designation ?? 'N/A',
        joinDate: this.formatJoinDate(profileData?.joinDate),
        employeeId: profileData?.employeeId ?? '',
        workExperience: this.calculateWorkExperience(profileData?.joinDate),
        gender: profileData?.gender ?? 'Not specified',
      },

      contactInfo: {
        email: profileData?.user?.email ?? user.email,
        phone: profileData?.phone ?? '',
        emergencyContact: this.formatEmergencyContact(profileData),
        address: profileData?.address ?? '',
      },

      performance: performance ?? {
        attendanceRate: 95,
        performanceScore: 4.5,
        activeProjects: 3,
        reviewDate: new Date().toISOString(),
      },

      leaveBalance,
      recentActivities,
    };
  }

  private formatJoinDate(joinDate?: string | Date): string {
    if (!joinDate) return '2023-01-15';
    if (typeof joinDate === 'string') return joinDate;
    return joinDate.toISOString().split('T')[0];
  }

  private calculateWorkExperience(joinDate?: string | Date): string {
    if (!joinDate) return '2 years';

    const join = new Date(joinDate);
    const now = new Date();
    const years = now.getFullYear() - join.getFullYear();

    return years > 0 ? `${years} years` : 'Less than 1 year';
  }

  private formatEmergencyContact(profile?: EmployeeProfile | null): string {
    if (!profile) return 'N/A';
    return `${profile.emergencyContactName ?? 'N/A'} - ${profile.emergencyContactPhone ?? 'N/A'}`;
  }

  private formatDate(date: Date | undefined): string {
    if (!date) return '';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  private getActivityTitle(type: string): string {
    const titles: Record<string, string> = {
      leave_applied: 'Leave Request Submitted',
      leave_approved: 'Leave Request Approved',
      leave_rejected: 'Leave Request Rejected',
      leave_cancelled: 'Leave Request Cancelled',
      performance_review: 'Performance Review',
      promotion: 'Promotion',
      training: 'Training',
      workshop: 'Workshop',
    };
    return titles[type] || 'Activity';
  }
}
