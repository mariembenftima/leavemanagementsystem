export interface User {
  id: string;
  username: string;
  fullname: string;
  email: string;
  phoneNumber: string;
  password?: string;
  isActive: boolean;
  lastLogin?: string;
  roles: string;
  profilePictureUrl?: string;
  bio?: string;
  address?: string;
  dateOfBirth?: string;
  teamId?: string;
  createdAt: string;
  updatedAt: string;
}
