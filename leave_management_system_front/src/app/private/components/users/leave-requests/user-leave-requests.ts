import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastService } from '../../../../shared/services/toast.service';
import { ApiService } from '../../../services/api.service';
import { EmployeeProfile } from '../../../../types/employee-profile.model';

interface LeaveType {
  value: string;
  label: string;
  maxDays: number;
  color: string;
}

interface User {
  fullname: string;
  username: string;
  email: string;
  avatar?: string;
  position?: string;
}

interface UpcomingLeave {
  title: string;
  startDate: string;
  endDate: string;
}

@Component({
  selector: 'app-leave-request',
  templateUrl: './user-leave-requests.html',
  styleUrls: ['./user-leave-requests.css'],
  standalone: false
})
export class LeaveRequestComponent implements OnInit {
  leaveRequestForm: FormGroup;
  isSubmitting = false;
  attachedFiles: File[] = [];
  currentEmployee: EmployeeProfile | null = null;
  isLoadingUser = false;
  allowedFileTypes: string[] = ['.pdf', '.doc', '.docx', '.png', '.jpg', '.jpeg'];


  minDate = new Date().toISOString().split('T')[0];

  leaveTypes: LeaveType[] = [
    { value: 'annual', label: 'Annual Leave', maxDays: 25, color: '#3b82f6' },
    { value: 'sick', label: 'Sick Leave', maxDays: 10, color: '#ef4444' },
    { value: 'maternity', label: 'Maternity Leave', maxDays: 120, color: '#ec4899' },
    { value: 'paternity', label: 'Paternity Leave', maxDays: 14, color: '#8b5cf6' },
    { value: 'emergency', label: 'Emergency Leave', maxDays: 5, color: '#f59e0b' },
    { value: 'bereavement', label: 'Bereavement Leave', maxDays: 3, color: '#6b7280' }
  ];

  upcomingLeaves: UpcomingLeave[] = [
    { title: 'Summer Vacation', startDate: '2025-08-15', endDate: '2025-08-25' },
    { title: 'Conference Leave', startDate: '2025-09-10', endDate: '2025-09-12' }
  ];

  constructor(
    private formBuilder: FormBuilder,
    private toastService: ToastService,
    private apiService: ApiService
  ) {
    this.leaveRequestForm = this.createForm();
  }

  ngOnInit(): void {
    this.loadCurrentEmployee();
    this.setupFormValidation();
  }

  private async loadCurrentEmployee(): Promise<void> {
    this.isLoadingUser = true;

    try {
      const storedUser = localStorage.getItem('currentUser');

      if (storedUser) {
        this.currentEmployee = JSON.parse(storedUser);
      } else {
        const currentUserStr = localStorage.getItem('currentUser');
        const userId = currentUserStr ? JSON.parse(currentUserStr)?.id : null; this.currentEmployee = (await this.apiService.getProfile(userId).toPromise()) ?? null;
      }

      console.log('✅ Loaded employee data:', this.currentEmployee);
    } catch (err) {
      console.error('❌ Failed to load user data:', err);
      this.currentEmployee = null;
    } finally {
      this.isLoadingUser = false;
    }
  }



  private createForm(): FormGroup {
    return this.formBuilder.group({
      type: ['', [Validators.required]],
      startDate: ['', [Validators.required]],
      endDate: ['', [Validators.required]],
      reason: ['', [Validators.required, Validators.maxLength(500)]],
      emergencyContact: [''],
      managerEmail: ['', [Validators.email]],
      halfDay: [false]
    });
  }

  private setupFormValidation(): void {
    // Add cross-field validation for dates
    this.leaveRequestForm.get('endDate')?.valueChanges.subscribe(() => {
      this.validateDateRange();
    });

    this.leaveRequestForm.get('startDate')?.valueChanges.subscribe(() => {
      this.validateDateRange();
    });
  }

  private validateDateRange(): void {
    const startDate = this.leaveRequestForm.get('startDate')?.value;
    const endDate = this.leaveRequestForm.get('endDate')?.value;

    if (startDate && endDate && new Date(endDate) < new Date(startDate)) {
      this.leaveRequestForm.get('endDate')?.setErrors({ dateRange: true });
    }
  }

  onFileSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      const files = Array.from(input.files);

      // Validate file types and sizes
      const validFiles = files.filter(file => {
        const extension = '.' + file.name.split('.').pop()?.toLowerCase();
        const isValidType = this.allowedFileTypes.includes(extension);
        const isValidSize = file.size <= 5 * 1024 * 1024; // 5MB limit

        if (!isValidType) {
          console.warn(`File ${file.name} has invalid type`);
          return false;
        }

        if (!isValidSize) {
          console.warn(`File ${file.name} exceeds size limit`);
          return false;
        }

        return true;
      });

