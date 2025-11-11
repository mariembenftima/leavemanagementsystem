import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  ParseIntPipe,
} from '@nestjs/common';

import { LeaveTypesService } from './leave-types.service';
import { CreateLeaveTypeDto } from './types/dtos/create-leave-type.dto';
import { UpdateLeaveTypeDto } from './types/dtos/update-leave-type.dto';

@Controller('leave-types')
export class LeaveTypesController {
  constructor(private readonly service: LeaveTypesService) {}

  @Post()
  async create(@Body() dto: CreateLeaveTypeDto) {
    return await this.service.create(dto);
  }

  @Get()
  async findAll() {
    const leaveTypes = await this.service.findAll();
    return {
      success: true,
      data: leaveTypes,
      message: 'Leave types retrieved successfully',
    };
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return await this.service.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateLeaveTypeDto,
  ) {
    return await this.service.update(id, dto);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.service.remove(id);
    return { deleted: true };
  }
}
