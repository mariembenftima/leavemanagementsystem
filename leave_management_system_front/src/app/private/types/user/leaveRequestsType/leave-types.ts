import { LeaveType } from './leave-type.model';

export const LEAVE_TYPES: LeaveType[] = [
  { id: 'annual', name: 'Annual Leave', max_days: 24, color: '#10b981' },
  { id: 'sick', name: 'Sick Leave', max_days: 10, color: '#8b5cf6' },
  { id: 'personal', name: 'Personal Leave', max_days: 5, color: '#f59e0b' },
  {
    id: 'maternity',
    name: 'Maternity Leave',
    max_days: 180,
    color: '#ec4899',
  },
  {
    id: 'paternity',
    name: 'Paternity Leave',
    max_days: 15,
    color: '#3b82f6',
  },
  {
    id: 'emergency',
    name: 'Emergency Leave',
    max_days: 3,
    color: '#ef4444',
  },

  { id: 'half-day', name: 'Half Day', max_days: 1, color: '#f59e0b' },
];