      this.attachedFiles = [...this.attachedFiles, ...validFiles];
    }
  }

  removeFile(index: number): void {
    this.attachedFiles.splice(index, 1);
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  getSelectedLeaveType(): LeaveType | undefined {
    const selectedValue = this.leaveRequestForm.get('type')?.value;
    return this.leaveTypes.find(type => type.value === selectedValue);
  }

  calculateTotalDays(): number {
    const startDate = this.leaveRequestForm.get('startDate')?.value;
    const endDate = this.leaveRequestForm.get('endDate')?.value;

    if (!startDate || !endDate) return 0;

    const start = new Date(startDate);
    const end = new Date(endDate);
    const timeDiff = end.getTime() - start.getTime();
    const dayDiff = Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1;

    return dayDiff > 0 ? dayDiff : 0;
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.leaveRequestForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string): string {
    const field = this.leaveRequestForm.get(fieldName);

    if (field?.errors) {
      if (field.errors['required']) return `${fieldName} is required`;
      if (field.errors['email']) return 'Please enter a valid email';
      if (field.errors['maxlength']) return `Maximum ${field.errors['maxlength'].requiredLength} characters allowed`;
      if (field.errors['dateRange']) return 'End date must be after start date';
    }

    return '';
  }

  async onSubmit(): Promise<void> {
    if (this.leaveRequestForm.valid) {
      this.isSubmitting = true;

      try {
        const payload = {
          leaveType: this.leaveRequestForm.value.type,          // ✅ backend expects "leaveType"
          startDate: this.leaveRequestForm.value.startDate,      // ✅ must be ISO date string
          endDate: this.leaveRequestForm.value.endDate,
          reason: this.leaveRequestForm.value.reason,
          emergencyContact: this.leaveRequestForm.value.emergencyContact,
          managerEmail: this.leaveRequestForm.value.managerEmail,
          isHalfDay: !!this.leaveRequestForm.value.halfDay,      // ✅ ensure boolean not string
        };

        console.log('📤 Sending payload to API:', payload);

        const response = await this.apiService.createLeaveRequest(payload).toPromise();
        console.log('✅ Leave request saved:', response);

        this.toastService.success('Leave Request Submitted', 'Your request was successfully sent!');
        this.resetForm();
      } catch (error) {
        console.error('❌ Submission error:', error);
        this.toastService.error('Submission Failed', 'Unable to send leave request.');
      } finally {
        this.isSubmitting = false;
      }
    } else {
      this.markFormGroupTouched();
    }
  }


  private markFormGroupTouched(): void {
    Object.keys(this.leaveRequestForm.controls).forEach(key => {
      this.leaveRequestForm.get(key)?.markAsTouched();
    });
  }

  resetForm(): void {
    this.leaveRequestForm.reset();
    this.attachedFiles = [];
  }

  onCancel(): void {
    if (confirm('Are you sure you want to cancel? All unsaved changes will be lost.')) {
      this.resetForm();
    }
  }

  private showNotification(message: string, type: 'success' | 'error'): void {
    if (type === 'success') {
      this.toastService.success('Leave Request Submitted', message);
    } else {
      this.toastService.error('Submission Failed', message);
    }
  }

  formatDateRange(startDate: string, endDate: string): string {
    const start = new Date(startDate);
    const end = new Date(endDate);

    const startFormatted = start.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });

    const endFormatted = end.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });

    return `${startFormatted} — ${endFormatted}`;
  }

  onHalfDayToggle(): void {
    // Handle half day toggle logic
    console.log('Half day toggle clicked');
  }

  onStartDateChange(): void {
    // Handle start date change logic
    const startDate = this.leaveRequestForm.get('startDate')?.value;
    if (startDate) {
      // Update minimum end date to be start date
      this.minDate = startDate;
    }
  }

  get hasFormErrors(): boolean {
    return this.leaveRequestForm.invalid && (this.leaveRequestForm.dirty || this.leaveRequestForm.touched);
  }

  // Drag and drop functionality
  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    const target = event.currentTarget as HTMLElement;
    target.classList.add('dragover');
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    const target = event.currentTarget as HTMLElement;
    target.classList.remove('dragover');
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    const target = event.currentTarget as HTMLElement;
    target.classList.remove('dragover');

    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.handleFiles(files);
    }
  }

  private handleFiles(files: FileList): void {
    const fileArray = Array.from(files);

    // Validate file types and sizes
    const validFiles = fileArray.filter(file => {
      const extension = '.' + file.name.split('.').pop()?.toLowerCase();
      const isValidType = this.allowedFileTypes.includes(extension);
      const isValidSize = file.size <= 5 * 1024 * 1024; // 5MB limit

      if (!isValidType) {
        console.warn(`File ${file.name} has invalid type`);
        return false;
      }

      if (!isValidSize) {
        console.warn(`File ${file.name} exceeds size limit`);
        return false;
      }

      return true;
    });

    this.attachedFiles = [...this.attachedFiles, ...validFiles];
  }
}