import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { lastValueFrom } from 'rxjs';
import { LEAVE_TYPES } from '../../../types/user/leaveRequestsType/leave-types';
import { ApiService, LeaveRequest } from '../../../services/api.service';
import { AuthService } from '../../../services/auth.service';
import { Holiday } from '../../../../types/holiday.model';

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
export class UserCalender implements OnInit {
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

  constructor(
    private router: Router,
    private apiService: ApiService,
    private authService: AuthService
  ) {}

  async ngOnInit(): Promise<void> {
    await this.refreshCalendar();
  }

  /** 🔹 Refresh calendar and reload data */
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

  /** 🔹 Load all calendar-related data from backend */
private async loadCalendarData(): Promise<void> {
  try {
    const [events, holidays, leaves] = await Promise.all([
      lastValueFrom(this.apiService.getCalendarEvents(this.currentMonth + 1, this.currentYear)),
      lastValueFrom(this.apiService.getHolidays(this.currentYear)),
      lastValueFrom(this.apiService.getMyLeaveRequests())
    ]);

    this.events = this.processCalendarEvents(events);
    this.holidays = holidays;
    this.myLeaveRequests = leaves;

    this.addHolidaysToCalendar(holidays);
    this.addLeaveRequestsToCalendar(leaves);
  } catch (err) {
    console.error('Failed to fetch calendar data:', err);
  }
}


  /** 🔹 Map API events to CalendarEvent format */
  private processCalendarEvents(apiEvents: any[]): CalendarEvent[] {
    return apiEvents.map(event => ({
      id: event.id,
      title: event.title || `${event.user?.firstName ?? ''} ${event.user?.lastName ?? ''}`,
      type: this.mapLeaveTypeToCalendarType(event.leaveType?.name || event.type),
      startDate: new Date(event.startDate),
      endDate: new Date(event.endDate),
      color: this.getLeaveTypeColor(event.leaveType?.name || event.type),
    }));
  }

  /** 🔹 Add holidays to event list */
  private addHolidaysToCalendar(holidays: any[]): void {
    holidays.forEach(holiday => {
      const date = new Date(holiday.date);
      if (this.isInCurrentMonth(date)) {
        this.events.push({
          id: `holiday-${holiday.id}`,
          title: holiday.name,
          type: 'autres',
          startDate: date,
          endDate: date,
          color: '#ef4444',
        });
      }
    });
  }

  /** 🔹 Add approved leave requests to calendar */
  private addLeaveRequestsToCalendar(leaveRequests: any[]): void {
    leaveRequests
      .filter(req => req.status === 'approved')
      .forEach(req => {
        const start = new Date(req.startDate);
        const end = new Date(req.endDate);
        if (this.isDateRangeInCurrentMonth(start, end)) {
          this.events.push({
            id: `leave-${req.id}`,
            title: `My ${req.leaveType?.name || 'Leave'}`,
            type: this.mapLeaveTypeToCalendarType(req.leaveType?.name),
            startDate: start,
            endDate: end,
            color: this.getLeaveTypeColor(req.leaveType?.name),
          });
        }
      });
  }

  /** 🔹 Map backend leave type to calendar type */
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

  /** 🔹 Color mapping for leave types */
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

  /** 🔹 Build the full 6-week (42-day) calendar grid */
  generateCalendar(): void {
    const firstDay = new Date(this.currentYear, this.currentMonth, 1);
    const start = new Date(firstDay);
    start.setDate(start.getDate() - firstDay.getDay());

    this.calendarDays = [];

    for (let i = 0; i < 42; i++) {
      const date = new Date(start);
      date.setDate(start.getDate() + i);

      const eventsForDay = this.events.filter(e => date >= e.startDate && date <= e.endDate);

      this.calendarDays.push({
        date,
        dayNumber: date.getDate(),
        isCurrentMonth: date.getMonth() === this.currentMonth,
        isToday: this.sameYMD(date, new Date()),
        events: eventsForDay,
      });
    }
  }

  /** 🔹 Navigation & utility functions */
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

  /** 🔹 Helpers */
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

  /** 🔹 Template utilities */
  isWeekend(date: Date): boolean {
    const day = date.getDay();
    return day === 0 || day === 6;
  }

  onEventClick(event: CalendarEvent): void {
    console.log('Event clicked:', event);
    // Placeholder: open modal/details
  }

  onDayClick(day: CalendarDay): void {
    console.log('Day clicked:', day);
    // Placeholder: custom logic or modal
  }
}
