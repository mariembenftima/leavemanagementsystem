import {
  Controller,
  Get,
  Patch,
  Body,
  Param,
  Query,
  ParseUUIDPipe, // ← Changé de ParseIntPipe à ParseUUIDPipe
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import {
  AdminLeaveRequestsService,
  LeaveRequestStatistics,
} from './admin-leave-requests.service';
import { ApproveLeaveRequestDto } from './dtos/approve-leave-request.dto';
import { RejectLeaveRequestDto } from './dtos/reject-leave-request.dto';
import { LeaveRequestFilterDto } from './dtos/leave-request-filter.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/users/roleguard';
import { UserRole } from 'src/users/types/enums/user-role.enum';
import { Roles } from 'src/users/roledecorator';
import { ResponseInterceptor } from 'src/shared/interceptors/response.interceptor';
import { AuthenticatedRequest } from 'src/auth/types/authenticated-request';

@ApiTags('admin-leave-requests')
@Controller('admin/leave-requests')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.MANAGER)
@ApiBearerAuth('JWT-auth')
@UseInterceptors(ResponseInterceptor)
export class AdminLeaveRequestsController {
  constructor(
    private readonly adminLeaveRequestsService: AdminLeaveRequestsService,
  ) {}

  @Get()
  @ApiOperation({
    summary: 'Get all leave requests with filters and pagination',
  })
  @ApiResponse({
    status: 200,
    description: 'Leave requests retrieved successfully',
  })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'status', required: false, type: String })
  @ApiQuery({ name: 'userId', required: false, type: String })
  @ApiQuery({ name: 'leaveTypeId', required: false, type: Number })
  @ApiQuery({ name: 'startDate', required: false, type: String })
  @ApiQuery({ name: 'endDate', required: false, type: String })
  async getAllLeaveRequests(@Query() filterDto: LeaveRequestFilterDto) {
    return this.adminLeaveRequestsService.getAllLeaveRequests(filterDto);
  }

  @Get('pending')
  @ApiOperation({ summary: 'Get all pending leave requests' })
  @ApiResponse({
    status: 200,
    description: 'Pending leave requests retrieved successfully',
  })
  async getPendingLeaveRequests() {
    return this.adminLeaveRequestsService.getPendingLeaveRequests();
  }

  @Get('statistics')
  @ApiOperation({ summary: 'Get leave request statistics' })
  @ApiResponse({
    status: 200,
    description: 'Statistics retrieved successfully',
  })
  async getLeaveRequestStatistics(): Promise<LeaveRequestStatistics> {
    return this.adminLeaveRequestsService.getLeaveRequestStatistics();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single leave request by ID' })
  @ApiResponse({
    status: 200,
    description: 'Leave request retrieved successfully',
  })
  async getLeaveRequestById(@Param('id', ParseUUIDPipe) id: string) {
    // ← Changé
    return this.adminLeaveRequestsService.getLeaveRequestById(id);
  }

  @Patch(':id/approve')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Approve a leave request' })
  @ApiResponse({
    status: 200,
    description: 'Leave request approved successfully',
  })
  async approveLeaveRequest(
    @Param('id', ParseUUIDPipe) id: string, // ← Changé
    @Body() approveDto: ApproveLeaveRequestDto,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.adminLeaveRequestsService.approveLeaveRequest(
      id,
      approveDto,
      req.user.userId,
    );
  }

  @Patch(':id/reject')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reject a leave request' })
  @ApiResponse({
    status: 200,
    description: 'Leave request rejected successfully',
  })
  async rejectLeaveRequest(
    @Param('id', ParseUUIDPipe) id: string, // ← Changé
    @Body() rejectDto: RejectLeaveRequestDto,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.adminLeaveRequestsService.rejectLeaveRequest(
      id,
      rejectDto,
      req.user.userId,
    );
  }

  @Patch(':id/cancel')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cancel a leave request (Admin override)' })
  @ApiResponse({
    status: 200,
    description: 'Leave request cancelled successfully',
  })
  async cancelLeaveRequest(
    @Param('id', ParseUUIDPipe) id: string, // ← Changé
    @Request() req: AuthenticatedRequest,
  ) {
    return this.adminLeaveRequestsService.cancelLeaveRequest(
      id,
      req.user.userId,
    );
  }
}
