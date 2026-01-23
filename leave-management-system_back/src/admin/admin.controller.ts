import { Controller, Get, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../users/roleguard';
import { Roles } from '../users/roledecorator';
import { UserRole } from '../users/types/enums/user-role.enum';

@ApiTags('admin')
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.HR)
@ApiBearerAuth('JWT-auth')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Get admin dashboard data (Admin/HR only)' })
  @ApiResponse({
    status: 200,
    description: 'Dashboard data retrieved successfully',
  })
  async getDashboardData() {
    const data = await this.adminService.getDashboardData();
    return {
      success: true,
      data,
      message: 'Dashboard data retrieved successfully',
    };
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get admin statistics (Admin/HR only)' })
  @ApiResponse({
    status: 200,
    description: 'Statistics retrieved successfully',
  })
  async getStats() {
    const stats = await this.adminService.getStats();
    return {
      success: true,
      data: stats,
      message: 'Statistics retrieved successfully',
    };
  }
}
