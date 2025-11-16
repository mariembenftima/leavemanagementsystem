import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap, map } from 'rxjs/operators';
import { Router } from '@angular/router';
import { EmployeeProfile } from '../../types/employee-profile.model';
import { environment } from '../../../environments/environment.development';


export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  data: {
    access_token: string;
    user: EmployeeProfile;
  };
  message?: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = environment.apiUrl;
  private currentUserSubject = new BehaviorSubject<EmployeeProfile | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  public isLoggedIn$: Observable<boolean> = this.currentUser$.pipe(map((u) => !!u));

  constructor(private http: HttpClient, private router: Router) {
    const token = localStorage.getItem('authToken');
    const user = localStorage.getItem('currentUser');
    if (token && user) {
      try {
        const parsed: any = JSON.parse(user);
        if (parsed && parsed.roles) {
          if (typeof parsed.roles === 'string') {
            parsed.roles = parsed.roles.split(',').map((r: string) => r.trim());
          }
        }
        this.currentUserSubject.next(parsed as EmployeeProfile);
      } catch (err) {
        console.warn('Failed to parse currentUser from storage', err);
        this.currentUserSubject.next(null);
      }
    }
  }
  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(`${this.apiUrl}/auth/login`, credentials)
      .pipe(
        tap((response) => {
          if (response.success && response.data.access_token) {
            const user: any = response.data.user || {};
            if (user.roles && typeof user.roles === 'string') {
              user.roles = user.roles.split(',').map((r: string) => r.trim());
            }

            try {
              localStorage.setItem('authToken', response.data.access_token);
              localStorage.setItem('currentUser', JSON.stringify(user));
            } catch (err) {
              console.warn('Failed to write auth data to storage', err);
            }

            this.currentUserSubject.next(user as EmployeeProfile);
          }
        })
      );
  }
  logout(): void {
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }
  getCurrentUser(): EmployeeProfile | null {
    return this.currentUserSubject.value;
  }

  getCurrentUserId(): string | null {
    return this.getCurrentUser()?.userId || null;
  }

  getToken(): string | null {
    return localStorage.getItem('authToken');
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }
  hasRole(role: string): boolean {
    const user = this.getCurrentUser();
    if (!user || !user.roles) return false;
    if (Array.isArray(user.roles)) return user.roles.includes(role);
    return (user.roles as string).split(',').map((r) => r.trim()).includes(role);
  }

  setCurrentUser(user: EmployeeProfile): void {
    localStorage.setItem('currentUser', JSON.stringify(user));
    this.currentUserSubject.next(user);
  }
  private authHeaders(): HttpHeaders {
    const token = this.getToken();
    if (!token) return new HttpHeaders();
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
  }
  getProfileFromServer(): Observable<EmployeeProfile> {
    return this.http.get<any>(`${this.apiUrl}/auth/me`, {
      headers: this.authHeaders(),
    }).pipe(
      map((res) => res.user as EmployeeProfile)
    );
  }
}
