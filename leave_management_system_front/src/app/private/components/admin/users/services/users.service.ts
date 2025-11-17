import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../../../../environments/environment.development';
import { User } from '../../../../../types/user.model';


export interface PaginationData {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface UsersResponse {
  success: boolean;
  data: User[];
  pagination: PaginationData;
  message: string;
}

export interface UserResponse {
  success: boolean;
  data: User;
  message: string;
}

export interface GetUsersParams {
  page: number;
  limit: number;
  search?: string;
  role?: string;
  hasProfile?: string;
}

export interface UpdateUserDto {
  fullname?: string;
  email?: string;
  phoneNumber?: string;
  address?: string;
  dateOfBirth?: string;
  bio?: string;
  password?: string;
}

@Injectable({
  providedIn: 'root'
})
export class UsersService {
  private apiUrl = `${environment.apiUrl}/users`;

  constructor(private http: HttpClient) { }


  getAllUsers(params: any): Observable<{ data: User[], pagination: PaginationData }> {
    return this.http.get<{ data: User[], pagination: PaginationData }>('api-url', { params });
  }


  getUserById(id: string): Observable<UserResponse> {
    return this.http.get<UserResponse>(`${this.apiUrl}/${id}`);
  }

  updateUser(id: string, data: UpdateUserDto): Observable<UserResponse> {
    return this.http.patch<UserResponse>(`${this.apiUrl}/${id}`, data);
  }

  deleteUser(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }


  updateUserRoles(id: string, roles: string[]): Observable<UserResponse> {
    return this.http.patch<UserResponse>(`${this.apiUrl}/${id}/roles`, { roles });
  }


  activateUser(id: string): Observable<UserResponse> {
    return this.http.patch<UserResponse>(`${this.apiUrl}/${id}/activate`, {});
  }


  deactivateUser(id: string): Observable<UserResponse> {
    return this.http.patch<UserResponse>(`${this.apiUrl}/${id}/deactivate`, {});
  }

  updateUserStatus(id: string, isActive: boolean): Observable<UserResponse> {
    return isActive ? this.activateUser(id) : this.deactivateUser(id);
  }


  uploadProfilePicture(id: string, file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post(`${this.apiUrl}/${id}/profile-pic`, formData);
  }
}