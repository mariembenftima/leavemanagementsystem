import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { LeaveRequest } from '../../../../types/leave-request.model';

import { DataMapperService } from '../../../../helpers/data-mapper.service';
import { ApiResponse } from '../../../../types/api-response.type';
import { environment } from '../../../../../environments/environment';


export interface LeaveRequestFilter {
  page?: number;
  limit?: number;
  status?: string | string[];
  userId?: string;
  leaveTypeId?: number;
  startDate?: string;
  endDate?: string;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export interface LeaveRequestStatistics {
  totalRequests: number;
  monthlyRequests: number;
  statusBreakdown: {
    PENDING?: number;
    APPROVED?: number;
    REJECTED?: number;
    CANCELLED?: number;
  };
}

export interface PaginatedLeaveRequests {
  data: LeaveRequest[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

@Injectable({
  providedIn: 'root',
})
export class AdminLeaveRequestsService {
  private readonly apiUrl = `${environment.apiUrl}/admin/leave-requests`;

  constructor(
    private http: HttpClient,
    private mapper: DataMapperService
  ) {}

getAllLeaveRequests(
  filter: LeaveRequestFilter = {}
): Observable<PaginatedLeaveRequests> {
  let params = new HttpParams();

  Object.keys(filter).forEach((key) => {
    const value = filter[key as keyof LeaveRequestFilter];
    if (value !== undefined && value !== null) {
      if (Array.isArray(value)) {
        value.forEach((v) => {
          params = params.append(key, v.toString());
        });
      } else {
        params = params.set(key, value.toString());
      }
    }
  });

  return this.http
    .get<any>(`${this.apiUrl}`, { params })
    .pipe(
      map((response) => {
        console.log('🔍 RAW Response:', response);
        
        // ✅ Extraire les données en tenant compte du double wrap
        const wrappedData = response?.data?.data || response?.data || response;
        console.log('🔍 Wrapped data:', wrappedData);
        
        return {
          data: this.mapper.fromApiArray<LeaveRequest>(
            wrappedData?.data || wrappedData || []
          ),
          pagination: wrappedData?.pagination || {
            total: 0,
            page: 1,
            limit: 10,
            totalPages: 0,
          },
        };
      })
    );
}

getLeaveRequestStatistics(): Observable<LeaveRequestStatistics> {
  return this.http
    .get<any>(`${this.apiUrl}/statistics`)
    .pipe(
      map((response) => {
        console.log('🔍 RAW Statistics:', response);
        
        // ✅ Aller directement au bon niveau
        const stats = response?.data?.data?.data || response?.data?.data || response?.data || response;
        
        console.log('🔍 Extracted stats:', stats);
        
        return stats as LeaveRequestStatistics;
      })
    );
}

  getPendingLeaveRequests(): Observable<LeaveRequest[]> {
    return this.http
      .get<any>(`${this.apiUrl}/pending`)
      .pipe(
        map((response) =>
          this.mapper.fromApiArray<LeaveRequest>(response?.data || response || [])
        )
      );
  }



  getLeaveRequestById(id: number): Observable<LeaveRequest> {
    return this.http
      .get<ApiResponse<LeaveRequest>>(`${this.apiUrl}/${id}`)
      .pipe(
        map((response) =>
          this.mapper.fromApi<LeaveRequest>(response?.data || response)
        )
      );
  }

  approveLeaveRequest(
    id: number,
    comments?: string
  ): Observable<LeaveRequest> {
    return this.http
      .patch<ApiResponse<LeaveRequest>>(`${this.apiUrl}/${id}/approve`, {
        comments,
      })
      .pipe(
        map((response) =>
          this.mapper.fromApi<LeaveRequest>(response?.data || response)
        )
      );
  }

  rejectLeaveRequest(id: number, reason: string): Observable<LeaveRequest> {
    return this.http
      .patch<ApiResponse<LeaveRequest>>(`${this.apiUrl}/${id}/reject`, {
        reason,
      })
      .pipe(
        map((response) =>
          this.mapper.fromApi<LeaveRequest>(response?.data || response)
        )
      );
  }

  cancelLeaveRequest(id: number): Observable<LeaveRequest> {
    return this.http
      .patch<ApiResponse<LeaveRequest>>(`${this.apiUrl}/${id}/cancel`, {})
      .pipe(
        map((response) =>
          this.mapper.fromApi<LeaveRequest>(response?.data || response)
        )
      );
  }
}