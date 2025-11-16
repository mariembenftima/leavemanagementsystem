import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  Unique,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/users.entity';
import { LeaveTypeEntity } from '../../leave-types/entities/leave-type.entity';

@Entity('leave_balances')
@Unique(['user', 'leaveType', 'year'])
export class LeaveBalanceEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.leaveBalances, { eager: true })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => LeaveTypeEntity, { eager: true })
  @JoinColumn({ name: 'leave_type_id' })
  leaveType: LeaveTypeEntity;

  @Column('int')
  year: number;

  @Column('int', { default: 0 })
  carryover: number;

  @Column('int', { default: 0 })
  used: number;

  get total(): number {
    return (this.leaveType?.maxDays || 21) + (this.carryover || 0);
  }

  get remaining(): number {
    return this.total - (this.used || 0);
  }
}
