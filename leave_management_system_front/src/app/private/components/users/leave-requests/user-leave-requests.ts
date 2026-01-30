import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { ToastService } from '../../../../shared/services/toast.service';
import { ApiService } from '../../../services/api.service';
import { EmployeeProfile } from '../../../../types/employee-profile.model';

import { HttpClient } from '@angular/common/http';  // ✅ Add HttpClient
import { environment } from '../../../../../environments/environment'; 
import { LeaveType } from '../../../types/user/leaveRequestsType/leave-type.model';

// Keep component-specific interfaces
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
export class LeaveRequestComponent implements OnInit, OnDestroy { 
  leaveRequestForm: FormGroup;
  isSubmitting = false;
  attachedFiles: File[] = [];
  currentEmployee: EmployeeProfile | null = null;
  isLoadingUser = false;
  allowedFileTypes: string[] = ['.pdf', '.doc', '.docx', '.png', '.jpg', '.jpeg'];

  private destroy$ = new Subject<void>(); 

  minDate = new Date().toISOString().split('T')[0];

  // ✅ Will be loaded from database
  leaveTypes: LeaveType[] = [];
  isLoadingLeaveTypes = false;

  upcomingLeaves: UpcomingLeave[] = [
    { title: 'Summer Vacation', startDate: '2025-08-15', endDate: '2025-08-25' },
    { title: 'Conference Leave', startDate: '2025-09-10', endDate: '2025-09-12' }
  ];

  constructor(
    private formBuilder: FormBuilder,
    private toastService: ToastService,
    private apiService: ApiService,
    private http: HttpClient  // ✅ Inject HttpClient directly
  ) {
    this.leaveRequestForm = this.createForm();
  }

  ngOnInit(): void {
    this.loadLeaveTypes();
    this.loadCurrentEmployee();
    this.setupFormValidation();
  }

  ngOnDestroy(): void { 
    this.destroy$.next();
    this.destroy$.complete();
  }

  private async loadLeaveTypes(): Promise<void> {
  this.isLoadingLeaveTypes = true;

  try {
    console.log('🔍 Loading leave types - BYPASSING DataMapper...');
    
    const apiUrl = environment.apiUrl || 'http://localhost:3001';
    const rawResponse = await this.http.get<any>(`${apiUrl}/leave-types`).toPromise();
    
    console.log('📦 RAW HTTP RESPONSE:', rawResponse);
    
    // Extract data array
    const leaveTypesData = rawResponse?.data || rawResponse || [];
    
    console.log('📦 Data length:', leaveTypesData.length);
    console.log('📦 First item:', leaveTypesData[0]);
    
    // ✅ Check ALL properties including non-enumerable ones
    console.log('🔑 Enumerable keys:', Object.keys(leaveTypesData[0]));
    console.log('🔑 ALL property names:', Object.getOwnPropertyNames(leaveTypesData[0]));
    
    // ✅ Try to access each property individually
    const firstItem = leaveTypesData[0];
    const allProps = Object.getOwnPropertyNames(firstItem);
    
    console.log('🔍 Testing property access:');
    allProps.forEach(prop => {
      const value = firstItem[prop];
      console.log(`  ${prop}: ${value} (type: ${typeof value})`);
    });
    
    if (leaveTypesData && leaveTypesData.length > 0) {
      // ✅ Map by copying ALL properties from non-enumerable to plain object
      this.leaveTypes = leaveTypesData.map((item: any) => {
        // Get all property names (including non-enumerable)
        const propertyNames = Object.getOwnPropertyNames(item);
        
        // Create plain object with all properties
        const plainObject: any = {};
        propertyNames.forEach(propName => {
          plainObject[propName] = item[propName];
        });
        
        console.log('✅ Plain object:', plainObject);
        console.log('✅ Plain object id:', plainObject.id);
        console.log('✅ Plain object name:', plainObject.name);
        
        return {
          id: plainObject.id,
          name: plainObject.name,
          maxDays: plainObject.maxDays || plainObject.max_days || 0,
          color: this.getColorForLeaveType(plainObject.name || ''),
          slug: (plainObject.name || 'unknown').toLowerCase().replace(/\s+/g, '-')
        };
      }).filter((type: { name: any; }) => type.name);

      console.log('✅ Successfully loaded leave types:', this.leaveTypes.length);
      console.log('📋 Final leave types:', this.leaveTypes);
    }
  } catch (err) {
    console.error('❌ Failed to load leave types:', err);
    this.toastService.error('Error', 'Failed to load leave types.');
    this.leaveTypes = [];
  } finally {
    this.isLoadingLeaveTypes = false;
  }
}

