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
import { AuthService } from '../../../services/auth.service';
import { EmployeeProfileData } from '../../../types/user/profileType/employee-profile-data.type';
import { LeaveBalance } from '../../../../types/leave-balance.model';
import { DataMapperService } from '../../../../helpers/data-mapper.service';
import { ApiService } from '../../../services/api.service';


@Component({
  selector: 'app-employee-profile',
  templateUrl: './user-profile.html',
  
  styleUrls: ['./user-profile.css'],
  standalone: false,
  
})
export class UserProfile implements OnInit, AfterViewInit, OnDestroy {
[x: string]: any;
  employeeData!: EmployeeProfileData;
  leaveBalances: Record<string, LeaveBalance> = {};
  isLoading = true;
  hasError = false;
  @ViewChild('loadingOrError') loadingOrError!: ElementRef;

  private autoSaveTimer?: number;
  private clockInterval?: number;

  constructor(
    private http: HttpClient, 
    private mapper: DataMapperService, 
    private authService: AuthService,
    private apiService: ApiService
  ) {}

  ngOnInit(): void {
    this.loadEmployeeProfile();
    this.loadLeaveBalances();

    const w = window as any;
    w.closeModal = this.closeModal.bind(this);
    w.downloadProfile = this.downloadProfile.bind(this);
    w.changeProfileImage = this.changeProfileImage.bind(this);
    w.viewLeaveDetails = this.viewLeaveDetails.bind(this);
    w.requestLeave = this.requestLeave.bind(this);
    w.sendMessage = this.sendMessage.bind(this);
    w.scheduleCall = this.scheduleCall.bind(this);
    w.viewReports = this.viewReports.bind(this);
    w.filterHolidays = this.filterHolidays.bind(this);
    w.showNotification = this.showNotification.bind(this);
    w.searchEmployee = this.searchEmployee.bind(this);
    w.printProfile = this.printProfile.bind(this);
    w.toggleDarkMode = this.toggleDarkMode.bind(this);
  }

  private loadEmployeeProfile(): void {
    const userId = this.getCurrentUserId();
    this.apiService.getProfile(userId).subscribe({
      next: (profileData) => {
        if (profileData) {
          this.employeeData = profileData;
          this.isLoading = false;
        } else {
          console.error('No profile data received');
          this.hasError = true;
          this.isLoading = false;
        }
      },
      error: (err) => {
        console.error('Failed to load employee profile:', err);
        if (err.status === 404) {
          this.employeeData = this.getEmptyProfileData();
          this.isLoading = false;
        } else {
          this.hasError = true;
          this.isLoading = false;
        }
      },
    });
  }

  private getEmptyProfileData(): EmployeeProfileData {
    return {
      id: '',
      user_id: this.getCurrentUserId(),
      employee_id: '',
      fullname: '',
      email: 'dfsc',
      phone: '',
      department: '',
      designation: '',
      join_date: new Date().toISOString().split('T')[0],
      gender: '',
      date_of_birth: '',
      address: '',
      emergency_contact_name: '',
      emergency_contact_phone: '',
      marital_status: '',
      nationality: '',
      salary: 0,
      bank_account_number: '',
      bank_name: '',
      roles: 'employee',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      isActive: true
    };
  }

  private loadLeaveBalances(): void {
    const userId = this.getCurrentUserId();
    this.apiService.getUserLeaveBalances(userId).subscribe({
      next: (balances) => {
        this.leaveBalances = balances;
      },
      error: (err) => {
        console.error('Failed to load leave balances:', err);
      },
    });
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
    if (this.clockInterval) clearInterval(this.clockInterval);
    if (this.autoSaveTimer) clearTimeout(this.autoSaveTimer);
  }

  @HostListener('document:keydown', ['$event'])
  handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') this.closeModal();
    if (e.ctrlKey && e.key.toLowerCase() === 'd') {
      e.preventDefault();
      this.downloadProfile();
    }
  }

  private getCurrentUserId(): string {
    return this.authService.getCurrentUserId() || '';
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
      const file = (e.target as HTMLInputElement).files?.[0];
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

  filterHolidays(
    filter: 'all' | 'upcoming' | 'optional' | string,
    ev?: Event
  ): void {
    document
      .querySelectorAll('.filter-tab')
      .forEach((tab) => tab.classList.remove('active'));
    if (ev && ev.target instanceof HTMLElement)
      ev.target.classList.add('active');

    const holidays = document.querySelectorAll(
      '.holiday-item'
    ) as NodeListOf<HTMLElement>;
    holidays.forEach((h) => {
      if (filter === 'all') h.style.display = 'flex';
      else {
        const category = h.getAttribute('data-category');
        h.style.display =
          filter === 'upcoming' || category === filter ? 'flex' : 'none';
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
    if (term) this.showNotification(`Searching for: ${term}`);
  }

  printProfile(): void {
    window.print();
  }

  toggleDarkMode(): void {
    document.body.classList.toggle('dark-mode');
    this.showNotification('Dark mode toggled!');
  }

  setupAutoSave(): void {
    const inputs = document.querySelectorAll(
      '.form-input'
    ) as NodeListOf<HTMLInputElement>;
    inputs.forEach((input) => {
      input.addEventListener('input', () => {
        if (this.autoSaveTimer) clearTimeout(this.autoSaveTimer);
        this.autoSaveTimer = window.setTimeout(() => {
          // Optional: API call to save draft
        }, 2000);
      });
    });
  }

  updateClock(): void {}
  initializeCharts(): void {}

  private capFirst(s: string): string {
    return s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
  }
}
