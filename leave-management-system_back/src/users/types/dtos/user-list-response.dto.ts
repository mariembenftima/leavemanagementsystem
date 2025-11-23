import { Expose, Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
export class UserListResponseDto {
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
  @ApiProperty({ example: true })
  isActive: boolean;

  @Expose()
  @ApiProperty({ example: ['EMPLOYEE'] })
  roles: string[];

  @Expose()
  @ApiProperty({
    example: '/uploads/profile_pics/user_123.jpg',
    required: false,
  })
  profilePictureUrl?: string;

  @Expose()
  @Type(() => Date)
  @ApiProperty({ example: '2024-01-15T10:30:00.000Z' })
  createdAt: Date;
}
