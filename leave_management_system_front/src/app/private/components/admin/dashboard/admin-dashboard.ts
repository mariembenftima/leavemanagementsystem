import { Component, OnInit, OnDestroy, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';  
import { ApiService } from '../../../services/api.service';
import { Activity } from '../../../../types/activity.model';
import { DataMapperService } from '../../../../helpers/data-mapper.service';
import { Holiday } from '../../../../types/holiday.model';

interface DashboardStats {
  pendingRequests: number;
  approvedRequests: number;
  rejectedRequests: number;
  totalLeaveTypes: number;
  activeHolidays: number;
}

interface AdminDashboardData {
  userCount: number;
  pendingRequests: number;
  approvedRequests: number;
  rejectedRequests: number;
  totalLeaveTypes: number;
  holidays: Holiday[];
  activities: Activity[];
}

@Component({
  selector: 'app-admin-dashboard',
  standalone: false,
  templateUrl: './admin-dashboard.html',
  styleUrls: ['./admin-dashboard.css'],
})
export class AdminDashboard implements OnInit, OnDestroy {
  userCount = signal<number>(0);
  pendingCount = signal<number>(0);
  approvedCount = signal<number>(0);
  rejectedCount = signal<number>(0);
  leaveTypeCount = signal<number>(0);
  holidayCount = signal<number>(0);

  stats: DashboardStats = {
    pendingRequests: 0,
    approvedRequests: 0,
    rejectedRequests: 0,
    totalLeaveTypes: 0,
    activeHolidays: 0,
  };

  recentActivities: Activity[] = [];

  private destroy$ = new Subject<void>(); 

  constructor(
    private router: Router,
    private api: ApiService,
    private mapper: DataMapperService
  ) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  ngOnDestroy(): void { 
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadDashboardData(): void {
    this.api.getAdminDashboardData()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {

          if (!response || !response.data) {
            console.error('Invalid response structure:', response);
            return;
          }

          const data = response.data;

          this.userCount.set(data.userCount || 0);
          this.pendingCount.set(data.pendingRequests || 0);
          this.approvedCount.set(data.approvedRequests || 0);
          this.rejectedCount.set(data.rejectedRequests || 0);
          this.leaveTypeCount.set(data.totalLeaveTypes || 0);

          const activeHolidays = (data.holidays || []).filter(
            (h: Holiday) => new Date(h.date) > new Date()
          );
          this.holidayCount.set(activeHolidays.length);
  
          this.stats = {
            pendingRequests: data.pendingRequests || 0,
            approvedRequests: data.approvedRequests || 0,
            rejectedRequests: data.rejectedRequests || 0,
            totalLeaveTypes: data.totalLeaveTypes || 0,
            activeHolidays: activeHolidays.length,
          };
        
          if (data.activities && data.activities.length > 0) {
            const mapped = this.mapper.fromApiArray<Activity>(data.activities);
            this.recentActivities = mapped.slice(0, 6);
          }
        },
        error: (err) => {
          console.error('Failed to load dashboard data', err);
        },
      });
  }

  navigateTo(route: string): void {
    this.router.navigate([route]);
  }

  getActivityIcon(type: string): string {
    switch (type) {
      case 'leave_request': return '📄';
      case 'user_created': return '👤';
      case 'holiday_added': return '🎉';
      default: return '📋';
    }
  }

  formatTime(timestamp: string | Date): string {
    const date = new Date(timestamp);
    const diffMs = Date.now() - date.getTime();
    const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
    if (diffHrs < 1) return 'Just now';
    if (diffHrs < 24) return `${diffHrs}h ago`;
    return `${Math.floor(diffHrs / 24)}d ago`;
  }

  getStatusColor(status: string | undefined): string {
    switch (status?.toLowerCase()) {
      case 'pending': return '#f39c12';
      case 'approved': return '#27ae60';
      case 'rejected': return '#e74c3c';
      default: return '#95a5a6';
    }
  }
}