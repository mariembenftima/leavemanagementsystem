import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Req,
  UseGuards,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
  UnauthorizedException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ProfileService } from './profile.service';
import {
  AuthenticatedRequest,
  AuthenticatedUser,
} from '../auth/types/authenticated-request';
import { EmployeeProfile } from './entities/employee-profile.entity';
import { Performance } from './entities/performance.entity';
import { User } from '../users/entities/users.entity';
import { LeaveBalancesService } from '../leave-balances/leave-balances.service';
import { CreateProfileDto } from './types/dtos/create-profile.dto';
import { UserRole } from '../users/types/enums/user-role.enum';
import { TeamEntity } from '../teams/entities/team.entity';
import { UsersService } from '../users/users.service';

interface LeaveBalanceItem {
  total: number;
  used: number;
  remaining: number;
}

interface LeaveBalanceRecord {
  [key: string]: LeaveBalanceItem;
}

interface PartialProfile {
  department?: string;
  designation?: string;
  joinDate?: Date | string;
  employeeId?: string;
  gender?: string;
  phone?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  address?: string;
  user?: {
    fullname?: string;
    email?: string;
  };
}

@ApiTags('profile')
@Controller('profile')
export class ProfileController {
  constructor(
    private readonly leaveBalancesService: LeaveBalancesService,
    private readonly profileService: ProfileService,
    private readonly usersService: UsersService,
  ) {}

  private toUserEntity(authenticatedUser: {
    userId: string;
    email: string;
    roles: string[];
  }): User {
    if (!authenticatedUser.userId) {
      throw new UnauthorizedException('User ID is required');
    }

    // Create a partial User object for authentication purposes
    const user: User = {
      id: authenticatedUser.userId,
      email: authenticatedUser.email,
      roles: authenticatedUser.roles,
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
      profile: null as unknown as EmployeeProfile,
    };

    return user;
  }

