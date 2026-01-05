// src/leave-requests/types/dtos/update-leave-status.dto.ts
import { IsEnum, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { LeaveRequestStatus } from '../enums/leave-request-status.enum';

export class UpdateLeaveStatusDto {
  @ApiProperty({
    description: 'The new status for the leave request',
    enum: LeaveRequestStatus,
    example: LeaveRequestStatus.APPROVED,
    required: true,
  })
  @IsEnum(LeaveRequestStatus, {
    message: 'Status must be one of: PENDING, APPROVED, REJECTED, CANCELLED',
  })
  @IsNotEmpty({ message: 'Status is required' })
  status: LeaveRequestStatus;
}
