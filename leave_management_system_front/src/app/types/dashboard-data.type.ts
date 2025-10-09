
import { LeaveSummary } from './leave-summary.type';
import { Activity } from './activity.model';
import { Performance } from './performance.model';
import { EmployeeProfileData } from '../private/types/user/profileType/employee-profile-data.type';
import { Holiday } from './holiday.model';

export interface DashboardData {
  employeeInfo: EmployeeProfileData;
  leaveBalance: Record<string, LeaveSummary>; // keyed by leave type
  activities: Activity[];
  performance: Performance[];
  holidays: { upcoming: number; total: number ;list: Holiday[];};
}
