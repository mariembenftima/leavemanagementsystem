import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { AuthService } from '../../../private/services/auth.service';

interface LoginCredentials {
  email: string;
  password: string;
}

interface User {
  username: string;
  role: string[];
  lastLogin?: Date;
}

@Component({
  selector: 'app-login',
  templateUrl: './login.html',
  styleUrls: ['./login.css'],
  standalone: false,
})
export class login implements OnInit, OnDestroy {
  loginForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService
  ) {
    this.initializeForm();
  }


  showSuccessPopup: boolean = false;
  showPassword: boolean = false;
  isLoading: boolean = false;
  showErrorToast: boolean = false;
  errorMessage: string = '';

  private currentUser: User | null = null;
  private errorTimeout: any;

  ngOnInit(): void {
    this.clearUserSession();
  }

  ngOnDestroy(): void {
    if (this.errorTimeout) {
      clearTimeout(this.errorTimeout);
    }
  }


  private initializeForm(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(4)]],
      rememberMe: [false],
    });
  }


  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.markFormGroupTouched();
      this.showError('Please fill in all required fields correctly.');
      return;
    }

    if (this.isLoading) {
      return;
    }

    const formValues = this.loginForm.value;
    this.attemptLogin(formValues);
  }


  private async attemptLogin(
    credentials: LoginCredentials & { rememberMe: boolean }
  ): Promise<void> {
    this.isLoading = true;
    this.dismissError();

    try {
      const loginRequest = {
        email: credentials.email,
        password: credentials.password
      };
      console.log('🔐 Attempting login with:', loginRequest.email);

      const response = await firstValueFrom(this.authService.login(loginRequest));
      console.log('📥 Full API response:', response);

      if (response && response.data?.success) {
        // ✅ Step 1: Extract JWT token from response
        const token = response.data.access_token;

        if (!token) {
          console.error('❌ No token in response!');
          throw new Error('Authentication token not received');
        }

        // ✅ Step 2: Extract user data from response
        const apiUser = response.data.user || {};
        console.log('👤 User data from API:', apiUser);

        // ✅ Step 3: Store JWT token (CRITICAL!)
        localStorage.setItem('authToken', token);
        console.log('✅ Token saved to localStorage');

        // ✅ Step 4: Store complete user data with ALL roles
        const userData = {
          id: apiUser.id,
          email: apiUser.email,
          username: apiUser.firstName || apiUser.email,
          fullname: apiUser.fullname || apiUser.firstName,
          firstName: apiUser.firstName,
          lastName: apiUser.lastName,
          roles: Array.isArray(apiUser.roles) ? apiUser.roles : [apiUser.roles || 'EMPLOYEE'],  // ✅ Store ALL roles as array
          phoneNumber: apiUser.phone,
          profilePictureUrl: apiUser.avatarUrl,
          isActive: apiUser.isActive,
          lastLogin: new Date().toISOString(),
        };

        localStorage.setItem('currentUser', JSON.stringify(userData));
        console.log('✅ User data saved:', userData);
        console.log('✅ User roles:', userData.roles);

        // ✅ Step 5: Update component state
        this.currentUser = {
          username: userData.username,
          role: userData.roles,  // ✅ Full roles array (for access control)
          lastLogin: new Date(),
        };

        if (credentials.rememberMe) {
          // Save remember me preference
          localStorage.setItem('rememberMe', 'true');
        }

        this.showSuccessPopup = true;
        console.log('✅ Login successful! Roles:', userData.roles);

        // ✅ Step 6: Navigate based on role
        setTimeout(() => {
          if (userData.roles.includes('ADMIN') || userData.roles.includes('HR')) {
            console.log('🚀 Redirecting to admin dashboard');
            this.router.navigate(['/admin/dashboard']);
          } else if (userData.roles.includes('MANAGER')) {
            console.log('🚀 Redirecting to manager dashboard');
            this.router.navigate(['/manager/dashboard']);
          } else {
            console.log('🚀 Redirecting to user dashboard');
            this.router.navigate(['/dashboard']);
          }
        }, 1500);

      } else {
        console.error('❌ Login failed - invalid response');
        this.showError('Invalid email or password. Please try again.');
        this.shakeLoginCard();
      }
    } catch (error: any) {
      console.error('❌ Login error:', error);
      const errorMessage = error?.error?.message || 'Invalid email or password. Please try again.';
      this.showError(errorMessage);
      this.shakeLoginCard();
    } finally {
      this.isLoading = false;
    }
  }



  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  onForgotPassword(event: Event): void {
    event.preventDefault();
    console.log('Forgot password clicked');

    alert('Please contact your system administrator to reset your password.');
  }


  closePopup(): void {
    this.showSuccessPopup = false;
    this.redirectToDashboard();
  }


  continueToDashboard(): void {
    this.showSuccessPopup = false;
    this.redirectToDashboard();
  }

  private redirectToDashboard(): void {
    console.log('Redirecting to dashboard...');
    if (this.authService.hasRole('ADMIN')) {
      this.router.navigate(['/admin/dashboard'], { state: { user: this.currentUser } });
    } else {
      this.router.navigate(['/dashboard'], { state: { user: this.currentUser } });
    }

  }


  private showError(message: string): void {
    this.errorMessage = message;
    this.showErrorToast = true;


    this.errorTimeout = setTimeout(() => {
      this.dismissError();
    }, 5000);
  }


  dismissError(): void {
    this.showErrorToast = false;
    this.errorMessage = '';

    if (this.errorTimeout) {
      clearTimeout(this.errorTimeout);
      this.errorTimeout = null;
    }
  }


  private markFormGroupTouched(): void {
    Object.keys(this.loginForm.controls).forEach((key) => {
      const control = this.loginForm.get(key);
      if (control) {
        control.markAsTouched();
      }
    });
  }


  private shakeLoginCard(): void {
    const loginCard = document.querySelector('.login-card') as HTMLElement;
    if (loginCard) {
      loginCard.style.animation = 'shake 0.5s ease-in-out';
      setTimeout(() => {
        loginCard.style.animation = '';
      }, 500);
    }
  }


  private saveUserSession(user: User): void {
    try {
      const sessionData = {
        user: user,
        timestamp: new Date().getTime(),
        rememberMe: true,
      };
      localStorage.setItem('hrms_session', JSON.stringify(sessionData));
    } catch (error) {
      console.warn('Could not save user session:', error);
    }
  }


  private clearUserSession(): void {
    try {
      localStorage.removeItem('hrms_session');
    } catch (error) {
      console.warn('Could not clear user session:', error);
    }
  }


  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }



  get email(): string {
    return this.loginForm.get('email')?.value || '';
  }

  get password(): string {
    return this.loginForm.get('password')?.value || '';
  }

  get isFormValid(): boolean {
    return this.loginForm.valid;
  }

  get emailErrors(): string[] {
    const errors: string[] = [];
    const emailControl = this.loginForm.get('email');

    if (emailControl?.errors && emailControl.touched) {
      if (emailControl.errors['required']) {
        errors.push('Email is required');
      }
      if (emailControl.errors['email']) {
        errors.push('Please enter a valid email address');
      }
    }

    return errors;
  }

  get passwordErrors(): string[] {
    const errors: string[] = [];
    const passwordControl = this.loginForm.get('password');

    if (passwordControl?.errors && passwordControl.touched) {
      if (passwordControl.errors['required']) {
        errors.push('Password is required');
      }
      if (passwordControl.errors['minlength']) {
        errors.push('Password must be at least 4 characters');
      }
    }

    return errors;
  }


  getCurrentTime(): string {
    return new Date().toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  }

  getBrowserInfo(): string {
    return navigator.userAgent.split(' ')[0] || 'Unknown Browser';
  }


  hasRememberedSession(): boolean {
    try {
      const sessionData = localStorage.getItem('hrms_session');
      if (sessionData) {
        const parsed = JSON.parse(sessionData);
        const oneDayAgo = new Date().getTime() - 24 * 60 * 60 * 1000;
        return parsed.timestamp > oneDayAgo && parsed.rememberMe;
      }
    } catch (error) {
      console.warn('Could not check remembered session:', error);
    }
    return false;
  }

  autoLoginFromSession(): void {
    if (this.hasRememberedSession()) {
      try {
        const sessionData = JSON.parse(
          localStorage.getItem('hrms_session') || ''
        );
        this.currentUser = sessionData.user;
        this.redirectToDashboard();
      } catch (error) {
        console.warn('Could not auto-login from session:', error);
        this.clearUserSession();
      }
    }
  }
}

declare const environment: { production: boolean };
