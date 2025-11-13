export interface Performance {
  id: number;
  userId: string;
  reviewPeriod: string; 
  year: number;
  rating?: number; 
  feedback?: string;  
  goals?: string;
  achievements?: string;
  areasForImprovement?: string;
  managerFeedback?: string;
  employeeComments?: string;
  reviewDate?: string;
  createdAt: string;
  updatedAt: string;
}