  private formatDate(date: Date): string {
    if (!date) return '';

    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  private getTimeAgo(date: Date): string {
    if (!date) return '';

    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return `${diffInSeconds} seconds ago`;

    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} hours ago`;

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 30) return `${diffInDays} days ago`;

    const diffInMonths = Math.floor(diffInDays / 30);
    if (diffInMonths < 12) return `${diffInMonths} months ago`;

    const diffInYears = Math.floor(diffInMonths / 12);
    return `${diffInYears} years ago`;
  }

  private getActivityTitle(activityType: string): string {
    switch (activityType) {
      case 'leave_applied':
        return 'Leave Request Submitted';
      case 'leave_approved':
        return 'Leave Request Approved';
      case 'leave_rejected':
        return 'Leave Request Rejected';
      case 'leave_cancelled':
        return 'Leave Request Cancelled';
      case 'performance_review':
        return 'Performance Review';
      case 'promotion':
        return 'Promotion';
      case 'training':
        return 'Training';
      case 'workshop':
        return 'Workshop';
      default:
        return 'Activity';
    }
  }

  @Get('dashboard')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get dashboard data for the current user' })
  @ApiResponse({
    status: 200,
    description: 'Dashboard data retrieved successfully',
  })
  async getDashboardData(@Req() req: AuthenticatedRequest) {
    const user = req.user;
    if (!user) {
      throw new UnauthorizedException('Missing user in JWT payload');
    }

    console.log('🔍 Dashboard request for user:', user);

    let profileData: EmployeeProfile | PartialProfile | null = null;
    let leaveBalance: LeaveBalanceRecord = {};
    let performance: Performance | null = null;

    try {
      // ✅ Use ProfileService.getFullProfile() which returns simplified activities
      const fullProfileData = await this.profileService.getFullProfile(
        user.userId,
        this.toUserEntity(user),
      );

      profileData = fullProfileData.profile;
      performance = fullProfileData.performance || null;

      // ✅ Get leave balance
      const rawLeaveBalance = await this.leaveBalancesService.findByUserId(
        user.userId,
      );
      leaveBalance = rawLeaveBalance || {};

      // ✅ Transform simplified activities for the dashboard
      // Service returns: { id, type, description, date, createdAt }
      // Dashboard needs: { title, description, date }
      const recentActivities = fullProfileData.recentActivities || [];

      const dashboardData = {
        user: {
          name: this.getFullname(profileData, user),
          email: this.getEmail(profileData, user),
          role:
            Array.isArray(user.roles) && user.roles.length > 0
              ? user.roles[0]
              : 'Employee',
          department: profileData?.department || 'Information Technology',
        },
        employeeInfo: {
          department: profileData?.department || 'Information Technology',
          designation: profileData?.designation || 'Software Developer',
          joinDate: profileData?.joinDate
            ? typeof profileData.joinDate === 'string'
              ? profileData.joinDate
              : profileData.joinDate.toISOString().split('T')[0]
            : '2023-01-15',
          employeeId: profileData?.employeeId || `EMP${user.userId}`,
          workExperience: this.getWorkExperience(profileData),
          gender: profileData?.gender || 'Not specified',
        },
        contactInfo: {
          email: this.getEmail(profileData, user),
          phone: profileData?.phone || '+1234567890',
          emergencyContact:
            profileData &&
            'emergencyContactName' in profileData &&
            'emergencyContactPhone' in profileData
              ? `${profileData.emergencyContactName || 'N/A'} - ${profileData.emergencyContactPhone || 'N/A'}`
              : 'Jane Doe - +1234567891',
          address: profileData?.address || '123 Main St, City, State',
        },
        performance: performance || {
          attendanceRate: 95,
          performanceScore: 4.5,
          activeProjects: 3,
        },
        leaveBalance,
        recentActivities: recentActivities.length
          ? recentActivities.map((activity) => ({
              title: this.getActivityTitle(activity.type),
              description: activity.description || '',
              date: this.formatDate(new Date(activity.date)),
            }))
          : [
              {
                title: 'Login',
                description: 'Logged into system',
                date: new Date().toISOString(),
              },
              {
                title: 'Profile Update',
                description: 'Updated profile information',
                date: new Date(Date.now() - 86400000).toISOString(),
              },
              {
                title: 'Leave Request',
                description: 'Submitted annual leave request',
                date: new Date(Date.now() - 172800000).toISOString(),
              },
            ],
      };

      return dashboardData;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      console.warn(
        '⚠️ Failed to fetch profile/leave/performance:',
        errorMessage,
      );

      // Fallback data
      return {
        user: {
          name: user.email || 'Current User',
          email: user.email || 'user@company.com',
          role:
            Array.isArray(user.roles) && user.roles.length > 0
              ? user.roles[0]
              : 'Employee',
          department: 'Information Technology',
        },
        employeeInfo: {
          department: 'Information Technology',
          designation: 'Software Developer',
          joinDate: '2023-01-15',
          employeeId: `EMP${user.userId}`,
          workExperience: '2 years',
          gender: 'Not specified',
        },
        contactInfo: {
          email: user.email || 'user@company.com',
          phone: '+1234567890',
          emergencyContact: 'Jane Doe - +1234567891',
          address: '123 Main St, City, State',
        },
        performance: {
          attendanceRate: 95,
          performanceScore: 4.5,
          activeProjects: 3,
        },
        leaveBalance: {
          annual: { total: 25, used: 5, remaining: 20 },
          sick: { total: 12, used: 2, remaining: 10 },
          personal: { total: 15, used: 1, remaining: 14 },
        },
        recentActivities: [
          {
            title: 'Login',
            description: 'Logged into system',
            date: new Date().toISOString(),
          },
        ],
      };
    }
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({
    status: 200,
    description: 'Profile retrieved successfully',
  })
  async getMyProfile(@Req() req: AuthenticatedRequest) {
    const user = req.user;
    if (!user || !user.userId) {
      throw new UnauthorizedException('Invalid user token');
    }

    console.log('🔍 Fetching profile for user:', user.userId);

    try {
      // ✅ Get user data from database (email, roles, phone)
      const userData = await this.usersService.getUserById(user.userId);

      // Get profile data (department, position, etc.)
      const profileData = await this.profileService.getProfile(
        user.userId,
        this.toUserEntity(user),
      );

      console.log('✅ User:', userData.email, 'Roles:', userData.roles);

      // ✅ Combine user data + profile data
      const combinedProfile = {
        // User data from database (CRITICAL - provides email, roles, phone)
        userId: userData.id,
        email: userData.email,
        roles: userData.roles,
        fullname: userData.fullname,
        phone: userData.phoneNumber || 'Not Set',
        avatarUrl: userData.profilePictureUrl || null,
        isActive: userData.isActive,

        // Profile data from employee_profiles table
        department: profileData?.department || 'Not Set',
        position: profileData?.designation || 'Not Set',
        hireDate: profileData?.joinDate || userData.createdAt || null,
        gender: profileData?.gender || 'Not Set',
        nationality: profileData?.nationality || 'Not Set',
        maritalStatus: profileData?.maritalStatus || 'Not Set',
        emergencyContactPhone: profileData?.emergencyContactPhone || 'Not Set',
        emergencyContactName: profileData?.emergencyContactName || 'Not Set',
        address: profileData?.address || 'Not Set',

        // Additional fields
        employeeId: profileData?.employeeId || `EMP-${userData.id.slice(0, 8)}`,
        yearsOfService: profileData?.yearsOfService || 0,
        dateOfBirth: profileData?.dateOfBirth || null,
      };

      console.log('✅ Combined profile returned');

      return {
        success: true,
        data: combinedProfile,
        message: 'Profile retrieved successfully',
      };
    } catch (error) {
      console.error('❌ Error fetching profile:', error);
      throw error;
    }
  }

  @Get(':userId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get a profile by user ID (admin/HR)' })
  @ApiResponse({
    status: 200,
    description: 'Profile retrieved successfully',
  })
  getProfileById(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Req() req: AuthenticatedRequest,
  ) {
    const requester = req.user;
    if (!requester) {
      throw new UnauthorizedException('User not found in request');
    }

    return this.profileService.getProfile(userId, this.toUserEntity(requester));
  }

  @Post(':userId/employee-profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create employee profile for a user' })
  @ApiResponse({
    status: 201,
    description: 'Employee profile created successfully',
  })
  createEmployeeProfile(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Body() createProfileDto: CreateProfileDto,
    @Req() req: AuthenticatedRequest,
  ) {
    const requester = req.user;

    if (
      !requester ||
      (!requester.roles.includes(UserRole.ADMIN) &&
        !requester.roles.includes(UserRole.MANAGER))
    ) {
      throw new UnauthorizedException('Only HR can create profiles');
    }

    return this.profileService.createProfile(
      userId,
      createProfileDto,
      this.toUserEntity(requester),
    );
  }

  // ========================================
  // PRIVATE HELPER METHODS
  // ========================================

  private getFullname(
    profileData: EmployeeProfile | PartialProfile | null,
    user: AuthenticatedUser,
  ): string {
    if (profileData && 'user' in profileData && profileData.user?.fullname) {
      return profileData.user.fullname;
    }
    return user.email || 'Current User';
  }

  private getEmail(
    profileData: EmployeeProfile | PartialProfile | null,
    user: AuthenticatedUser,
  ): string {
    if (profileData && 'user' in profileData && profileData.user?.email) {
      return profileData.user.email;
    }
    return user.email || 'user@company.com';
  }

  private getWorkExperience(
    profileData: EmployeeProfile | PartialProfile | null,
  ): string {
    if (!profileData) {
      return '2 years';
    }

    if (
      'yearsOfService' in profileData &&
      typeof profileData.yearsOfService === 'number'
    ) {
      return `${profileData.yearsOfService} years`;
    }

    return '2 years';
  }
}
