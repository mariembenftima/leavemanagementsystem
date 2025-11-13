export interface Holiday {
  id: number;
  name: string;
  date: string;               
  type: 'COMPANY' | 'NATIONAL' | 'RELIGIOUS';
  description?: string;
  createdAt: string;
}
