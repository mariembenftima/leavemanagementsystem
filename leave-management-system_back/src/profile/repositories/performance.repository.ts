import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Performance } from '../entities/performance.entity';

@Injectable()
export class PerformanceRepository extends Repository<Performance> {
  constructor(private dataSource: DataSource) {
    super(Performance, dataSource.createEntityManager());
  }

  async getLatestPerformance(userId: string): Promise<Performance | null> {
    return this.createQueryBuilder('performance')
      .leftJoinAndSelect('performance.profile', 'profile')
      .where('profile.userId = :userId', { userId })
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
      .getRepository('EmployeeProfile')
      .createQueryBuilder('profile')
      .where('profile.userId = :userId', { userId: data.userId })
      .getOne();

    if (!profile) {
      throw new Error(`Profile not found for user ${data.userId}`);
    }

    const performance = this.create({
      profileId: profile.id,
      rating: data.performanceScore,
      reviewerId: String(data.reviewerId),
      goals: data.goals,
      achievements: data.achievements,
      feedback: data.feedback,
      reviewPeriod: new Date().getFullYear().toString(),
    });

    return this.save(performance);
  }
}
