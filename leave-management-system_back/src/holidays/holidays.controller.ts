import { Controller, Get, Query, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';

@ApiTags('holidays')
@Controller('holidays')
export class HolidaysController {
  @Get()
  @ApiOperation({ summary: 'Get holidays for a specific year' })
  @ApiResponse({ status: 200, description: 'Holidays retrieved successfully' })
  @ApiQuery({ name: 'year', required: false, type: Number })
  getHolidays(
    @Query('year', new ParseIntPipe({ optional: true })) year?: number,
  ) {
    // Return mock holidays for now
    // TODO: Replace with actual service call when HolidaysService is implemented
    const mockHolidays = [
      {
        id: '1',
        name: "New Year's Day",
        date: '2025-01-01',
        type: 'national',
      },
      {
        id: '2',
        name: 'Independence Day',
        date: '2025-07-04',
        type: 'national',
      },
      {
        id: '3',
        name: 'Christmas Day',
        date: '2025-12-25',
        type: 'national',
      },
      {
        id: '4',
        name: 'Labor Day',
        date: '2025-09-01',
        type: 'national',
      },
      {
        id: '5',
        name: 'Thanksgiving',
        date: '2025-11-27',
        type: 'national',
      },
    ];

    // ✅ No manual wrapping - interceptor handles it
    return mockHolidays;
  }
}
