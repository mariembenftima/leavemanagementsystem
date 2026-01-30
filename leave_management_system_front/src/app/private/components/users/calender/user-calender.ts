import { Component, OnInit, OnDestroy } from '@angular/core';  
import { Router } from '@angular/router';
import { Subject, lastValueFrom } from 'rxjs'; 
import { ApiService, LeaveRequest } from '../../../services/api.service';
import { AuthService } from '../../../services/auth.service';
import { Holiday } from '../../../../types/holiday.model';
import { LEAVE_TYPES } from '../../../../types/leave-types';

interface CalendarEvent {
  id: string;
  title: string;
  type:
    | 'congé-payé'
    | 'congé-non-payé'
    | 'congé-maladie'
    | 'congé-maternité'
    | 'non-traité'
    | 'autres';
  startDate: Date;
  endDate: Date;
  color: string;
}

interface CalendarDay {
  date: Date;
  dayNumber: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  events: CalendarEvent[];
}



@Component({
  selector: 'app-calendar',
  templateUrl: './user-calender.html',
  styleUrls: ['./user-calender.css'],
  standalone: false,
})
export class UserCalender implements OnInit, OnDestroy {
  currentDate = new Date();
  currentMonth = this.currentDate.getMonth(); // 0-based
  currentYear = this.currentDate.getFullYear();

