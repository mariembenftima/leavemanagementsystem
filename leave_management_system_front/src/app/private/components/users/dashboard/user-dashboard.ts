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
import { ApiService } from '../../../services/api.service';

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
    private mapper: DataMapperService,
    private apiService: ApiService
  ) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  private loadDashboardData(): void {
    this.apiService.getDashboardData().subscribe({
      next: (data) => {
        this.dashboardData = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Failed to load dashboard data:', err);
        this.hasError = true;
        this.isLoading = false;
      },
    });
  }

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
