import { IsBoolean, IsDateString, IsOptional, IsString } from 'class-validator';

export class CreateLeaveRequestDto {
  @IsString()
  leaveType!: string;

  @IsDateString()
  startDate!: string;

  @IsDateString()
  endDate!: string;

  @IsString()
  reason!: string;

  @IsBoolean()
  @IsOptional()
  isHalfDay?: boolean;

  @IsString()
  @IsOptional()
  managerEmail?: string;

  @IsString()
  @IsOptional()
  emergencyContact?: string;
  @IsOptional()
  totalDays?: number;
}
