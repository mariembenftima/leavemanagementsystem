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
    const updatePayload: Partial<EmployeeProfile> = {};

    if (updateData) {
      if (
        'department' in updateData &&
        typeof updateData.department === 'string'
      ) {
        updatePayload.department = updateData.department;
      }

      if (
        'designation' in updateData &&
        typeof updateData.designation === 'string'
      ) {
        updatePayload.designation = updateData.designation;
      }

      // Join Date - with proper error handling
      if ('joinDate' in updateData && updateData.joinDate) {
        try {
          updatePayload.joinDate = new Date(updateData.joinDate);
        } catch {
          // No unused variable warning - omitted variable name
          console.warn(
            `Invalid joinDate format: ${String(updateData.joinDate)}`,
          );
        }
      }

      // Date of Birth - with proper error handling
      if ('dateOfBirth' in updateData && updateData.dateOfBirth) {
        try {
          updatePayload.dateOfBirth = new Date(updateData.dateOfBirth);
        } catch {
          // No unused variable warning - omitted variable name
          console.warn(
            `Invalid dateOfBirth format: ${String(updateData.dateOfBirth)}`,
          );
        }
      }

      if ('gender' in updateData && typeof updateData.gender === 'string') {
        updatePayload.gender = updateData.gender;
      }

      if ('phone' in updateData && typeof updateData.phone === 'string') {
        updatePayload.phone = updateData.phone;
      }

      if (
        'emergencyContactName' in updateData &&
        typeof updateData.emergencyContactName === 'string'
      ) {
        updatePayload.emergencyContactName = updateData.emergencyContactName;
      }

      if (
        'emergencyContactPhone' in updateData &&
        typeof updateData.emergencyContactPhone === 'string'
      ) {
        updatePayload.emergencyContactPhone = updateData.emergencyContactPhone;
      }

      if ('address' in updateData && typeof updateData.address === 'string') {
        updatePayload.address = updateData.address;
      }
    }

    const profile = await this.findByUserId(userId);
    if (!profile) {
      throw new Error('Profile not found');
    }

    Object.assign(profile, updatePayload);

    const updated = await this.repository.save(profile);
    return updated;
  }

  async findByDepartment(department: string): Promise<EmployeeProfile[]> {
    return this.repository.find({
      where: { department },
      relations: ['user'],
      order: { joinDate: 'ASC' },
    });
  }
}
