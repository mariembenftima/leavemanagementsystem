import { Activity } from "./activity.model";
import { EmployeeProfile } from "./employee-profile.model";
import { Holiday } from "./holiday.model";
import { LeaveSummary } from "./leave-summary.type";
import { Performance } from "./performance.model";
export interface DashboardData {
  totalUsers: number;
  totalLeaves: number;
  totalDepartments: number;
  totalPendingRequests: number;
  recentActivities: Activity[];
  employeeInfo: EmployeeProfile; 
  activities: Activity[];        
  performance: Performance[];     
  holidays: { upcoming: number; total: number; list: Holiday[] };            
  leaveBalance: Record<string, LeaveSummary>; 
}

