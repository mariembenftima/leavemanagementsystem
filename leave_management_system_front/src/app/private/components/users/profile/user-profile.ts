import {
  Component,
  OnInit,
  AfterViewInit,
  OnDestroy,
  HostListener,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Subject, takeUntil } from 'rxjs';
import { AuthService } from '../../../services/auth.service';
import { LeaveBalance } from '../../../../types/leave-balance.model';
import { DataMapperService } from '../../../../helpers/data-mapper.service';
import { ApiService } from '../../../services/api.service';
import { EmployeeProfile } from '../../../../types/employee-profile.model';

// ✅ Holiday interface for type safety
interface Holiday {
  id?: string;
  name: string;
  date: string;
  type: string;
  description?: string;
}

declare global {
  interface Window {
    closeModal?: () => void;
    downloadProfile?: () => Promise<void>;
    changeProfileImage?: () => void;
    viewLeaveDetails?: (typeKey: string) => void;
    requestLeave?: () => void;
    sendMessage?: () => void;
    scheduleCall?: () => void;
    viewReports?: () => void;
    filterHolidays?: (filter: string, ev?: Event) => void;
    showNotification?: (message: string) => void;
    searchEmployee?: () => void;
    printProfile?: () => void;
    toggleDarkMode?: () => void;
  }
}

@Component({
  selector: 'app-employee-profile',
  templateUrl: './user-profile.html',
  styleUrls: ['./user-profile.css'],
  standalone: false,
})
export class UserProfile implements OnInit, AfterViewInit, OnDestroy {
  employeeData!: EmployeeProfile;
  leaveBalances: Record<string, LeaveBalance> = {};
  holidaysList: Holiday[] = [];  // ✅ Added holidaysList property
  isLoading = true;
  hasError = false;
  
  @ViewChild('loadingOrError') loadingOrError!: ElementRef;

  private autoSaveTimer?: number;
  private clockInterval?: number;
  private destroy$ = new Subject<void>();

  constructor(
    private http: HttpClient,
    private mapper: DataMapperService,
    private authService: AuthService,
    private apiService: ApiService
  ) { }

  ngOnInit(): void {
    const token = localStorage.getItem('authToken');
    if (!token) {
      console.warn('No token found, redirecting to login...');
      window.location.href = '/login';
      return;
    }

    this.loadEmployeeProfile();
    this.loadLeaveBalances();
    this.loadHolidays();  // ✅ Load holidays

    window.closeModal = this.closeModal.bind(this);
    window.downloadProfile = this.downloadProfile.bind(this);
    window.changeProfileImage = this.changeProfileImage.bind(this);
    window.viewLeaveDetails = this.viewLeaveDetails.bind(this);
    window.requestLeave = this.requestLeave.bind(this);
    window.sendMessage = this.sendMessage.bind(this);
    window.scheduleCall = this.scheduleCall.bind(this);
    window.viewReports = this.viewReports.bind(this);
    window.filterHolidays = this.filterHolidays.bind(this);
    window.showNotification = this.showNotification.bind(this);
    window.searchEmployee = this.searchEmployee.bind(this);
    window.printProfile = this.printProfile.bind(this);
    window.toggleDarkMode = this.toggleDarkMode.bind(this);
  }

  ngAfterViewInit(): void {
    document.querySelectorAll('.modal').forEach((modal) => {
      modal.addEventListener('click', (e: Event) => {
        if (e.target === modal) this.closeModal();
      });
    });

    this.initializeCharts();
    this.updateClock();
    this.clockInterval = window.setInterval(() => this.updateClock(), 1000);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();

    if (this.clockInterval) {
      clearInterval(this.clockInterval);
      this.clockInterval = undefined;
    }

    if (this.autoSaveTimer) {
      clearTimeout(this.autoSaveTimer);
      this.autoSaveTimer = undefined;
    }

    delete window.closeModal;
    delete window.downloadProfile;
    delete window.changeProfileImage;
    delete window.viewLeaveDetails;
    delete window.requestLeave;
    delete window.sendMessage;
    delete window.scheduleCall;
    delete window.viewReports;
    delete window.filterHolidays;
    delete window.showNotification;
    delete window.searchEmployee;
    delete window.printProfile;
    delete window.toggleDarkMode;
  }

