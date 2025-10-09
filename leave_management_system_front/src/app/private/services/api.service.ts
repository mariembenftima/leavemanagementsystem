import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { count, firstValueFrom, map, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface ProfileData {
  
  id: string;                     // users.id
  username: string;               // users.username
  fullname: string;               // users.fullname
  email: string;                  // users.email
  phone_number: string;           // users.phone_number
  address: string;                // users.address
  date_of_birth: string;          // users.date_of_birth
  team_id: string;                // users.team_id
  profile_picture_url?: string;   // users.profile_picture_url
  roles?: string;                 // users.roles
  is_active?: boolean;            // users.is_active
  created_at?: string;            // users.created_at
  updated_at?: string;            // users.updated_at

}

export interface DashboardData {
  employeeInfo: {
    department: string;
    designation: string;
    joinDate: string;
    employeeId: string;
    workExperience: string;
    gender: string;
    idProof: string;
  };
  contactInfo: {
    email: string;
    phone: string;
    emergencyContact: string;
    currentAddress: string;
  };
  leaveBalance: {
  id: string;             // leave_balances.id
  user_id: string;        // leave_balances.user_id
  leave_type_id: string;  // leave_balances.leave_type_id
  year: number;           // leave_balances.year
  carryover: number;      // leave_balances.carryover
  used: number;           // leave_balances.used
  };
  recentActivities: Array<{
    id: string;
    type: string;
    description: string;
    date: string;
    status: string;
  }>;
  performance: {
    attendanceRate: number;
    performanceScore: number;
    projectsCompleted: number;
    activeProjects: number;
  };
}

export interface LeaveRequest {
  id?: string;
  leaveTypeId: string;
  startDate: string;
  endDate: string;
  reason: string;
  status?: string;
  attachments?: File[];
  isHalfDay: boolean;
  halfDayPeriod?: 'morning' | 'afternoon';
}

export interface LeaveType {
   id: string;             // leave_types.id
  name: string;           // leave_types.name
  max_days: number;       // leave_types.max_days
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('authToken');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    });
  }

  // Authentication APIs
  async register(userData: any): Promise<any> {
    try {
      const response = await this.http.post(`${this.apiUrl}/auth/register`, userData).toPromise();
      return response;
    } catch (error) {
      throw error;
    }
  }

  async registerWithFile(formData: FormData): Promise<any> {
    try {
      const response = await this.http.post(`${this.apiUrl}/auth/register`, formData).toPromise();
      return response;
    } catch (error) {
      throw error;
    }
  }

  async login(credentials: { email: string; password: string }): Promise<any> {
    try {
      const response = await this.http.post(`${this.apiUrl}/auth/login`, credentials).toPromise();
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Profile APIs
  getProfile(userId?: string): Observable<ApiResponse<ProfileData>> {
    const url = userId ? `${this.apiUrl}/profile/${userId}` : `${this.apiUrl}/profile/me`;
    return this.http.get<ApiResponse<ProfileData>>(url, { headers: this.getHeaders() });
  }

  updateProfile(profileData: Partial<ProfileData>): Observable<ApiResponse<ProfileData>> {
    return this.http.put<ApiResponse<ProfileData>>(`${this.apiUrl}/profile`, profileData, { headers: this.getHeaders() });
  }

  // Dashboard APIs
  getDashboardData(): Observable<ApiResponse<DashboardData>> {
    return this.http.get<ApiResponse<DashboardData>>(`${this.apiUrl}/profile/dashboard`, { headers: this.getHeaders() });
  }

  // Leave APIs
  getLeaveTypes(): Observable<ApiResponse<LeaveType[]>> {
    return this.http.get<ApiResponse<LeaveType[]>>(`${this.apiUrl}/leave-types`, { headers: this.getHeaders() });
  }

  submitLeaveRequest(leaveRequest: LeaveRequest): Observable<ApiResponse<any>> {
    const formData = new FormData();
    
    formData.append('leaveTypeId', leaveRequest.leaveTypeId);
    formData.append('startDate', leaveRequest.startDate);
    formData.append('endDate', leaveRequest.endDate);
    formData.append('reason', leaveRequest.reason);
    formData.append('isHalfDay', leaveRequest.isHalfDay.toString());
    
    if (leaveRequest.halfDayPeriod) {
      formData.append('halfDayPeriod', leaveRequest.halfDayPeriod);
    }

    if (leaveRequest.attachments) {
      leaveRequest.attachments.forEach((file, index) => {
        formData.append(`attachments`, file);
      });
    }

    const headers = new HttpHeaders({
      ...(localStorage.getItem('authToken') && { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` })
    });

    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/leave-requests`, formData, { headers });
  }

  getMyLeaveRequests(): Observable<ApiResponse<any[]>> {
    return this.http.get<ApiResponse<any[]>>(`${this.apiUrl}/leave-requests/me`, { headers: this.getHeaders() });
  }

getAllPendingRequests(): Observable<number> {
  return this.http.get<ApiResponse<any[]>>(
    `${this.apiUrl}/leave-requests/all`,
    { headers: this.getHeaders() }
  ).pipe(
    map(response => response.data.filter(req => req.status === 'PENDING').length)
  );
}

  getAllRejectedRequests():  Observable<number> {
      return this.http.get<ApiResponse<any[]>>(
      `${this.apiUrl}/leave-requests/all`,
      { headers: this.getHeaders() }
    ).pipe(
      map(response => response.data.filter(req => req.status === 'REJECTED').length)
    );
  }

  getAllApprouvedRequests():  Observable<number> {
      return this.http.get<ApiResponse<any[]>>(
      `${this.apiUrl}/leave-requests/all`,
      { headers: this.getHeaders() }
    ).pipe(
      map(response => response.data.filter(req => req.status === 'APPROVED').length)
    );
  }

  // User APIs
  getCurrentUser(): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(`${this.apiUrl}/auth/me`, { headers: this.getHeaders() });
  }

  // Calendar APIs
  getCalendarEvents(month?: number, year?: number): Observable<ApiResponse<any[]>> {
    const params = new URLSearchParams();
    if (month !== undefined) params.append('month', month.toString());
    if (year !== undefined) params.append('year', year.toString());
    
    const url = `${this.apiUrl}/calendar/events${params.toString() ? '?' + params.toString() : ''}`;
    return this.http.get<ApiResponse<any[]>>(url, { headers: this.getHeaders() });
  }

  // Holidays API
  getHolidays(year?: number): Observable<ApiResponse<any[]>> {
    const url = year ? `${this.apiUrl}/holidays?year=${year}` : `${this.apiUrl}/holidays`;
    return this.http.get<ApiResponse<any[]>>(url, { headers: this.getHeaders() });
  }


  getAllUsers(): Observable<ProfileData[]> {
    let usersList = this.http.get<ProfileData[]>(`${this.apiUrl}/users`, { headers: this.getHeaders() });
    return usersList;
  }

  getAllUsersCount(): Observable<number> {
  return this.getAllUsers().pipe(
    map(users => users.length)
  );
}

}
