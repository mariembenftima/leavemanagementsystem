import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { DataMapperService } from '../../helpers/data-mapper.service';
import { LeaveRequest } from '../../types/leave-request.model';
import { User } from '../../types/user.model';
import { ApiResponse } from '../../types/api-response.type';
import { environment } from '../../../environments/environment.development';


@Injectable({
  providedIn: 'root',
})
export class AdminService {
  private readonly apiUrl = environment.apiUrl;

  constructor(
    private http: HttpClient,
    private mapper: DataMapperService
  ) {}


  getAllLeaveRequests(): Observable<LeaveRequest[]> {
    return this.http
      .get<ApiResponse<LeaveRequest[]>>(`${this.apiUrl}/leave-requests/all`)
      .pipe(
        map((res) => this.mapper.fromApiArray<LeaveRequest>(res.data || []))
      );
  }

  getPendingRequestsCount(): Observable<number> {
    return this.http
      .get<any>(`${this.apiUrl}/leave-requests/all`)
      .pipe(
        map((res) => {
          const list = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
          return list.filter((r: any) => r.status === 'PENDING').length;
        })
      );
  }


  getRejectedRequestsCount(): Observable<number> {
    return this.http
      .get<ApiResponse<LeaveRequest[]>>(`${this.apiUrl}/leave-requests/all`)
      .pipe(
        map((res) => {
          const list = Array.isArray(res?.data) ? res.data : [];
          return list.filter((r) => r.status?.toUpperCase() === 'REJECTED').length;
        })
      );
  }

  getApprovedRequestsCount(): Observable<number> {
    return this.http
      .get<ApiResponse<LeaveRequest[]>>(`${this.apiUrl}/leave-requests/all`)
      .pipe(
        map((res) => {
          const list = Array.isArray(res?.data) ? res.data : [];
          return list.filter((r) => r.status?.toUpperCase() === 'APPROVED').length;
        })
      );
  }


  approveLeaveRequest(requestId: string, comments?: string): Observable<any> {
    return this.http.patch(
      `${this.apiUrl}/leave-requests/${requestId}/approve`,
      { comments }
    );
  }


  rejectLeaveRequest(requestId: string, reason: string): Observable<any> {
    return this.http.patch(
      `${this.apiUrl}/leave-requests/${requestId}/reject`,
      { reason }
    );
  }


  getAllUsers(): Observable<User[]> {
    return this.http
      .get<ApiResponse<User[]>>(`${this.apiUrl}/users`)
      .pipe(
        map((res) => this.mapper.fromApiArray<User>(res.data || []))
      );
  }

  getUsersCount(): Observable<number> {
    return this.getAllUsers().pipe(
      map((users) => users.length)
    );
  }

  registerUser(formData: FormData): Promise<any> {
    const url = `${this.apiUrl}/auth/register`;
    return this.http.post<ApiResponse<any>>(url, formData).toPromise();
  }


  updateUserStatus(userId: string, isActive: boolean): Observable<any> {
    const endpoint = isActive ? 'activate' : 'deactivate';
    return this.http.patch(`${this.apiUrl}/users/${userId}/${endpoint}`, {});
  }

  deleteUser(userId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/users/${userId}`);
  }

  updateUserRoles(userId: string, roles: string[]): Observable<any> {
    return this.http.patch(`${this.apiUrl}/users/${userId}/roles`, { roles });
  }
}