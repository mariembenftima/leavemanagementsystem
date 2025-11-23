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
import { Expose } from 'class-transformer';
import { User } from '../../users/entities/users.entity';
import { Activity } from './activity.entity';
import { Performance } from './performance.entity';

@Entity('employee_profiles')
export class EmployeeProfile {
  @Expose()
  @PrimaryGeneratedColumn()
  id: number;

  @Expose()
  @OneToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Expose()
  @Column({ name: 'employee_id', unique: true })
  employeeId: string;

  @Expose()
  @Column()
  department: string;

  @Expose()
  @Column()
  designation: string;

  @Expose()
  @Column({ name: 'join_date', type: 'date' })
  joinDate: Date;

  @Expose()
  @Column({ type: 'varchar', length: 20 })
  gender: string;

  @Expose()
  @Column({ name: 'date_of_birth', type: 'date', nullable: true })
  dateOfBirth: Date;

  @Expose()
  @Column({ nullable: true })
  phone: string;

  @Expose()
  @Column({ name: 'emergency_contact_name', nullable: true })
  emergencyContactName: string;

  @Expose()
  @Column({ name: 'emergency_contact_phone', nullable: true })
  emergencyContactPhone: string;

  @Expose()
  @Column({ type: 'text', nullable: true })
  address: string;

  @Expose()
  @Column({ name: 'marital_status', nullable: true })
  maritalStatus: string;

  @Expose()
  @Column({ nullable: true })
  nationality: string;

  @Expose()
  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  salary: number;

  @Expose()
  @Column({ name: 'bank_account_number', nullable: true })
  bankAccountNumber: string;

  @Expose()
  @Column({ name: 'bank_name', nullable: true })
  bankName: string;

  @Expose()
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Expose()
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Expose()
  @OneToMany(() => Activity, (activity) => activity.profile)
  activities: Activity[];

  @Expose()
  @OneToMany(() => Performance, (performance) => performance.profile)
  performances: Performance[];

  @Expose()
  get fullname(): string {
    return this.user?.fullname || '';
  }

  @Expose()
  get age(): number | null {
    if (!this.dateOfBirth) return null;

    const today = new Date();
    const birth = new Date(this.dateOfBirth);
    let age = today.getFullYear() - birth.getFullYear();

    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
      age--;
    }

    return age;
  }

  @Expose()
  get yearsOfService(): number {
    if (!this.joinDate) return 0;

    const now = new Date();
    const join = new Date(this.joinDate);

    return Math.floor(
      (now.getTime() - join.getTime()) / (1000 * 60 * 60 * 24 * 365),
    );
  }
}
