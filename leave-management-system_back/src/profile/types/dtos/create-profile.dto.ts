import {
  IsNotEmpty,
  IsEnum,
  IsDateString,
  IsOptional,
  IsString,
  IsNumber,
  IsPhoneNumber,
} from 'class-validator';
import { Gender } from '../enums/gender.enum';

export class CreateProfileDto {
  @IsNotEmpty()
  @IsString()
  employeeId: string;

  @IsNotEmpty()
  @IsString()
  department: string;

  @IsNotEmpty()
  @IsString()
  designation: string;

  @IsDateString()
  joinDate: string;

  @IsEnum(Gender)
  gender: Gender;

  @IsOptional()
  @IsDateString()
  dateOfBirth?: string;

  @IsOptional()
  @IsString()
  @IsPhoneNumber()
  phone?: string;

  @IsOptional()
  @IsString()
  emergencyContact?: string;

  @IsOptional()
  @IsString()
  currentAddress?: string;

  @IsOptional()
  @IsNumber()
  workExperience?: number;

  @IsOptional()
  @IsString()
  idProofType?: string;

  @IsOptional()
  @IsString()
  idProofNumber?: string;
}
