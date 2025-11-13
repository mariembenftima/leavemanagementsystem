import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';

@ApiTags('calendar')
@Controller('calendar')
export class CalendarController {
  @Get('events')
  @ApiOperation({ summary: 'Get calendar events for a specific month/year' })
  @ApiResponse({
    status: 200,
    description: 'Calendar events retrieved successfully',
  })
  @ApiQuery({ name: 'month', required: false, type: Number })
  @ApiQuery({ name: 'year', required: false, type: Number })
  async getCalendarEvents(
    @Query('month') month?: number,
    @Query('year') year?: number,
  ) {
    // Return mock calendar events for now
    const mockEvents = [
      {
        id: '1',
        title: 'Sarah Johnson - Annual Leave',
        type: 'annual',
        startDate: '2025-09-15',
        endDate: '2025-09-17',
        employeeName: 'Sarah Johnson',
        status: 'approved',
      },
      {
        id: '2',
        title: 'David Wilson - Sick Leave',
        type: 'sick',
        startDate: '2025-09-20',
        endDate: '2025-09-20',
        employeeName: 'David Wilson',
        status: 'approved',
      },
      {
        id: '3',
        title: 'Emily Davis - Personal Leave',
        type: 'personal',
        startDate: '2025-09-25',
        endDate: '2025-09-26',
        employeeName: 'Emily Davis',
        status: 'pending',
      },
    ];

    return {
      success: true,
      data: mockEvents,
      message: 'Calendar events retrieved successfully',
    };
  }
}
