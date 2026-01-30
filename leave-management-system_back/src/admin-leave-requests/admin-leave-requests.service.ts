import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LeaveBalancesService } from 'src/leave-balances/leave-balances.service';
import { LeaveRequest } from 'src/leave-requests/entities/leave-request.entity';
import { EmailNotificationService } from 'src/notifications/email-notification.service';
import { Between, Repository } from 'typeorm';
import { LeaveRequestFilterDto } from './dtos/leave-request-filter.dto';
import { LeaveRequestStatus } from 'src/leave-requests/types/enums/leave-request-status.enum';
import { ApproveLeaveRequestDto } from './dtos/approve-leave-request.dto';
import { RejectLeaveRequestDto } from './dtos/reject-leave-request.dto';

export interface StatusBreakdown {
  [key: string]: number;
}

export interface LeaveRequestStatistics {
  totalRequests: number;
  monthlyRequests: number;
  statusBreakdown: StatusBreakdown;
}

// Interface for extended LeaveBalancesService methods
interface ExtendedLeaveBalancesService extends LeaveBalancesService {
  deductLeaveBalance(
    userId: string,
    leaveTypeId: number,
    days: number,
  ): Promise<void>;
  restoreLeaveBalance(
    userId: string,
    leaveTypeId: number,
    days: number,
  ): Promise<void>;
}

@Injectable()
export class AdminLeaveRequestsService {
  constructor(
    @InjectRepository(LeaveRequest)
    private readonly leaveRequestRepository: Repository<LeaveRequest>,
    private readonly emailNotificationService: EmailNotificationService,
    private readonly leaveBalancesService: LeaveBalancesService,
  ) {}

