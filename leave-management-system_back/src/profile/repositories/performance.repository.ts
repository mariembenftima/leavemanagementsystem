import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Performance } from '../entities/performance.entity';
import { EmployeeProfile } from '../entities/employee-profile.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class PerformanceRepository extends Repository<Performance> {
  constructor(
    @InjectRepository(Performance)
    private readonly performanceRepo: Repository<Performance>,
    private dataSource: DataSource,
  ) {
    super(Performance, dataSource.createEntityManager());
  }

  async getLatestPerformance(userId: string): Promise<Performance | null> {
    return this.performanceRepo
      .createQueryBuilder('performance')
      .leftJoinAndSelect('performance.profile', 'profile')
      .leftJoinAndSelect('profile.user', 'user')
      .where('user.id = :userId', { userId })
      .orderBy('performance.createdAt', 'DESC')
      .getOne();
  }

  async createPerformance(data: {
    userId: string;
    performanceScore: number;
    reviewerId: number;
    reviewDate: Date;
    goals?: string;
    achievements?: string;
    feedback?: string;
  }): Promise<Performance> {
    const profile = await this.dataSource
      .getRepository(EmployeeProfile)
      .createQueryBuilder('profile')
      .leftJoinAndSelect('profile.user', 'user')
      .where('user.id = :userId', { userId: data.userId })
      .getOne();

    if (!profile) {
      throw new Error(`Profile not found for user ${data.userId}`);
    }

    const performance = this.performanceRepo.create({
      profile: { id: profile.id },
      rating: data.performanceScore,
      reviewer: { id: String(data.reviewerId) },
      goals: data.goals,
      achievements: data.achievements,
      feedback: data.feedback,
      reviewPeriod: new Date().getFullYear().toString(),
    });

    return this.performanceRepo.save(performance);
  }
}
