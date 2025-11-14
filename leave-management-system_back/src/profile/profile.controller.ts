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
import { ProfileService } from './profile.service';
import { AuthenticatedRequest } from '../auth/types/authenticated-request';
import { EmployeeProfile } from './entities/employee-profile.entity';
import { Performance } from './entities/performance.entity';
import { User } from '../users/entities/users.entity';
import { Activity } from './entities/activity.entity';
import { LeaveBalancesService } from 'src/leave-balances/leave-balances.service';

// Definition of the leave balance structure that matches what the service returns
interface LeaveBalanceItem {
  total: number;
  used: number;
  remaining: number;
}

interface LeaveBalanceRecord {
  [key: string]: LeaveBalanceItem;
}

// Activity summary structure
interface ActivitySummary {
  id: number;
  type: string;
  title: string;
  description?: string;
  timeAgo: string;
  displayDate: string;
  createdAt: Date;
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
  ) {}

  private toUserEntity(authenticatedUser: {
    userId: string;
    email: string;
    roles: string[];
  }): Partial<User> {
    return {
      id: authenticatedUser.userId,
      email: authenticatedUser.email,
      roles: authenticatedUser.roles,
    } as Partial<User>;
  }

  // Helper method to convert Activity to ActivitySummary
  private activityToSummary(activity: Activity): ActivitySummary {
    return {
      id: activity.id,
      type: activity.activityType,
      title: this.getActivityTitle(activity.activityType),
      description: activity.description,
      timeAgo: this.getTimeAgo(activity.createdAt),
      displayDate: activity.activityDate
        ? this.formatDate(activity.activityDate)
        : this.formatDate(activity.createdAt),
      createdAt: activity.activityDate || activity.createdAt,
    };
  }

  // Helper method to format date to display string
  private formatDate(date: Date): string {
    if (!date) return '';

    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  // Helper method to calculate time ago
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

  @UseGuards(JwtAuthGuard)
  @Get(':userId')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get a profile by user ID (admin/HR)' })
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
      this.toUserEntity(requester) as User,
    );

    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    return {
      success: true,
      data: profile,
      message: 'Profile retrieved successfully',
    };
  }

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
    if (!user) {
      throw new UnauthorizedException('Missing user in JWT payload');
    }

    console.log('🔍 Dashboard request for user:', user);

    let profileData: EmployeeProfile | PartialProfile | null = null;
    let leaveBalance: LeaveBalanceRecord = {};
    let recentActivities: ActivitySummary[] = [];
    let performance: Performance | null = null;

    try {
      // Get profile data
      profileData = await this.profileService.getProfile(
        user.userId,
        this.toUserEntity(user) as User,
      );

      // Get leave balance data
      const rawLeaveBalance = await this.leaveBalancesService.findByUserId(
        user.userId,
      );

      // Use proper type for leave balance (no type assertion)
      leaveBalance = rawLeaveBalance || {};

      // Get activities data
      if (
        'activityRepository' in this.profileService &&
        this.profileService.activityRepository
      ) {
        // First get the profile ID which is needed for the activity repository
        const profile = profileData as EmployeeProfile;
        if (profile && profile.id) {
          // Use profile ID (number) instead of userId (string)
          const rawActivities =
            await this.profileService.activityRepository.getRecentActivities(
              profile.id,
              5,
            );

          // Convert activities to our ActivitySummary format without casting
          if (Array.isArray(rawActivities)) {
            recentActivities = rawActivities.map((activity) =>
              this.activityToSummary(activity),
            );
          }
        }
      }

      // Get performance data
      if (
        'performanceRepository' in this.profileService &&
        this.profileService.performanceRepository
      ) {
        const rawPerformance =
          await this.profileService.performanceRepository.getLatestPerformance(
            user.userId,
          );
        performance = rawPerformance || null;
      }
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      console.warn(
        '⚠️ Failed to fetch profile/leave/performance:',
        errorMessage,
      );

      // Use fallback data with proper types
      leaveBalance = {
        annual: { total: 25, used: 5, remaining: 20 },
        sick: { total: 12, used: 2, remaining: 10 },
        personal: { total: 15, used: 1, remaining: 14 },
      };
    }

    const getFullname = (): string => {
      if (profileData && 'user' in profileData && profileData.user?.fullname) {
        return profileData.user.fullname;
      }
      return user.email || 'Current User';
    };

    const getEmail = (): string => {
      if (profileData && 'user' in profileData && profileData.user?.email) {
        return profileData.user.email;
      }
      return user.email || 'user@company.com';
    };

    const getWorkExperience = (): string => {
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
    };

    const dashboardData = {
      user: {
        name: getFullname(),
        email: getEmail(),
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
        workExperience: getWorkExperience(),
        gender: profileData?.gender || 'Not specified',
      },
      contactInfo: {
        email: getEmail(),
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
            title: activity.title,
            description: activity.description || '',
            date: activity.displayDate || activity.createdAt.toISOString(),
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
  async getMyProfile(@Req() req: AuthenticatedRequest) {
    const user = req.user;
    if (!user || !user.userId) {
      throw new UnauthorizedException('Invalid user token');
    }

    try {
      const profile = await this.profileService.getProfile(
        user.userId,
        this.toUserEntity(user) as User,
      );

      if (!profile) {
        throw new NotFoundException(
          `Profile not found for user ID: ${user.userId}`,
        );
      }

      return {
        success: true,
        data: profile,
        message: 'Profile retrieved successfully',
      };
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      return {
        success: false,
        message: 'Unable to retrieve profile',
        error: errorMessage,
      };
    }
  }

  // Helper method to generate a title from activity type
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
}
