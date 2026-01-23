import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { User } from 'src/users/entities/users.entity';
import { LeaveRequest } from 'src/leave-requests/entities/leave-request.entity';
import { Holiday } from 'src/holidays/entities/holiday.entity';
import { LeaveTypesService } from 'src/leave-types/leave-types.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      LeaveRequest,
      LeaveTypesService,
      Holiday,
      // ✅ Activity removed - add it later if you have it
    ]),
  ],
  controllers: [AdminController],
  providers: [AdminService],
  exports: [AdminService],
})
export class AdminModule {}
