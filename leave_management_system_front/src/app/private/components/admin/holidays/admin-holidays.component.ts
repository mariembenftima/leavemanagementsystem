import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { HolidaysService, Holiday, HolidayStatistics } from './holidays.service';
import { ToastService } from '../../../../shared/services/toast.service';

@Component({
  selector: 'app-admin-holidays',
  templateUrl: './admin-holidays.component.html',
  styleUrls: ['./admin-holidays.component.css'],
  standalone: false
})
export class AdminHolidaysComponent implements OnInit, OnDestroy {
  holidays: Holiday[] = [];
  filteredHolidays: Holiday[] = [];
  statistics: HolidayStatistics | null = null;
  
  holidayForm: FormGroup;
  isLoading = false;
  isSubmitting = false;
  
  // Modal state
  showCreateModal = false;
  showEditModal = false;
  showDeleteModal = false;
  selectedHoliday: Holiday | null = null;
  
  // Filters
  selectedYear: number = new Date().getFullYear();
  searchQuery = '';
  selectedType = '';
  
  holidayTypes = [
    { value: '', label: 'All Types' },
    { value: 'national', label: 'National' },
    { value: 'religious', label: 'Religious' },
    { value: 'company', label: 'Company' },
    { value: 'other', label: 'Other' }
  ];

  private destroy$ = new Subject<void>();

  constructor(
    private holidaysService: HolidaysService,
    private formBuilder: FormBuilder,
    private toastService: ToastService
  ) {
    this.holidayForm = this.createForm();
  }

  ngOnInit(): void {
    this.loadData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private createForm(): FormGroup {
    return this.formBuilder.group({
      name: ['', [Validators.required, Validators.maxLength(255)]],
      date: ['', Validators.required],
      description: ['', Validators.maxLength(500)],
      isRecurring: [true],
      type: ['national', Validators.required]
    });
  }

  private loadData(): void {
    this.isLoading = true;

    this.holidaysService.getAllHolidays(this.selectedYear)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (holidays) => {
          this.holidays = holidays;
          this.applyFilters();
          this.loadStatistics();
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading holidays:', error);
          this.toastService.error('Error', 'Failed to load holidays');
          this.isLoading = false;
        }
      });
  }

  private loadStatistics(): void {
    this.holidaysService.getStatistics()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (stats) => {
          this.statistics = stats;
        },
        error: (error) => {
          console.error('Error loading statistics:', error);
        }
      });
  }

  applyFilters(): void {
    let filtered = [...this.holidays];

    // Search filter
    if (this.searchQuery.trim()) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(h => 
        h.name.toLowerCase().includes(query) ||
        h.description?.toLowerCase().includes(query)
      );
    }

    // Type filter
    if (this.selectedType) {
      filtered = filtered.filter(h => h.type === this.selectedType);
    }

    this.filteredHolidays = filtered;
  }

  onYearChange(): void {
    this.loadData();
  }

  onSearchChange(): void {
    this.applyFilters();
  }

  onTypeChange(): void {
    this.applyFilters();
  }

  openCreateModal(): void {
    this.holidayForm.reset({
      isRecurring: true,
      type: 'national'
    });
    this.showCreateModal = true;
  }

  openEditModal(holiday: Holiday): void {
    this.selectedHoliday = holiday;
    this.holidayForm.patchValue({
      name: holiday.name,
      date: this.formatDateForInput(holiday.date),
      description: holiday.description || '',
      isRecurring: holiday.isRecurring,
      type: holiday.type || 'national'
    });
    this.showEditModal = true;
  }

  openDeleteModal(holiday: Holiday): void {
    this.selectedHoliday = holiday;
    this.showDeleteModal = true;
  }

  closeModals(): void {
    this.showCreateModal = false;
    this.showEditModal = false;
    this.showDeleteModal = false;
    this.selectedHoliday = null;
    this.holidayForm.reset();
  }

  onSubmitCreate(): void {
    if (this.holidayForm.invalid) {
      this.markFormAsTouched();
      return;
    }

    this.isSubmitting = true;
    const formValue = this.holidayForm.value;

    this.holidaysService.createHoliday(formValue)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.toastService.success('Success', 'Holiday created successfully');
          this.closeModals();
          this.loadData();
          this.isSubmitting = false;
        },
        error: (error) => {
          console.error('Error creating holiday:', error);
          this.toastService.error('Error', 'Failed to create holiday');
          this.isSubmitting = false;
        }
      });
  }

  onSubmitEdit(): void {
    if (this.holidayForm.invalid || !this.selectedHoliday) {
      return;
    }

    this.isSubmitting = true;
    const formValue = this.holidayForm.value;

    this.holidaysService.updateHoliday(this.selectedHoliday.id, formValue)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.toastService.success('Success', 'Holiday updated successfully');
          this.closeModals();
          this.loadData();
          this.isSubmitting = false;
        },
        error: (error) => {
          console.error('Error updating holiday:', error);
          this.toastService.error('Error', 'Failed to update holiday');
          this.isSubmitting = false;
        }
      });
  }

  confirmDelete(): void {
    if (!this.selectedHoliday) return;

    this.isSubmitting = true;

    this.holidaysService.deleteHoliday(this.selectedHoliday.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.toastService.success('Success', 'Holiday deleted successfully');
          this.closeModals();
          this.loadData();
          this.isSubmitting = false;
        },
        error: (error) => {
          console.error('Error deleting holiday:', error);
          this.toastService.error('Error', 'Failed to delete holiday');
          this.isSubmitting = false;
        }
      });
  }

  formatDate(date: string | Date): string {
    const d = new Date(date);
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  private formatDateForInput(date: string | Date): string {
    const d = new Date(date);
    return d.toISOString().split('T')[0];
  }

  getDayOfWeek(date: string | Date): string {
    const d = new Date(date);
    return d.toLocaleDateString('en-US', { weekday: 'long' });
  }

  isUpcoming(date: string | Date): boolean {
    const holidayDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return holidayDate >= today;
  }

  isPast(date: string | Date): boolean {
    return !this.isUpcoming(date);
  }

  getTypeClass(type: string): string {
    switch (type) {
      case 'national': return 'type-national';
      case 'religious': return 'type-religious';
      case 'company': return 'type-company';
      default: return 'type-other';
    }
  }

  getTypeIcon(type: string): string {
    switch (type) {
      case 'national': return '🏳️';
      case 'religious': return '🕌';
      case 'company': return '🏢';
      default: return '📅';
    }
  }

  private markFormAsTouched(): void {
    Object.keys(this.holidayForm.controls).forEach(key => {
      this.holidayForm.get(key)?.markAsTouched();
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.holidayForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string): string {
    const field = this.holidayForm.get(fieldName);
    if (field?.errors) {
      if (field.errors['required']) return `${fieldName} is required`;
      if (field.errors['maxlength']) return `Maximum ${field.errors['maxlength'].requiredLength} characters allowed`;
    }
    return '';
  }
}