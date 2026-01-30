import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Holiday } from './entities/holiday.entity';
import { AdminHolidaysController } from './admin-holidays.controller';
import { AdminHolidaysService } from './admin-holidays.service';

@Module({
  imports: [TypeOrmModule.forFeature([Holiday])],
  controllers: [AdminHolidaysController],
  providers: [AdminHolidaysService],
  exports: [AdminHolidaysService],
})
export class AdminHolidaysModule {}
