import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LeaveRequestsController } from './leave-requests.controller';
import { LeaveRequestsService } from './leave-requests.service';
import { LeaveRequest } from './entities/leave-request.entity';
import { User } from '../users/entities/users.entity';
import { NotificationsModule } from '../notifications/notifications.module';
import { EmailNotificationService } from 'src/notifications/email-notification.service';
import { LeaveTypeEntity } from 'src/leave-types/entities/leave-type.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([LeaveRequest, User, LeaveTypeEntity]),
    NotificationsModule,
  ],
  controllers: [LeaveRequestsController],
  providers: [LeaveRequestsService, EmailNotificationService],
  exports: [LeaveRequestsService],
})
export class LeaveRequestsModule {}