  months = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ];
  days = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];

  calendarDays: CalendarDay[] = [];
  events: CalendarEvent[] = [];

  selectedView: 'calendar' | 'validation' = 'calendar';
  selectedDepartment = '';
  selectedMonth = '';

  leaveTypes = LEAVE_TYPES;
  isLoading = false;

  holidays : Holiday[] = [];
  myLeaveRequests: LeaveRequest[] = [];

  private destroy$ = new Subject<void>(); 

  constructor(
    private router: Router,
    private apiService: ApiService,
    private authService: AuthService
  ) {}

  async ngOnInit(): Promise<void> {
    await this.refreshCalendar();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  async refreshCalendar(): Promise<void> {
    this.isLoading = true;
    try {
      await this.loadCalendarData();
      this.generateCalendar();
    } catch (error) {
      console.error('Error loading calendar:', error);
    } finally {
      this.isLoading = false;
    }
  }

  private async loadCalendarData(): Promise<void> {
    try {
      console.log('🔍 Loading calendar data for:', this.currentMonth + 1, this.currentYear);

      // ✅ Fetch all leave requests and holidays from database
      const [allLeaveRequests, holidays] = await Promise.all([
        lastValueFrom(this.apiService.getAllLeaveRequests()),  // ✅ Get ALL leave requests
        lastValueFrom(this.apiService.getHolidays(this.currentYear))
      ]);

      console.log('✅ Loaded leave requests:', allLeaveRequests.length);
      console.log('✅ Loaded holidays:', holidays.length);

      // ✅ Clear events array
      this.events = [];
      this.holidays = holidays;
      this.myLeaveRequests = allLeaveRequests;

      // ✅ Add holidays to calendar
      this.addHolidaysToCalendar(holidays);

      // ✅ Add all leave requests to calendar (ALL, not just current user)
      this.addAllLeaveRequestsToCalendar(allLeaveRequests);

      console.log('✅ Total calendar events:', this.events.length);

    } catch (err) {
      console.error('❌ Failed to fetch calendar data:', err);
    }
  }

  private addHolidaysToCalendar(holidays: any[]): void {
    console.log('📅 Adding holidays to calendar:', holidays.length);
    
    holidays.forEach(holiday => {
      const date = new Date(holiday.date);
      console.log('  Holiday:', holiday.name, 'Date:', date, 'Current month:', this.currentMonth);
      
      // ✅ FIX: Don't filter by month - show ALL holidays
      this.events.push({
        id: `holiday-${holiday.id}`,
        title: holiday.name,
        type: 'autres',
        startDate: date,
        endDate: date,
        color: '#ef4444',
      });
    });
    
    console.log('✅ Holidays added:', this.events.filter(e => e.id.startsWith('holiday-')).length);
  }

  private addAllLeaveRequestsToCalendar(leaveRequests: any[]): void {
    console.log('📝 Adding leave requests to calendar:', leaveRequests.length);
    
    leaveRequests.forEach((req, index) => {
      const start = new Date(req.startDate);
      const end = new Date(req.endDate);
      
      console.log(`  Request ${index + 1}:`, {
        user: req.user?.fullname,
        type: req.leaveType?.name,
        start: start,
        end: end,
        status: req.status
      });
      
      const userName = req.user?.fullname || `${req.user?.firstName || ''} ${req.user?.lastName || ''}`.trim() || 'Unknown';
      
      this.events.push({
        id: `leave-${req.id}`,
        title: `${userName} - ${req.leaveType?.name || 'Leave'} (${req.status})`,
        type: this.mapLeaveTypeToCalendarType(req.leaveType?.name),
        startDate: start,
        endDate: end,
        color: this.getLeaveTypeColor(req.leaveType?.name),
      });
    });
    
    console.log('✅ Leave requests added:', this.events.filter(e => e.id.startsWith('leave-')).length);
  }

  private mapLeaveTypeToCalendarType(
    name: string
  ): 'congé-payé' | 'congé-non-payé' | 'congé-maladie' | 'congé-maternité' | 'non-traité' | 'autres' {
    const map: Record<string, any> = {
      'Annual Leave': 'congé-payé',
      'Personal Leave': 'congé-payé',
      'Sick Leave': 'congé-maladie',
      'Maternity Leave': 'congé-maternité',
      'Paternity Leave': 'congé-maternité',
      'Emergency Leave': 'non-traité',
      'Study Leave': 'congé-non-payé',
      'Compassionate Leave': 'autres',
    };
    return map[name] || 'autres';
  }

  private getLeaveTypeColor(name: string): string {
    const colorMap: Record<string, string> = {
      'Annual Leave': '#3b82f6',
      'Sick Leave': '#ef4444',
      'Personal Leave': '#10b981',
      'Emergency Leave': '#f59e0b',
      'Maternity Leave': '#8b5cf6',
      'Paternity Leave': '#06b6d4',
      'Study Leave': '#84cc16',
      'Compassionate Leave': '#f97316',
      'holiday': '#ef4444',
    };
    return colorMap[name] || '#6b7280';
  }

  generateCalendar(): void {
    console.log('🗓️ Generating calendar for:', this.currentMonth + 1, this.currentYear);
    console.log('📊 Total events to display:', this.events.length);
    
    const firstDay = new Date(this.currentYear, this.currentMonth, 1);
    const start = new Date(firstDay);
    start.setDate(start.getDate() - firstDay.getDay());

    this.calendarDays = [];

    for (let i = 0; i < 42; i++) {
      const date = new Date(start);
      date.setDate(start.getDate() + i);

      // ✅ FIX: Normalize dates for comparison (remove time component)
      const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      
      const eventsForDay = this.events.filter(e => {
        const eventStart = new Date(e.startDate.getFullYear(), e.startDate.getMonth(), e.startDate.getDate());
        const eventEnd = new Date(e.endDate.getFullYear(), e.endDate.getMonth(), e.endDate.getDate());
        return dateOnly >= eventStart && dateOnly <= eventEnd;
      });

      this.calendarDays.push({
        date,
        dayNumber: date.getDate(),
        isCurrentMonth: date.getMonth() === this.currentMonth,
        isToday: this.sameYMD(date, new Date()),
        events: eventsForDay,
      });
    }
    
    const daysWithEvents = this.calendarDays.filter(d => d.events.length > 0).length;
    console.log('✅ Calendar generated:', this.calendarDays.length, 'days,', daysWithEvents, 'days with events');
  }

  previousMonth(): void {
    if (this.currentMonth === 0) {
      this.currentMonth = 11;
      this.currentYear--;
    } else this.currentMonth--;
    this.refreshCalendar();
  }

  nextMonth(): void {
    if (this.currentMonth === 11) {
      this.currentMonth = 0;
      this.currentYear++;
    } else this.currentMonth++;
    this.refreshCalendar();
  }

  goToToday(): void {
    const today = new Date();
    this.currentMonth = today.getMonth();
    this.currentYear = today.getFullYear();
    this.refreshCalendar();
  }

  getCurrentMonthYear(): string {
    return `${this.months[this.currentMonth]} ${this.currentYear}`;
  }

  setView(view: 'calendar' | 'validation'): void {
    this.selectedView = view;
  }

  onDepartmentChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.selectedDepartment = target.value;
  }

  onMonthChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.selectedMonth = target.value;
    const month = Number(target.value) - 1;
    if (!isNaN(month)) {
      this.currentMonth = month;
      this.refreshCalendar();
    }
  }

  private sameYMD(a: Date, b: Date): boolean {
    return a.getFullYear() === b.getFullYear() &&
           a.getMonth() === b.getMonth() &&
           a.getDate() === b.getDate();
  }

  private isInCurrentMonth(date: Date): boolean {
    return date.getMonth() === this.currentMonth && date.getFullYear() === this.currentYear;
  }

  private isDateRangeInCurrentMonth(start: Date, end: Date): boolean {
    const monthStart = new Date(this.currentYear, this.currentMonth, 1);
    const monthEnd = new Date(this.currentYear, this.currentMonth + 1, 0);
    return start <= monthEnd && end >= monthStart;
  }

  isWeekend(date: Date): boolean {
    const day = date.getDay();
    return day === 0 || day === 6;
  }

  onEventClick(event: CalendarEvent): void {
    console.log('Event clicked:', event);
  }

  onDayClick(day: CalendarDay): void {
    console.log('Day clicked:', day);
  }
}