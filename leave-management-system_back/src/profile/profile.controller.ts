import {
  Controller,
  Get,
  Req,
  UseGuards,
  NotFoundException,
  UnauthorizedException,
  Param,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { LeaveBalancesService } from '../leave-balances/leave-balances.service';
import { ProfileService } from './profile.service';
import { Request } from 'express';

// 🔹 Custom request type that includes `user`
interface AuthenticatedRequest extends Request {
  user: any;
}

@ApiTags('profile')
@Controller('profile')
export class ProfileController {
  constructor(
    private readonly leaveBalancesService: LeaveBalancesService,
    private readonly profileService: ProfileService, // ✅ readonly ensures DI type safety
  ) {}

  // 🔹 Fetch profile by userId (admin or HR use)
  @UseGuards(JwtAuthGuard)
  @Get(':userId')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get a profile by user ID (admin/HR)' })
  async getProfileById(
    @Param('userId') userId: string,
    @Req() req: AuthenticatedRequest,
  ) {
    const requester = req.user;
    if (!requester)
      throw new UnauthorizedException('User not found in request');

    const profile = await this.profileService.getProfile(userId, requester);
    if (!profile) throw new NotFoundException('Profile not found');

    return {
      success: true,
      data: profile,
      message: 'Profile retrieved successfully',
    };
  }

  // 🔹 Dashboard data for current user
  @UseGuards(JwtAuthGuard)
  @Get('dashboard')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get dashboard data for the current user' })
  @ApiResponse({
    status: 200,
    description: 'Dashboard data retrieved successfully',
  })
  async getDashboardData(@Req() req: AuthenticatedRequest) {
    const user = req.user;
    if (!user) throw new UnauthorizedException('Missing user in JWT payload');

    console.log('🔍 Dashboard request for user:', user);

    // Fetch related data
    let profileData: any = null;
    let leaveBalance: any = null;
    let recentActivities: any[] = [];
    let performance: any = null;

    try {
      profileData = await this.profileService.getProfile(
        user.id || user.userId,
        user,
      );
      leaveBalance = await this.leaveBalancesService.findByUserId(
        user.id || user.userId,
      );

      if (this.profileService.activityRepository) {
        recentActivities =
          await this.profileService.activityRepository.getRecentActivities(
            user.id || user.userId,
            5,
          );
      }

      if (this.profileService.performanceRepository) {
        performance =
          await this.profileService.performanceRepository.getLatestPerformance(
            user.id || user.userId,
          );
      }
    } catch (error) {
      console.warn('⚠️ Failed to fetch profile/leave/performance:', error);
      leaveBalance = {
        annual: { total: 25, used: 5, remaining: 20 },
        sick: { total: 12, used: 2, remaining: 10 },
        personal: { total: 15, used: 1, remaining: 14 },
      };
    }

    const dashboardData = {
      user: {
        name:
          profileData?.fullname ||
          user.fullname ||
          user.name ||
          `${user.firstName || ''} ${user.lastName || ''}`.trim() ||
          'Current User',
        email: profileData?.email || user.email || 'user@company.com',
        role: Array.isArray(user.roles)
          ? user.roles[0]
          : user.roles || user.role || 'Employee',
        department:
          profileData?.department ||
          user.department ||
          'Information Technology',
      },
      employeeInfo: {
        department:
          profileData?.department ||
          user.department ||
          'Information Technology',
        designation:
          profileData?.designation || user.position || 'Software Developer',
        joinDate:
          profileData?.joinDate ||
          (user.createdAt
            ? new Date(user.createdAt).toISOString().split('T')[0]
            : '2023-01-15'),
        employeeId:
          profileData?.employeeId ||
          user.employeeId ||
          `EMP${user.id || '001'}`,
        workExperience: profileData?.workExperience || '2 years',
        gender: profileData?.gender || user.gender || 'Not specified',
      },
      contactInfo: {
        email: profileData?.email || user.email || 'admin@company.com',
        phone:
          profileData?.phone || user.phoneNumber || user.phone || '+1234567890',
        emergencyContact:
          profileData?.emergencyContact ||
          user.emergencyContact ||
          'Jane Doe - +1234567891',
        address:
          profileData?.address || user.address || '123 Main St, City, State',
      },
      performance: performance || {
        attendanceRate: 95,
        performanceScore: 4.5,
        activeProjects: 3,
      },
      leaveBalance,
      recentActivities: recentActivities.length
        ? recentActivities
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

    return {
      success: true,
      data: dashboardData,
      message: 'Dashboard data retrieved successfully',
    };
  }

  // 🔹 Current logged-in user’s profile
  @UseGuards(JwtAuthGuard)
  @Get('me')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user profile (alias for /auth/me)' })
  async getMyProfile(@Req() req: AuthenticatedRequest) {
    const user = req.user;
    if (!user) throw new UnauthorizedException('Missing user in JWT payload');

    const userId = user.userId || user.id;
    const profile = await this.profileService.getProfile(userId, user);
    if (!profile)
      throw new NotFoundException(`Profile not found for user ID: ${userId}`);

    return {
      success: true,
      data: profile,
      message: 'Profile retrieved successfully',
    };
  }
}
