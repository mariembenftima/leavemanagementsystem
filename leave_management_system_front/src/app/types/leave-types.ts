import { LeaveType } from "../private/types/user/leaveRequestsType/leave-type.model";

export const LEAVE_TYPES: LeaveType[] = [
  { 
    id: 1, 
    name: 'Annual Leave', 
    maxDays: 25, 
    color: '#3b82f6',
    slug: 'annual'
  },
  { 
    id: 2, 
    name: 'Sick Leave', 
    maxDays: 15, 
    color: '#ef4444',
    slug: 'sick'
  },
  { 
    id: 3, 
    name: 'Personal Leave', 
    maxDays: 5, 
    color: '#10b981',
    slug: 'personal'
  },
  {
    id: 4,
    name: 'Maternity Leave',
    maxDays: 90,
    color: '#ec4899',
    slug: 'maternity'
  },
  {
    id: 5,
    name: 'Paternity Leave',
    maxDays: 14,
    color: '#8b5cf6',
    slug: 'paternity'
  },
  {
    id: 6,
    name: 'Bereavement Leave',
    maxDays: 5,
    color: '#6b7280',
    slug: 'bereavement'
  },
  {
    id: 7,
    name: 'Emergency Leave',
    maxDays: 3,
    color: '#f59e0b',
    slug: 'emergency'
  },
  {
    id: 8,
    name: 'Study Leave',
    maxDays: 10,
    color: '#84cc16',
    slug: 'study'
  },
  {
    id: 9,
    name: 'Unpaid Leave',
    maxDays: 30,
    color: '#94a3b8',
    slug: 'unpaid'
  }
];

export function getLeaveTypeById(id: number): LeaveType | undefined {
  return LEAVE_TYPES.find(type => type.id === id);
}

export function getLeaveTypeBySlug(slug: string): LeaveType | undefined {
  return LEAVE_TYPES.find(type => type.slug === slug);
}

export function getLeaveTypeByName(name: string): LeaveType | undefined {
  return LEAVE_TYPES.find(type => type.name.toLowerCase() === name.toLowerCase());
}