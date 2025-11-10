import { Injectable, ConflictException, BadRequestException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { LeaveBalancesService } from '../leave-balances/leave-balances.service';
import { LeaveTypesService } from '../leave-types/leave-types.service';
import * as bcrypt from 'bcrypt';
import { AuthResponse } from './types/interfaces/auth-response.interface';
import { RegisterUserDto } from './types/register-user.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly leaveBalancesService: LeaveBalancesService,
    private readonly leaveTypesService: LeaveTypesService,
  ) {}

  // used by LocalStrategy and login endpoint
  async validateUserIdentifier(identifier: string, pass: string): Promise<AuthResponse> {
    // Try to find user by email first
    console.log('🔍 validateUserIdentifier called with identifier:', identifier);
    let user = await this.usersService.findByEmail(identifier);
    console.log('🔎 findByEmail result:', !!user);
    if (!user) {
      // If not found by email, try username
      user = await this.usersService.findByUsername(identifier);
      console.log('🔎 findByUsername result:', !!user);
    }
    if (user) {
      const match = await bcrypt.compare(pass, user.password);
      console.log('🔐 password compare result for', identifier, ':', match);
      if (match) {
        return this.login(user);
      }
    }
    console.log('❌ validateUserIdentifier - authentication failed for', identifier);
    throw new Error('Invalid username/email or password');
  }

  // Backwards-compatible wrapper for LocalStrategy and other callers
  async validateUser(identifier: string, password: string): Promise<AuthResponse> {
    return this.validateUserIdentifier(identifier, password);
  }

  async login(user: any): Promise<AuthResponse> {
    const payload = { sub: user.id, email: user.email, roles: user.roles };
    const access_token = this.jwtService.sign(payload);

    return {
      success: true,
      data: {
        access_token,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.fullname.split(' ')[0] || user.fullname,
          lastName: user.fullname.split(' ').slice(1).join(' ') || '',
          roles: user.roles || [],
        },
      },
      message: 'Login successful'
    };
  }

  async registerUser(registerDto: RegisterUserDto): Promise<AuthResponse> {
    const { email, password, username, fullname, phoneNumber, teamId, address, dateOfBirth, bio, profilePictureUrl } = registerDto;

    // Check if user already exists
    const existingUser = await this.usersService.findByEmail(email);
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user data
    const userData = {
      username,
      fullname,
      email,
      phoneNumber,
      password: hashedPassword,
      roles: ['EMPLOYEE'], // Default role
      teamId,
      address: address || undefined,
      dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
      bio: bio || undefined,
      profilePictureUrl: profilePictureUrl || undefined,
      isActive: true,
    };

    try {
      // Create user
      const newUser = await this.usersService.createUser(userData);

      // Create initial leave balances for all leave types
      await this.createInitialLeaveBalances(newUser.id);

      // Generate JWT token for immediate login
      const payload = {
        sub: newUser.id,
        email: newUser.email,
        roles: newUser.roles,
      };
      const access_token = this.jwtService.sign(payload);

      return {
        success: true,
        data: {
          access_token,
          user: {
            id: newUser.id,
            email: newUser.email,
            firstName: newUser.fullname.split(' ')[0] || newUser.fullname,
            lastName: newUser.fullname.split(' ').slice(1).join(' ') || '',
            roles: newUser.roles || [],
          },
        },
        message: 'Registration successful'
      };
    } catch (error) {
      throw new BadRequestException('Failed to create user: ' + error.message);
    }
  }

  private async createInitialLeaveBalances(userId: string) {
    try {
      // Get all leave types
      const leaveTypes = await this.leaveTypesService.findAll();
      const currentYear = new Date().getFullYear();

      // Create leave balance for each leave type
      for (const leaveType of leaveTypes) {
        await this.leaveBalancesService.create({
          userId,
          leaveTypeId: leaveType.id,
          year: currentYear,
          carryover: 0,
          used: 0,
        });
      }

      console.log(`✅ Created initial leave balances for user ${userId}`);
    } catch (error) {
      console.error(
        `❌ Failed to create leave balances for user ${userId}:`,
        error.message,
      );
      // Don't throw error here to avoid failing registration
    }
  }

  async findUserById(userId: string) {
    try {
      console.log('🔍 Finding user by ID:', userId);
      const user = await this.usersService.getUserById(userId);
      
      console.log('✅ User found:', user.email);
      return user;
    } catch (error) {
      console.log('❌ Error finding user by ID:', error.message);
      throw new NotFoundException(`User with ID ${userId} not found`);
    }
  }
}
