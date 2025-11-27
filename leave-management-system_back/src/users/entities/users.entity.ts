import { TeamEntity } from '../../teams/entities/team.entity';
import { ManyToOne, JoinColumn, OneToMany, OneToOne } from 'typeorm';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Exclude, Expose } from 'class-transformer';
import { IUser } from '../types/interfaces/users.interfaces';
import { LeaveBalanceEntity } from 'src/leave-balances/entities/leave-balance.entity';
import { EmployeeProfile } from 'src/profile/entities/employee-profile.entity';

@Entity('users')
export class User implements IUser {
  @Expose()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Expose()
  @Column()
  username: string;

  @Expose()
  @Column()
  fullname: string;

  @Expose()
  @Column()
  email: string;

  @Expose()
  @Column({ name: 'phone_number' })
  phoneNumber: string;

  @Exclude()
  @Column()
  password: string;

  @Expose()
  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Expose()
  @Column({ name: 'last_login', nullable: true })
  lastLogin?: Date;

  @Expose()
  @Column('text', { array: true, default: '{EMPLOYEE}' })
  roles: string[];

  @Expose()
  @Column({ name: 'profile_picture_url', nullable: true })
  profilePictureUrl?: string;

  @Expose()
  @Column({ nullable: true })
  bio?: string;

  @Expose()
  @Column({ nullable: true })
  address?: string;

  @Expose()
  @Column({ name: 'date_of_birth', nullable: true })
  dateOfBirth?: Date;

  @Expose()
  @Column({ name: 'team_id', nullable: true })
  teamId: number;

  @Expose()
  @ManyToOne(() => TeamEntity, (team) => team.members)
  @JoinColumn({ name: 'team_id' })
  team: TeamEntity;

  @Expose()
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Expose()
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Expose()
  @OneToMany(() => LeaveBalanceEntity, (lb) => lb.user)
  leaveBalances: LeaveBalanceEntity[];

  @Expose()
  @OneToOne(() => EmployeeProfile, (profile) => profile.user)
  profile: EmployeeProfile;
}
