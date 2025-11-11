import { Request } from 'express';

export interface AuthenticatedUser {
  userId: string;
  email: string;
  roles: string[];
}

export interface AuthenticatedRequest extends Request {
  user: AuthenticatedUser;
}
