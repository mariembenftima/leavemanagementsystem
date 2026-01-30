import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EmployeeProfile } from './entities/employee-profile.entity';
import { Performance } from './entities/performance.entity';
import { Activity } from './entities/activity.entity';
import { User } from '../users/entities/users.entity';
import { LeaveRequest } from '../leave-requests/entities/leave-request.entity';
import { CreateProfileDto } from './types/dtos/create-profile.dto';
import { UpdateProfileDto } from './types/dtos/update-profile.dto';
import { PerformanceUpdateDto } from './types/dtos/performance-update.dto';
import { UserRole } from '../users/types/enums/user-role.enum';
import { ActivityType } from './types/enums/activity-type.enum';

@Injectable()
export class ProfileService {
  private readonly logger = new Logger(ProfileService.name);

  constructor(
    @InjectRepository(EmployeeProfile)
    private profileRepository: Repository<EmployeeProfile>,

    @InjectRepository(Performance)
    private performanceRepository: Repository<Performance>,

    @InjectRepository(Activity)
    private activityRepository: Repository<Activity>,

    @InjectRepository(User)
    private userRepository: Repository<User>,

    @InjectRepository(LeaveRequest)
    private leaveRequestRepository: Repository<LeaveRequest>,
  ) {}

  async createProfile(
    userId: string,
    createProfileDto: CreateProfileDto,
    createdBy: User,
  ) {
    if (
      !createdBy.roles?.includes(UserRole.MANAGER) &&
      !createdBy.roles?.includes(UserRole.ADMIN)
    ) {
      throw new ForbiddenException('Only HR can create employee profiles');
    }

    const existingProfile = await this.profileRepository.findOne({
      where: { employeeId: createProfileDto.employeeId },
      relations: ['user'],
    });

    if (existingProfile) {
      throw new ForbiddenException('Employee ID already exists');
    }

    const profile = this.profileRepository.create({
      user: { id: userId },
      ...createProfileDto,
      joinDate: new Date(createProfileDto.joinDate),
      dateOfBirth: createProfileDto.dateOfBirth
        ? new Date(createProfileDto.dateOfBirth)
        : undefined,
    });

    const savedProfile = await this.profileRepository.save(profile);

    const activity = this.activityRepository.create({
      profile: { id: savedProfile.id },
      activityType: ActivityType.PROMOTION,
      description: `Joined as ${createProfileDto.designation} in ${createProfileDto.department} department`,
      activityDate: new Date(),
    });

    await this.activityRepository.save(activity);

    return savedProfile;
  }

  async getProfile(userId: string, requestingUser: User) {
    this.validateAccess(userId, requestingUser);

    const profile = await this.profileRepository.findOne({
      where: { user: { id: userId } },
      relations: ['user', 'activities', 'performances'],
    });

    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    return profile;
  }

  async getFullProfile(userId: string, requestingUser: User) {
    this.validateAccess(userId, requestingUser);

    const [profile, performance, activities, leaveBalance] = await Promise.all([
      this.profileRepository.findOne({
        where: { user: { id: userId } },
        relations: ['user'],
      }),
      this.getLatestPerformance(userId),
      this.getRecentActivities(userId, 5),
      this.getLeaveBalanceOverview(userId),
    ]);

    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    return {
      profile,
      performance,
      recentActivities: activities.map((activity) => ({
        id: activity.id,
        type: activity.activityType,
        description: activity.description,
        date: activity.activityDate || activity.createdAt,
        createdAt: activity.createdAt,
      })),
      leaveBalance,
    };
  }

  async getDashboardData(userId: string) {
    const profile = await this.profileRepository.findOne({
      where: { user: { id: userId } },
      relations: ['user'],
    });

    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    const [activities, leaveBalance] = await Promise.all([
      this.getRecentActivities(userId, 5),
      this.getLeaveBalanceOverview(userId),
    ]);

    return {
      profile: {
        name: profile.fullname,
        employeeId: profile.employeeId,
        department: profile.department,
        designation: profile.designation,
        joinDate: profile.joinDate,
      },
      recentActivities: activities.map((activity) => ({
        id: activity.id,
        type: activity.activityType,
        description: activity.description,
        date: activity.activityDate || activity.createdAt,
      })),
      leaveBalance,
    };
  }

  async updateProfile(
    userId: string,
    updateData: UpdateProfileDto,
    updatedBy: User,
  ) {
    if (
      updatedBy.roles?.includes(UserRole.EMPLOYEE) &&
      String(updatedBy.id) !== String(userId)
    ) {
      throw new ForbiddenException('You can only update your own profile');
    }

    const profile = await this.profileRepository.findOne({
      where: { user: { id: userId } },
    });

    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    if (updateData.joinDate) {
      profile.joinDate = new Date(updateData.joinDate);
      delete updateData.joinDate;
    }
    if (updateData.dateOfBirth) {
      profile.dateOfBirth = new Date(updateData.dateOfBirth);
      delete updateData.dateOfBirth;
    }

    Object.assign(profile, updateData);
    const savedProfile = await this.profileRepository.save(profile);

    const activity = this.activityRepository.create({
      profile: { id: profile.id },
      activityType: ActivityType.TRAINING,
      description: 'Employee profile information was updated',
      activityDate: new Date(),
    });

    await this.activityRepository.save(activity);

    return savedProfile;
  }

