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
import { Expose } from 'class-transformer';
import { EmployeeProfile } from './employee-profile.entity';
import { User } from '../../users/entities/users.entity';

@Entity('performances')
export class Performance {
  @Expose()
  @PrimaryGeneratedColumn()
  id: number;

  @Expose()
  @ManyToOne(() => EmployeeProfile, (profile) => profile.performances)
  @JoinColumn({ name: 'profile_id' })
  profile: EmployeeProfile;

  @Expose()
  @RelationId((performance: Performance) => performance.profile)
  profileId: number;

  @Expose()
  @Column({ name: 'review_period' })
  reviewPeriod: string;

  @Expose()
  @Column({ type: 'decimal', precision: 3, scale: 2, nullable: true })
  rating: number;

  @Expose()
  @Column({ type: 'text', nullable: true })
  goals: string;

  @Expose()
  @Column({ type: 'text', nullable: true })
  achievements: string;

  @Expose()
  @Column({ type: 'text', nullable: true })
  feedback: string;

  @Expose()
  @ManyToOne(() => User)
  @JoinColumn({ name: 'reviewer_id' })
  reviewer: User;

  @Expose()
  @RelationId((performance: Performance) => performance.reviewer)
  reviewerId: string;

  @Expose()
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Expose()
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
