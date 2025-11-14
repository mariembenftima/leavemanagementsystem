import { User } from "./user.model";
import { LeaveType } from "../private/types/user/leaveRequestsType/leave-type.model";

export interface LeaveRequest {
  emergency_contact: string;
  manager_email: string;
  is_half_day: boolean;
  id: number;
  userId: string;
  leaveTypeId: number;
  startDate: string;
  endDate: string;
  totalDays: number;
  reason?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
  approvedBy?: string;
  approvedAt?: string;
  rejectedReason?: string;
  createdAt: string;
  updatedAt: string;
  attachment?: File | string;
  user?: User;
  leaveType?: LeaveType;
}
