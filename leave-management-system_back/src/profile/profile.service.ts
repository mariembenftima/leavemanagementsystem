import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { ProfileRepository } from './repositories/profile.repository';
import { PerformanceRepository } from './repositories/performance.repository';
import { ActivityRepository } from './repositories/activity.repository';
import { CreateProfileDto } from './types/dtos/create-profile.dto';
import { UpdateProfileDto } from './types/dtos/update-profile.dto';
import { PerformanceUpdateDto } from './types/dtos/performance-update.dto';
import { User } from '../users/entities/users.entity';
import { UserRole } from '../users/types/enums/user-role.enum';
import { ActivityType } from './types/enums/activity-type.enum';
import { ActivityDao } from './types/daos/activity.dao';

@Injectable()
export class ProfileService {
  constructor(
    private profileRepository: ProfileRepository,
    public performanceRepository: PerformanceRepository,
    public activityRepository: ActivityRepository,
  ) {}

  async createProfile(
    userId: string,
    createProfileDto: CreateProfileDto,
    createdBy: User,
  ) {
    if (!createdBy.roles?.includes(UserRole.HR)) {
      throw new ForbiddenException('Only HR can create employee profiles');
    }

    const existingProfile = await this.profileRepository.findByEmployeeId(
      createProfileDto.employeeId,
    );
    if (existingProfile) {
      throw new ForbiddenException('Employee ID already exists');
    }

    const profile = await this.profileRepository.createProfile(
      userId,
      createProfileDto,
    );

    const profileId = profile.id;

    await this.activityRepository.createActivity({
      profileId: profileId,
      activityType: ActivityType.PROMOTION,
      description: `Joined as ${createProfileDto.designation} in ${createProfileDto.department} department`,
    });

    return profile;
  }

  async getProfile(userId: string, requestingUser: User) {
    const profile = await this.profileRepository.findByUserId(userId);
    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    if (!this.canAccessProfile(userId, requestingUser)) {
      throw new ForbiddenException('Access denied');
    }

    return profile;
  }

  async getFullProfile(userId: string, requestingUser: User) {
    const profile = await this.getProfile(userId, requestingUser);
    const profileId = profile.id;

    const [performance, activityEntities, leaveBalance] = await Promise.all([
      this.performanceRepository.getLatestPerformance(userId),
      this.activityRepository.getRecentActivities(profileId, 5), // Use profileId (number)
      this.getLeaveBalanceOverview(userId),
    ]);

    const recentActivities = activityEntities.map((activity) => {
      return new ActivityDao({
        id: activity.id,
        userId: profile.user?.id || userId,
        type: activity.activityType as unknown as ActivityType,
        description: activity.description || '',
        createdAt: activity.activityDate || activity.createdAt,
        displayDate: this.formatDate(
          activity.activityDate || activity.createdAt,
        ),
      });
    });

    return {
      profile,
      performance,
      recentActivities: recentActivities.map((activity) =>
        activity.toSummary(),
      ),
      leaveBalance,
    };
  }

  private formatDate(date: Date): string {
    if (!date) return '';

    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  async updateProfile(
    userId: string,
    updateData: UpdateProfileDto,
    updatedBy: User,
  ) {
    if (
      updatedBy.roles?.includes(UserRole.EMPLOYEE) &&
      String(updatedBy.id) !== String(userId)
    ) {
      throw new ForbiddenException('You can only update your own profile');
    }

    const profile = await this.profileRepository.updateProfile(
      userId,
      updateData,
    );

    const profileId = profile.id;

    await this.activityRepository.createActivity({
      profileId: profileId,
      activityType: ActivityType.TRAINING,
      description: 'Employee profile information was updated',
    });

    return profile;
  }

  async updatePerformance(
    userId: string,
    performanceDto: PerformanceUpdateDto,
    reviewerId: number,
  ) {
    const performance = await this.performanceRepository.createPerformance({
      userId,
      ...performanceDto,
      reviewerId,
      reviewDate: new Date(performanceDto.reviewDate),
    });

    const profile = await this.profileRepository.findByUserId(userId);
    if (!profile) {
      throw new NotFoundException(`Profile not found for user ${userId}`);
    }

    await this.activityRepository.createActivity({
      profileId: profile.id,
      activityType: ActivityType.PERFORMANCE_REVIEW,
      description: `Completed performance review. Performance score: ${performanceDto.performanceScore}/5.0`,
    });

    return performance;
  }

  private canAccessProfile(userId: string, requestingUser: User): boolean {
    // Users can access their own profiles
    if (String(requestingUser.id) === String(userId)) {
      return true;
    }

    // HR, Managers, and Admins can access any profile
    if (
      requestingUser.roles?.includes(UserRole.HR) ||
      requestingUser.roles?.includes(UserRole.MANAGER) ||
      requestingUser.roles?.includes(UserRole.ADMIN)
    ) {
      return true;
    }

    return false;
  }

  private async getUsedLeaves(
    userId: string,
    leaveType: string,
  ): Promise<number> {
    const currentYear = new Date().getFullYear();

    console.log(
      `Calculating used ${leaveType} leave for user ${userId} in year ${currentYear}`,
    );

    // For example, you might do something like this:
    // return this.leaveRequestRepository.count({
    //   where: {
    //     user: { id: userId },
    //     leaveType: { name: leaveType },
    //     status: 'APPROVED',
    //     startDate: Between(
    //       new Date(currentYear, 0, 1),
    //       new Date(currentYear, 11, 31)
    //     )
    //   }
    // });

    // For now, return a placeholder value
    return 0;
  }

  async getLeaveBalanceOverview(userId: string) {
    const profile = await this.profileRepository.findByUserId(userId);
    if (!profile) return null;

    return {
      annual: {
        total: 25,
        used: await this.getUsedLeaves(userId, 'annual'),
        remaining: 25 - (await this.getUsedLeaves(userId, 'annual')),
      },
      sick: {
        total: 12,
        used: await this.getUsedLeaves(userId, 'sick'),
        remaining: 12 - (await this.getUsedLeaves(userId, 'sick')),
      },
      personal: {
        total: 5,
        used: await this.getUsedLeaves(userId, 'personal'),
        remaining: 5 - (await this.getUsedLeaves(userId, 'personal')),
      },
    };
  }

  async getDashboardData(userId: string) {
    const profile = await this.profileRepository.findByUserId(userId);
    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    const rawActivities = await this.activityRepository.getRecentActivities(
      profile.id,
      5,
    );

    const activityDaos = rawActivities.map((activity) => {
      return new ActivityDao({
        id: activity.id,
        userId: profile.user?.id || userId,
        type: activity.activityType as unknown as ActivityType,
        description: activity.description || '',
        createdAt: activity.activityDate || activity.createdAt,
      });
    });

    return {
      profile: {
        name: profile.fullname,
        employeeId: profile.employeeId,
        department: profile.department,
        designation: profile.designation,
        joinDate: profile.joinDate,
      },
      recentActivities: activityDaos.map((activity) => activity.toSummary()),
      leaveBalance: await this.getLeaveBalanceOverview(userId),
    };
  }
}
