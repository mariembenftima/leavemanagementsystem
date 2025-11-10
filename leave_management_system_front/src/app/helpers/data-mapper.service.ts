import { Injectable } from '@angular/core';
import { User } from '../types/user.model';
import { EmployeeProfile } from '../types/employee-profile.model';
import { EmployeeProfileData } from '../private/types/user/profileType/employee-profile-data.type';
import { LeaveRequest, LeaveType } from '../private/services/api.service';
import { LeaveBalance } from '../types/leave-balance.model';
import { Activity } from '../types/activity.model';
import { Holiday } from '../types/holiday.model';

@Injectable({
  providedIn: 'root',
})
export class DataMapperService {

  private toCamelCase(obj: any): any {
    if (Array.isArray(obj)) {
      return obj.map((v) => this.toCamelCase(v));
    } else if (obj && typeof obj === 'object') {
      return Object.keys(obj).reduce((acc: any, key: string) => {
        const camelKey = key.replace(/_([a-z])/g, (_, g) => g.toUpperCase());
        acc[camelKey] = this.toCamelCase(obj[key]);
        return acc;
      }, {});
    }
    return obj;
  }

  private toSnakeCase(obj: any): any {
    if (Array.isArray(obj)) {
      return obj.map((v) => this.toSnakeCase(v));
    } else if (obj && typeof obj === 'object') {
      return Object.keys(obj).reduce((acc: any, key: string) => {
        const snakeKey = key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
        acc[snakeKey] = this.toSnakeCase(obj[key]);
        return acc;
      }, {});
    }
    return obj;
  }

  fromApi<T>(data: any): T {
    return this.toCamelCase(data);
  }

  fromApiArray<T>(data: any[]): T[] {
    return this.toCamelCase(data);
  }

  toApi<T>(data: T): any {
    return this.toSnakeCase(data);
  }

  toApiArray<T>(data: T[]): any[] {
    return this.toSnakeCase(data);
  }


  mapUser(data: any): User {
    return this.fromApi<User>(data);
  }

  mapEmployeeProfile(data: any): EmployeeProfile {
    return this.fromApi<EmployeeProfile>(data);
  }

  mapEmployeeProfileData(data: any): EmployeeProfileData {
    return this.fromApi<EmployeeProfileData>(data);
  }

  mapLeaveType(data: any): LeaveType {
    return this.fromApi<LeaveType>(data);
  }

  mapLeaveRequest(data: any): LeaveRequest {
    return this.fromApi<LeaveRequest>(data);
  }

  mapLeaveBalance(data: any): LeaveBalance {
    return this.fromApi<LeaveBalance>(data);
  }

  mapPerformance(data: any): Performance {
    return this.fromApi<Performance>(data);
  }

  mapActivity(data: any): Activity {
    return this.fromApi<Activity>(data);
  }

  mapHoliday(data: any): Holiday {
    return this.fromApi<Holiday>(data);
  }

  // Batch helpers for lists
  mapUsers(data: any[]): User[] {
    return this.fromApiArray<User>(data);
  }

  mapLeaveRequests(data: any[]): LeaveRequest[] {
    return this.fromApiArray<LeaveRequest>(data);
  }

  mapLeaveBalances(data: any[]): LeaveBalance[] {
    return this.fromApiArray<LeaveBalance>(data);
  }

  mapActivities(data: any[]): Activity[] {
    return this.fromApiArray<Activity>(data);
  }

  mapHolidays(data: any[]): Holiday[] {
    return this.fromApiArray<Holiday>(data);
  }
}
