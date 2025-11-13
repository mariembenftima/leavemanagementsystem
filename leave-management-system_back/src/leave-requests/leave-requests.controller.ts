import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { LeaveRequestsService } from './leave-requests.service';
import { LeaveRequestStatus } from './entities/leave-request.entity';
import { AuthenticatedRequest } from 'src/auth/types/authenticated-request';
import { CreateLeaveRequestDto } from './types/dtos/create-leave-request.dto';

@ApiTags('leave-requests')
@ApiBearerAuth()
@Controller('leave-requests')
export class LeaveRequestsController {
  constructor(private readonly leaveRequestsService: LeaveRequestsService) {}

  @ApiOperation({ summary: 'Get all leave requests (HR/Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'All leave requests retrieved successfully',
  })
  @Get('all')
  async getAllLeaveRequests() {
    try {
      const leaveRequests =
        await this.leaveRequestsService.getAllLeaveRequests();
      return {
        success: true,
        data: leaveRequests,
        message: 'All leave requests retrieved successfully',
      };
    } catch (err) {
      console.error('❌ /leave-requests/all failed:', err.message, err.stack);
      throw err;
    }
  }

  @Get('pending')
  @ApiOperation({ summary: 'Get all pending leave requests' })
  @ApiResponse({
    status: 200,
    description: 'Pending leave requests retrieved successfully',
  })
  async getPendingLeaveRequests() {
    const pendingRequests =
      await this.leaveRequestsService.getPendingLeaveRequests();
    return {
      success: true,
      data: pendingRequests,
      message: 'Pending leave requests retrieved successfully',
    };
  }

  @ApiOperation({ summary: 'Get current user’s leave requests' })
  @ApiResponse({
    status: 200,
    description: 'Leave requests retrieved successfully',
  })
  @Get('me')
  async getMyLeaveRequests(@Request() req: AuthenticatedRequest) {
    const userId = req.user.userId;
    return {
      success: true,
      data: await this.leaveRequestsService.getLeaveRequestsByUser(userId),
    };
  }

  @Post()
  @ApiOperation({ summary: 'Create a new leave request' })
  @ApiResponse({
    status: 201,
    description: 'Leave request created successfully',
  })
  async createLeaveRequest(@Body() dto: CreateLeaveRequestDto, @Request() req) {
    const userId = (req.user as { id: string })?.id;

    const createdRequest = await this.leaveRequestsService.createLeaveRequest(
      dto,
      userId,
    );

    return {
      success: true,
      message: 'Leave request created successfully',
      data: createdRequest,
    };
  }

  @Put(':id/status')
  async updateLeaveRequestStatus(
    @Param('id') id: string,
    @Body() updateStatusDto: { status: LeaveRequestStatus },
    @Request() req: AuthenticatedRequest,
  ) {
    const updated = await this.leaveRequestsService.updateLeaveRequestStatus(
      id,
      updateStatusDto.status,
      req.user.userId,
    );
    return {
      success: true,
      data: updated,
      message: `Leave request ${updateStatusDto.status} successfully`,
    };
  }
}
