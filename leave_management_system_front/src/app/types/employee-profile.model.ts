import { Team } from "./team.model";

export interface EmployeeProfile {
  id: number;
  userId: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  fullname: string; 
  position?: string;
  department?: string;
  managerId?: string;
  hireDate?: string;
  salary?: number;
  dateOfBirth?: string;
  bankAccountNumber?: string;
  socialSecurityNumber?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  gender?: string;
  nationality?: string; 
  maritalStatus?: string;  
  phone?: string;  
  email: string;  
  roles: string[];
  address?: string; 
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  avatarUrl?: string;
  team?: Team | null;
}
