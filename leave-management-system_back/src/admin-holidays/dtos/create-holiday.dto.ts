import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsDateString,
  IsOptional,
  IsBoolean,
} from 'class-validator';

export class CreateHolidayDto {
  @ApiProperty({
    description: 'Name of the holiday',
    example: 'Independence Day',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Date of the holiday',
    example: '2026-07-04',
  })
  @IsDateString()
  @IsNotEmpty()
  date: string;

  @ApiPropertyOptional({
    description: 'Description of the holiday',
    example: 'National Independence Day celebration',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    description: 'Whether this holiday recurs annually',
    example: true,
    default: true,
  })
  @IsBoolean()
  @IsOptional()
  isRecurring?: boolean;

  @ApiPropertyOptional({
    description: 'Type of holiday',
    example: 'national',
  })
  @IsString()
  @IsOptional()
  type?: string;
}
