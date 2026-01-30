import { IsString, IsInt, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateLeaveTypeDto {
  @ApiProperty({
    description: 'The name of the leave type',
    example: 'Annual Leave',
  })
  @IsString()
  readonly name: string;

  @ApiProperty({
    description: 'Maximum number of days allowed for this leave type',
    example: 20,
    minimum: 0,
  })
  @IsInt()
  @Min(0)
  readonly maxDays: number;
}
