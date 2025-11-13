export interface LeaveBalance {
  id: number;
  userId: string;
  leaveTypeId: number;
  year: number;
  totalDays: number;
  usedDays: number;  
  remainingDays: number;
  carryOverDays: number;  
  createdAt: string;
  updatedAt: string;
}
