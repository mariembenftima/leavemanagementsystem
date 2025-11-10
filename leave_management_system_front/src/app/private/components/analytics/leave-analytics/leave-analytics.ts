import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../../services/api.service';
import { AuthService } from '../../../services/auth.service';

interface LeaveTrend {
  month: string;
  approved: number;
  pending: number;
  rejected: number;
}

interface DepartmentStats {
  department: string;
  totalLeaves: number;
  approvedLeaves: number;
  pendingLeaves: number;
  averageDays: number;
}

interface SeasonalPattern {
  quarter: string;
  leaveCount: number;
  percentage: number;
}

@Component({
  selector: 'app-leave-analytics',
  standalone: false,
  templateUrl: './leave-analytics.html',
  styleUrls: ['./leave-analytics.css'],
})
export class LeaveAnalytics implements OnInit {
  leaveTrendsData: LeaveTrend[] = [];
  departmentStats: DepartmentStats[] = [];
  seasonalPatterns: SeasonalPattern[] = [];
  
  selectedTimeRange: string = '12months';
  selectedDepartment: string = 'all';
  isLoading: boolean = false;
  
  leaveTrendsChart: any = {
    type: 'line',
    data: {
      labels: [],
      datasets: [
        {
          label: 'Approved',
          data: [],
          borderColor: '#10b981',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          tension: 0.4,
          fill: true
        },
        {
          label: 'Pending',
          data: [],
          borderColor: '#f59e0b',
          backgroundColor: 'rgba(245, 158, 11, 0.1)',
          tension: 0.4,
          fill: true
        },
        {
          label: 'Rejected',
          data: [],
          borderColor: '#ef4444',
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          tension: 0.4,
          fill: true
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: {
          display: true,
          text: 'Leave Requests Trend (Last 12 Months)',
          font: { size: 16, weight: 'bold' }
        },
        legend: {
          position: 'top' as const,
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            precision: 0
          }
        }
      }
    }
  };

  departmentChart: any = {
    type: 'bar',
    data: {
      labels: [],
      datasets: [
        {
          label: 'Total Leaves',
          data: [],
          backgroundColor: '#3b82f6',
          borderColor: '#2563eb',
          borderWidth: 1
        },
        {
          label: 'Approved',
          data: [],
          backgroundColor: '#10b981',
          borderColor: '#059669',
          borderWidth: 1
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: {
          display: true,
          text: 'Leave Requests by Department',
          font: { size: 16, weight: 'bold' }
        },
        legend: {
          position: 'top' as const,
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            precision: 0
          }
        }
      }
    }
  };

