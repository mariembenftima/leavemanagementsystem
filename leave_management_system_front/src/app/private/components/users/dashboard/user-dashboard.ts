import { Component, OnInit } from '@angular/core';
import { DashboardData } from '../../../../types/dashboard-data.type';
import { Activity } from '../../../../types/activity.model';
import { Performance } from '../../../../types/performance.model';
import { Holiday } from '../../../../types/holiday.model';
import { DataMapperService } from '../../../../helpers/data-mapper.service';
import { HttpClient } from '@angular/common/http';
import { LeaveSummary } from '../../../../types/leave-summary.type';
import { ApiService } from '../../../services/api.service';
import { EmployeeProfile } from '../../../../types/employee-profile.model';

@Component({
  selector: 'app-dashboard',
  standalone: false,
  templateUrl: './user-dashboard.html',
  styleUrls: ['./user-dashboard.css'],
})
export class UserDashboard implements OnInit {
  dashboardData: DashboardData | null = null;
  isLoading = true;
  hasError = false;

  constructor(
    private http: HttpClient,
    private mapper: DataMapperService,
    private apiService: ApiService
  ) { }

  ngOnInit(): void {
    this.loadDashboardData();
  }

  private loadDashboardData(): void {
    const authToken = localStorage.getItem('authToken');
    const userData = localStorage.getItem('currentUser');
    console.log('📱 Dashboard loading - checking auth...');
    console.log('🔐 Auth token exists:', authToken ? 'Yes' : 'No');
    console.log('👤 User data exists:', userData ? 'Yes' : 'No');
    console.log('🔐 Token preview:', authToken ? authToken.substring(0, 50) + '...' : 'NULL');

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
  

  get employee(): EmployeeProfile | undefined {
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
