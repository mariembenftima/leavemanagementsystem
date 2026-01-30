export interface StatusBreakdown {
  [key: string]: number;
}

export interface LeaveRequestStatistics {
  totalRequests: number;
  monthlyRequests: number;
  statusBreakdown: StatusBreakdown;
}

export interface ExtendedLeaveBalancesService {
  deductLeaveBalance(
    userId: string,
    leaveTypeId: number,
    days: number,
  ): Promise<void>;
  restoreLeaveBalance(
    userId: string,
    leaveTypeId: number,
    days: number,
  ): Promise<void>;
}
