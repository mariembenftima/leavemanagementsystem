export interface User {
  id: string;
  username: string;
  fullname: string;
  email: string;
  phoneNumber: string;
  password?: string;
  isActive: boolean;
  lastLogin?: string;
  // Roles may come from the API as a comma-separated string or as an array.
  // Accept both to remain backwards compatible while we normalize at runtime.
  roles: string | string[];
  profilePictureUrl?: string;
  bio?: string;
  address?: string;
  dateOfBirth?: string;
  teamId?: string;
  createdAt: string;
  updatedAt: string;
}
