import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { Activity } from '../../../../types/activity.model';
import { Performance } from '../../../../types/performance.model';
import { Holiday } from '../../../../types/holiday.model';
import { DataMapperService } from '../../../../helpers/data-mapper.service';
import { HttpClient } from '@angular/common/http';
import { ApiService } from '../../../services/api.service';

interface DashboardResponse {
  user: {
    name: string;
    email: string;
    role: string;
    department: string;
  };
  employeeInfo: {
    department: string;
    designation: string;
    joinDate: string;
    employeeId: string;
    workExperience: string;
    gender: string;
  };
  contactInfo: {
    email: string;
    phone: string;
    emergencyContact: string;
    address: string;
  };
  performance?: {
    id: number;
    reviewPeriod: string;
    rating: string;
    feedback?: string;
    updatedAt: string;
  };
  leaveBalance: {
    [key: string]: {
      total: number;
      used: number;
      remaining: number;
    };
  };
  recentActivities: Array<{
    title: string;
    description: string;
    date: string;
  }>;
  holidays?: {
    list: Holiday[];
  };
}

@Component({
  selector: 'app-dashboard',
  standalone: false,
  templateUrl: './user-dashboard.html',
  styleUrls: ['./user-dashboard.css'],
})
export class UserDashboard implements OnInit, OnDestroy {
  dashboardData: DashboardResponse | null = null;
  isLoading = true;
  hasError = false;

  private destroy$ = new Subject<void>();

  constructor(
    private http: HttpClient,
    private mapper: DataMapperService,
    private apiService: ApiService
  ) { }

  ngOnInit(): void {
    this.loadDashboardData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadDashboardData(): void {
    this.apiService.getDashboardData()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          this.dashboardData = response?.data || response;
          this.isLoading = false;
          console.log('✅ Dashboard data loaded:', this.dashboardData);
        },
        error: (err) => {
          console.error('Failed to load dashboard data:', err);
          this.hasError = true;
          this.isLoading = false;
        },
      });
  }

  get activities(): Array<{title: string, description: string, date: string}> {
    return this.dashboardData?.recentActivities || [];
  }

  get performance() {
    return this.dashboardData?.performance;
  }

  get holidays(): Holiday[] {
    return this.dashboardData?.holidays?.list || [];
  }

  get leaveBalance(): Record<string, {total: number, used: number, remaining: number}> {
    return this.dashboardData?.leaveBalance || {};
  }
}