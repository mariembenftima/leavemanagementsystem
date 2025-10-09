import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LeaveBalanceEntity } from './entities/leave-balance.entity';

import { LeaveTypeEntity } from '../leave-types/entities/leave-type.entity';
import { LeaveBalancesPort } from './types/ports/leave-balances.port';
import { User } from 'src/users/entities/users.entity';
import { CreateBalanceDto } from './types/dtos/create-balance.dto';
import { AdjustBalanceDto } from './types/dtos/adjust-balance.dto';

@Injectable()
export class LeaveBalancesService implements LeaveBalancesPort {
  constructor(
    @InjectRepository(LeaveBalanceEntity)
    private readonly repo: Repository<LeaveBalanceEntity>,
    @InjectRepository(User)
    private readonly usersRepo: Repository<User>,
    @InjectRepository(LeaveTypeEntity)
    private readonly ltRepo: Repository<LeaveTypeEntity>,
  ) {}

  // ✅ Create a new leave balance
  async create(dto: CreateBalanceDto) {
    const user = await this.usersRepo.findOne({ where: { id: dto.userId } });
    if (!user) throw new NotFoundException(`User ${dto.userId} not found`);

    const lt = await this.ltRepo.findOne({ where: { id: dto.leaveTypeId } });
    if (!lt)
      throw new NotFoundException(`Leave type ${dto.leaveTypeId} not found`);

    const lb = this.repo.create({
      user,
      leaveType: lt,
      year: dto.year,
      carryover: dto.carryover,
      used: dto.used,
    });

    return await this.repo.save(lb);
  }

  // ✅ Get all leave balances
  async findAll() {
    return await this.repo.find({ relations: ['user', 'leaveType'] });
  }

  // ✅ Get a user's aggregated leave balance summary (used for /me)
  async findByUserId(userId: string) {
    const balances = await this.repo.find({
      where: { user: { id: String(userId) } },
      relations: ['leaveType'],
    });

    if (!balances.length) {
      // Return defaults if no records exist
      return {
        annual: { total: 24, used: 0, remaining: 24 },
        sick: { total: 10, used: 0, remaining: 10 },
        personal: { total: 5, used: 0, remaining: 5 },
      };
    }

    // Aggregate by leave type name
    const summary: Record<
      string,
      {
        total: number;
        used: number;
        remaining: number;
      }
    > = {};
    for (const bal of balances) {
      const total = (bal.leaveType?.maxDays || 0) + bal.carryover;
      summary[bal.leaveType.name.toLowerCase()] = {
        total,
        used: bal.used,
        remaining: total - bal.used,
      };
    }
    return summary;
  }

  // ✅ Get a user's detailed leave balance records (used for admin/reporting)
  async findByUserIdDetailed(userId: string) {
    const balances = await this.repo.find({
      where: { user: { id: String(userId) } },
      relations: ['user', 'leaveType'],
      order: { year: 'DESC' },
    });

    if (!balances.length) {
      throw new NotFoundException(`No leave balances found for user ${userId}`);
    }

    return balances;
  }

  // ✅ Get one record by ID
  async findOne(id: number) {
    const lb = await this.repo.findOne({
      where: { id },
      relations: ['user', 'leaveType'],
    });
    if (!lb) throw new NotFoundException(`Leave balance ${id} not found`);
    return lb;
  }

  // ✅ Adjust balance for a given record
  async adjust(id: number, dto: AdjustBalanceDto) {
    const lb = await this.repo.findOne({ where: { id } });
    if (!lb) throw new NotFoundException(`Leave balance ${id} not found`);

    lb.year = dto.year;
    lb.carryover = dto.carryover;
    lb.used = dto.used;
    return await this.repo.save(lb);
  }
}
