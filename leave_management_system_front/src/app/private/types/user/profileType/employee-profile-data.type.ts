export interface EmployeeProfileData {
  id: string;
  user_id: string;
  employee_id: string;
  fullname: string;
  email: string;
  phone: string;
  department: string;
  designation: string;
  join_date: string;
  gender: string;
  date_of_birth: string;
  address: string;
  emergency_contact_name: string;
  emergency_contact_phone: string;
  marital_status: string;
  nationality: string;
  salary: number;
  bank_account_number: string;
  bank_name: string;
  profile_picture_url?: string;
  roles: string;
  team_name?: string; 
  created_at: string;
  updated_at: string;
  isActive: boolean;
}
