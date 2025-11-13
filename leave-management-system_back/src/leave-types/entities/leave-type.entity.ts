import { LeaveBalanceEntity } from 'src/leave-balances/entities/leave-balance.entity';
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';

@Entity('leave_types')
export class LeaveTypeEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  @Column('int', { name: 'max_days' })
  maxDays: number;
  @OneToMany(() => LeaveBalanceEntity, (lb) => lb.leaveType)
  leaveBalances: LeaveBalanceEntity[];
}
