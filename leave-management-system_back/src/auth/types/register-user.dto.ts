import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  IsOptional,
  IsInt,
  Min,
  Max,
  IsDateString,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class RegisterUserDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: 'john.doe',
    description: 'Username for the new user',
  })
  username: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'John Doe', description: 'Full name of the user' })
  fullname: string;

  @IsEmail()
  @ApiProperty({
    example: 'john.doe@company.com',
    description: 'Email address',
  })
  email: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: '+1-555-0123', description: 'Phone number' })
  phoneNumber: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: 'password123',
    description: 'Password for the account',
  })
  password: string;

  @Transform(({ value }) => parseInt(value))
  @IsInt()
  @Min(1)
  @Max(8)
  @ApiProperty({
    example: 2,
    description:
      'Team ID (1-8): 1=HR, 2=IT, 3=Marketing, 4=Finance, 5=Sales, 6=Operations, 7=Legal, 8=Customer Support',
  })
  teamId: number;

  @IsOptional()
  @IsString()
  @ApiProperty({
    example: '123 Main Street, City, State 12345',
    description: 'Home address',
    required: false,
  })
  address?: string;

  @IsOptional()
  @IsDateString()
  @ApiProperty({
    example: '1990-01-15',
    description: 'Date of birth (YYYY-MM-DD)',
    required: false,
  })
  dateOfBirth?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({
    example: 'Experienced professional with expertise in...',
    description: 'Bio/description',
    required: false,
  })
  bio?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({
    example: '/uploads/profiles/profile-123456789.jpg',
    description: 'Profile picture URL',
    required: false,
  })
  profilePictureUrl?: string;
}
