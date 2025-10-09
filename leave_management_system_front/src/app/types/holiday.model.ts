export interface Holiday {
  id: string;
  name: string;
  date: string;
  type: string;
  isOptional: boolean;
  description?: string;
  createdAt: string;
}
