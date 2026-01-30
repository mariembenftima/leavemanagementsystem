import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class ApproveLeaveRequestDto {
  @ApiProperty({
    description: 'Optional comments from admin when approving',
    required: false,
    example: 'Approved for the requested dates',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  comments?: string;
}
