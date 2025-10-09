import { Component, EventEmitter, Output, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { LeaveType } from '../../../types/user/leaveRequestsType/leave-type.model';
import { LeaveRequest } from '../../../types/user/leaveRequestsType/leave-request.model';
import { DataMapperService } from '../../../../helpers/data-mapper.service';


@Component({
  selector: 'app-leave-request',
  standalone: false,
  templateUrl: './user-leave-requests.html',
  styleUrls: ['./user-leave-requests.css'],
})
export class UserLeaveRequests implements OnInit {
  @Output() leaveSubmitted = new EventEmitter<LeaveRequest>();
  @Output() formCancel = new EventEmitter<void>();

  leaveRequestForm: FormGroup;
  leaveTypes: LeaveType[] = [];
  isSubmitting = false;
  showSuccessMessage = false;
  attachedFiles: File[] = [];
  maxFileSize = 5 * 1024 * 1024;
  allowedFileTypes = ['.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png'];

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private mapper: DataMapperService
  ) {
    this.leaveRequestForm = this.fb.group(
      {
        leaveTypeId: ['', Validators.required],
        startDate: ['', Validators.required],
        endDate: ['', Validators.required],
        reason: ['', [Validators.required, Validators.minLength(10)]],
        isHalfday: [false],
        halfDayPeriod: ['morning'],
        emergencyContact: [''],
        managerEmail: ['', [Validators.email]],
      },
      { validators: this.dateRangeValidatorFactory() }
    );
  }

  ngOnInit(): void {
    this.loadLeaveTypes();
  }

  // 🔹 Fetch available leave types from backend
  private loadLeaveTypes(): void {
    this.http.get('/api/leave_types').subscribe({
      next: (res: any) => {
        this.leaveTypes = this.mapper.fromApiArray<LeaveType>(res);
      },
      error: (err) => console.error('Failed to load leave types:', err),
    });
  }

  // ✅ Custom form validator using DB maxDays
  private dateRangeValidatorFactory() {
    return (form: FormGroup) => {
      const startDate = form.get('startDate')?.value;
      const endDate = form.get('endDate')?.value;
      const leaveTypeId = form.get('leaveTypeId')?.value;
      if (!startDate || !endDate || !leaveTypeId) return null;

      const start = new Date(startDate);
      const end = new Date(endDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (start < today) return { pastDate: true };
      if (end < start) return { invalidDateRange: true };

      const selectedType = this.leaveTypes.find((lt) => lt.id === leaveTypeId);
      if (selectedType) {
        const daysDiff =
          Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
        if (daysDiff > selectedType.max_days) {
          return {
            exceedsMaxDays: { max: selectedType.max_days, requested: daysDiff },
          };
        }
      }

      return null;
    };
  }

  // 🧮 Compute total requested days
  calculateTotalDays(): number {
    const start = this.leaveRequestForm.get('startDate')?.value;
    const end = this.leaveRequestForm.get('endDate')?.value;
    if (!start || !end) return 0;

    const startDate = new Date(start);
    const endDate = new Date(end);
    const diff = endDate.getTime() - startDate.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1;
    return this.leaveRequestForm.get('isHalfday')?.value ? 0.5 : Math.max(days, 0);
  }

  // 📎 File handling
  onFileSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files) return;

    const newFiles = Array.from(input.files).filter((file) => {
      const validSize = file.size <= this.maxFileSize;
      const validType = this.allowedFileTypes.some((ext) =>
        file.name.toLowerCase().endsWith(ext)
      );
      if (!validSize) alert(`${file.name} exceeds 5MB`);
      if (!validType) alert(`${file.name} has unsupported type`);
      return validSize && validType;
    });

    this.attachedFiles = [...this.attachedFiles, ...newFiles];
  }

  removeFile(index: number): void {
    this.attachedFiles.splice(index, 1);
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
  }

  // ✅ Form submission (real DB call)
  onSubmit(): void {
    if (this.leaveRequestForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    const formData = this.leaveRequestForm.value;
    const payload: LeaveRequest = {
      user_id: this.getCurrentUserId(),
      leave_type_id: formData.leaveTypeId,
      start_date: formData.startDate,
      end_date: formData.endDate,
      days_requested: this.calculateTotalDays(),
      reason: formData.reason,
      status: 'pending',
      is_half_day: formData.isHalfday,
      emergency_contact: formData.emergencyContact,
      manager_email: formData.managerEmail,
      attachments: this.attachedFiles,
    };

    this.isSubmitting = true;

    this.http.post('/api/leave_requests', this.mapper.toApi(payload)).subscribe({
      next: (res) => {
        this.isSubmitting = false;
        this.showSuccessMessage = true;
        this.leaveSubmitted.emit(payload);
        setTimeout(() => (this.showSuccessMessage = false), 3000);
        this.resetForm();
      },
      error: (err) => {
        console.error('Leave request submission failed:', err);
        this.isSubmitting = false;
      },
    });
  }

  // 🔹 Get logged-in user ID from storage or service
  private getCurrentUserId(): string {
    // Replace with your actual auth service integration
    return localStorage.getItem('user_id') || '';
  }

  private markFormGroupTouched(): void {
    Object.values(this.leaveRequestForm.controls).forEach((control) => {
      control.markAsTouched();
    });
  }

  resetForm(): void {
    this.leaveRequestForm.reset();
    this.attachedFiles = [];
  }

  onCancel(): void {
    this.resetForm();
    this.formCancel.emit();
  }

  onHalfDayToggle(): void {
    const startDate = this.leaveRequestForm.get('startDate');
    const endDate = this.leaveRequestForm.get('endDate');
    if (this.leaveRequestForm.get('isHalfday')?.value && startDate?.value) {
      endDate?.setValue(startDate.value);
    }
  }

  get minDate(): string {
    return new Date().toISOString().split('T')[0];
  }

  get hasFormErrors(): boolean {
    return this.leaveRequestForm.invalid && this.leaveRequestForm.touched;
  }
}
