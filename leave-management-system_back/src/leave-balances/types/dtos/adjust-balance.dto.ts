import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Min } from 'class-validator';

export class AdjustBalanceDto {
  @ApiProperty({ description: 'Year', example: 2025 })
  @IsInt()
  year: number;

  @ApiProperty({ description: 'Carryover days', example: 5, minimum: 0 })
  @IsInt()
  @Min(0)
  carryover: number;

  @ApiProperty({ description: 'Used days', example: 10, minimum: 0 })
  @IsInt()
  @Min(0)
  used: number;
}
