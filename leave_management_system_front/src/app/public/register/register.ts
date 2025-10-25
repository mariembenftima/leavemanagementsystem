import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../../private/services/api.service';
import { AuthService } from '../../private/services/auth.service';
import { CommonModule } from '@angular/common';
import { Team } from '../../types/team.model';

@Component({
  selector: 'app-register',
  templateUrl: './register.html',
  styleUrls: ['./register.css'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule]
})
export class RegisterComponent {
  registerForm: FormGroup;
  isLoading = false;
  errorMessage = '';
  successMessage = '';
  selectedFile: File | null = null;
  profilePicturePreview: string | null = null;

  teams : Team[] = []
  constructor(
    private formBuilder: FormBuilder,
    private apiService: ApiService,
    private authService: AuthService,
    private router: Router
  ) {
    this.registerForm = this.formBuilder.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      fullname: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phoneNumber: ['', [Validators.required, Validators.pattern(/^\+?[\d\s\-\(\)]+$/)]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
      teamId: ['', [Validators.required, Validators.min(1), Validators.max(8)]],
      address: [''],
      dateOfBirth: [''],
      bio: ['']
    }, {
      validators: this.passwordMatchValidator
    });
  }

  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password');
    const confirmPassword = form.get('confirmPassword');
    
    if (password && confirmPassword && password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }
    
    return null;
  }

  async onSubmit() {
    if (this.registerForm.invalid) {
      this.markFormGroupTouched(this.registerForm);
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    try {
      // Create FormData for file upload
      const formData = new FormData();
      
      // Add all form fields
      Object.keys(this.registerForm.value).forEach(key => {
        if (key !== 'confirmPassword' && this.registerForm.value[key]) {
          formData.append(key, this.registerForm.value[key]);
        }
      });

      // Ensure teamId is sent as a number
      if (this.registerForm.value.teamId) {
        formData.set('teamId', this.registerForm.value.teamId.toString());
      }

      // Add profile picture if selected
      if (this.selectedFile) {
        formData.append('profilePicture', this.selectedFile);
      }

      const response = await this.apiService.registerWithFile(formData);
      
      if (response.success) {
        this.successMessage = 'Registration successful! Redirecting to dashboard...';
        
        // Store user data for login
        if (response.user) {
          this.authService.setCurrentUser(response.user);
        }
        
        // Redirect after a short delay
        setTimeout(() => {
          this.router.navigate(['/dashboard']);
        }, 2000);
      }
    } catch (error: any) {
      console.error('Registration error:', error);
      this.errorMessage = error.message || 'Registration failed. Please try again.';
    } finally {
      this.isLoading = false;
    }
  }

  private markFormGroupTouched(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach(field => {
      const control = formGroup.get(field);
      control?.markAsTouched({ onlySelf: true });
    });
  }

  getErrorMessage(fieldName: string): string {
    const field = this.registerForm.get(fieldName);
    
    if (field?.hasError('required')) {
      return `${this.getFieldLabel(fieldName)} is required`;
    }
    
    if (field?.hasError('email')) {
      return 'Please enter a valid email address';
    }
    
    if (field?.hasError('minlength')) {
      const minLength = field.errors?.['minlength']?.requiredLength;
      return `${this.getFieldLabel(fieldName)} must be at least ${minLength} characters`;
    }
    
    if (field?.hasError('pattern')) {
      return 'Please enter a valid phone number';
    }
    
    if (field?.hasError('passwordMismatch')) {
      return 'Passwords do not match';
    }
    
    if (field?.hasError('min')) {
      return 'Please select a valid department';
    }
    
    if (field?.hasError('max')) {
      return 'Please select a valid department';
    }
    
    return '';
  }

  private getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      username: 'Username',
      fullname: 'Full Name',
      email: 'Email',
      phoneNumber: 'Phone Number',
      password: 'Password',
      confirmPassword: 'Confirm Password',
      teamId: 'Team'
    };
    return labels[fieldName] || fieldName;
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        this.errorMessage = 'Please select a valid image file';
        return;
      }

      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        this.errorMessage = 'File size must be less than 5MB';
        return;
      }

      this.selectedFile = file;
      this.errorMessage = '';

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        this.profilePicturePreview = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  removeProfilePicture() {
    this.selectedFile = null;
    this.profilePicturePreview = null;
    // Reset file input
    const fileInput = document.getElementById('profilePicture') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }
}