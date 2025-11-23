import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  RelationId,
} from 'typeorm';
import { Expose } from 'class-transformer';
import { EmployeeProfile } from './employee-profile.entity';

@Entity('activities')
export class Activity {
  @Expose()
  @PrimaryGeneratedColumn()
  id: number;

  @Expose()
  @ManyToOne(() => EmployeeProfile, (profile) => profile.activities)
  @JoinColumn({ name: 'profile_id' })
  profile: EmployeeProfile;

  @Expose()
  @RelationId((activity: Activity) => activity.profile)
  profileId: number;

  @Expose()
  @Column({ name: 'activity_type' })
  activityType: string;

  @Expose()
  @Column({ type: 'text', nullable: true })
  description: string;

  @Expose()
  @Column({ name: 'activity_date', type: 'timestamp' })
  activityDate: Date;

  @Expose()
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
