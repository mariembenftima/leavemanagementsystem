import { ApiProperty } from '@nestjs/swagger';
import {
  IsOptional,
  IsInt,
  Min,
  IsString,
  IsEnum,
  IsDateString,
  IsArray,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { LeaveRequestStatus } from 'src/leave-requests/types/enums/leave-request-status.enum';

export class LeaveRequestFilterDto {
  @ApiProperty({
    description: 'Page number for pagination',
    required: false,
    default: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiProperty({
    description: 'Number of items per page',
    required: false,
    default: 10,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 10;

  @ApiProperty({
    description: 'Filter by leave request status',
    required: false,
    enum: LeaveRequestStatus,
    isArray: true,
  })
  @IsOptional()
  @Transform(({ value }): LeaveRequestStatus[] =>
    Array.isArray(value) ? value : [value],
  )
  @IsArray()
  @IsEnum(LeaveRequestStatus, { each: true })
  status?: LeaveRequestStatus | LeaveRequestStatus[];

  @ApiProperty({
    description: 'Filter by user ID',
    required: false,
  })
  @IsOptional()
  @IsString()
  userId?: string;

  @ApiProperty({
    description: 'Filter by leave type ID',
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  leaveTypeId?: number;

  @ApiProperty({
    description: 'Filter by start date (YYYY-MM-DD)',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiProperty({
    description: 'Filter by end date (YYYY-MM-DD)',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiProperty({
    description: 'Field to sort by',
    required: false,
    default: 'createdAt',
  })
  @IsOptional()
  @IsString()
  sortBy?: string = 'createdAt';

  @ApiProperty({
    description: 'Sort order',
    required: false,
    enum: ['ASC', 'DESC'],
    default: 'DESC',
  })
  @IsOptional()
  @IsEnum(['ASC', 'DESC'])
  sortOrder?: 'ASC' | 'DESC' = 'DESC';
}
