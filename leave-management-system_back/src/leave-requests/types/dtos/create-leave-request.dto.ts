import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsDateString,
  IsOptional,
  IsString,
  IsInt,
} from 'class-validator';

export class CreateLeaveRequestDto {
  @ApiProperty({ description: 'Leave type name or ID', example: 'annual' })
  @IsString()
  leaveType!: string;

  @ApiProperty({
    description: 'Start date',
    example: '2025-01-15',
    format: 'date',
  })
  @IsDateString()
  startDate!: string;

  @ApiProperty({
    description: 'End date',
    example: '2025-01-20',
    format: 'date',
  })
  @IsDateString()
  endDate!: string;

  @ApiProperty({
    description: 'Reason for leave request',
    example: 'Family vacation',
  })
  @IsString()
  reason!: string;

  @ApiPropertyOptional({
    description: 'Is this a half-day leave?',
    example: false,
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  isHalfDay?: boolean;

  @ApiPropertyOptional({
    description: 'Manager email for approval',
    example: 'manager@company.com',
  })
  @IsString()
  @IsOptional()
  managerEmail?: string;

  @ApiPropertyOptional({
    description: 'Emergency contact number',
    example: '+1234567890',
  })
  @IsString()
  @IsOptional()
  emergencyContact?: string;

  @ApiPropertyOptional({ description: 'Total days requested', example: 5 })
  @IsInt()
  @IsOptional()
  totalDays?: number;
}
