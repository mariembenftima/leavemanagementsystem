export interface LeaveRequest {
  id?: string;
  user_id: string;
  leave_type_id: string;
  start_date: string;
  end_date: string;
  days_requested?: number;
  reason: string;
  status?: 'pending' | 'approved' | 'rejected';
  approved_by?: string;
  approved_at?: string;
  rejection_reason?: string;
  is_half_day: boolean;
  emergency_contact?: string;
  manager_email?: string;
  reviewed_by?: string;
  reviewed_at?: string;
  created_at?: string;
  updated_at?: string;
  attachments?: File[];
}
