import { Component, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
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

@Component({
  selector: 'app-admin-dashboard',
  standalone: false,
  templateUrl: './admin-dashboard.html',
  styleUrls: ['./admin-dashboard.css'],
})
export class AdminDashboard implements OnInit {
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

  constructor(
    private router: Router,
    private api: ApiService,
    private mapper: DataMapperService
  ) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  private loadDashboardData(): void {
    this.api.getAllUsersCount().subscribe({
      next: (count) => this.userCount.set(count),
      error: (err) => console.error('Failed to load user count', err),
    });

    this.api.getAllPendingRequests().subscribe({
      next: (res) => {
        this.pendingCount.set(res);
        this.stats.pendingRequests = res;
      },
    });

    this.api.getAllRejectedRequests().subscribe({
      next: (res) => {
        this.rejectedCount.set(res);
        this.stats.rejectedRequests = res;
      },
    });

    this.api.getAllApprovedRequests().subscribe({
      next: (res) => {
        this.approvedCount.set(res);
        this.stats.approvedRequests = res;
      },
    });

    this.api.getLeaveTypes().subscribe({
      next: (res) => {
        this.leaveTypeCount.set(res.length);
        this.stats.totalLeaveTypes = res.length;
      },
      error: (err) => console.error('Failed to load leave types', err),
    });

    this.api.getHolidays().subscribe({
      next: (res) => {
        const activeHolidays = res.filter(
          (h: Holiday) => new Date(h.date) > new Date()
        );
        this.holidayCount.set(activeHolidays.length);
        this.stats.activeHolidays = activeHolidays.length;
      },
      error: (err) => console.error('Failed to load holidays', err),
    });

    this.loadRecentActivities();
  }

  private loadRecentActivities(): void {
    this.api
      .getDashboardData()
      .subscribe({
        next: (res) => {
          const mapped = this.mapper.fromApiArray<Activity>(res.activities || []);
          this.recentActivities = mapped.slice(0, 6); 
        },
        error: (err) => console.error('Failed to load activities', err),
      });
  }

  navigateTo(route: string): void {
    this.router.navigate([route]);
  }

  getActivityIcon(type: string): string {
    switch (type) {
      case 'leave_request': return '📝';
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
