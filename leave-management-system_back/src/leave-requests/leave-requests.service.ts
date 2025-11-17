import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  LeaveRequest,
  LeaveRequestStatus,
} from './entities/leave-request.entity';
import { User } from '../users/entities/users.entity';
import { EmailNotificationService } from '../notifications/email-notification.service';
import { LeaveTypeEntity } from 'src/leave-types/entities/leave-type.entity';
import { CreateLeaveRequestDto } from './types/dtos/create-leave-request.dto';

@Injectable()
export class LeaveRequestsService {
  constructor(
    @InjectRepository(LeaveRequest)
    private readonly leaveRequestRepository: Repository<LeaveRequest>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private emailNotificationService: EmailNotificationService,
    @InjectRepository(LeaveTypeEntity)
    private leaveTypeRepository: Repository<any>,
  ) {}

  async createLeaveRequest(
    dto: CreateLeaveRequestDto,
    userId: string,
  ): Promise<LeaveRequest> {
    // Find the leave type by name or ID
    const leaveType: LeaveTypeEntity | null =
      await this.leaveTypeRepository.findOne({
        where: { name: dto.leaveType },
      });

    if (!leaveType) {
      throw new BadRequestException(`Leave type '${dto.leaveType}' not found`);
    }

    // Create the entity instance
    const leaveRequest: LeaveRequest = this.leaveRequestRepository.create({
      user: { id: userId },
      leaveType,
      startDate: new Date(dto.startDate),
      endDate: new Date(dto.endDate),
      reason: dto.reason,
      is_half_day: !!dto.isHalfDay,
      totalDays: dto.totalDays,
      status: LeaveRequestStatus.PENDING,
    });

    // Save to DB
    const saved: LeaveRequest =
      await this.leaveRequestRepository.save(leaveRequest);
    return saved;
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
    try {
      console.log('🔍 Fetching all leave requests...');

      // Try query builder approach (more reliable)
      const leaveRequests = await this.leaveRequestRepository
        .createQueryBuilder('lr')
        .leftJoinAndSelect('lr.user', 'user')
        .leftJoinAndSelect('lr.leaveType', 'leaveType')
        .orderBy('lr.createdAt', 'DESC')
        .getMany();

      console.log(`✅ Fetched ${leaveRequests.length} leave requests`);
      return leaveRequests;

    } catch (error) {
      console.error('❌ ERROR in getAllLeaveRequests:', error);
      console.error('Error message:', error.message);
      console.error('Error name:', error.name);

      // Try without relations as fallback
      console.log('⚠️ Trying without relations...');
      const basicRequests = await this.leaveRequestRepository.find({
        order: { createdAt: 'DESC' },
      });

      console.log(`⚠️ Got ${basicRequests.length} requests without relations`);
      return basicRequests;
    }
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
      const allUsers = await this.userRepository.find();
      const hrUsers = allUsers.filter(
        (user) => user.roles.includes('hr') || user.roles.includes('admin'),
      );

      for (const hrUser of hrUsers) {
        await this.emailNotificationService.sendLeaveRequestNotification(
          leaveRequest,
          hrUser,
          'submitted',
        );
      }
    } catch (error) {
      console.error('Failed to send HR notification:', error);
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
