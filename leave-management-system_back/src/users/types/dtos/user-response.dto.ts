import { Exclude, Expose, Type } from 'class-transformer';

export class UserResponseDto {
  @Expose()
  id: string;

  @Expose()
  email: string;

  @Expose()
  fullname: string;

  @Expose()
  username?: string;

  @Expose()
  phoneNumber?: string;

  @Expose()
  roles: string[];

  @Expose()
  isActive: boolean;

  @Expose()
  profilePictureUrl?: string;

  @Expose()
  bio?: string;

  @Expose()
  @Type(() => Date)
  createdAt: Date;

  @Exclude()
  password: string;

  @Exclude()
  refreshToken?: string;

  @Exclude()
  resetToken?: string;

  @Exclude()
  updatedAt?: Date;
}
