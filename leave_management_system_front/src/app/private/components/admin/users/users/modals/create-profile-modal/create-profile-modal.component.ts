import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UpdateUserDto, UsersService } from '../../../services/users.service';

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

  formData: UpdateUserDto = {
    fullname: '',
    email: '',
    phoneNumber: '',
    address: '',
    dateOfBirth: '',
    bio: ''
  };

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
    if (!this.formData.fullname || !this.formData.email) {
      alert('Full name and email are required');
      return;
    }

    this.loading = true;

    this.usersService.updateUser(this.userId, this.formData).subscribe({
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
    alert('Profile created successfully');
    this.loading = false;
    this.success.emit();
  }

  getInitials(): string {
    return this.formData.fullname ? this.formData.fullname.charAt(0).toUpperCase() : 'U';
  }
}