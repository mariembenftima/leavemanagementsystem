import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsInt, Min } from 'class-validator';

export class UpdateLeaveTypeDto {
  @ApiPropertyOptional({
    description: 'Leave type name',
    example: 'Sick Leave',
  })
  @IsOptional()
  @IsString()
  readonly name?: string;

  @ApiPropertyOptional({
    description: 'Maximum days allowed',
    example: 10,
    minimum: 0,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  readonly maxDays?: number;
}
