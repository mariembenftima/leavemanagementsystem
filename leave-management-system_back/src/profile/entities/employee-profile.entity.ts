import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { User } from '../../users/entities/users.entity';
import { Activity } from './activity.entity';
import { Performance } from './performance.entity';

@Entity('employee_profiles')
export class EmployeeProfile {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id' })
  name: string;

  @OneToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'employee_id', unique: true })
  employeeId: string;

  @Column()
  department: string;

  @Column()
  designation: string;

  @Column({ name: 'join_date', type: 'date' })
  joinDate: Date;

  @Column({
    type: 'varchar',
    length: 20,
  })
  gender: string;

  @Column({ name: 'date_of_birth', type: 'date', nullable: true })
  dateOfBirth: Date;

  @Column({ nullable: true })
  phone: string;

  @Column({ name: 'emergency_contact_name', nullable: true })
  emergencyContactName: string;

  @Column({ name: 'emergency_contact_phone', nullable: true })
  emergencyContactPhone: string;

  @Column({ type: 'text', nullable: true })
  address: string;

  @Column({ name: 'marital_status', nullable: true })
  maritalStatus: string;

  @Column({ nullable: true })
  nationality: string;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  salary: number;

  @Column({ name: 'bank_account_number', nullable: true })
  bankAccountNumber: string;

  @Column({ name: 'bank_name', nullable: true })
  bankName: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => Activity, (activity) => activity.profile)
  activities: Activity[];

  @OneToMany(() => Performance, (performance) => performance.profile)
  performances: Performance[];
  fullname: any;

  // Virtual properties
  get age(): number | null {
    if (!this.dateOfBirth) return null;
    const today = new Date();
    const birthDate = new Date(this.dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    return age;
  }

  get yearsOfService(): number {
    const today = new Date();
    const joinDate = new Date(this.joinDate);
    return Math.floor(
      (today.getTime() - joinDate.getTime()) / (1000 * 60 * 60 * 24 * 365),
    );
  }
}
