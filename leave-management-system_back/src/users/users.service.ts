import { ConflictException, Injectable } from '@nestjs/common';
import { CreateUsersDto } from './types/dtos/create-users.dto';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/users.entity';
import * as bcrypt from 'bcrypt';
interface GetAllUsersOptions {
  page: number;
  limit: number;
  search?: string;
  role?: string;
  hasProfile?: boolean;
}
@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async findByUsername(username: string) {
    return this.usersRepository.findOneBy({ username });
  }

  async findByEmail(email: string) {
    return this.usersRepository.findOneBy({ email });
  }

  async getUser() {
    return this.usersRepository.find();
  }

  async getUserById(id: string) {
    const fetchedUser = await this.usersRepository.findOneBy({ id });
    if (!fetchedUser) {
      throw new Error(`User with id ${id} not found`);
    }
    return fetchedUser;
  }

  async createUser(createUserDto: CreateUsersDto) {
    const existingUser = await this.usersRepository.findOne({
      where: [
        { email: createUserDto.email },
        { username: createUserDto.username },
      ],
    });

    if (existingUser) {
      throw new ConflictException(
        'User with this email or username already exists',
      );
    }

    if (createUserDto.password) {
      createUserDto.password = await bcrypt.hash(createUserDto.password, 10);
    }

    const newUser = this.usersRepository.create({
      ...createUserDto,
      roles: createUserDto.roles || ['EMPLOYEE'],
      isActive: true,
    });
    return this.usersRepository.save(newUser);
  }

  async updateUser(id: string, updateUserDto: Partial<CreateUsersDto>) {
    const user = await this.getUserById(id);

    // Handle password hashing separately (needs transformation)
    if (updateUserDto.password) {
      user.password = await bcrypt.hash(updateUserDto.password, 10);
      delete updateUserDto.password; // Don't assign plain password again
    }

    // Handle date conversion separately
    if (updateUserDto.dateOfBirth) {
      user.dateOfBirth = new Date(updateUserDto.dateOfBirth);
      delete updateUserDto.dateOfBirth; // Already handled
    }

    // Merge all other fields automatically
    Object.assign(user, updateUserDto);

    return this.usersRepository.save(user);
  }

  async deleteUser(id: string) {
    const user = await this.getUserById(id);
    return this.usersRepository.delete(user.id);
  }

  async getAllUsers(options: GetAllUsersOptions) {
    const { page = 1, limit = 10, search, role, hasProfile } = options;
    const skip = (page - 1) * limit;

    const queryBuilder = this.usersRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.team', 'team')
      .leftJoin('employee_profiles', 'profile', 'profile.user_id = user.id')
      .addSelect(
        'CASE WHEN profile.id IS NOT NULL THEN true ELSE false END',
        'hasProfile',
      );

    if (search) {
      queryBuilder.andWhere(
        '(user.fullname ILIKE :search OR user.email ILIKE :search OR user.username ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (role) {
      queryBuilder.andWhere(':role = ANY(user.roles)', { role });
    }

    if (hasProfile !== undefined) {
      if (hasProfile) {
        queryBuilder.andWhere('profile.id IS NOT NULL');
      } else {
        queryBuilder.andWhere('profile.id IS NULL');
      }
    }

    queryBuilder.orderBy('user.createdAt', 'DESC').skip(skip).take(limit);

    const [users, total] = await queryBuilder.getManyAndCount();
    const usersWithProfile = await Promise.all(
      users.map(async (user) => {
        const profileExists = await this.usersRepository
          .createQueryBuilder('user')
          .leftJoin('employee_profiles', 'profile', 'profile.user_id = user.id')
          .where('user.id = :userId', { userId: user.id })
          .select('profile.id')
          .getRawOne<{ profile_id: number | null }>();

        return {
          ...user,
          hasProfile: !!profileExists?.profile_id,
        };
      }),
    );

    return {
      data: usersWithProfile,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getUserStats() {
    const total = await this.usersRepository.count();
    const active = await this.usersRepository.count({
      where: { isActive: true },
    });
    const inactive = await this.usersRepository.count({
      where: { isActive: false },
    });

    const usersWithProfiles = await this.usersRepository
      .createQueryBuilder('user')
      .leftJoin('employee_profiles', 'profile', 'profile.user_id = user.id')
      .where('profile.id IS NOT NULL')
      .getCount();

    const usersWithoutProfiles = total - usersWithProfiles;

    const allUsers = await this.usersRepository.find();
    const roleDistribution = allUsers.reduce(
      (acc, user) => {
        user.roles?.forEach((role) => {
          acc[role] = (acc[role] || 0) + 1;
        });
        return acc;
      },
      {} as Record<string, number>,
    );

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentRegistrations = await this.usersRepository
      .createQueryBuilder('user')
      .where('user.createdAt >= :date', { date: thirtyDaysAgo })
      .getCount();

    return {
      total,
      active,
      inactive,
      withProfiles: usersWithProfiles,
      withoutProfiles: usersWithoutProfiles,
      roleDistribution,
      recentRegistrations,
    };
  }

  async updateUserRoles(id: string, roles: string[]): Promise<User> {
    const user = await this.getUserById(id);
    user.roles = roles;
    return this.usersRepository.save(user);
  }

  async updateUserStatus(id: string, isActive: boolean): Promise<User> {
    const user = await this.getUserById(id);
    user.isActive = isActive;
    return this.usersRepository.save(user);
  }
}
