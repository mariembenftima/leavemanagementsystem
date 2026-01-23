import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LeaveTypeEntity } from './entities/leave-type.entity';
import { LeaveTypesService } from './leave-types.service';
import { LeaveTypesController } from './leave-types.controller';
import { LEAVE_TYPES_PORT } from './types/tokens';

@Module({
  imports: [TypeOrmModule.forFeature([LeaveTypeEntity])],
  providers: [
    { provide: LEAVE_TYPES_PORT, useClass: LeaveTypesService },
    LeaveTypesService,
  ],
  controllers: [LeaveTypesController],
  exports: [
    { provide: LEAVE_TYPES_PORT, useClass: LeaveTypesService },
    LeaveTypesService,
  ],
})
export class LeaveTypesModule {}
