import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LeaveBalancesService } from './leave-balances.service';
import { LeaveBalancesController } from './leave-balances.controller';
import { LeaveBalanceEntity } from './entities/leave-balance.entity';
import { User } from '../users/entities/users.entity';
import { LeaveTypeEntity } from '../leave-types/entities/leave-type.entity';
import { LEAVE_BALANCES_PORT } from './types/tokens';

@Module({
  imports: [
    TypeOrmModule.forFeature([LeaveBalanceEntity, User, LeaveTypeEntity]),
  ],
  providers: [
    { provide: LEAVE_BALANCES_PORT, useClass: LeaveBalancesService },
    LeaveBalancesService,
  ],
  controllers: [LeaveBalancesController],
  exports: [
    { provide: LEAVE_BALANCES_PORT, useClass: LeaveBalancesService },
    LeaveBalancesService,
  ],
})
export class LeaveBalancesModule {}
