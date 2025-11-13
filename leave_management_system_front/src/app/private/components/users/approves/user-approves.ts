import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../../services/api.service';
import { AuthService } from '../../../services/auth.service';

interface LeaveStatistic {
  type: string;
  count: number;
  icon: string;
  color: string;
  bgColor: string;
}

interface LeaveRequest {
  id: string;
  employee: string;
  startDate: string;
  endDate: string;
  duration: string;
  status: 'Approved' | 'Pending' | 'Declined';
  leaveType: string;
}

interface FilterOptions {
  leaveType: string;
  status: string;
  dateRange: string;
}

@Component({
  selector: 'app-leave-statistics',
  standalone: false,
  templateUrl: './user-approves.html',
  styleUrls: ['./user-approves.css'],
})
export class UserApproves implements OnInit {
  leaveStats: LeaveStatistic[] = [];

  leaveAllowance = 0;
  leaveUsed = 0;

  leaveRequests: LeaveRequest[] = [];

  filteredRequests: LeaveRequest[] = [];

  filters: FilterOptions = {
    leaveType: 'all',
    status: 'all',
    dateRange: 'all',
  };

  leaveTypes = [
    'All Types',
    'Annual Leave',
    'Sick Leave',
    'Personal Leave',
    'Half Day',
  ];
  statusOptions = ['All Status', 'Approved', 'Pending', 'Declined'];
  dateRangeOptions = ['All Dates', 'This Week', 'This Month', 'Last 30 Days'];

  showFilters = false;
  sortColumn = '';
  sortDirection: 'asc' | 'desc' = 'asc';
  selectedRequests: string[] = [];

  constructor(
    private apiService: ApiService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  private loadData(): void {
    this.loadLeaveRequests();
    this.loadLeaveStatistics();
    this.loadLeaveBalance();
  }

  private loadLeaveRequests(): void {
    this.apiService.getLeaveRequests().subscribe({
      next: (response: any) => {
        if (response.success && response.data) {
          this.leaveRequests = response.data.map((request: any) => ({
            id: request.id,
            employee: `${request.user?.firstName || ''} ${request.user?.lastName || ''}`.trim() || 'Unknown',
            startDate: this.formatDate(request.startDate),
            endDate: this.formatDate(request.endDate),
            duration: this.calculateDuration(request.startDate, request.endDate),
            status: this.mapStatus(request.status),
            leaveType: request.leaveType?.name || 'Unknown',
          }));
          this.filteredRequests = [...this.leaveRequests];
        }
      },
      error: (error) => {
        console.error('Error loading leave requests:', error);
      }
    });
  }

  private loadLeaveStatistics(): void {
    const approved = this.leaveRequests.filter(r => r.status === 'Approved').length;
    const pending = this.leaveRequests.filter(r => r.status === 'Pending').length;
    const declined = this.leaveRequests.filter(r => r.status === 'Declined').length;
    const total = this.leaveRequests.length;

    this.leaveStats = [
      {
        type: 'Approved',
        count: approved,
        icon: '✓',
        color: '#10b981',
        bgColor: '#dcfce7',
      },
      {
        type: 'Pending',
        count: pending,
        icon: '⏳',
        color: '#f59e0b',
        bgColor: '#fef3c7',
      },
      {
        type: 'Requests',
        count: total,
        icon: '📋',
        color: '#ef4444',
        bgColor: '#fecaca',
      },
      {
        type: 'Declined',
        count: declined,
        icon: '✗',
        color: '#ef4444',
        bgColor: '#fecaca',
      },
    ];
  }

  private loadLeaveBalance(): void {
    this.apiService.getDashboardData().subscribe({
      next: (response: any) => {
        if (response.success && response.data?.leaveBalance) {
          const balance = response.data.leaveBalance;
          this.leaveAllowance = balance.annual?.total || 0;
          this.leaveUsed = balance.annual?.used || 0;
        }
      },
      error: (error) => {
        console.error('Error loading leave balance:', error);
      }
    });
  }

  private formatDate(dateString: string): string {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      return 'Invalid Date';
    }
  }

  private calculateDuration(startDate: string, endDate: string): string {
    if (!startDate || !endDate) return 'N/A';
    try {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      
      if (diffDays === 1) return '1 day';
      return `${diffDays} days`;
    } catch (error) {
      return 'N/A';
    }
  }

  private mapStatus(status: string): 'Approved' | 'Pending' | 'Declined' {
    switch (status?.toLowerCase()) {
      case 'approved':
        return 'Approved';
      case 'pending':
        return 'Pending';
      case 'declined':
      case 'rejected':
        return 'Declined';
      default:
        return 'Pending';
    }
  }

  applyFilters(): void {
    this.filteredRequests = this.leaveRequests.filter((request) => {
      const matchesType =
        this.filters.leaveType === 'all' ||
        request.leaveType
          .toLowerCase()
          .includes(this.filters.leaveType.toLowerCase());
      const matchesStatus =
        this.filters.status === 'all' ||
        request.status.toLowerCase() === this.filters.status.toLowerCase();

      const matchesDateRange = this.filters.dateRange === 'all' || true; // Placeholder logic

      return matchesType && matchesStatus && matchesDateRange;
    });
  }