  /**
   * Get color for leave type based on name
   */
  private getColorForLeaveType(name: string): string {
    const colorMap: Record<string, string> = {
      'Annual Leave': '#3b82f6',
      'Sick Leave': '#ef4444',
      'Personal Leave': '#10b981',
      'Maternity Leave': '#ec4899',
      'Paternity Leave': '#8b5cf6',
      'Bereavement Leave': '#6b7280',
      'Emergency Leave': '#f59e0b',
      'Study Leave': '#84cc16',
      'Unpaid Leave': '#94a3b8'
    };
    return colorMap[name] || '#6b7280';
  }

  private async loadCurrentEmployee(): Promise<void> {
    this.isLoadingUser = true;

    try {
      const storedUser = localStorage.getItem('currentUser');

      if (storedUser) {
        this.currentEmployee = JSON.parse(storedUser);
      } else {
        const currentUserStr = localStorage.getItem('currentUser');
        const userId = currentUserStr ? JSON.parse(currentUserStr)?.id : null; this.currentEmployee = (await this.apiService.getProfile().toPromise()) ?? null;
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

    this.leaveRequestForm.get('endDate')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.validateDateRange();
      });

    this.leaveRequestForm.get('startDate')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
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
  
  // ✅ Convertir en nombre pour la comparaison
  const selectedId = parseInt(selectedValue, 10);
  
  console.log('🔍 Selected value:', selectedValue, 'Type:', typeof selectedValue);
  console.log('🔍 Converted to:', selectedId, 'Type:', typeof selectedId);
  console.log('🔍 Available leave types:', this.leaveTypes);
  console.log('🔍 Found leave type:', this.leaveTypes.find(type => type.id === selectedId));
  
  return this.leaveTypes.find(type => type.id === selectedId);
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
        const selectedLeaveType = this.getSelectedLeaveType();
        
        if (!selectedLeaveType) {
          this.toastService.error('Invalid Leave Type', 'Please select a valid leave type.');
          this.isSubmitting = false;
          return;
        }

        const totalDays = this.calculateTotalDays();

        const payload = {
          leaveTypeId: selectedLeaveType.id,
          startDate: this.leaveRequestForm.value.startDate,      
          endDate: this.leaveRequestForm.value.endDate,
          totalDays: totalDays,
          reason: this.leaveRequestForm.value.reason,
          emergencyContact: this.leaveRequestForm.value.emergencyContact,
          managerEmail: this.leaveRequestForm.value.managerEmail,
          isHalfDay: !!this.leaveRequestForm.value.halfDay,     
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

    console.log('Half day toggle clicked');
  }

  onStartDateChange(): void {

    const startDate = this.leaveRequestForm.get('startDate')?.value;
    if (startDate) {

      this.minDate = startDate;
    }
  }

  get hasFormErrors(): boolean {
    return this.leaveRequestForm.invalid && (this.leaveRequestForm.dirty || this.leaveRequestForm.touched);
  }


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

    const validFiles = fileArray.filter(file => {
      const extension = '.' + file.name.split('.').pop()?.toLowerCase();
      const isValidType = this.allowedFileTypes.includes(extension);
      const isValidSize = file.size <= 5 * 1024 * 1024; // 5MB limit

      if (!isValidType) {
        console.warn(`File ${file.name} has invalid type`);
        return false;
      }

      if (!isValidSize) {
        console.warn(`File ${file.name} has exceeds size limit`);
        return false;
      }

      return true;
    });

    this.attachedFiles = [...this.attachedFiles, ...validFiles];
  }
}