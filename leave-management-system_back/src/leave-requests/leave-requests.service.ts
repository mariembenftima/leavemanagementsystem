import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  LeaveRequest,
  LeaveRequestStatus,
} from './entities/leave-request.entity';
import { User } from '../users/entities/users.entity';
import { EmailNotificationService } from '../notifications/email-notification.service';

@Injectable()
export class LeaveRequestsService {
  constructor(
    @InjectRepository(LeaveRequest)
    private leaveRequestRepository: Repository<LeaveRequest>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private emailNotificationService: EmailNotificationService,
  ) { }

  async createLeaveRequest(
    createLeaveRequestDto: any,
    userId: string,
  ): Promise<LeaveRequest> {
    const leaveRequest = this.leaveRequestRepository.create({
      ...createLeaveRequestDto,
      user: { id: userId },
      status: LeaveRequestStatus.PENDING,
    });

    const result = await this.leaveRequestRepository.save(leaveRequest);
    const savedLeaveRequest = Array.isArray(result) ? result[0] : result;

    // Send email notification to HR/Admin
    await this.sendNotificationToHR(savedLeaveRequest);

    return savedLeaveRequest;
  }

  async updateLeaveRequestStatus(
    id: string,
    status: LeaveRequestStatus,
    userId: string,
  ): Promise<LeaveRequest> {
    const leaveRequest = await this.leaveRequestRepository.findOne({
      where: { id: +id },
      relations: ['user', 'leaveType'],
    });

    if (!leaveRequest) {
      throw new Error('Leave request not found');
    }

    leaveRequest.status = status;
    leaveRequest.approvedBy = userId;
    leaveRequest.approvedAt = new Date();
    const updatedLeaveRequest =
      await this.leaveRequestRepository.save(leaveRequest);

    // Send email notification to employee
    await this.sendNotificationToEmployee(updatedLeaveRequest, status);

    return updatedLeaveRequest;
  }

  async getLeaveRequestsByUser(userId: string): Promise<LeaveRequest[]> {
    return this.leaveRequestRepository.find({
      where: { user: { id: userId } },
      relations: ['leaveType'],
      order: { createdAt: 'DESC' },
    });
  }

  async getAllLeaveRequests(): Promise<LeaveRequest[]> {
    return this.leaveRequestRepository.find({
      relations: ['user', 'leaveType'],
      order: { createdAt: 'DESC' },
    });
  }

  async getPendingLeaveRequests(): Promise<LeaveRequest[]> {
    return this.leaveRequestRepository.find({
      where: { status: LeaveRequestStatus.PENDING },
      relations: ['user', 'leaveType'],
      order: { createdAt: 'ASC' },
    });
  }

  private async sendNotificationToHR(
    leaveRequest: LeaveRequest,
  ): Promise<void> {
    try {
      // Get all users and filter by roles (since TypeORM doesn't support array contains directly)
      const allUsers = await this.userRepository.find();
      const hrUsers = allUsers.filter(
        (user) => user.roles.includes('hr') || user.roles.includes('admin'),
      );

      // Send notification to each HR/Admin user
      for (const hrUser of hrUsers) {
        await this.emailNotificationService.sendLeaveRequestNotification(
          leaveRequest,
          hrUser,
          'submitted',
        );
      }
    } catch (error) {
      console.error('Failed to send HR notification:', error);
      // Don't throw error to avoid breaking the leave request creation
    }
  }

  private async sendNotificationToEmployee(
    leaveRequest: LeaveRequest,
    status: LeaveRequestStatus,
  ): Promise<void> {
    try {
      await this.emailNotificationService.sendLeaveRequestNotification(
        leaveRequest,
        leaveRequest.user,
        status,
      );
    } catch (error) {
      console.error('Failed to send employee notification:', error);
      // Don't throw error to avoid breaking the status update
    }
  }

  // Mock data methods for development
  async getMockLeaveRequests(): Promise<any[]> {
    return [
      {
        id: '1',
        type: 'annual',
        startDate: '2025-09-15',
        endDate: '2025-09-17',
        days: 3,
        status: 'approved',
        reason: 'Family vacation',
        appliedDate: '2025-08-20',
        employee: {
          name: 'John Doe',
          email: 'john.doe@company.com',
          department: 'Engineering',
        },
      },
      {
        id: '2',
        type: 'sick',
        startDate: '2025-08-10',
        endDate: '2025-08-10',
        days: 1,
        status: 'approved',
        reason: 'Medical appointment',
        appliedDate: '2025-08-09',
        employee: {
          name: 'Jane Smith',
          email: 'jane.smith@company.com',
          department: 'Marketing',
        },
      },
      {
        id: '3',
        type: 'personal',
        startDate: '2025-10-05',
        endDate: '2025-10-06',
        days: 2,
        status: 'pending',
        reason: 'Personal matters',
        appliedDate: '2025-09-20',
        employee: {
          name: 'Mike Johnson',
          email: 'mike.johnson@company.com',
          department: 'Sales',
        },
      },
    ];
  }
}
