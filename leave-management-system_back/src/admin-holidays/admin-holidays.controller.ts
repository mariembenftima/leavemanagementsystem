import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';

import { CreateHolidayDto } from './dtos/create-holiday.dto';
import { UpdateHolidayDto } from './dtos/update-holiday.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../users/roleguard';
import { Roles } from '../users/roledecorator';
import { UserRole } from '../users/types/enums/user-role.enum';
import { AdminHolidaysService } from './admin-holidays.service';

@ApiTags('holidays')
@Controller('holidays')
export class AdminHolidaysController {
  constructor(private readonly holidaysService: AdminHolidaysService) {}

  @Get()
  @ApiOperation({ summary: 'Get all holidays' })
  @ApiResponse({ status: 200, description: 'Holidays retrieved successfully' })
  async findAll(@Query('year') year?: string) {
    if (year) {
      return this.holidaysService.findByYear(parseInt(year, 10));
    }
    return this.holidaysService.findAll();
  }

  @Get('upcoming')
  @ApiOperation({ summary: 'Get upcoming holidays' })
  @ApiResponse({ status: 200, description: 'Upcoming holidays retrieved' })
  async findUpcoming(@Query('limit') limit?: string) {
    const limitNum = limit ? parseInt(limit, 10) : 10;
    return this.holidaysService.findUpcoming(limitNum);
  }

  @Get('statistics')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get holiday statistics (Admin/HR only)' })
  @ApiResponse({ status: 200, description: 'Statistics retrieved' })
  async getStatistics() {
    return this.holidaysService.getHolidayStatistics();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a holiday by ID' })
  @ApiResponse({ status: 200, description: 'Holiday retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Holiday not found' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.holidaysService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new holiday (Admin/HR only)' })
  @ApiResponse({ status: 201, description: 'Holiday created successfully' })
  async create(@Body() createHolidayDto: CreateHolidayDto) {
    return this.holidaysService.create(createHolidayDto);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update a holiday (Admin/HR only)' })
  @ApiResponse({ status: 200, description: 'Holiday updated successfully' })
  @ApiResponse({ status: 404, description: 'Holiday not found' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateHolidayDto: UpdateHolidayDto,
  ) {
    return this.holidaysService.update(id, updateHolidayDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a holiday (Admin/HR only)' })
  @ApiResponse({ status: 204, description: 'Holiday deleted successfully' })
  @ApiResponse({ status: 404, description: 'Holiday not found' })
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.holidaysService.remove(id);
  }
}
