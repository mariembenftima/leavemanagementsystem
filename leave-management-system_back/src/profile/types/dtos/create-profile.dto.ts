import {
  IsNotEmpty,
  IsEnum,
  IsDateString,
  IsOptional,
  IsString,
  IsNumber,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Gender } from '../enums/gender.enum';
import { MaritalStatus } from '../enums/marital-status.enum';

export class CreateProfileDto {
  @ApiProperty({
    description: 'Unique employee ID',
    example: 'EMP001',
  })
  @IsNotEmpty()
  @IsString()
  employeeId: string;

  @ApiProperty({
    description: 'Department name',
    example: 'Engineering',
  })
  @IsNotEmpty()
  @IsString()
  department: string;

  @ApiProperty({
    description: 'Job designation/title',
    example: 'Software Engineer',
  })
  @IsNotEmpty()
  @IsString()
  designation: string;

  @ApiProperty({
    description: 'Date when employee joined the company',
    example: '2024-01-15',
  })
  @IsDateString()
  joinDate: string;

  @ApiProperty({
    description: 'Gender of the employee',
    enum: Gender,
    example: Gender.MALE,
  })
  @IsEnum(Gender)
  gender: Gender;

  @ApiPropertyOptional({
    description: 'Date of birth',
    example: '1990-05-20',
  })
  @IsOptional()
  @IsDateString()
  dateOfBirth?: string;

  @ApiPropertyOptional({
    description: 'Contact phone number',
    example: '+21651710059',
  })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({
    description: 'Emergency contact name',
    example: 'John Doe',
  })
  @IsOptional()
  @IsString()
  emergencyContactName?: string;

  @ApiPropertyOptional({
    description: 'Emergency contact phone',
    example: '+21698765432',
  })
  @IsOptional()
  @IsString()
  emergencyContactPhone?: string;

  @ApiPropertyOptional({
    description: 'Current residential address',
    example: '123 Main St, Sfax, Tunisia',
  })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({
    description: 'Marital status',
    enum: MaritalStatus,
    example: MaritalStatus.SINGLE,
  })
  @IsOptional()
  @IsEnum(MaritalStatus)
  maritalStatus?: MaritalStatus;

  @ApiPropertyOptional({
    description: 'Nationality',
    example: 'Tunisian',
  })
  @IsOptional()
  @IsString()
  nationality?: string;

  @ApiPropertyOptional({
    description: 'Monthly salary',
    example: 50000.0,
  })
  @IsOptional()
  @IsNumber()
  salary?: number;

  @ApiPropertyOptional({
    description: 'Bank account number',
    example: '1234567890',
  })
  @IsOptional()
  @IsString()
  bankAccountNumber?: string;

  @ApiPropertyOptional({
    description: 'Bank name',
    example: 'Banque de Tunisie',
  })
  @IsOptional()
  @IsString()
  bankName?: string;
}
