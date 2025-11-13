import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TeamEntity } from './entities/team.entity';
import { CreateTeamDto } from './types/dtos/create-team.dto';
import { UpdateTeamDto } from './types/dtos/update-team.dto';

@Injectable()
export class TeamsService {
  constructor(
    @InjectRepository(TeamEntity)
    private repo: Repository<TeamEntity>,
  ) {}

  async create(dto: CreateTeamDto) {
    const team = this.repo.create(dto);
    return await this.repo.save(team);
  }

  async findAll() {
    return await this.repo.find({ relations: ['members'] });
  }

  async findOne(id: number) {
    const team = await this.repo.findOne({
      where: { id },
      relations: ['members'],
    });
    if (!team) throw new NotFoundException(`Team #${id} not found`);
    return team;
  }

  async update(id: number, dto: UpdateTeamDto) {
    const team = await this.findOne(id);
    Object.assign(team, dto);
    return await this.repo.save(team);
  }

  async remove(id: number) {
    const result = await this.repo.delete(id);
    if (result.affected === 0)
      throw new NotFoundException(`Team #${id} not found`);
  }
}
