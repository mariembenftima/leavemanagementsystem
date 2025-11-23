import { Injectable } from '@nestjs/common';
import { Repository, DataSource } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { EmployeeProfile } from '../entities/employee-profile.entity';
import { CreateProfileDto } from '../types/dtos/create-profile.dto';
import { UpdateProfileDto } from '../types/dtos/update-profile.dto';

@Injectable()
export class ProfileRepository extends Repository<EmployeeProfile> {
  constructor(
    @InjectRepository(EmployeeProfile)
    private readonly repository: Repository<EmployeeProfile>,
    private dataSource: DataSource,
  ) {
    super(EmployeeProfile, dataSource.createEntityManager());
  }

  async findByUserId(userId: string): Promise<EmployeeProfile | null> {
    return this.repository.findOne({
      where: { user: { id: userId } },
      relations: ['user', 'activities', 'performances'],
    });
  }

  async findByEmployeeId(employeeId: string): Promise<EmployeeProfile | null> {
    return this.repository.findOne({
      where: { employeeId },
      relations: ['user'],
    });
  }

  async findAllProfiles(): Promise<EmployeeProfile[]> {
    return this.repository.find({
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
  }

  async createProfile(
    userId: string,
    profileData: CreateProfileDto,
  ): Promise<EmployeeProfile> {
    const profile = this.repository.create({
      user: { id: userId },
      ...profileData,
      joinDate: new Date(profileData.joinDate),
      dateOfBirth: profileData.dateOfBirth
        ? new Date(profileData.dateOfBirth)
        : undefined,
    });

    return this.repository.save(profile);
  }

  async updateProfile(
    userId: string,
    updateData: UpdateProfileDto,
  ): Promise<EmployeeProfile> {
    const profile = await this.findByUserId(userId);

    if (!profile) {
      throw new Error('Profile not found');
    }

    if (updateData.joinDate) {
      profile.joinDate = new Date(updateData.joinDate);
    }

    if (updateData.dateOfBirth) {
      profile.dateOfBirth = new Date(updateData.dateOfBirth);
    }

    Object.assign(profile, updateData);

    return this.repository.save(profile);
  }

  async findByDepartment(department: string): Promise<EmployeeProfile[]> {
    return this.repository.find({
      where: { department },
      relations: ['user'],
      order: { joinDate: 'ASC' },
    });
  }
}
