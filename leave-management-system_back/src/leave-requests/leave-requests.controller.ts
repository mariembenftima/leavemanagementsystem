import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Request,
  ParseIntPipe, // ✅ Change from ParseUUIDPipe to ParseIntPipe
  HttpCode,
  HttpStatus,
  UseGuards,
  ParseUUIDPipe,
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

@ApiTags('leave-requests')
@ApiBearerAuth('JWT-auth')
@Controller('leave-requests')
export class LeaveRequestsController {
  constructor(private readonly leaveRequestsService: LeaveRequestsService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get leave requests for current user' })
  @ApiResponse({
    status: 200,
    description: 'Leave requests retrieved successfully',
  })
  getLeaveRequests(@Request() req: AuthenticatedRequest) {
    return this.leaveRequestsService.getLeaveRequestsByUser(req.user.userId);
  }

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
  @UseGuards(JwtAuthGuard)
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
  @UseGuards(JwtAuthGuard)
  createLeaveRequest(
    @Body() dto: CreateLeaveRequestDto,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.leaveRequestsService.createLeaveRequest(dto, req.user.userId);
  }

  @Put(':id/status')
  updateLeaveRequestStatus(
    @Param('id', ParseUUIDPipe) id: string, // ✅ ParseUUIDPipe for UUID
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
  getLeaveRequestById(@Param('id', ParseIntPipe) id: string) {
    // ✅ Changed to ParseIntPipe and number type
    return this.leaveRequestsService.getLeaveRequestById(id);
  }
}
