import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { DataMapperService } from '../../helpers/data-mapper.service';
import { EmployeeProfileData } from '../types/user/profileType/employee-profile-data.type';
import { DashboardData } from '../../types/dashboard-data.type';
import { LeaveType } from '../types/user/leaveRequestsType/leave-type.model';
import { LeaveRequest } from '../types/user/leaveRequestsType/leave-request.model';
import { Holiday } from '../../types/holiday.model';
import { User } from '../../types/user.model';
import { ApiResponse } from '../../types/api-response.type';


@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient, private mapper: DataMapperService) { }

  // 🔹 Profile APIs
  getProfile(userId?: string): Observable<EmployeeProfileData> {
    const url = userId
      ? `${this.apiUrl}/profile/${userId}`
      : `${this.apiUrl}/profile/me`;

    return this.http.get<ApiResponse<EmployeeProfileData>>(url).pipe(
      map((res) => this.mapper.fromApi<EmployeeProfileData>(res.data))
    );
  }

  updateProfile(
    profileData: Partial<EmployeeProfileData>
  ): Observable<EmployeeProfileData> {
    return this.http
      .put<ApiResponse<EmployeeProfileData>>(
        `${this.apiUrl}/profile`,
        this.mapper.toApi(profileData)
      )
      .pipe(map((res) => this.mapper.fromApi<EmployeeProfileData>(res.data)));
  }

  // 🔹 Dashboard APIs
  getDashboardData(): Observable<DashboardData> {
    return this.http
      .get<ApiResponse<DashboardData>>(`${this.apiUrl}/profile/dashboard`)
      .pipe(map((res) => this.mapper.fromApi<DashboardData>(res.data)));
  }

  // 🔹 Leave APIs
  getLeaveTypes(): Observable<LeaveType[]> {
    return this.http
      .get<ApiResponse<LeaveType[]>>(`${this.apiUrl}/leave-types`)
      .pipe(map((res) => this.mapper.fromApiArray<LeaveType>(res.data)));
  }

  submitLeaveRequest(leaveRequest: LeaveRequest): Observable<ApiResponse<any>> {
    const formData = new FormData();
    formData.append('leaveTypeId', leaveRequest.leave_type_id);
    formData.append('startDate', leaveRequest.start_date);
    formData.append('endDate', leaveRequest.end_date);
    formData.append('reason', leaveRequest.reason);
    formData.append('isHalfday', String(leaveRequest.is_half_day));



    if (leaveRequest.attachments?.length) {
      leaveRequest.attachments.forEach((file) =>
        formData.append('attachments', file)
      );
    }

    return this.http.post<ApiResponse<any>>(
      `${this.apiUrl}/leave-requests`,
      formData
    );
  }

  getMyLeaveRequests(): Observable<LeaveRequest[]> {
    return this.http
      .get<ApiResponse<LeaveRequest[]>>(`${this.apiUrl}/leave-requests/me`)
      .pipe(map((res) => this.mapper.fromApiArray<LeaveRequest>(res.data)));
  }

  // 🔹 Leave Request Stats
  getAllPendingRequests(): Observable<number> {
    return this.http
      .get<ApiResponse<LeaveRequest[]>>(`${this.apiUrl}/leave-requests/all`)
      .pipe(map((res) => res.data.filter((r) => r.status === 'pending').length));
  }

  getAllRejectedRequests(): Observable<number> {
    return this.http
      .get<ApiResponse<LeaveRequest[]>>(`${this.apiUrl}/leave-requests/all`)
      .pipe(map((res) => res.data.filter((r) => r.status === 'rejected').length));
  }

  getAllApprovedRequests(): Observable<number> {
    return this.http
      .get<ApiResponse<LeaveRequest[]>>(`${this.apiUrl}/leave-requests/all`)
      .pipe(map((res) => res.data.filter((r) => r.status === 'approved').length));
  }


  // 🔹 Calendar APIs
  getCalendarEvents(month?: number, year?: number): Observable<any[]> {
    const params = new URLSearchParams();
    if (month !== undefined) params.append('month', String(month));
    if (year !== undefined) params.append('year', String(year));
    const url = `${this.apiUrl}/calendar/events${params.toString() ? '?' + params.toString() : ''
      }`;
    return this.http
      .get<ApiResponse<any[]>>(url)
      .pipe(map((res) => this.mapper.fromApiArray<any>(res.data)));
  }

  // 🔹 Holidays
  getHolidays(year?: number): Observable<Holiday[]> {
    const url = year
      ? `${this.apiUrl}/holidays?year=${year}`
      : `${this.apiUrl}/holidays`;
    return this.http
      .get<ApiResponse<Holiday[]>>(url)
      .pipe(map((res) => this.mapper.fromApiArray<Holiday>(res.data)));
  }

  // 🔹 User APIs
  getAllUsers(): Observable<User[]> {
    return this.http
      .get<ApiResponse<User[]>>(`${this.apiUrl}/users`)
      .pipe(map((res) => this.mapper.fromApiArray<User>(res.data)));
  }

  getAllUsersCount(): Observable<number> {
    return this.getAllUsers().pipe(map((users) => users.length));
  }
  // 🔹 Register user with optional profile picture
  registerWithFile(formData: FormData): Promise<any> {
    const url = `${this.apiUrl}/auth/register`;
    return this.http.post<ApiResponse<any>>(url, formData).toPromise();
  }

}

export type { LeaveRequest };

  export type { LeaveType };

