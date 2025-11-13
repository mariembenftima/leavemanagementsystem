import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/users.entity';
import { LeaveTypeEntity } from '../../leave-types/entities/leave-type.entity';

export enum LeaveRequestStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  CANCELLED = 'CANCELLED',
}

@Entity('leave_requests')
export class LeaveRequest {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, { eager: false })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => LeaveTypeEntity, { eager: false })
  @JoinColumn({ name: 'leave_type_id' })
  leaveType: LeaveTypeEntity;

  @Column({ name: 'start_date', type: 'date' })
  startDate: Date;

  @Column({ name: 'end_date', type: 'date' })
  endDate: Date;

  @Column({ name: 'total_days', type: 'int' })
  totalDays: number;

  @Column({
    name: 'status',
    type: 'varchar',
    length: 20,
    default: LeaveRequestStatus.PENDING,
  })
  status: LeaveRequestStatus;

  @Column({ name: 'reason', type: 'text', nullable: true })
  reason?: string;

  @Column({ name: 'rejection_reason', type: 'text', nullable: true })
  rejectionReason?: string;

  @Column({ name: 'approved_by', type: 'uuid', nullable: true })
  approvedBy?: string;

  @Column({ name: 'approved_at', type: 'timestamp', nullable: true })
  approvedAt?: Date;

  @Column({ name: 'is_half_day', type: 'boolean', default: false })
  is_half_day: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
  @Column({
    name: 'manager_email',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  managerEmail?: string;

  @Column({
    name: 'emergency_contact',
    type: 'varchar',
    length: 50,
    nullable: true,
  })
  emergencyContact?: string;
  @Column({
    name: 'days_requested',
    type: 'int',
    nullable: true,
  })
  daysRequested?: number;
}
