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

  @ManyToOne(() => LeaveTypeEntity)
  @JoinColumn({ name: 'leave_type_id' })
  leaveType: LeaveTypeEntity;

  @Column('int')
  year: number;
  @Column('int')
  carryover: number;

  @Column('int')
  used: number;
  get total(): number {
    if (this.leaveType?.maxDays) {
      return this.leaveType.maxDays + this.carryover;
    }
    return 21 + this.carryover;
  }

  get remaining(): number {
    return this.total - this.used;
  }
}
