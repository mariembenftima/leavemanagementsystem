import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LeaveBalancesService } from './leave-balances.service';
import { LeaveBalancesController } from './leave-balances.controller';
import { LeaveBalanceEntity } from './entities/leave-balance.entity';
import { User } from '../users/entities/users.entity';
import { LeaveTypeEntity } from '../leave-types/entities/leave-type.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([LeaveBalanceEntity, User, LeaveTypeEntity]),
  ],
  providers: [LeaveBalancesService],
  controllers: [LeaveBalancesController],
  exports: [LeaveBalancesService],
})
export class LeaveBalancesModule {}
