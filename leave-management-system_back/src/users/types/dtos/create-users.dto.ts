import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  IsNumber,
  IsOptional,
  IsBoolean,
  IsArray,
} from 'class-validator';

export class CreateUsersDto {
  @IsOptional()
  @IsString()
  @ApiPropertyOptional()
  username?: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  fullname: string;

  @IsEmail()
  @ApiProperty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  password: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  phoneNumber: string;

  @IsArray()
  @IsOptional()
  @ApiPropertyOptional()
  roles?: string[];

  @IsOptional()
  @IsString()
  @ApiPropertyOptional()
  profilePictureUrl?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional()
  bio?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional()
  address?: string;

  @IsOptional()
  @ApiPropertyOptional()
  dateOfBirth?: Date;

  @IsOptional()
  @IsNumber()
  @ApiPropertyOptional()
  teamId?: number;

  @IsOptional()
  @IsBoolean()
  @ApiPropertyOptional()
  isActive?: boolean;
}
