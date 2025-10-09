import { Component, OnInit } from '@angular/core';
import { DashboardData } from '../../../../types/dashboard-data.type';
import { EmployeeProfileData } from '../../../types/user/profileType/employee-profile-data.type';
import { Activity } from '../../../../types/activity.model';
import { Performance } from '../../../../types/performance.model';
import { Holiday } from '../../../../types/holiday.model';
import { LeaveBalance } from '../../../../types/leave-balance.model';
import { DataMapperService } from '../../../../helpers/data-mapper.service';
import { HttpClient } from '@angular/common/http';
import { LeaveSummary } from '../../../../types/leave-summary.type';

@Component({
  selector: 'app-dashboard',
  standalone: false,
  templateUrl: './user-dashboard.html',
  styleUrls: ['./user-dashboard.css'],
})
export class Dashboard implements OnInit {
  dashboardData: DashboardData | null = null;
  isLoading = true;
  hasError = false;

  constructor(
    private http: HttpClient,
    private mapper: DataMapperService
  ) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  // 🔹 Fetch dashboard data directly from your backend API
  private loadDashboardData(): void {
    this.http.get('/api/dashboard').subscribe({
      next: (res: any) => {
        // Automatically convert snake_case → camelCase
        this.dashboardData = this.mapper.fromApi<DashboardData>(res);
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Failed to load dashboard data:', err);
        this.hasError = true;
        this.isLoading = false;
      },
    });
  }

  // 🔸 Template accessors
  get employee(): EmployeeProfileData | undefined {
    return this.dashboardData?.employeeInfo;
  }

  get activities(): Activity[] {
    return this.dashboardData?.activities || [];
  }

  get performance(): Performance[] {
    return this.dashboardData?.performance || [];
  }

  get holidays(): Holiday[] {
    return this.dashboardData?.holidays?.list || [];
  }

  get leaveBalance(): Record<string, LeaveSummary> {
    return this.dashboardData?.leaveBalance || {};
  }
}
