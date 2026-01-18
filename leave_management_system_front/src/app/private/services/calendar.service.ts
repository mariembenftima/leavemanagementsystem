import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { DataMapperService } from '../../helpers/data-mapper.service';
import { Holiday } from '../../types/holiday.model';
import { ApiResponse } from '../../types/api-response.type';
import { environment } from '../../../environments/environment.development';


@Injectable({
  providedIn: 'root',
})
export class CalendarService {
  private readonly apiUrl = environment.apiUrl;

  constructor(
    private http: HttpClient,
    private mapper: DataMapperService
  ) {}


  getCalendarEvents(month?: number, year?: number): Observable<any[]> {
    const params = new URLSearchParams();
    
    if (month !== undefined) params.append('month', String(month));
    if (year !== undefined) params.append('year', String(year));
    
    const url = `${this.apiUrl}/calendar/events${
      params.toString() ? '?' + params.toString() : ''
    }`;

    return this.http
      .get<ApiResponse<any[]>>(url)
      .pipe(
        map((res) => this.mapper.fromApiArray<any>(res.data || []))
      );
  }

  getHolidays(year?: number): Observable<Holiday[]> {
    let url = `${this.apiUrl}/holidays`;

    if (year) {
      url += `?year=${year}`;
    }

    return this.http
      .get<ApiResponse<Holiday[]>>(url)
      .pipe(
        map((res) => this.mapper.fromApiArray<Holiday>(res.data || []))
      );
  }

  getUpcomingHolidays(limit: number = 5): Observable<Holiday[]> {
    return this.getHolidays().pipe(
      map((holidays) => {
        const now = new Date();
        return holidays
          .filter((h) => new Date(h.date) >= now)
          .slice(0, limit);
      })
    );
  }


  createHoliday(holiday: Partial<Holiday>): Observable<Holiday> {
    return this.http
      .post<ApiResponse<Holiday>>(
        `${this.apiUrl}/holidays`,
        this.mapper.toApi(holiday)
      )
      .pipe(
        map((res) => this.mapper.fromApi<Holiday>(res.data))
      );
  }

  updateHoliday(holidayId: string, holiday: Partial<Holiday>): Observable<Holiday> {
    return this.http
      .put<ApiResponse<Holiday>>(
        `${this.apiUrl}/holidays/${holidayId}`,
        this.mapper.toApi(holiday)
      )
      .pipe(
        map((res) => this.mapper.fromApi<Holiday>(res.data))
      );
  }


  deleteHoliday(holidayId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/holidays/${holidayId}`);
  }
}