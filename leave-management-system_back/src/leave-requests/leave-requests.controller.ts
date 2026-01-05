import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Request,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { LeaveRequestsService } from './leave-requests.service';
import { AuthenticatedRequest } from '../auth/types/authenticated-request';
import { CreateLeaveRequestDto } from './types/dtos/create-leave-request.dto';
import { UpdateLeaveStatusDto } from './types/dtos/update-leave-status.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/users/roleguard';
import { Roles } from 'src/users/roledecorator';
import { UserRole } from 'src/users/types/enums/user-role.enum';

@ApiTags('leave-requests')
@ApiBearerAuth('JWT-auth')
@Controller('leave-requests')
export class LeaveRequestsController {
  constructor(private readonly leaveRequestsService: LeaveRequestsService) {}

  @Get('all')
  @ApiOperation({ summary: 'Get all leave requests (HR/Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'All leave requests retrieved successfully',
  })
  getAllLeaveRequests() {
    return this.leaveRequestsService.getAllLeaveRequests();
  }

  @Get('pending')
  @ApiOperation({ summary: 'Get all pending leave requests' })
  @ApiResponse({
    status: 200,
    description: 'Pending leave requests retrieved successfully',
  })
  getPendingLeaveRequests() {
    return this.leaveRequestsService.getPendingLeaveRequests();
  }

  @Get('me')
  @ApiOperation({ summary: "Get current user's leave requests" })
  @ApiResponse({
    status: 200,
    description: 'Leave requests retrieved successfully',
  })
  getMyLeaveRequests(@Request() req: AuthenticatedRequest) {
    return this.leaveRequestsService.getLeaveRequestsByUser(req.user.userId);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new leave request' })
  @ApiResponse({
    status: 201,
    description: 'Leave request created successfully',
  })
  createLeaveRequest(
    @Body() dto: CreateLeaveRequestDto,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.leaveRequestsService.createLeaveRequest(dto, req.user.userId);
  }

  @Put(':id/status')
  @ApiOperation({ summary: 'Update leave request status (HR/Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Leave request status updated successfully',
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.HR, UserRole.ADMIN)
  @ApiBearerAuth('JWT-auth')
  updateLeaveRequestStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateStatusDto: UpdateLeaveStatusDto,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.leaveRequestsService.updateLeaveRequestStatus(
      id,
      updateStatusDto.status,
      req.user.userId,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single leave request by ID' })
  @ApiResponse({
    status: 200,
    description: 'Leave request retrieved successfully',
  })
  getLeaveRequestById(@Param('id', ParseUUIDPipe) id: string) {
    return this.leaveRequestsService.getLeaveRequestById(id);
  }
}
