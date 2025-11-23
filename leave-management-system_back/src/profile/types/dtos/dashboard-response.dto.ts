import { Expose, Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { UserProfileResponseDto } from './user-profile-response.dto';

export class DashboardActivityDto {
  @Expose()
  @ApiProperty({ example: 'Leave Request Submitted' })
  title: string;

  @Expose()
  @ApiProperty({ example: 'Annual leave for 3 days' })
  description: string;

  @Expose()
  @ApiProperty({ example: '2024-01-15' })
  date: string;
}

export class DashboardLeaveSummaryDto {
  @Expose()
  @ApiProperty({ example: 25 })
  total: number;

  @Expose()
  @ApiProperty({ example: 5 })
  used: number;

  @Expose()
  @ApiProperty({ example: 20 })
  remaining: number;
}

export class DashboardPerformanceDto {
  @Expose()
  @ApiProperty({ example: 95 })
  attendanceRate: number;

  @Expose()
  @ApiProperty({ example: 4.2 })
  performanceScore: number;

  @Expose()
  @ApiProperty({ example: 3 })
  activeProjects: number;

  @Expose()
  @ApiProperty({ example: '2024-01-10' })
  reviewDate?: string;

  @Expose()
  @ApiProperty({ example: 'Doing great overall', required: false })
  comments?: string;
}

export class DashboardEmployeeInfoDto {
  @Expose()
  @ApiProperty({ example: 'Engineering' })
  department: string;

  @Expose()
  @ApiProperty({ example: 'Software Developer' })
  designation: string;

  @Expose()
  @ApiProperty({ example: '2023-05-10' })
  joinDate: string;

  @Expose()
  @ApiProperty({ example: 'EMP12345' })
  employeeId: string;

  @Expose()
  @ApiProperty({ example: '2 years' })
  workExperience: string;

  @Expose()
  @ApiProperty({ example: 'Male' })
  gender: string;
}

export class DashboardContactInfoDto {
  @Expose()
  @ApiProperty({ example: 'john.doe@example.com' })
  email: string;

  @Expose()
  @ApiProperty({ example: '+123456789' })
  phone: string;

  @Expose()
  @ApiProperty({ example: 'Jane Doe - +987654321' })
  emergencyContact: string;

  @Expose()
  @ApiProperty({ example: '123 Main St, Paris, France' })
  address: string;
}

export class DashboardResponseDto {
  @Expose()
  @Type(() => UserProfileResponseDto)
  @ApiProperty({ type: UserProfileResponseDto })
  user: UserProfileResponseDto;

  @Expose()
  @Type(() => DashboardEmployeeInfoDto)
  @ApiProperty({ type: DashboardEmployeeInfoDto })
  employeeInfo: DashboardEmployeeInfoDto;

  @Expose()
  @Type(() => DashboardContactInfoDto)
  @ApiProperty({ type: DashboardContactInfoDto })
  contactInfo: DashboardContactInfoDto;

  @Expose()
  @Type(() => DashboardPerformanceDto)
  @ApiProperty({ type: DashboardPerformanceDto })
  performance: DashboardPerformanceDto;

  @Expose()
  @ApiProperty({ type: Object })
  leaveBalance: Record<string, DashboardLeaveSummaryDto>;

  @Expose()
  @Type(() => DashboardActivityDto)
  @ApiProperty({ type: [DashboardActivityDto] })
  recentActivities: DashboardActivityDto[];
}
