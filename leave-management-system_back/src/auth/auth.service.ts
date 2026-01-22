import {
  Injectable,
  ConflictException,
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { LeaveBalancesService } from '../leave-balances/leave-balances.service';
import { LeaveTypesService } from '../leave-types/leave-types.service';
import * as bcrypt from 'bcrypt';
import { AuthResponse } from './types/interfaces/auth-response.interface';
import { RegisterUserDto } from './types/register-user.dto';
import { ChangePasswordDto } from './types/dtos/change-password.dto';
import { User } from '../users/entities/users.entity';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly leaveBalancesService: LeaveBalancesService,
    private readonly leaveTypesService: LeaveTypesService,
  ) {}

  async validateUserIdentifier(
    identifier: string,
    pass: string,
  ): Promise<AuthResponse> {
    this.logger.debug(`Validating user identifier: ${identifier}`);

    let user = await this.usersService.findByEmail(identifier);

    if (!user) {
      user = await this.usersService.findByUsername(identifier);
    }

    if (user) {
      const match = await bcrypt.compare(pass, user.password);

      if (match) {
        this.logger.debug(`Authentication successful for: ${identifier}`);
        return this.login(user);
      }
    }

    this.logger.warn(`Authentication failed for: ${identifier}`);
    throw new Error('Invalid username/email or password');
  }

  async validateUser(
    identifier: string,
    password: string,
  ): Promise<AuthResponse> {
    return this.validateUserIdentifier(identifier, password);
  }

  login(user: User): AuthResponse {
    const payload = {
      sub: user.id,
      email: user.email,
      roles: user.roles,
    };
    const access_token = this.jwtService.sign(payload);

    return {
      success: true,
      access_token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.fullname.split(' ')[0] || user.fullname,
        lastName: user.fullname.split(' ').slice(1).join(' ') || '',
        roles: user.roles || [],
      },
      message: 'Login successful',
    };
  }

  async registerUser(registerDto: RegisterUserDto): Promise<AuthResponse> {
    const {
      email,
      password,
      username,
      fullname,
      phoneNumber,
      teamId,
      address,
      dateOfBirth,
      bio,
      profilePictureUrl,
    } = registerDto;

    const existingUser = await this.usersService.findByEmail(email);
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const userData = {
      username,
      fullname,
      email,
      phoneNumber,
      password: hashedPassword,
      roles: ['EMPLOYEE'],
      teamId,
      address: address || undefined,
      dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
      bio: bio || undefined,
      profilePictureUrl: profilePictureUrl || undefined,
      isActive: true,
    };

    try {
      const newUser = await this.usersService.createUser(userData);
      await this.createInitialLeaveBalances(newUser.id);

      const payload = {
        sub: newUser.id,
        email: newUser.email,
        roles: newUser.roles,
      };
      const access_token = this.jwtService.sign(payload);

      this.logger.log(`User registered successfully: ${email}`);

      return {
        success: true,
        access_token,
        user: {
          id: newUser.id,
          email: newUser.email,
          firstName: newUser.fullname.split(' ')[0] || newUser.fullname,
          lastName: newUser.fullname.split(' ').slice(1).join(' ') || '',
          roles: newUser.roles || [],
        },

        message: 'Registration successful',
      };
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to create user: ${errorMessage}`);
      throw new BadRequestException('Failed to create user: ' + errorMessage);
    }
  }

  private async createInitialLeaveBalances(userId: string): Promise<void> {
    try {
      const leaveTypes = await this.leaveTypesService.findAll();
      const currentYear = new Date().getFullYear();

      for (const leaveType of leaveTypes) {
        await this.leaveBalancesService.create({
          userId,
          leaveTypeId: leaveType.id,
          year: currentYear,
          carryover: 0,
          used: 0,
        });
      }

      this.logger.log(`Created initial leave balances for user: ${userId}`);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(
        `Failed to create leave balances for user ${userId}: ${errorMessage}`,
      );
    }
  }

  async findUserById(userId: string): Promise<User> {
    try {
      this.logger.debug(`Finding user by ID: ${userId}`);
      const user = await this.usersService.getUserById(userId);
      return user;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Error finding user by ID: ${errorMessage}`);
      throw new NotFoundException(`User with ID ${userId} not found`);
    }
  }

  async changePassword(
    userId: string,
    changePasswordDto: ChangePasswordDto,
  ): Promise<{ success: boolean; message: string }> {
    const { currentPassword, newPassword, confirmPassword } = changePasswordDto;

    if (newPassword !== confirmPassword) {
      throw new BadRequestException('New passwords do not match');
    }

    if (currentPassword === newPassword) {
      throw new BadRequestException(
        'New password must be different from current password',
      );
    }

    if (newPassword.length < 6) {
      throw new BadRequestException(
        'Password must be at least 6 characters long',
      );
    }

    const user = await this.findUserById(userId);

    const isPasswordValid = await bcrypt.compare(
      currentPassword,
      user.password,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await this.usersService.updateUser(userId, { password: hashedPassword });

    this.logger.log(`Password changed successfully for user: ${userId}`);

    return {
      success: true,
      message: 'Password changed successfully',
    };
  }
}
