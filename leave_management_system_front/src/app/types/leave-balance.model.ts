export interface LeaveBalance {
  id: number;
  userId: string;
  leaveTypeId: number;
  year: number;
  total: number;
  used: number;
  carryover: number;
  remaining: number;  
  createdAt: string;
  updatedAt: string;
}
