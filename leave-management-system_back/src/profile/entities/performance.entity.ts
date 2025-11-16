import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  RelationId,
} from 'typeorm';
import { EmployeeProfile } from './employee-profile.entity';
import { User } from '../../users/entities/users.entity';

@Entity('performances')
export class Performance {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => EmployeeProfile, (profile) => profile.performances)
  @JoinColumn({ name: 'profile_id' })
  profile: EmployeeProfile;

  @RelationId((performance: Performance) => performance.profile)
  profileId: number;

  @Column({ name: 'review_period' })
  reviewPeriod: string;

  @Column({ type: 'decimal', precision: 3, scale: 2, nullable: true })
  rating: number;

  @Column({ type: 'text', nullable: true })
  goals: string;

  @Column({ type: 'text', nullable: true })
  achievements: string;

  @Column({ type: 'text', nullable: true })
  feedback: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'reviewer_id' })
  reviewer: User;

  @RelationId((performance: Performance) => performance.reviewer)
  reviewerId: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
