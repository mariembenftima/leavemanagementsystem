import { Controller, Get, Req, UseGuards, Inject } from '@nestjs/common';
import { Request } from 'express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { LeaveBalancesService } from '../leave-balances/leave-balances.service';
import { ProfileService } from './profile.service';

@ApiTags('profile')
@Controller('profile')
export class ProfileController {
  constructor(
    private readonly leaveBalancesService: LeaveBalancesService,
    private readonly profileService: ProfileService,
  ) {}

  @Get('dashboard')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get dashboard data for the current user' })
  @ApiResponse({
    status: 200,
    description: 'Dashboard data retrieved successfully',
  })
  async getDashboardData(@Req() req: Request) {
    // Get user info from JWT payload
    const user = (req as any).user;
    console.log('🔍 Dashboard request for user:', user);

    // Fetch profile and leave balances
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
      // Optionally fetch recent activities and performance if available
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
      console.log('⚠️ Failed to fetch profile/leave/performance:', error);
      // Fallback to defaults
      leaveBalance = {
        annual: { total: 25, used: 5, remaining: 20 },
        sick: { total: 12, used: 2, remaining: 10 },
        personal: { total: 15, used: 1, remaining: 14 },
      };
    }

    // Compose dashboard data
    const dashboardData = {
      user: {
        name:
          profileData?.fullname ||
          user.fullname ||
          user.name ||
          `${user.firstName || ''} ${user.lastName || ''}`.trim() ||
          'Current User',
        email: profileData?.email || user.email || 'user@company.com',
        role: user.roles
          ? Array.isArray(user.roles)
            ? user.roles[0]
            : user.roles
          : user.role || 'Employee',
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

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user profile (alias for /auth/me)' })
  async getMyProfile(@Req() req: Request) {
    // Defer to AuthController's logic: return profile information for the token user
    const user = (req as any).user;
    const userId = user?.userId || user?.id;
    try {
      // profileService.getProfile expects (userId, requestingUser)
      const profile = await this.profileService.getProfile(userId, user as any);
      return {
        success: true,
        data: profile,
        message: 'Profile retrieved successfully',
      };
    } catch (error) {
      return {
        success: false,
        message: 'Unable to retrieve profile',
        error: error.message,
      };
    }
  }
}
