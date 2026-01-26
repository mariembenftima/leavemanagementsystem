import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';
import { HolidayType } from '../types/enums/holiday-type.enum';

@Entity('holidays')
export class Holiday {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ type: 'date' })
  date: Date;

  @Column({
    type: 'enum',
    enum: HolidayType,
    default: HolidayType.COMPANY,
  })
  type: HolidayType;
  @Column({ name: 'is_optional' })
  isOptional: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
