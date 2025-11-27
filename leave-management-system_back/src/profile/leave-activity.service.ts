import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Activity } from './entities/activity.entity';
import { EmployeeProfile } from './entities/employee-profile.entity';
import { LeaveRequest } from '../leave-requests/entities/leave-request.entity';
import { User } from '../users/entities/users.entity';
import { ActivityType } from './types/enums/activity-type.enum';

@Injectable()
export class LeaveActivityService {
  constructor(
    @InjectRepository(Activity)
    private activityRepository: Repository<Activity>,

    @InjectRepository(EmployeeProfile)
    private profileRepository: Repository<EmployeeProfile>,
  ) {}

  /**
   * Get profile ID for a user
   * Helper method to fetch profile before creating activities
   */
  private async getProfileId(userId: string): Promise<number> {
    const profile = await this.profileRepository.findOne({
      where: { user: { id: userId } },
    });

    if (!profile) {
      throw new Error(`Profile not found for user ID: ${userId}`);
    }

    return profile.id;
  }

  /**
   * Create activity when leave is applied
   */
  async createLeaveAppliedActivity(
    leaveRequest: LeaveRequest,
    user: User,
  ): Promise<void> {
    const profileId = await this.getProfileId(user.id);

    // ✅ Direct TypeORM create + save
    const activity = this.activityRepository.create({
      profile: { id: profileId },
      activityType: ActivityType.LEAVE_APPLIED,
      description: `${user.fullname} requested leave from ${this.formatDate(leaveRequest.startDate)} to ${this.formatDate(leaveRequest.endDate)}.`,
      activityDate: new Date(),
    });

    await this.activityRepository.save(activity);
  }

  /**
   * Create activity when leave is approved
   */
  async createLeaveApprovedActivity(
    leaveRequest: LeaveRequest,
    approverName: string,
  ): Promise<void> {
    const profileId = await this.getProfileId(leaveRequest.user.id);

    // ✅ Direct TypeORM create + save
    const activity = this.activityRepository.create({
      profile: { id: profileId },
      activityType: ActivityType.LEAVE_APPROVED,
      description: `${approverName} approved leave request from ${this.formatDate(leaveRequest.startDate)} to ${this.formatDate(leaveRequest.endDate)}.`,
      activityDate: new Date(),
    });

    await this.activityRepository.save(activity);
  }

  /**
   * Create activity when leave is rejected
   */
  async createLeaveRejectedActivity(
    leaveRequest: LeaveRequest,
    rejectorName: string,
  ): Promise<void> {
    const profileId = await this.getProfileId(leaveRequest.user.id);

    // ✅ Direct TypeORM create + save
    const activity = this.activityRepository.create({
      profile: { id: profileId },
      activityType: ActivityType.LEAVE_REJECTED,
      description: `${rejectorName} rejected leave request from ${this.formatDate(leaveRequest.startDate)} to ${this.formatDate(leaveRequest.endDate)}. Reason: ${leaveRequest.rejectionReason || 'No reason provided'}`,
      activityDate: new Date(),
    });

    await this.activityRepository.save(activity);
  }

  /**
   * Create activity when leave is cancelled
   */
  async createLeaveCancelledActivity(
    leaveRequest: LeaveRequest,
    cancelerName: string,
  ): Promise<void> {
    const profileId = await this.getProfileId(leaveRequest.user.id);

    // ✅ Direct TypeORM create + save
    const activity = this.activityRepository.create({
      profile: { id: profileId },
      activityType: ActivityType.LEAVE_CANCELLED,
      description: `${cancelerName} cancelled leave request from ${this.formatDate(leaveRequest.startDate)} to ${this.formatDate(leaveRequest.endDate)}.`,
      activityDate: new Date(),
    });

    await this.activityRepository.save(activity);
  }

  /**
   * Format date helper
   */
  private formatDate(date: Date): string {
    if (!date) return 'Unknown';

    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }
}
