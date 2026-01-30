export interface LeaveType {
  id: number;            
  name: string;       
  maxDays: number;         
  color: string;       
  slug?: string;           
}

export interface LeaveTypeDao {
  id: number;            
  name: string;            
  maxDays: number;        
}