  async getAllLeaveRequests(filterDto: LeaveRequestFilterDto) {
    const {
      page = 1,
      limit = 10,
      status,
      userId,
      leaveTypeId,
      startDate,
      endDate,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
    } = filterDto;

    const skip = (page - 1) * limit;

    const queryBuilder = this.leaveRequestRepository
      .createQueryBuilder('lr')
      .leftJoinAndSelect('lr.user', 'user')
      .leftJoinAndSelect('lr.leaveType', 'leaveType')
      .skip(skip)
      .take(limit);

    // Apply filters
    if (status) {
      if (Array.isArray(status)) {
        queryBuilder.andWhere('lr.status IN (:...statuses)', {
          statuses: status,
        });
      } else {
        queryBuilder.andWhere('lr.status = :status', { status });
      }
    }

    if (userId) {
      queryBuilder.andWhere('lr.user.id = :userId', { userId });
    }

    if (leaveTypeId) {
      queryBuilder.andWhere('lr.leaveType.id = :leaveTypeId', { leaveTypeId });
    }

    if (startDate && endDate) {
      queryBuilder.andWhere('lr.startDate BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      });
    } else if (startDate) {
      queryBuilder.andWhere('lr.startDate >= :startDate', { startDate });
    } else if (endDate) {
      queryBuilder.andWhere('lr.endDate <= :endDate', { endDate });
    }

    // Apply sorting
    const validSortFields = [
      'createdAt',
      'startDate',
      'endDate',
      'status',
      'totalDays',
    ];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'createdAt';
    queryBuilder.orderBy(`lr.${sortField}`, sortOrder);

    const [leaveRequests, total] = await queryBuilder.getManyAndCount();

    return {
      data: leaveRequests,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getPendingLeaveRequests() {
    const pendingRequests = await this.leaveRequestRepository
      .createQueryBuilder('lr')
      .leftJoinAndSelect('lr.user', 'user')
      .leftJoinAndSelect('lr.leaveType', 'leaveType')
      .where('lr.status = :status', { status: LeaveRequestStatus.PENDING })
      .orderBy('lr.createdAt', 'ASC')
      .getMany();

    return pendingRequests;
  }

  async getLeaveRequestStatistics(): Promise<LeaveRequestStatistics> {
    const stats = await this.leaveRequestRepository
      .createQueryBuilder('lr')
      .select('lr.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .groupBy('lr.status')
      .getRawMany<{ status: string; count: string }>();

    const totalRequests = await this.leaveRequestRepository.count();

    const currentMonth = new Date();
    currentMonth.setDate(1);
    currentMonth.setHours(0, 0, 0, 0);

    const monthlyRequests = await this.leaveRequestRepository.count({
      where: {
        createdAt: Between(currentMonth, new Date()),
      },
    });

    const statusBreakdown: StatusBreakdown = stats.reduce(
      (acc: StatusBreakdown, stat) => {
        acc[stat.status] = parseInt(stat.count, 10);
        return acc;
      },
      {},
    );

    return {
      totalRequests,
      monthlyRequests,
      statusBreakdown,
    };
  }

  async getLeaveRequestById(id: string) {
    const leaveRequest = await this.leaveRequestRepository.findOne({
      where: { id },
      relations: ['user', 'leaveType'],
    });

    if (!leaveRequest) {
      throw new NotFoundException(`Leave request with ID ${id} not found`);
    }

    return leaveRequest;
  }

  async approveLeaveRequest(
    id: string,
    approveDto: ApproveLeaveRequestDto,
    adminId: string,
  ) {
    const leaveRequest = await this.getLeaveRequestById(id);

    if (leaveRequest.status !== LeaveRequestStatus.PENDING) {
      throw new BadRequestException(
        `Cannot approve leave request with status ${leaveRequest.status}`,
      );
    }

    // Update leave request status
    leaveRequest.status = LeaveRequestStatus.APPROVED;
    leaveRequest.approvedBy = adminId;
    leaveRequest.approvedAt = new Date();
    leaveRequest.rejectionReason = approveDto.comments || undefined;

    const updatedRequest = await this.leaveRequestRepository.save(leaveRequest);

    // Deduct leave balance
    try {
      const extendedService = this
        .leaveBalancesService as ExtendedLeaveBalancesService;
      await extendedService.deductLeaveBalance(
        leaveRequest.user.id,
        leaveRequest.leaveType.id,
        leaveRequest.totalDays,
      );
    } catch (error) {
      console.error('Failed to deduct leave balance:', error);
      // Continue anyway - admin can manually adjust if needed
    }

    // Send notification email
    try {
      await this.emailNotificationService.sendLeaveRequestNotification(
        updatedRequest,
        leaveRequest.user,
        LeaveRequestStatus.APPROVED,
      );
    } catch (error) {
      console.error('Failed to send notification email:', error);
    }

    return updatedRequest;
  }

  async rejectLeaveRequest(
    id: string,
    rejectDto: RejectLeaveRequestDto,
    adminId: string,
  ) {
    const leaveRequest = await this.getLeaveRequestById(id);

    if (leaveRequest.status !== LeaveRequestStatus.PENDING) {
      throw new BadRequestException(
        `Cannot reject leave request with status ${leaveRequest.status}`,
      );
    }

    if (!rejectDto.reason) {
      throw new BadRequestException('Rejection reason is required');
    }

    // Update leave request status
    leaveRequest.status = LeaveRequestStatus.REJECTED;
    leaveRequest.approvedBy = adminId;
    leaveRequest.approvedAt = new Date();
    leaveRequest.rejectionReason = rejectDto.reason;

    const updatedRequest = await this.leaveRequestRepository.save(leaveRequest);

    // Send notification email
    try {
      await this.emailNotificationService.sendLeaveRequestNotification(
        updatedRequest,
        leaveRequest.user,
        LeaveRequestStatus.REJECTED,
      );
    } catch (error) {
      console.error('Failed to send notification email:', error);
    }

    return updatedRequest;
  }

  async cancelLeaveRequest(id: string, adminId: string) {
    const leaveRequest = await this.getLeaveRequestById(id);

    if (
      leaveRequest.status !== LeaveRequestStatus.APPROVED &&
      leaveRequest.status !== LeaveRequestStatus.PENDING
    ) {
      throw new BadRequestException(
        `Cannot cancel leave request with status ${leaveRequest.status}`,
      );
    }

    const wasApproved = leaveRequest.status === LeaveRequestStatus.APPROVED;

    // Update status
    leaveRequest.status = LeaveRequestStatus.CANCELLED;
    leaveRequest.approvedBy = adminId;
    leaveRequest.approvedAt = new Date();

    const updatedRequest = await this.leaveRequestRepository.save(leaveRequest);

    // If it was approved, restore the leave balance
    if (wasApproved) {
      try {
        const extendedService = this
          .leaveBalancesService as ExtendedLeaveBalancesService;
        await extendedService.restoreLeaveBalance(
          leaveRequest.user.id,
          leaveRequest.leaveType.id,
          leaveRequest.totalDays,
        );
      } catch (error) {
        console.error('Failed to restore leave balance:', error);
      }
    }

    return updatedRequest;
  }
}