  @HostListener('document:keydown', ['$event'])
  handleKeydown(e: KeyboardEvent): void {
    if (e.key === 'Escape') this.closeModal();
    if (e.ctrlKey && e.key.toLowerCase() === 'd') {
      e.preventDefault();
      this.downloadProfile();
    }
  }

  private loadEmployeeProfile(): void {
    this.apiService.getProfile()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (profileData) => {
          if (profileData) {
            this.employeeData = profileData;
            this.isLoading = false;
          }
        },
        error: (err) => {
          console.error('Profile error:', err);
          this.hasError = true;
          this.isLoading = false;
        },
      });
  }

  private loadLeaveBalances(): void {
    const userId = this.getCurrentUserId();
    if (!userId) {
      console.warn('No user ID available for loading leave balances');
      return;
    }

    this.apiService.getUserLeaveBalances(userId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (balances) => {
          this.leaveBalances = balances;
        },
        error: (err) => {
          console.error('Balances error:', err);
          this.leaveBalances = {};
        },
      });
  }

  // ✅ Added: Load holidays method
  private loadHolidays(): void {
    // Option 1: If you have a getHolidays() method in ApiService
    // const currentYear = new Date().getFullYear();
    // this.apiService.getHolidays(currentYear)
    //   .pipe(takeUntil(this.destroy$))
    //   .subscribe({
    //     next: (holidays) => {
    //       this.holidaysList = holidays;
    //     },
    //     error: (err) => {
    //       console.error('Holidays error:', err);
    //       this.holidaysList = [];
    //     },
    //   });

    // Option 2: Fallback - Use sample data until API is ready
    this.holidaysList = [
      {
        name: 'New Year\'s Day',
        date: '2025-01-01',
        type: 'national',
        description: 'National Holiday'
      },
      {
        name: 'Independence Day',
        date: '2025-03-20',
        type: 'national',
        description: 'National Holiday'
      },
      {
        name: 'Labor Day',
        date: '2025-05-01',
        type: 'national',
        description: 'National Holiday'
      },
      {
        name: 'Republic Day',
        date: '2025-07-25',
        type: 'national',
        description: 'National Holiday'
      },
      {
        name: 'Eid al-Fitr',
        date: '2025-03-30',
        type: 'national',
        description: 'Religious Holiday'
      },
      {
        name: 'Eid al-Adha',
        date: '2025-06-06',
        type: 'national',
        description: 'Religious Holiday'
      }
    ];
  }

  private getCurrentUserId(): string {
    return this.authService.getCurrentUserId() || '';
  }

  getAge(): number | null {
    if (!this.employeeData?.dateOfBirth) {
      return null;
    }

    const today = new Date();
    const birthDate = new Date(this.employeeData.dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    return Math.max(0, age);
  }

  getYearsOfExperience(): number {
    if (!this.employeeData?.hireDate) {
      return 0;
    }

    const joinDate = this.employeeData.hireDate;
    const join = new Date(joinDate);
    const today = new Date();

    const years = today.getFullYear() - join.getFullYear();
    const monthDiff = today.getMonth() - join.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < join.getDate())) {
      return Math.max(0, years - 1);
    }

    return Math.max(0, years);
  }

  closeModal(): void {
    document
      .querySelectorAll('.modal')
      .forEach((m) => m.classList.remove('show'));
  }

  async downloadProfile(): Promise<void> {
    this.showNotification('Preparing PDF...');
    try {
      const [{ jsPDF }, html2canvasModule] = await Promise.all([
        import('jspdf'),
        import('html2canvas'),
      ]);
      const html2canvas = html2canvasModule.default;

      const target = document.getElementById('profilePrintable') || document.body;
      const canvas = await html2canvas(target, { scale: 2, useCORS: true });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pageWidth;
      const imgHeight = (canvas.height * pageWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight, '', 'FAST');
      heightLeft -= pageHeight;

      while (heightLeft > 0) {
        pdf.addPage();
        position = heightLeft * -1;
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight, '', 'FAST');
        heightLeft -= pageHeight;
      }

      const safeName = this.employeeData.fullname.replace(/\s+/g, '_');
      const date = new Date().toISOString().slice(0, 10);
      pdf.save(`${safeName}_Profile_${date}.pdf`);
      this.showNotification('Profile PDF downloaded!');
    } catch (err) {
      console.error(err);
      this.showNotification('PDF failed. Try browser print instead.');
      setTimeout(() => window.print(), 200);
    }
  }

  changeProfileImage(): void {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e: Event) => {
      const target = e.target as HTMLInputElement;
      const file = target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (ev: ProgressEvent<FileReader>) => {
        const img = document.querySelector('.profile-image') as HTMLImageElement;
        if (img && ev.target?.result) {
          img.src = ev.target.result as string;
          this.showNotification('Profile picture updated!');
        }
      };
      reader.readAsDataURL(file);
    };
    input.click();
  }

  viewLeaveDetails(typeKey: string): void {
    const leave = this.leaveBalances[typeKey];
    if (!leave) return;

    const total = leave.carryover + leave.used;
    const remaining = total - leave.used;
    const percentage = ((leave.used / total) * 100).toFixed(1);

    const content = `
      <div class="info-grid">
        <div class="info-item"><div class="info-label">Type</div><div class="info-value">${typeKey}</div></div>
        <div class="info-item"><div class="info-label">Used</div><div class="info-value">${leave.used} days</div></div>
        <div class="info-item"><div class="info-label">Remaining</div><div class="info-value">${remaining} days</div></div>
        <div class="info-item" style="grid-column: 1 / -1;">
          <div class="info-label">Usage</div>
          <div class="progress-bar"><div class="progress-fill" style="width: ${percentage}%"></div></div>
          <div class="info-value" style="margin-top: 5px;">${percentage}% used</div>
        </div>
      </div>`;

    const modal = document.getElementById('leaveModal');
    const contentEl = document.getElementById('leaveModalContent');
    if (modal && contentEl) {
      contentEl.innerHTML = content;
      modal.classList.add('show');
    }
  }

  requestLeave(): void {
    this.showNotification('Opening leave request form...');
  }

  sendMessage(): void {
    this.showNotification('Opening messaging app...');
  }

  scheduleCall(): void {
    this.showNotification('Opening calendar...');
  }

  viewReports(): void {
    this.showNotification('Loading reports...');
  }

  filterHolidays(filter: 'all' | 'upcoming' | 'optional' | string, ev?: Event): void {
    document
      .querySelectorAll('.filter-tab')
      .forEach((tab) => tab.classList.remove('active'));
    if (ev && ev.target instanceof HTMLElement) {
      ev.target.classList.add('active');
    }

    const holidays = document.querySelectorAll('.holiday-item') as NodeListOf<HTMLElement>;
    holidays.forEach((h) => {
      if (filter === 'all') {
        h.style.display = 'flex';
      } else {
        const category = h.getAttribute('data-category');
        h.style.display = filter === 'upcoming' || category === filter ? 'flex' : 'none';
      }
    });
  }

  showNotification(message: string): void {
    const notification = document.getElementById('notification');
    const text = document.getElementById('notificationText');
    if (!notification || !text) return;

    text.textContent = message;
    notification.classList.add('show');
    setTimeout(() => notification.classList.remove('show'), 3000);
  }

  searchEmployee(): void {
    const term = prompt('Enter employee name or ID:');
    if (term) {
      this.showNotification(`Searching for: ${term}`);
    }
  }

  printProfile(): void {
    window.print();
  }

  toggleDarkMode(): void {
    document.body.classList.toggle('dark-mode');
    this.showNotification('Dark mode toggled!');
  }

  setupAutoSave(): void {
    const inputs = document.querySelectorAll('.form-input') as NodeListOf<HTMLInputElement>;
    inputs.forEach((input) => {
      input.addEventListener('input', () => {
        if (this.autoSaveTimer) {
          clearTimeout(this.autoSaveTimer);
        }
        this.autoSaveTimer = window.setTimeout(() => {
          this.showNotification('Auto-saved changes.');
        }, 2000);
      });
    });
  }

  updateClock(): void {
    // Clock update logic if needed
  }

  initializeCharts(): void {
    // Chart initialization if needed
  }
}