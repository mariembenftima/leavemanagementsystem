import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
  Req,
} from '@nestjs/common';
import { LeaveBalancesService } from './leave-balances.service';
import { CreateBalanceDto } from './types/dtos/create-balance.dto';
import { AdjustBalanceDto } from './types/dtos/adjust-balance.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { LeaveBalanceEntity } from './entities/leave-balance.entity';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Request } from 'express';

@ApiTags('leave-balances')
@Controller('leave-balances')
export class LeaveBalancesController {
  constructor(private readonly svc: LeaveBalancesService) {}

  // ✅ Define a proper JWT payload type
  private getUserId(req: Request): string {
    const user = req.user as { id?: string; userId?: string };
    const id = user?.id || user?.userId || '';
    if (!id) {
      throw new Error('User ID is missing from request payload');
    }

    return id;
  }

  // ➕ Create a new leave balance
  @Post()
  @ApiOperation({ summary: 'Create a new leave balance record' })
  @ApiResponse({ status: 201, type: LeaveBalanceEntity })
  async create(@Body() dto: CreateBalanceDto) {
    return await this.svc.create(dto);
  }

  // 📋 Get all leave balances (admin)
  @Get()
  @ApiOperation({ summary: 'Get all leave balance records' })
  @ApiResponse({ status: 200, type: [LeaveBalanceEntity] })
  async findAll() {
    return await this.svc.findAll();
  }

  // 👤 Get current user's aggregated summary (dashboard)
  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get current user’s aggregated leave balance summary',
  })
  async getMyBalances(@Req() req: Request) {
    const userId = this.getUserId(req);
    return await this.svc.findByUserId(userId);
  }

  // 🧾 Get full detailed balances for a specific user (admin/reporting)
  @Get('user/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get full leave balances (detailed records) for a specific user',
  })
  @ApiResponse({ status: 200, type: [LeaveBalanceEntity] })
  async findByUserIdDetailed(@Param('id') id: string) {
    return await this.svc.findByUserIdDetailed(id);
  }

  // 🔍 Get one leave balance record by ID
  @Get(':id')
  @ApiOperation({ summary: 'Get one leave balance record by ID' })
  @ApiResponse({ status: 200, type: LeaveBalanceEntity })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return await this.svc.findOne(id);
  }

  // ✏️ Adjust leave balance (admin)
  @Patch(':id')
  @ApiOperation({ summary: 'Adjust leave balance for a record' })
  @ApiResponse({ status: 200, type: LeaveBalanceEntity })
  async adjust(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: AdjustBalanceDto,
  ) {
    return await this.svc.adjust(id, dto);
  }
}
