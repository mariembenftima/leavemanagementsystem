import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { DataMapperService } from '../../helpers/data-mapper.service';
import { Holiday } from '../../types/holiday.model';
import { Activity } from '../../types/activity.model';
import { ApiResponse } from '../../types/api-response.type';
import { DashboardData } from '../../types/dashboard-data.type';
import { Team } from '../../types/team.model';
import { User } from '../../types/user.model';
import { LeaveBalance } from '../../types/leave-balance.model';

interface LeaveRequest {
  id: string;
  leaveTypeId: number;
  startDate: string;
  endDate: string;
  reason?: string;
  is_half_day?: boolean;
  emergency_contact?: string;
  manager_email?: string;
  totalDays: number;
  status?: string;
  attachment?: File;
  user?: {
    firstName?: string;
    lastName?: string;
  };
  leaveType?: {
    name?: string;
  };
}

interface LeaveType {
  id: number;
  name: string;
  description?: string;
  maxDays?: number;
  requiresApproval?: boolean;
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

interface LeaveRequestsWithBalanceData {
  requests: LeaveRequest[];
  leaveBalance: any; 
}

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private apiUrl = environment.apiUrl;

  constructor(
    private http: HttpClient,
    private mapper: DataMapperService
  ) {}

  updateProfile(data: any): Observable<any> {
    return this.http.patch<ApiResponse<any>>(`${this.apiUrl}/profile`, data);
  }

  getProfile(): Observable<any> {
    return this.http
      .get<ApiResponse<any>>(`${this.apiUrl}/profile/me`)
      .pipe(map((res) => this.mapper.fromApi<any>(res.data)));
  }

  uploadProfilePicture(userId: string, file: File) {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post(
      `${this.apiUrl}/users/${userId}/profile-pic`,
      formData
    );
  }

  getDashboardData(): Observable<DashboardData> {
    return this.http
      .get<ApiResponse<DashboardData>>(`${this.apiUrl}/profile/dashboard`)
      .pipe(map((res) => this.mapper.fromApi<DashboardData>(res.data)));
  }

  getLeaveTypes(): Observable<LeaveType[]> {
    return this.http
      .get<ApiResponse<LeaveType[]>>(`${this.apiUrl}/leave-types`)
      .pipe(map((res) => this.mapper.fromApiArray<LeaveType>(res.data || [])));
  }

  submitLeaveRequest(leaveRequest: LeaveRequest): Observable<ApiResponse<any>> {
    const formData = new FormData();

    formData.append('leaveType', leaveRequest.leaveTypeId.toString());
    formData.append('startDate', leaveRequest.startDate);
    formData.append('endDate', leaveRequest.endDate);
    formData.append('reason', leaveRequest.reason || '');
    formData.append('isHalfDay', String(leaveRequest.is_half_day ?? false));
    formData.append('emergencyContact', leaveRequest.emergency_contact || '');
    formData.append('managerEmail', leaveRequest.manager_email || '');
    formData.append('totalDays', leaveRequest.totalDays.toString());

    if (leaveRequest.attachment && leaveRequest.attachment instanceof File) {
      formData.append('attachment', leaveRequest.attachment);
    }

    return this.http.post<ApiResponse<any>>(
      `${this.apiUrl}/leave-requests`,
      formData
    );
  }

  createLeaveRequest(payload: any) {
    return this.http.post(`${this.apiUrl}/leave-requests`, payload);
  }

  getLeaveRequests(): Observable<LeaveRequest[]> {
    return this.http
      .get<ApiResponse<LeaveRequest[]>>(`${this.apiUrl}/leave-requests`)
      .pipe(map((res) => this.mapper.fromApiArray<LeaveRequest>(res.data || [])));
  }

  getTeams(): Observable<Team[]> {
    return this.http
      .get<any>(`${this.apiUrl}/teams`)
      .pipe(map((res) => (res && res.data ? res.data : res)));
  }

  getAllPendingRequests(): Observable<number> {
    return this.http
      .get<any>(`${this.apiUrl}/leave-requests/all`)
      .pipe(
        map((res) => {
          const list = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
          return list.filter((r: any) => r.status === 'PENDING').length;
        })
      );
  }

  getAllRejectedRequests(): Observable<number> {
    return this.http
      .get<ApiResponse<LeaveRequest[]>>(`${this.apiUrl}/leave-requests/all`)
      .pipe(
        map((res) => {
          const list = Array.isArray(res?.data) ? res.data : [];
          return list.filter((r) => r.status?.toUpperCase() === 'REJECTED').length;
        })
      );
  }

  getAllApprovedRequests(): Observable<number> {
    return this.http
      .get<ApiResponse<LeaveRequest[]>>(`${this.apiUrl}/leave-requests/all`)
      .pipe(
        map((res) => {
          const list = Array.isArray(res?.data) ? res.data : [];
          return list.filter((r) => r.status?.toUpperCase() === 'APPROVED').length;
        })
      );
  }

  getAllLeaveRequests(): Observable<LeaveRequest[]> {
    return this.http
      .get<ApiResponse<LeaveRequest[]>>(`${this.apiUrl}/leave-requests/all`)
      .pipe(map((res) => this.mapper.fromApiArray<LeaveRequest>(res.data || [])));
  }

  getCalendarEvents(month?: number, year?: number): Observable<any[]> {
    const params = new URLSearchParams();
    if (month !== undefined) params.append('month', String(month));
    if (year !== undefined) params.append('year', String(year));
    const url = `${this.apiUrl}/calendar/events${params.toString() ? '?' + params.toString() : ''}`;
    return this.http
      .get<ApiResponse<any[]>>(url)
      .pipe(map((res) => this.mapper.fromApiArray<any>(res.data || [])));
  }

  getHolidays(year?: number): Observable<Holiday[]> {
    let url = `${this.apiUrl}/holidays`;

    if (year) {
      url += `?year=${year}`;
    }

    return this.http
      .get<ApiResponse<Holiday[]>>(url)
      .pipe(map((res) => this.mapper.fromApiArray<Holiday>(res.data || [])));
  }

  getAllUsers(): Observable<User[]> {
    return this.http
      .get<ApiResponse<User[]>>(`${this.apiUrl}/users`)
      .pipe(map((res) => this.mapper.fromApiArray<User>(res.data || [])));
  }

  getAllUsersCount(): Observable<number> {
    return this.getAllUsers().pipe(map((users) => users.length));
  }

  getUserLeaveBalances(userId: string): Observable<Record<string, LeaveBalance>> {
    return this.http
      .get<ApiResponse<Record<string, LeaveBalance>>>(`${this.apiUrl}/leave-balances/user/${userId}`)
      .pipe(map((res) => this.mapper.fromApi<Record<string, LeaveBalance>>(res.data)));
  }

  registerWithFile(formData: FormData): Promise<any> {
    const url = `${this.apiUrl}/auth/register`;
    return this.http.post<ApiResponse<any>>(url, formData).toPromise();
  }

  getAdminDashboardData(): Observable<ApiResponse<AdminDashboardData>> {
    return this.http.get<ApiResponse<AdminDashboardData>>(
      `${this.apiUrl}/admin/dashboard`
    );
  }

  getLeaveRequestsWithBalance(): Observable<ApiResponse<LeaveRequestsWithBalanceData>> {
    return this.http.get<ApiResponse<LeaveRequestsWithBalanceData>>(
      `${this.apiUrl}/leave-requests/with-balance`
    );
  }
}

export type { LeaveRequest };
export type { LeaveType };
export type { AdminDashboardData };
export type { LeaveRequestsWithBalanceData };