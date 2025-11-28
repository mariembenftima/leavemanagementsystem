import { IsNumber, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AdjustBalanceDto {
  @ApiProperty({
    description: 'Year for the leave balance',
    example: 2025,
    minimum: 2015,
    maximum: 2100,
  })
  @IsNumber()
  @Min(2015, { message: 'Year must be 2020 or later' })
  @Max(2100, { message: 'Year must be 2100 or earlier' })
  year: number;

  @ApiProperty({
    description: 'Number of days carried over from previous year',
    example: 20,
    minimum: 0,
    maximum: 365,
  })
  @IsNumber()
  @Min(0, { message: 'Carryover cannot be negative' })
  @Max(365, { message: 'Carryover cannot exceed 365 days' })
  carryover: number;

  @ApiProperty({
    description: 'Number of leave days used',
    example: 10,
    minimum: 0,
    maximum: 25,
  })
  @IsNumber()
  @Min(0, { message: 'Used days cannot be negative' })
  @Max(365, { message: 'Used days cannot exceed 365' })
  used: number;
}
