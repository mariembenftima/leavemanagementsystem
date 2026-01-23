import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { DataMapperService } from '../../helpers/data-mapper.service';
import { DashboardData } from '../../types/dashboard-data.type';
import { ApiResponse } from '../../types/api-response.type';
import { environment } from '../../../environments/environment';



@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  private readonly apiUrl = environment.apiUrl;

  constructor(
    private http: HttpClient,
    private mapper: DataMapperService
  ) {}

  getDashboardData(): Observable<DashboardData> {
    return this.http
      .get<ApiResponse<DashboardData>>(`${this.apiUrl}/profile/dashboard`)
      .pipe(
        map((res) => this.mapper.fromApi<DashboardData>(res.data))
      );
  }

  getAdminDashboardStats(): Observable<any> {
    return this.http
      .get<ApiResponse<any>>(`${this.apiUrl}/admin/dashboard/stats`)
      .pipe(
        map((res) => this.mapper.fromApi<any>(res.data))
      );
  }


  getDashboardOverview(startDate?: string, endDate?: string): Observable<any> {
    let url = `${this.apiUrl}/dashboard/overview`;
    const params = new URLSearchParams();
    
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    
    if (params.toString()) {
      url += `?${params.toString()}`;
    }

    return this.http
      .get<ApiResponse<any>>(url)
      .pipe(
        map((res) => this.mapper.fromApi<any>(res.data))
      );
  }
}