  onFilterChange(filterType: keyof FilterOptions, event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.filters[filterType] = target.value;
    this.applyFilters();
  }

  clearFilters(): void {
    this.filters = {
      leaveType: 'all',
      status: 'all',
      dateRange: 'all',
    };
    this.filteredRequests = [...this.leaveRequests];
  }

  toggleFilters(): void {
    this.showFilters = !this.showFilters;
  }

  sortBy(column: string): void {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }

    this.filteredRequests.sort((a, b) => {
      let aValue = this.getColumnValue(a, column);
      let bValue = this.getColumnValue(b, column);

      if (aValue < bValue) {
        return this.sortDirection === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return this.sortDirection === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }

  private getColumnValue(request: LeaveRequest, column: string): any {
    switch (column) {
      case 'employee':
        return request.employee;
      case 'startDate':
        return request.startDate;
      case 'endDate':
        return request.endDate;
      case 'duration':
        return request.duration;
      case 'status':
        return request.status;
      default:
        return '';
    }
  }

  approveAllPending(): void {
    const pendingRequests = this.leaveRequests.filter(
      (req) => req.status === 'Pending'
    );
    pendingRequests.forEach((req) => (req.status = 'Approved'));

    const approvedStat = this.leaveStats.find(
      (stat) => stat.type === 'Approved'
    );
    const pendingStat = this.leaveStats.find((stat) => stat.type === 'Pending');

    if (approvedStat && pendingStat) {
      approvedStat.count += pendingRequests.length;
      pendingStat.count = 0;
    }

    this.applyFilters();
    console.log('All pending requests approved');
  }

  exportData(): void {
    const csvContent = this.generateCSV();
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');

    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', 'leave_statistics.csv');
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
    console.log('Data exported');
  }

  private generateCSV(): string {
    const headers = [
      'Employee',
      'Start Date',
      'End Date',
      'Duration',
      'Status',
      'Leave Type',
    ];
    const csvRows = [headers.join(',')];

    this.filteredRequests.forEach((request) => {
      const row = [
        request.employee,
        request.startDate,
        request.endDate,
        request.duration,
        request.status,
        request.leaveType,
      ];
      csvRows.push(row.join(','));
    });

    return csvRows.join('\n');
  }

  toggleRequestSelection(requestId: string): void {
    const index = this.selectedRequests.indexOf(requestId);
    if (index > -1) {
      this.selectedRequests.splice(index, 1);
    } else {
      this.selectedRequests.push(requestId);
    }
  }

  isRequestSelected(requestId: string): boolean {
    return this.selectedRequests.includes(requestId);
  }

  selectAllRequests(): void {
    if (this.selectedRequests.length === this.filteredRequests.length) {
      this.selectedRequests = [];
    } else {
      this.selectedRequests = this.filteredRequests.map((req) => req.id);
    }
  }

  changeRequestStatus(
    requestId: string,
    newStatus: 'Approved' | 'Pending' | 'Declined'
  ): void {
    const request = this.leaveRequests.find((req) => req.id === requestId);
    if (request && request.status !== newStatus) {
      const oldStatus = request.status;
      request.status = newStatus;

      this.updateStatistics(oldStatus, newStatus);
      this.applyFilters();

      console.log(
        `Request ${requestId} status changed from ${oldStatus} to ${newStatus}`
      );
    }
  }

  private updateStatistics(oldStatus: string, newStatus: string): void {
    const oldStat = this.leaveStats.find((stat) => stat.type === oldStatus);
    const newStat = this.leaveStats.find((stat) => stat.type === newStatus);

    if (oldStat) oldStat.count = Math.max(0, oldStat.count - 1);
    if (newStat) newStat.count += 1;
  }

  getStatusClass(status: string): string {
    switch (status.toLowerCase()) {
      case 'approved':
        return 'status-approved';
      case 'pending':
        return 'status-pending';
      case 'declined':
        return 'status-declined';
      default:
        return '';
    }
  }

  getLeaveUsagePercentage(): number {
    return this.leaveAllowance > 0
      ? (this.leaveUsed / this.leaveAllowance) * 100
      : 0;
  }

  getRemainingLeave(): number {
    return this.leaveAllowance - this.leaveUsed;
  }

  showActionMenu(event: Event, requestId: string): void {
    event.stopPropagation();
    console.log('Show action menu for request:', requestId);
  }

  editRequest(requestId: string): void {
    console.log('Edit request:', requestId);
  }

  deleteRequest(requestId: string): void {
    const index = this.leaveRequests.findIndex((req) => req.id === requestId);
    if (index > -1) {
      const request = this.leaveRequests[index];
      this.leaveRequests.splice(index, 1);

      const stat = this.leaveStats.find((s) => s.type === request.status);
      if (stat) stat.count = Math.max(0, stat.count - 1);

      this.applyFilters();
      console.log('Request deleted:', requestId);
    }
  }

  viewRequestDetails(requestId: string): void {
    console.log('View request details:', requestId);
  }

  trackByRequestId(index: number, item: LeaveRequest): string {
    return item.id;
  }
}
