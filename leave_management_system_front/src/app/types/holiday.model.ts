export interface Holiday {
  name: string;                                
  date: string;                                  
  type: 'COMPANY' | 'NATIONAL' | 'RELIGIOUS'; 
  description?: string;                      
  createdAt: string;                        
  isRecurring?: boolean;                         
}

export interface HolidayDao {
  id: number;
  name: string;
  date: string;
  type: 'COMPANY' | 'NATIONAL' | 'RELIGIOUS';
  description?: string;
  createdAt: string;
  isRecurring?: boolean;
}