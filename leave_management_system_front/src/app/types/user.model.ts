import { Team } from "./team.model";

export interface User {
  id: string;                    // UUID
  username: string;
  fullname: string;
  email: string;
  phoneNumber?: string;
  password?: string;             // optional for frontend
  isActive: boolean;
  lastLogin?: string;
  roles: string[];               // ['EMPLOYEE', 'HR', 'ADMIN']
  profilePictureUrl?: string;
  bio?: string;
  address?: string;
  dateOfBirth?: string;
  team?: Team | null;
  createdAt: string;
  updatedAt: string;
}
