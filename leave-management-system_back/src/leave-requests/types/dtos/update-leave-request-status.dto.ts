import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { LeaveRequestStatus } from '../enums/leave-request-status.enum';

export class UpdateLeaveRequestStatusDto {
  @ApiProperty({
    enum: LeaveRequestStatus,
    example: LeaveRequestStatus.APPROVED,
    description: 'The new status of the leave request',
  })
  @IsEnum(LeaveRequestStatus)
  status!: LeaveRequestStatus;

  @ApiProperty({
    example: 'Reason for rejection',
    required: false,
    description: 'Optional reason if the request is rejected',
  })
  @IsString()
  @IsOptional()
  rejectionReason?: string;
}
