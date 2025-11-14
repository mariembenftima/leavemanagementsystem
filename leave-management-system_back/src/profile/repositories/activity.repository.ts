import { Injectable } from '@nestjs/common';
import { Repository, DataSource, In, Between } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Activity } from '../entities/activity.entity';
import { ActivityType } from '../types/enums/activity-type.enum';

export interface CreateActivityDto {
  profileId: number;
  activityType: ActivityType | string;
  description?: string;
  activityDate?: Date;
}

@Injectable()
export class ActivityRepository extends Repository<Activity> {
  constructor(
    @InjectRepository(Activity)
    private readonly activityRepo: Repository<Activity>,
    private dataSource: DataSource,
  ) {
    super(Activity, dataSource.createEntityManager());
  }

  async createActivity(dto: CreateActivityDto): Promise<Activity> {
    const activity = this.activityRepo.create({
      profileId: dto.profileId,
      activityType: dto.activityType,
      description: dto.description,
      activityDate: dto.activityDate || new Date(),
    });

    return this.activityRepo.save(activity);
  }

  async getRecentActivities(
    profileId: number,
    count: number = 5,
  ): Promise<Activity[]> {
    return this.activityRepo.find({
      where: { profileId },
      order: { createdAt: 'DESC' },
      take: count,
      relations: ['profile'],
    });
  }

  async getActivitiesByType(
    activityType: ActivityType | string,
    count: number = 20,
  ): Promise<Activity[]> {
    return this.activityRepo.find({
      where: { activityType },
      order: { createdAt: 'DESC' },
      take: count,
    });
  }

  async getLeaveActivities(
    profileId: number,
    count: number = 10,
  ): Promise<Activity[]> {
    const leaveActivityTypes = [
      ActivityType.LEAVE_APPLIED,
      ActivityType.LEAVE_APPROVED,
      ActivityType.LEAVE_REJECTED,
      ActivityType.LEAVE_CANCELLED,
    ];

    return this.activityRepo.find({
      where: {
        profileId,
        activityType: In(leaveActivityTypes),
      },
      order: { createdAt: 'DESC' },
      take: count,
    });
  }

  async getActivitiesForProfiles(
    profileIds: number[],
    count: number = 10,
  ): Promise<Activity[]> {
    if (!profileIds || profileIds.length === 0) {
      return [];
    }

    return this.activityRepo.find({
      where: {
        profileId: In(profileIds),
      },
      order: { createdAt: 'DESC' },
      take: count * profileIds.length,
    });
  }
  async getActivitiesForDateRange(
    profileId: number,
    startDate: Date,
    endDate: Date,
  ): Promise<Activity[]> {
    return this.activityRepo.find({
      where: {
        profileId,
        activityDate: Between(startDate, endDate),
      },
      order: { activityDate: 'DESC' },
    });
  }

  async createLeaveActivity(
    profileId: number,
    activityType: ActivityType,
    leaveDetails: {
      userName: string;
      startDate: Date;
      endDate: Date;
      leaveType: string;
      additionalInfo?: string;
    },
  ): Promise<Activity> {
    const description = `${leaveDetails.userName} ${this.getActionVerb(activityType)} ${leaveDetails.leaveType} leave from ${this.formatDate(leaveDetails.startDate)} to ${this.formatDate(leaveDetails.endDate)}. ${leaveDetails.additionalInfo || ''}`;

    return this.createActivity({
      profileId,
      activityType,
      description,
      activityDate: new Date(),
    });
  }

  private getActionVerb(activityType: ActivityType): string {
    switch (activityType) {
      case ActivityType.LEAVE_APPLIED:
        return 'requested';
      case ActivityType.LEAVE_APPROVED:
        return 'was approved for';
      case ActivityType.LEAVE_REJECTED:
        return 'was rejected for';
      case ActivityType.LEAVE_CANCELLED:
        return 'cancelled';
      default:
        return 'updated';
    }
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
