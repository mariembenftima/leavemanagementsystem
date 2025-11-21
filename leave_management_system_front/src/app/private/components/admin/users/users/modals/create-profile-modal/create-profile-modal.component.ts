import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UpdateUserDto, UsersService } from '../../../services/users.service';

export interface CreateEmployeeProfileDto {
  employeeId: string;
  department: string;
  designation: string;
  joinDate: string;
  gender: string;
  dateOfBirth?: string;
  phone?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  address?: string;
  maritalStatus?: string;
  nationality?: string;
  salary?: number;
  bankAccountNumber?: string;
  bankName?: string;
}

@Component({
  selector: 'app-create-profile-modal',
  standalone: false,
  templateUrl: './create-profile-modal.component.html',
  styleUrls: ['./create-profile-modal.component.css']
})
export class CreateProfileModalComponent {
  @Input() userId!: string;
  @Output() close = new EventEmitter<void>();
  @Output() success = new EventEmitter<void>();

  loading = false;
  profilePicture: File | null = null;
  previewUrl: string | null = null;

  formData: CreateEmployeeProfileDto = {
    employeeId: '',
    department: '',
    designation: '',
    joinDate: '',
    gender: '',
    dateOfBirth: '',
    phone: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    address: '',
    maritalStatus: '',
    nationality: '',
    salary: undefined,
    bankAccountNumber: '',
    bankName: ''
  };

  // Dropdown options
  genderOptions = ['Male', 'Female', 'Other', 'Prefer not to say'];
  maritalStatusOptions = ['Single', 'Married', 'Divorced', 'Widowed'];

  constructor(private usersService: UsersService) {}

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (file) {
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        alert('Invalid file type. Please upload JPG, PNG, or WEBP image.');
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
      }

      this.profilePicture = file;

      const reader = new FileReader();
      reader.onload = (e) => {
        this.previewUrl = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  removeProfilePicture(): void {
    this.profilePicture = null;
    this.previewUrl = null;
  }

  onClose(): void {
    this.close.emit();
  }

  onSubmit(): void {
    // Validate required fields
    if (!this.formData.employeeId || !this.formData.department || 
        !this.formData.designation || !this.formData.joinDate || !this.formData.gender) {
      alert('Employee ID, Department, Designation, Join Date, and Gender are required');
      return;
    }

    this.loading = true;

    this.usersService.createEmployeeProfile(this.userId, this.formData).subscribe({
      next: () => {
        if (this.profilePicture) {
          this.uploadProfilePicture();
        } else {
          this.onSuccessComplete();
        }
      },
      error: (error) => {
        console.error('Error creating profile:', error);
        alert(error.error?.message || 'Failed to create profile');
        this.loading = false;
      }
    });
  }

  private uploadProfilePicture(): void {
    if (!this.profilePicture) {
      this.onSuccessComplete();
      return;
    }

    this.usersService.uploadProfilePicture(this.userId, this.profilePicture).subscribe({
      next: () => {
        this.onSuccessComplete();
      },
      error: (error) => {
        console.error('Error uploading profile picture:', error);
        alert('Profile created but picture upload failed');
        this.onSuccessComplete();
      }
    });
  }

  private onSuccessComplete(): void {
    alert('Employee profile created successfully');
    this.loading = false;
    this.success.emit();
  }

  getInitials(): string {
    return this.formData.employeeId ? this.formData.employeeId.substring(0, 2).toUpperCase() : 'EP';
  }
}