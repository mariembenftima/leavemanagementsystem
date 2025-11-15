import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProfileService } from './profile.service';
import { ProfileController } from './profile.controller';
import { EmployeeProfile } from './entities/employee-profile.entity';
import { Activity } from './entities/activity.entity';
import { Performance } from './entities/performance.entity';
import { User } from '../users/entities/users.entity';
import { ProfileRepository } from './repositories/profile.repository';
import { ActivityRepository } from './repositories/activity.repository';
import { PerformanceRepository } from './repositories/performance.repository';
import { LeaveBalancesModule } from '../leave-balances/leave-balances.module';
import { LeaveActivityService } from './leave-activity.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([EmployeeProfile, Activity, Performance, User]),
    LeaveBalancesModule,
  ],
  providers: [
    ProfileService,
    ProfileRepository,
    ActivityRepository,
    PerformanceRepository,
  ],
  controllers: [ProfileController],
  exports: [ProfileService, LeaveActivityService],
})
export class ProfileModule {}
