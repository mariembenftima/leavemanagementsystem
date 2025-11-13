import { TeamEntity } from '../../teams/entities/team.entity';
import { ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { IUser } from '../types/interfaces/users.interfaces';
import { LeaveBalanceEntity } from 'src/leave-balances/entities/leave-balance.entity';

@Entity('users')
export class User implements IUser {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  username: string;

  @Column()
  fullname: string;

  @Column()
  email: string;

  @Column({ name: 'phone_number' })
  phoneNumber: string;

  @Column()
  password: string;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ name: 'last_login', nullable: true })
  lastLogin?: Date;

  @Column('text', { array: true, default: '{EMPLOYEE}' })
  roles: string[];

  @Column({ name: 'profile_picture_url', nullable: true })
  profilePictureUrl?: string;

  @Column({ nullable: true })
  bio?: string;

  @Column({ nullable: true })
  address?: string;

  @Column({ name: 'date_of_birth', nullable: true })
  dateOfBirth?: Date;

  @Column({ name: 'team_id', nullable: true })
  teamId: number;

  @ManyToOne(() => TeamEntity, (team) => team.members)
  @JoinColumn({ name: 'team_id' })
  team: TeamEntity;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
  @OneToMany(() => LeaveBalanceEntity, (lb) => lb.user)
  leaveBalances: LeaveBalanceEntity[];
}
