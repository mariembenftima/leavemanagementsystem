import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ProfileService } from './profile.service';
import { LeaveActivityService } from './leave-activity.service';

import { Performance } from './entities/performance.entity';
import { EmployeeProfile } from './entities/employee-profile.entity';
import { Activity } from './entities/activity.entity';
import { User } from '../users/entities/users.entity';

import { ProfileController } from './profile.controller';

import { LeaveBalancesModule } from '../leave-balances/leave-balances.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([EmployeeProfile, Performance, Activity, User]),
    LeaveBalancesModule,
  ],
  controllers: [ProfileController],
  providers: [ProfileService, LeaveActivityService],
  exports: [ProfileService, LeaveActivityService],
})
export class ProfileModule {}