  async updatePerformance(
    userId: string,
    performanceDto: PerformanceUpdateDto,
    reviewerId: number,
  ) {
    const profile = await this.profileRepository
      .createQueryBuilder('profile')
      .leftJoinAndSelect('profile.user', 'user')
      .where('user.id = :userId', { userId })
      .getOne();

    if (!profile) {
      throw new NotFoundException(`Profile not found for user ${userId}`);
    }

    const performance = new Performance();
    performance.profile = profile;
    performance.rating = performanceDto.performanceScore;
    performance.reviewer = { id: String(reviewerId) } as User;
    performance.reviewPeriod = new Date().getFullYear().toString();

    if (performanceDto.comments) {
      performance.feedback = performanceDto.comments;
    }

    const savedPerformance = await this.performanceRepository.save(performance);

    const activity = this.activityRepository.create({
      profile: { id: profile.id },
      activityType: ActivityType.PERFORMANCE_REVIEW,
      description: `Completed performance review. Performance score: ${performanceDto.performanceScore}/5.0`,
      activityDate: new Date(),
    });

    await this.activityRepository.save(activity);

    return savedPerformance;
  }

  async findByEmployeeId(employeeId: string): Promise<EmployeeProfile | null> {
    return this.profileRepository.findOne({
      where: { employeeId },
      relations: ['user'],
    });
  }

  async getAllProfiles(): Promise<EmployeeProfile[]> {
    return this.profileRepository.find({
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
  }

  async findByDepartment(department: string): Promise<EmployeeProfile[]> {
    return this.profileRepository.find({
      where: { department },
      relations: ['user'],
      order: { joinDate: 'ASC' },
    });
  }

  private validateAccess(userId: string, requestingUser: User): void {
    const isOwnProfile = String(requestingUser.id) === String(userId);
    const isAdmin = requestingUser.roles?.includes(UserRole.ADMIN);
    const isHR = requestingUser.roles?.includes(UserRole.HR);
    const isManager = requestingUser.roles?.includes(UserRole.MANAGER);

    if (!isOwnProfile && !isAdmin && !isHR && !isManager) {
      throw new ForbiddenException('Access denied');
    }
  }

  private async getLatestPerformance(
    userId: string,
  ): Promise<Performance | null> {
    return this.performanceRepository
      .createQueryBuilder('performance')
      .leftJoinAndSelect('performance.profile', 'profile')
      .leftJoinAndSelect('profile.user', 'user')
      .where('user.id = :userId', { userId })
      .orderBy('performance.createdAt', 'DESC')
      .getOne();
  }

  private async getRecentActivities(
    userId: string,
    limit: number = 5,
  ): Promise<Activity[]> {
    return this.activityRepository.find({
      where: { profile: { user: { id: userId } } },
      order: { activityDate: 'DESC' },
      take: limit,
      relations: ['profile'],
    });
  }

  private async getUsedLeaves(
    userId: string,
    leaveType: string,
  ): Promise<number> {
    const currentYear = new Date().getFullYear();

    this.logger.debug(
      `Calculating used ${leaveType} leave for user ${userId} in year ${currentYear}`,
    );

    try {
      const result = await this.leaveRequestRepository
        .createQueryBuilder('lr')
        .leftJoin('lr.user', 'user')
        .leftJoin('lr.leaveType', 'lt')
        .select('COALESCE(SUM(lr.totalDays), 0)', 'totalDays')
        .where('user.id = :userId', { userId })
        .andWhere('LOWER(lt.name) = LOWER(:leaveType)', { leaveType })
        .andWhere('lr.status = :status', { status: 'APPROVED' })
        .andWhere('EXTRACT(YEAR FROM lr.startDate) = :year', {
          year: currentYear,
        })
        .getRawOne<{ totalDays: string }>();

      const usedDays = parseFloat(result?.totalDays ?? '0');
      this.logger.debug(
        `User ${userId} has used ${usedDays} ${leaveType} days in ${currentYear}`,
      );

      return usedDays;
    } catch (error) {
      this.logger.error(
        `Error calculating leave for user ${userId}: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      return 0;
    }
  }

  async getLeaveBalanceOverview(userId: string) {
    const profile = await this.profileRepository.findOne({
      where: { user: { id: userId } },
    });

    if (!profile) return null;
    const [annualUsed, sickUsed, personalUsed] = await Promise.all([
      this.getUsedLeaves(userId, 'annual'),
      this.getUsedLeaves(userId, 'sick'),
      this.getUsedLeaves(userId, 'personal'),
    ]);

    return {
      annual: {
        total: 25,
        used: annualUsed,
        remaining: 25 - annualUsed,
      },
      sick: {
        total: 12,
        used: sickUsed,
        remaining: 12 - sickUsed,
      },
      personal: {
        total: 5,
        used: personalUsed,
        remaining: 5 - personalUsed,
      },
    };
  }
}
