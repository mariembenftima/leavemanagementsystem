import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { DataMapperService } from '../../helpers/data-mapper.service';
import { Team } from '../../types/team.model';
import { ApiResponse } from '../../types/api-response.type';
import { environment } from '../../../environments/environment.development';


@Injectable({
  providedIn: 'root',
})
export class TeamService {
  private readonly apiUrl = environment.apiUrl;

  constructor(
    private http: HttpClient,
    private mapper: DataMapperService
  ) {}


  getTeams(): Observable<Team[]> {
    return this.http
      .get<any>(`${this.apiUrl}/teams`)
      .pipe(
        map((res) => (res && res.data ? res.data : res))
      );
  }

  getTeamById(teamId: string): Observable<Team> {
    return this.http
      .get<ApiResponse<Team>>(`${this.apiUrl}/teams/${teamId}`)
      .pipe(
        map((res) => this.mapper.fromApi<Team>(res.data))
      );
  }

  createTeam(team: Partial<Team>): Observable<Team> {
    return this.http
      .post<ApiResponse<Team>>(
        `${this.apiUrl}/teams`,
        this.mapper.toApi(team)
      )
      .pipe(
        map((res) => this.mapper.fromApi<Team>(res.data))
      );
  }

  updateTeam(teamId: string, team: Partial<Team>): Observable<Team> {
    return this.http
      .put<ApiResponse<Team>>(
        `${this.apiUrl}/teams/${teamId}`,
        this.mapper.toApi(team)
      )
      .pipe(
        map((res) => this.mapper.fromApi<Team>(res.data))
      );
  }

  deleteTeam(teamId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/teams/${teamId}`);
  }


  getTeamMembers(teamId: string): Observable<any[]> {
    return this.http
      .get<ApiResponse<any[]>>(`${this.apiUrl}/teams/${teamId}/members`)
      .pipe(
        map((res) => this.mapper.fromApiArray<any>(res.data || []))
      );
  }


  addTeamMember(teamId: string, userId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/teams/${teamId}/members`, { userId });
  }


  removeTeamMember(teamId: string, userId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/teams/${teamId}/members/${userId}`);
  }
}