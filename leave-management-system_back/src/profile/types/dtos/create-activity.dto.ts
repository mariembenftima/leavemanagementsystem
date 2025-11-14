import { ActivityType } from '../enums/activity-type.enum';

export interface CreateActivityDto {
  profileId: number;
  activityType: ActivityType;
  description?: string;
  activityDate?: Date;
}
