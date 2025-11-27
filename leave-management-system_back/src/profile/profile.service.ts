import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EmployeeProfile } from './entities/employee-profile.entity';
import { Performance } from './entities/performance.entity';
import { Activity } from './entities/activity.entity';
import { User } from '../users/entities/users.entity';
import { CreateProfileDto } from './types/dtos/create-profile.dto';
import { UpdateProfileDto } from './types/dtos/update-profile.dto';
import { PerformanceUpdateDto } from './types/dtos/performance-update.dto';
import { UserRole } from '../users/types/enums/user-role.enum';
import { ActivityType } from './types/enums/activity-type.enum';
import { ActivityDao } from './types/daos/activity.dao';

@Injectable()
export class ProfileService {
  constructor(
    @InjectRepository(EmployeeProfile)
    private profileRepository: Repository<EmployeeProfile>,

    @InjectRepository(Performance)
    private performanceRepository: Repository<Performance>,

    @InjectRepository(Activity)
    private activityRepository: Repository<Activity>,

    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  /**
   * Create a new employee profile
   * Replaces: ProfileRepository.createProfile() + ActivityRepository.createActivity()
   */
  async createProfile(
    userId: string,
    createProfileDto: CreateProfileDto,
    createdBy: User,
  ) {
    // Authorization check
    if (!createdBy.roles?.includes(UserRole.HR)) {
      throw new ForbiddenException('Only HR can create employee profiles');
    }

    // ✅ Direct TypeORM query - replaces ProfileRepository.findByEmployeeId()
    const existingProfile = await this.profileRepository.findOne({
      where: { employeeId: createProfileDto.employeeId },
      relations: ['user'],
    });

    if (existingProfile) {
      throw new ForbiddenException('Employee ID already exists');
    }

    // ✅ Direct TypeORM create + save - replaces ProfileRepository.createProfile()
    const profile = this.profileRepository.create({
      user: { id: userId },
      ...createProfileDto,
      joinDate: new Date(createProfileDto.joinDate),
      dateOfBirth: createProfileDto.dateOfBirth
        ? new Date(createProfileDto.dateOfBirth)
        : undefined,
    });

    const savedProfile = await this.profileRepository.save(profile);

    // ✅ Direct activity creation - replaces ActivityRepository.createActivity()
    const activity = this.activityRepository.create({
      profile: { id: savedProfile.id },
      activityType: ActivityType.PROMOTION,
      description: `Joined as ${createProfileDto.designation} in ${createProfileDto.department} department`,
      activityDate: new Date(),
    });

    await this.activityRepository.save(activity);

    return savedProfile;
  }

  /**
   * Get profile by user ID
   * Replaces: ProfileRepository.findByUserId()
   */
  async getProfile(userId: string, requestingUser: User) {
    // ✅ Direct TypeORM query
    const profile = await this.profileRepository.findOne({
      where: { user: { id: userId } },
      relations: ['user', 'activities', 'performances'],
    });

    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    if (!this.canAccessProfile(userId, requestingUser)) {
      throw new ForbiddenException('Access denied');
    }

    return profile;
  }

  /**
   * Get full profile with performance and activities
   * Replaces: ProfileRepository.findByUserId() + PerformanceRepository.getLatestPerformance() + ActivityRepository.getRecentActivities()
   */
  async getFullProfile(userId: string, requestingUser: User) {
    const profile = await this.getProfile(userId, requestingUser);

    // ✅ Parallel queries for better performance
    const [performance, activityEntities, leaveBalance] = await Promise.all([
      // ✅ Direct TypeORM QueryBuilder - replaces PerformanceRepository.getLatestPerformance()
      this.performanceRepository
        .createQueryBuilder('performance')
        .leftJoinAndSelect('performance.profile', 'profile')
        .leftJoinAndSelect('profile.user', 'user')
        .where('user.id = :userId', { userId })
        .orderBy('performance.createdAt', 'DESC')
        .getOne(),

      // ✅ Direct TypeORM find - replaces ActivityRepository.getRecentActivities()
      this.activityRepository.find({
        where: { profile: { id: profile.id } },
        order: { createdAt: 'DESC' },
        take: 5,
        relations: ['profile'],
      }),

      this.getLeaveBalanceOverview(userId),
    ]);

    const recentActivities = activityEntities.map((activity) => {
      return new ActivityDao({
        id: activity.id,
        userId: profile.user?.id || userId,
        type: activity.activityType as unknown as ActivityType,
        description: activity.description || '',
        createdAt: activity.activityDate || activity.createdAt,
        displayDate: this.formatDate(
          activity.activityDate || activity.createdAt,
        ),
      });
    });

    return {
      profile,
      performance,
      recentActivities: recentActivities.map((activity) =>
        activity.toSummary(),
      ),
      leaveBalance,
    };
  }

  /**
   * Update profile
   * Replaces: ProfileRepository.updateProfile()
   */
  async updateProfile(
    userId: string,
    updateData: UpdateProfileDto,
    updatedBy: User,
  ) {
    // Authorization check
    if (
      updatedBy.roles?.includes(UserRole.EMPLOYEE) &&
      String(updatedBy.id) !== String(userId)
    ) {
      throw new ForbiddenException('You can only update your own profile');
    }

    // ✅ Direct TypeORM findOne
    const profile = await this.profileRepository.findOne({
      where: { user: { id: userId } },
    });

    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    // ✅ Handle date conversions separately
    if (updateData.joinDate) {
      profile.joinDate = new Date(updateData.joinDate);
      delete updateData.joinDate; // Already handled
    }
    if (updateData.dateOfBirth) {
      profile.dateOfBirth = new Date(updateData.dateOfBirth);
      delete updateData.dateOfBirth; // Already handled
    }

    // ✅ Use Object.assign for clean update
    Object.assign(profile, updateData);
    const savedProfile = await this.profileRepository.save(profile);

    // ✅ Track update activity
    const activity = this.activityRepository.create({
      profile: { id: profile.id },
      activityType: ActivityType.TRAINING,
      description: 'Employee profile information was updated',
      activityDate: new Date(),
    });

    await this.activityRepository.save(activity);

    return savedProfile;
  }

  /**
   * Update performance review
   * Replaces: PerformanceRepository.createPerformance()
   */
  async updatePerformance(
    userId: string,
    performanceDto: PerformanceUpdateDto,
    reviewerId: number,
  ) {
    // ✅ Find profile first
    const profile = await this.profileRepository
      .createQueryBuilder('profile')
      .leftJoinAndSelect('profile.user', 'user')
      .where('user.id = :userId', { userId })
      .getOne();

    if (!profile) {
      throw new NotFoundException(`Profile not found for user ${userId}`);
    }
    const performance = this.performanceRepository.create({
      profile: { id: profile.id },
      rating: performanceDto.performanceScore,
      reviewer: { id: String(reviewerId) },
      reviewPeriod: new Date().getFullYear().toString(),
    });

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
  async getDashboardData(userId: string) {
    // ✅ Direct TypeORM query
    const profile = await this.profileRepository.findOne({
      where: { user: { id: userId } },
      relations: ['user'],
    });

    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    // ✅ Direct activity fetch
    const rawActivities = await this.activityRepository.find({
      where: { profile: { id: profile.id } },
      order: { createdAt: 'DESC' },
      take: 5,
      relations: ['profile'],
    });

    const activityDaos = rawActivities.map((activity) => {
      return new ActivityDao({
        id: activity.id,
        userId: profile.user?.id || userId,
        type: activity.activityType as unknown as ActivityType,
        description: activity.description || '',
        createdAt: activity.activityDate || activity.createdAt,
      });
    });

    return {
      profile: {
        name: profile.fullname,
        employeeId: profile.employeeId,
        department: profile.department,
        designation: profile.designation,
        joinDate: profile.joinDate,
      },
      recentActivities: activityDaos.map((activity) => activity.toSummary()),
      leaveBalance: await this.getLeaveBalanceOverview(userId),
    };
  }

  /**
   * Find profile by employee ID
   * Replaces: ProfileRepository.findByEmployeeId()
   */
  async findByEmployeeId(employeeId: string): Promise<EmployeeProfile | null> {
    return this.profileRepository.findOne({
      where: { employeeId },
      relations: ['user'],
    });
  }

  /**
   * Get all profiles
   * Replaces: ProfileRepository.findAllProfiles()
   */
  async getAllProfiles(): Promise<EmployeeProfile[]> {
    return this.profileRepository.find({
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Find profiles by department
   * Replaces: ProfileRepository.findByDepartment()
   */
  async findByDepartment(department: string): Promise<EmployeeProfile[]> {
    return this.profileRepository.find({
      where: { department },
      relations: ['user'],
      order: { joinDate: 'ASC' },
    });
  }

  // ========================================
  // PRIVATE HELPER METHODS
  // ========================================

  private canAccessProfile(userId: string, requestingUser: User): boolean {
    // Users can access their own profiles
    if (String(requestingUser.id) === String(userId)) {
      return true;
    }

    // HR, Managers, and Admins can access any profile
    if (
      requestingUser.roles?.includes(UserRole.HR) ||
      requestingUser.roles?.includes(UserRole.MANAGER) ||
      requestingUser.roles?.includes(UserRole.ADMIN)
    ) {
      return true;
    }

    return false;
  }

  private formatDate(date: Date): string {
    if (!date) return '';

    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  private getUsedLeaves(userId: string, leaveType: string): Promise<number> {
    const currentYear = new Date().getFullYear();

    console.log(
      `Calculating used ${leaveType} leave for user ${userId} in year ${currentYear}`,
    );

    // TODO: Implement actual leave calculation
    // For example:
    // return this.leaveRequestRepository.count({
    //   where: {
    //     user: { id: userId },
    //     leaveType: { name: leaveType },
    //     status: 'APPROVED',
    //     startDate: Between(
    //       new Date(currentYear, 0, 1),
    //       new Date(currentYear, 11, 31)
    //     )
    //   }
    // });

    // Placeholder return
    return Promise.resolve(0);
  }

  async getLeaveBalanceOverview(userId: string) {
    // ✅ Direct TypeORM query
    const profile = await this.profileRepository.findOne({
      where: { user: { id: userId } },
    });

    if (!profile) return null;

    return {
      annual: {
        total: 25,
        used: await this.getUsedLeaves(userId, 'annual'),
        remaining: 25 - (await this.getUsedLeaves(userId, 'annual')),
      },
      sick: {
        total: 12,
        used: await this.getUsedLeaves(userId, 'sick'),
        remaining: 12 - (await this.getUsedLeaves(userId, 'sick')),
      },
      personal: {
        total: 5,
        used: await this.getUsedLeaves(userId, 'personal'),
        remaining: 5 - (await this.getUsedLeaves(userId, 'personal')),
      },
    };
  }
}
