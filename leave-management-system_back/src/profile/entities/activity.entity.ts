import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  RelationId,
} from 'typeorm';
import { EmployeeProfile } from './employee-profile.entity';

@Entity('activities')
export class Activity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => EmployeeProfile, (profile) => profile.activities)
  @JoinColumn({ name: 'profile_id' })
  profile: EmployeeProfile;

  @RelationId((activity: Activity) => activity.profile)
  profileId: number;

  @Column({ name: 'activity_type' })
  activityType: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ name: 'activity_date' })
  activityDate: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
