import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { DataMapperService } from '../../helpers/data-mapper.service';
import { EmployeeProfile } from '../../types/employee-profile.model';
import { LeaveBalance } from '../../types/leave-balance.model';
import { ApiResponse } from '../../types/api-response.type';
import { environment } from '../../../environments/environment.development';

@Injectable({
  providedIn: 'root',
})
export class ProfileService {
  private readonly apiUrl = environment.apiUrl;

  constructor(
    private http: HttpClient,
    private mapper: DataMapperService
  ) {}

  getProfile(): Observable<EmployeeProfile> {
    return this.http.get<any>(`${this.apiUrl}/profile/me`).pipe(
      map((res) => {
        // Handle different response structures from backend
        if (res?.data) {
          return this.mapper.fromApi<EmployeeProfile>(res.data);
        }
        if (res?.user) {
          return this.mapper.fromApi<EmployeeProfile>(res.user);
        }
        return this.mapper.fromApi<EmployeeProfile>(res);
      })
    );
  }


  updateProfile(profileData: Partial<EmployeeProfile>): Observable<EmployeeProfile> {
    return this.http
      .put<ApiResponse<EmployeeProfile>>(
        `${this.apiUrl}/profile`,
        this.mapper.toApi(profileData)
      )
      .pipe(
        map((res) => this.mapper.fromApi<EmployeeProfile>(res.data))
      );
  }


  uploadProfilePicture(userId: string, file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    
    return this.http.post(
      `${this.apiUrl}/users/${userId}/profile-pic`,
      formData
    );
  }

  getMyLeaveBalances(): Observable<Record<string, LeaveBalance>> {
    return this.http.get<any>(`${this.apiUrl}/leave-balances/me`).pipe(
      map((res) => res?.data || res || {})
    );
  }


  getUserLeaveBalances(userId: string): Observable<Record<string, LeaveBalance>> {
    return this.http
      .get<ApiResponse<Record<string, LeaveBalance>>>(
        `${this.apiUrl}/leave-balances/user/${userId}`
      )
      .pipe(
        map((res) => this.mapper.fromApi<Record<string, LeaveBalance>>(res.data))
      );
  }
}