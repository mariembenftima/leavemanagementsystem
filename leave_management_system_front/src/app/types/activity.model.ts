export interface Activity {
[x: string]: any;
  id: number;
  userId: string;
  activityType: string;          // LOGIN, LEAVE_REQUEST, etc.
  description: string;
  details?: Record<string, any>; // JSONB field
  createdAt: string;
}
