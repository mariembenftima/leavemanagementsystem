import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Holiday } from 'src/holidays/entities/holiday.entity';
import { LeaveRequest } from 'src/leave-requests/entities/leave-request.entity';
import { LeaveRequestStatus } from 'src/leave-requests/types/enums/leave-request-status.enum';
import { LeaveTypeEntity } from 'src/leave-types/entities/leave-type.entity';
import { LeaveType } from 'src/leave-types/types/interfaces/leave-type.interface';
import { User } from 'src/users/entities/users.entity';
import { Repository } from 'typeorm';

export interface DashboardData {
  userCount: number;
  pendingRequests: number;
  approvedRequests: number;
  rejectedRequests: number;
  totalLeaveTypes: number;
  holidays: Holiday[];
  activities: any[];
}

export interface Stats {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  totalLeaveRequests: number;
  pendingLeaveRequests: number;
  approvedLeaveRequests: number;
  rejectedLeaveRequests: number;
  totalLeaveTypes: number;
  totalHolidays: number;
  upcomingHolidays: number;
}

@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name);

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(LeaveRequest)
    private leaveRequestRepository: Repository<LeaveRequest>,
    @InjectRepository(LeaveTypeEntity)
    private leaveTypeRepository: Repository<LeaveType>,
    @InjectRepository(Holiday)
    private holidayRepository: Repository<Holiday>,
  ) {}

  async getDashboardData(): Promise<DashboardData> {
    try {
      // Get user count
      const userCount = await this.userRepository.count();

      // ✅ Get leave request counts by status - using enum values
      const pendingRequests = await this.leaveRequestRepository.count({
        where: { status: LeaveRequestStatus.PENDING },
      });

      const approvedRequests = await this.leaveRequestRepository.count({
        where: { status: LeaveRequestStatus.APPROVED },
      });

      const rejectedRequests = await this.leaveRequestRepository.count({
        where: { status: LeaveRequestStatus.REJECTED },
      });

      // Get total leave types
      const totalLeaveTypes = await this.leaveTypeRepository.count();

      // Get upcoming holidays (next 10)
      const holidays = await this.holidayRepository.find({
        order: { date: 'ASC' },
        take: 10,
      });

      // Activities - placeholder for now
      const activities: any[] = [];

      this.logger.log('Dashboard data retrieved successfully');

      return {
        userCount,
        pendingRequests,
        approvedRequests,
        rejectedRequests,
        totalLeaveTypes,
        holidays,
        activities,
      };
    } catch (error) {
      this.logger.error(
        `Error fetching dashboard data: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      throw error;
    }
  }

  async getStats(): Promise<Stats> {
    try {
      // User statistics
      const totalUsers = await this.userRepository.count();
      const activeUsers = await this.userRepository.count({
        where: { isActive: true },
      });
      const inactiveUsers = totalUsers - activeUsers;

      // ✅ Leave request statistics - using enum values
      const totalLeaveRequests = await this.leaveRequestRepository.count();

      const pendingLeaveRequests = await this.leaveRequestRepository.count({
        where: { status: LeaveRequestStatus.PENDING },
      });

      const approvedLeaveRequests = await this.leaveRequestRepository.count({
        where: { status: LeaveRequestStatus.APPROVED },
      });

      const rejectedLeaveRequests = await this.leaveRequestRepository.count({
        where: { status: LeaveRequestStatus.REJECTED },
      });

      // Leave type statistics
      const totalLeaveTypes = await this.leaveTypeRepository.count();

      // Holiday statistics
      const totalHolidays = await this.holidayRepository.count();

      const today = new Date();
      const upcomingHolidays = await this.holidayRepository
        .createQueryBuilder('holiday')
        .where('holiday.date >= :today', { today })
        .getCount();

      this.logger.log('Statistics retrieved successfully');

      return {
        totalUsers,
        activeUsers,
        inactiveUsers,
        totalLeaveRequests,
        pendingLeaveRequests,
        approvedLeaveRequests,
        rejectedLeaveRequests,
        totalLeaveTypes,
        totalHolidays,
        upcomingHolidays,
      };
    } catch (error) {
      this.logger.error(
        `Error fetching statistics: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      throw error;
    }
  }
}
