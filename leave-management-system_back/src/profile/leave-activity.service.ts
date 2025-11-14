import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ActivityRepository } from './repositories/activity.repository';
import { EmployeeProfile } from './entities/employee-profile.entity';
import { LeaveRequest } from 'src/leave-requests/entities/leave-request.entity';
import { User } from 'src/users/entities/users.entity';
import { ActivityType } from './types/enums/activity-type.enum';

@Injectable()
export class LeaveActivityService {
  constructor(
    private readonly activityRepository: ActivityRepository,
    @InjectRepository(EmployeeProfile)
    private readonly profileRepository: Repository<EmployeeProfile>,
  ) {}

  private async getProfileId(userId: string): Promise<number> {
    const profile = await this.profileRepository.findOne({
      where: { user: { id: userId } },
    });

    if (!profile) {
      throw new Error(`Profile not found for user ID: ${userId}`);
    }

    return profile.id;
  }

  async createLeaveAppliedActivity(
    leaveRequest: LeaveRequest,
    user: User,
  ): Promise<void> {
    const profileId = await this.getProfileId(user.id);

    await this.activityRepository.createActivity({
      profileId,
      activityType: ActivityType.LEAVE_APPLIED,
      description: `${user.fullname} requested leave from ${this.formatDate(leaveRequest.startDate)} to ${this.formatDate(leaveRequest.endDate)}.`,
      activityDate: new Date(),
    });
  }

  async createLeaveApprovedActivity(
    leaveRequest: LeaveRequest,
    approverName: string,
  ): Promise<void> {
    // Get the profile ID for the user who owns the leave request
    const profileId = await this.getProfileId(leaveRequest.user.id);

    await this.activityRepository.createActivity({
      profileId,
      activityType: ActivityType.LEAVE_APPROVED,
      description: `${approverName} approved leave request from ${this.formatDate(leaveRequest.startDate)} to ${this.formatDate(leaveRequest.endDate)}.`,
      activityDate: new Date(),
    });
  }

  async createLeaveRejectedActivity(
    leaveRequest: LeaveRequest,
    rejectorName: string,
  ): Promise<void> {
    const profileId = await this.getProfileId(leaveRequest.user.id);

    await this.activityRepository.createActivity({
      profileId,
      activityType: ActivityType.LEAVE_REJECTED,
      description: `${rejectorName} rejected leave request from ${this.formatDate(leaveRequest.startDate)} to ${this.formatDate(leaveRequest.endDate)}. Reason: ${leaveRequest.rejectionReason || 'No reason provided'}`,
      activityDate: new Date(),
    });
  }

  async createLeaveCancelledActivity(
    leaveRequest: LeaveRequest,
    cancelerName: string,
  ): Promise<void> {
    const profileId = await this.getProfileId(leaveRequest.user.id);

    await this.activityRepository.createActivity({
      profileId,
      activityType: ActivityType.LEAVE_CANCELLED,
      description: `${cancelerName} cancelled leave request from ${this.formatDate(leaveRequest.startDate)} to ${this.formatDate(leaveRequest.endDate)}.`,
      activityDate: new Date(),
    });
  }

  private formatDate(date: Date): string {
    if (!date) return 'Unknown';
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }
}
