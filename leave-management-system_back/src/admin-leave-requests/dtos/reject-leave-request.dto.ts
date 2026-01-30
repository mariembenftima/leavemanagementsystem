import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength, MaxLength } from 'class-validator';

export class RejectLeaveRequestDto {
  @ApiProperty({
    description: 'Reason for rejecting the leave request',
    required: true,
    example: 'Insufficient staff coverage during requested period',
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(10, { message: 'Rejection reason must be at least 10 characters' })
  @MaxLength(500, {
    message: 'Rejection reason must not exceed 500 characters',
  })
  reason: string;
}
