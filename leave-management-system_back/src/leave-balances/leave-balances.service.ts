import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LeaveBalanceEntity } from './entities/leave-balance.entity';
import { LeaveTypeEntity } from '../leave-types/entities/leave-type.entity';
import { User } from 'src/users/entities/users.entity';
import { CreateBalanceDto } from './types/dtos/create-balance.dto';
import { AdjustBalanceDto } from './types/dtos/adjust-balance.dto';

@Injectable()
export class LeaveBalancesService {
  constructor(
    @InjectRepository(LeaveBalanceEntity)
    private readonly repo: Repository<LeaveBalanceEntity>,
    @InjectRepository(User)
    private readonly usersRepo: Repository<User>,
    @InjectRepository(LeaveTypeEntity)
    private readonly ltRepo: Repository<LeaveTypeEntity>,
  ) {}

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

  async findAll() {
    return await this.repo.find({ relations: ['user', 'leaveType'] });
  }

  async findByUserId(userId: string) {
    const balances = await this.repo.find({
      where: { user: { id: String(userId) } },
      relations: ['leaveType'],
    });

    if (!balances.length) {
      return {
        annual: { total: 24, used: 0, remaining: 24 },
        sick: { total: 10, used: 0, remaining: 10 },
        personal: { total: 5, used: 0, remaining: 5 },
      };
    }

    const summary: Record<
      string,
      {
        total: number;
        used: number;
        remaining: number;
      }
    > = {};

    for (const bal of balances) {
      const total = (bal.leaveType?.maxDays || 24) + (bal.carryover || 0);
      const used = bal.used;
      const remaining = total - used;

      const typeName = bal.leaveType?.name?.toLowerCase() || 'unknown';

      summary[typeName] = { total, used, remaining };
    }

    return summary;
  }

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

  async findOne(id: number) {
    const lb = await this.repo.findOne({
      where: { id },
      relations: ['user', 'leaveType'],
    });
    if (!lb) throw new NotFoundException(`Leave balance ${id} not found`);
    return lb;
  }
  async adjust(id: number, dto: AdjustBalanceDto) {
    const lb = await this.repo.findOne({ where: { id } });
    if (!lb) throw new NotFoundException(`Leave balance ${id} not found`);
    Object.assign(lb, dto);

    return await this.repo.save(lb);
  }
}