  seasonalChart: any = {
    type: 'doughnut',
    data: {
      labels: [],
      datasets: [{
        data: [],
        backgroundColor: [
          '#3b82f6',
          '#10b981',
          '#f59e0b',
          '#ef4444'
        ],
        borderWidth: 2,
        borderColor: '#ffffff'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: {
          display: true,
          text: 'Seasonal Leave Distribution',
          font: { size: 16, weight: 'bold' }
        },
        legend: {
          position: 'bottom' as const,
        }
      }
    }
  };

  totalStats = {
    totalRequests: 0,
    approvedRequests: 0,
    pendingRequests: 0,
    rejectedRequests: 0,
    averageProcessingTime: 0
  };


  constructor(
    private apiService: ApiService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadAnalyticsData();
  }
private updateTrendsChart(): void {
  if (!this.leaveTrendsChart?.data) return;

  this.leaveTrendsChart.data.labels = this.leaveTrendsData.map(t => t.month);
  this.leaveTrendsChart.data.datasets[0].data = this.leaveTrendsData.map(t => t.approved);
  this.leaveTrendsChart.data.datasets[1].data = this.leaveTrendsData.map(t => t.pending);
  this.leaveTrendsChart.data.datasets[2].data = this.leaveTrendsData.map(t => t.rejected);

  this.refreshChartInstance(this.leaveTrendsChart);
}

private updateDepartmentChart(): void {
  if (!this.departmentChart?.data) return;

  this.departmentChart.data.labels = this.departmentStats.map(d => d.department);
  this.departmentChart.data.datasets[0].data = this.departmentStats.map(d => d.totalLeaves);
  this.departmentChart.data.datasets[1].data = this.departmentStats.map(d => d.approvedLeaves);

  this.refreshChartInstance(this.departmentChart);
}

private updateSeasonalChart(): void {
  if (!this.seasonalChart?.data) return;

  this.seasonalChart.data.labels = this.seasonalPatterns.map(s => s.quarter);
  this.seasonalChart.data.datasets[0].data = this.seasonalPatterns.map(s => s.leaveCount);

  this.refreshChartInstance(this.seasonalChart);
}

private refreshChartInstance(chart: any): void {
  try {
    if (chart && typeof chart.update === 'function') {
      chart.update();
    } else if (chart?.ctx?.canvas) {
      const ChartJS = (window as any).Chart;
      if (ChartJS) {
        new ChartJS(chart.ctx, chart);
      }
    }
  } catch (err) {
    console.warn('Chart update failed:', err);
  }
}

private async loadAnalyticsData(): Promise<void> {
  this.isLoading = true;

  try {
    const leaves: any[] = (await this.apiService.getAllLeaveRequests().toPromise()) ?? [];

    this.computeLeaveTrends(leaves);
    this.computeDepartmentStats(leaves);
    this.computeSeasonalPatterns(leaves);
    this.computeTotalStats(leaves);

    this.updateTrendsChart();
    this.updateDepartmentChart();
    this.updateSeasonalChart();
  } catch (err) {
    console.error('Failed to load analytics:', err);
  } finally {
    this.isLoading = false;
  }
}

private computeLeaveTrends(leaves: any[]): void {
  const monthlyData: Record<string, { approved: number; pending: number; rejected: number }> = {};

  leaves.forEach(l => {
    const month = new Date(l.start_date).toLocaleString('en', { month: 'short' });
    if (!monthlyData[month]) monthlyData[month] = { approved: 0, pending: 0, rejected: 0 };
    const status = l.status?.toLowerCase();
    if (status === 'approved' || status === 'pending' || status === 'rejected') {
      monthlyData[month][status as 'approved' | 'pending' | 'rejected'] = (monthlyData[month][status as 'approved' | 'pending' | 'rejected'] || 0) + 1;
    }
  });

  this.leaveTrendsData = Object.entries(monthlyData).map(([month, counts]) => ({
    month,
    approved: counts.approved || 0,
    pending: counts.pending || 0,
    rejected: counts.rejected || 0,
  }));
}

private computeDepartmentStats(leaves: any[]): void {
  const deptMap: Record<string, { total: number; approved: number; pending: number; totalDays: number }> = {};

  leaves.forEach(l => {
    const dept = l.user?.team?.name || 'Unassigned';
    if (!deptMap[dept]) deptMap[dept] = { total: 0, approved: 0, pending: 0, totalDays: 0 };

    deptMap[dept].total++;
    if (l.status === 'approved') deptMap[dept].approved++;
    if (l.status === 'pending') deptMap[dept].pending++;

    const start = new Date(l.start_date);
    const end = new Date(l.end_date);
    const diffDays = (end.getTime() - start.getTime()) / (1000 * 3600 * 24) + 1;
    deptMap[dept].totalDays += diffDays;
  });

  this.departmentStats = Object.entries(deptMap).map(([department, stats]) => ({
    department,
    totalLeaves: stats.total,
    approvedLeaves: stats.approved,
    pendingLeaves: stats.pending,
    averageDays: stats.totalDays / stats.total || 0,
  }));
}

private computeSeasonalPatterns(leaves: any[]): void {
  const quarters = { 'Q1 (Jan–Mar)': 0, 'Q2 (Apr–Jun)': 0, 'Q3 (Jul–Sep)': 0, 'Q4 (Oct–Dec)': 0 };

  leaves.forEach(l => {
    const month = new Date(l.start_date).getMonth();
    if (month <= 2) quarters['Q1 (Jan–Mar)']++;
    else if (month <= 5) quarters['Q2 (Apr–Jun)']++;
    else if (month <= 8) quarters['Q3 (Jul–Sep)']++;
    else quarters['Q4 (Oct–Dec)']++;
  });

  const total = Object.values(quarters).reduce((a, b) => a + b, 0);
  this.seasonalPatterns = Object.entries(quarters).map(([quarter, count]) => ({
    quarter,
    leaveCount: count,
    percentage: total ? (count / total) * 100 : 0,
  }));
}

private computeTotalStats(leaves: any[]): void {
  const approved = leaves.filter(l => l.status === 'approved').length;
  const pending = leaves.filter(l => l.status === 'pending').length;
  const rejected = leaves.filter(l => l.status === 'rejected').length;
  const total = leaves.length;

  this.totalStats = {
    totalRequests: total,
    approvedRequests: approved,
    pendingRequests: pending,
    rejectedRequests: rejected,
    averageProcessingTime: 0 
  };
}


  onTimeRangeChange(): void {
    this.loadAnalyticsData();
  }

  onDepartmentChange(): void {
    this.loadAnalyticsData();
  }

  refreshData(): void {
    this.loadAnalyticsData();
  }

  exportData(): void {
    const data = {
      trends: this.leaveTrendsData,
      departments: this.departmentStats,
      seasonal: this.seasonalPatterns,
      stats: this.totalStats
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'leave-analytics.json';
    link.click();
    URL.revokeObjectURL(url);
  }
}
