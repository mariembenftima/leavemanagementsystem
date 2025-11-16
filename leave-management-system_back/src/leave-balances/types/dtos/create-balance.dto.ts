import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Min, IsString } from 'class-validator';

export class CreateBalanceDto {
  @ApiProperty({
    description: 'User ID (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsString()
  userId: string;

  @ApiProperty({ description: 'Leave Type ID', example: 1 })
  @IsInt()
  leaveTypeId: number;

  @ApiProperty({ description: 'Year', example: 2025 })
  @IsInt()
  year: number;

  @ApiProperty({
    description: 'Carryover days from previous year',
    example: 5,
    minimum: 0,
  })
  @IsInt()
  @Min(0)
  carryover: number;

  @ApiProperty({ description: 'Days already used', example: 3, minimum: 0 })
  @IsInt()
  @Min(0)
  used: number;
}
