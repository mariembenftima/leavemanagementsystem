import { Expose, Type, Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

interface UserProfileTransformObject {
  lastLogin?: Date;
  createdAt: Date;
  team?: {
    id: number;
    name: string;
  };
}

export class UserProfileResponseDto {
  @Expose()
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  id: string;

  @Expose()
  @ApiProperty({ example: 'john.doe' })
  username: string;

  @Expose()
  @ApiProperty({ example: 'John Doe' })
  fullname: string;

  @Expose()
  @ApiProperty({ example: 'john.doe@example.com' })
  email: string;

  @Expose()
  @ApiProperty({ example: '+1234567890' })
  phoneNumber: string;

  @Expose()
  @ApiProperty({ example: true })
  isActive: boolean;

  @Expose()
  @ApiProperty({ example: ['EMPLOYEE', 'ADMIN'] })
  roles: string[];

  @Expose()
  @ApiProperty({
    example: '/uploads/profile_pics/user_123.jpg',
    required: false,
  })
  profilePictureUrl?: string;

  @Expose()
  @ApiProperty({
    example: 'Software developer with 5 years experience',
    required: false,
  })
  bio?: string;

  @Expose()
  @ApiProperty({ example: '123 Main St, City, Country', required: false })
  address?: string;

  @Expose()
  @Type(() => Date)
  @ApiProperty({ example: '1990-01-15T00:00:00.000Z', required: false })
  dateOfBirth?: Date;

  @Expose()
  @Type(() => Date)
  @ApiProperty({ example: '2024-01-15T10:30:00.000Z', required: false })
  lastLogin?: Date;

  @Expose()
  @Type(() => Date)
  @ApiProperty({ example: '2024-01-15T10:30:00.000Z' })
  createdAt: Date;

  @Expose()
  @Type(() => Date)
  @ApiProperty({ example: '2024-01-16T10:30:00.000Z' })
  updatedAt: Date;

  @Expose()
  @Transform(({ obj }: { obj: UserProfileTransformObject }) => obj.team || null)
  @ApiProperty({
    example: { id: 1, name: 'Engineering Team' },
    required: false,
    nullable: true,
  })
  team?: { id: number; name: string } | null;

  // Computed field - days since last login
  @Expose()
  @Transform(({ obj }: { obj: UserProfileTransformObject }): number | null => {
    if (!obj.lastLogin) return null;

    const now = new Date();
    const lastLoginDate = new Date(obj.lastLogin);
    const diffTime = Math.abs(now.getTime() - lastLoginDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays;
  })
  @ApiProperty({
    example: 5,
    required: false,
    nullable: true,
    description: 'Number of days since user last logged in',
  })
  daysSinceLastLogin?: number | null;

  @Expose()
  @Transform(({ obj }: { obj: UserProfileTransformObject }): number => {
    const now = new Date();
    const createdDate = new Date(obj.createdAt);
    const diffTime = Math.abs(now.getTime() - createdDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays;
  })
  @ApiProperty({
    example: 365,
    description: 'Number of days since account was created',
  })
  accountAgeDays: number;
}
