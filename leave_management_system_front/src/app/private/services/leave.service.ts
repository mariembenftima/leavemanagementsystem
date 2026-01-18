import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { DataMapperService } from '../../helpers/data-mapper.service';
import { LeaveType } from '../types/user/leaveRequestsType/leave-type.model';
import { LeaveRequest } from '../../types/leave-request.model';
import { ApiResponse } from '../../types/api-response.type';
import { environment } from '../../../environments/environment.development';


@Injectable({
  providedIn: 'root',
})
export class LeaveService {
  private readonly apiUrl = environment.apiUrl;

  constructor(
    private http: HttpClient,
    private mapper: DataMapperService
  ) {}


  getLeaveTypes(): Observable<LeaveType[]> {
    return this.http
      .get<ApiResponse<LeaveType[]>>(`${this.apiUrl}/leave-types`)
      .pipe(
        map((res) => this.mapper.fromApiArray<LeaveType>(res.data || []))
      );
  }

  getMyLeaveRequests(): Observable<LeaveRequest[]> {
    return this.http
      .get<ApiResponse<LeaveRequest[]>>(`${this.apiUrl}/leave-requests`)
      .pipe(
        map((res) => this.mapper.fromApiArray<LeaveRequest>(res.data || []))
      );
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
eLeaveRequest(payload: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/leave-requests`, payload);
  }

  updateLeaveRequest(requestId: string, payload: Partial<LeaveRequest>): Observable<any> {
    return this.http.put(
      `${this.apiUrl}/leave-requests/${requestId}`,
      this.mapper.toApi(payload)
    );
  }


  cancelLeaveRequest(requestId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/leave-requests/${requestId}`);
  }


  getLeaveRequestById(requestId: string): Observable<LeaveRequest> {
    return this.http
      .get<ApiResponse<LeaveRequest>>(`${this.apiUrl}/leave-requests/${requestId}`)
      .pipe(
        map((res) => this.mapper.fromApi<LeaveRequest>(res.data))
      );
  }
}