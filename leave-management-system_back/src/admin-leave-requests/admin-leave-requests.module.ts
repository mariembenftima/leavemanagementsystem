import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminLeaveRequestsController } from './admin-leave-requests.controller';
import { AdminLeaveRequestsService } from './admin-leave-requests.service';
import { LeaveRequest } from 'src/leave-requests/entities/leave-request.entity';
import { NotificationsModule } from 'src/notifications/notifications.module';
import { LeaveBalancesModule } from 'src/leave-balances/leave-balances.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([LeaveRequest]),
    NotificationsModule,
    LeaveBalancesModule,
  ],
  controllers: [AdminLeaveRequestsController],
  providers: [AdminLeaveRequestsService],
  exports: [AdminLeaveRequestsService],
})
export class AdminLeaveRequestsModule {}
