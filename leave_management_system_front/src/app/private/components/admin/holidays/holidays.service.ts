import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';

export interface Holiday {
  id: number;
  name: string;
  date: string | Date;
  description?: string;
  isRecurring: boolean;
  type?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface HolidayStatistics {
  totalHolidays: number;
  upcomingCount: number;
  thisYearCount: number;
  upcomingHolidays: Holiday[];
}

export interface CreateHolidayDto {
  name: string;
  date: string;
  description?: string;
  isRecurring?: boolean;
  type?: string;
}

@Injectable({
  providedIn: 'root'
})
export class HolidaysService {
  private readonly apiUrl = `${environment.apiUrl}/holidays`;

  constructor(private http: HttpClient) {}

  getAllHolidays(year?: number): Observable<Holiday[]> {
    const url = year ? `${this.apiUrl}?year=${year}` : this.apiUrl;
    return this.http.get<Holiday[]>(url);
  }

  getUpcomingHolidays(limit: number = 10): Observable<Holiday[]> {
    return this.http.get<Holiday[]>(`${this.apiUrl}/upcoming?limit=${limit}`);
  }

  getHolidayById(id: number): Observable<Holiday> {
    return this.http.get<Holiday>(`${this.apiUrl}/${id}`);
  }

  getStatistics(): Observable<HolidayStatistics> {
    return this.http.get<HolidayStatistics>(`${this.apiUrl}/statistics`);
  }

  createHoliday(holiday: CreateHolidayDto): Observable<Holiday> {
    return this.http.post<Holiday>(this.apiUrl, holiday);
  }

  updateHoliday(id: number, holiday: Partial<CreateHolidayDto>): Observable<Holiday> {
    return this.http.put<Holiday>(`${this.apiUrl}/${id}`, holiday);
  }

  deleteHoliday(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}