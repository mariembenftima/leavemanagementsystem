import { Request } from 'express';

export interface AuthenticatedUser {
  userId: string;
  email: string;
  roles: string[];
  id?: string;
  username?: string;
  fullname?: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  role?: string;
  department?: string;
  position?: string;
  teamId?: number;
  phoneNumber?: string;
  profilePictureUrl?: string;
  createdAt?: string;
}

export interface AuthenticatedRequest extends Request {
  user: AuthenticatedUser;
}
