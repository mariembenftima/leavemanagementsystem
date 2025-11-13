import { AdjustBalanceDto } from '../dtos/adjust-balance.dto';
import { CreateBalanceDto } from '../dtos/create-balance.dto';

export abstract class LeaveBalancesPort {
  abstract create(dto: CreateBalanceDto);
  abstract findAll();
  abstract findOne(id: number);
  abstract adjust(id: number, dto: AdjustBalanceDto);
}
