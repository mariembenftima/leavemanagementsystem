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
  HttpCode,
  HttpStatus,
  UseInterceptors,
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
import { ResponseInterceptor } from 'src/shared/interceptors/response.interceptor';

@ApiTags('leave-balances')
@Controller('leave-balances')
@UseInterceptors(ResponseInterceptor)
export class LeaveBalancesController {
  constructor(private readonly svc: LeaveBalancesService) {}

  private getUserId(req: Request): string {
    const user = req.user as { id?: string; userId?: string };
    const id = user?.id || user?.userId || '';
    if (!id) {
      throw new Error('User ID is missing from request payload');
    }

    return id;
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: "Get current user's aggregated leave balance summary",
  })
  @ApiResponse({
    status: 200,
    description: 'Leave balance retrieved successfully',
  })
  getMyBalances(@Req() req: Request) {
    console.log('Fetching leave balances for current user');
    const userId = this.getUserId(req);
    const lbs = this.svc.findByUserId(userId);
    console.log('Leave balances for user', userId, ':', lbs);
    return lbs;
  }

  @Get('user/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get full leave balances (detailed records) for a specific user',
  })
  @ApiResponse({ status: 200, type: [LeaveBalanceEntity] })
  findByUserIdDetailed(@Param('id') id: string) {
    return this.svc.findByUserIdDetailed(id);
  }

  @Get()
  @ApiOperation({ summary: 'Get all leave balance records' })
  @ApiResponse({ status: 200, type: [LeaveBalanceEntity] })
  findAll() {
    return this.svc.findAll();
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new leave balance record' })
  @ApiResponse({ status: 201, type: LeaveBalanceEntity })
  create(@Body() dto: CreateBalanceDto) {
    return this.svc.create(dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get one leave balance record by ID' })
  @ApiResponse({ status: 200, type: LeaveBalanceEntity })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.svc.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Adjust leave balance for a record' })
  @ApiResponse({ status: 200, type: LeaveBalanceEntity })
  adjust(@Param('id', ParseIntPipe) id: number, @Body() dto: AdjustBalanceDto) {
    return this.svc.adjust(id, dto);
  }
}
