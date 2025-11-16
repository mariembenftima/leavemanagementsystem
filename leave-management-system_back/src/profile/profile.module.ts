import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ProfileService } from './profile.service';
import { LeaveActivityService } from './leave-activity.service';

import { ProfileRepository } from './repositories/profile.repository';
import { PerformanceRepository } from './repositories/performance.repository';
import { ActivityRepository } from './repositories/activity.repository';

import { Performance } from './entities/performance.entity';
import { EmployeeProfile } from './entities/employee-profile.entity';
import { Activity } from './entities/activity.entity';

import { ProfileController } from './profile.controller';

import { LeaveBalancesModule } from '../leave-balances/leave-balances.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Performance, EmployeeProfile, Activity]),
    LeaveBalancesModule,
  ],
  controllers: [ProfileController],
  providers: [
    ProfileService,
    LeaveActivityService,
    ProfileRepository,
    PerformanceRepository,
    ActivityRepository,
  ],
  exports: [ProfileService, LeaveActivityService],
})
export class ProfileModule {}
