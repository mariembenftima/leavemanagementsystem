import {
  Controller,
  Post,
  Body,
  UnauthorizedException,
  UseInterceptors,
  UploadedFile,
  Get,
  UseGuards,
  Request,
  Patch,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiConsumes,
  ApiBearerAuth,
} from '@nestjs/swagger';
// ⚠️ NOTE: Uncomment this line AFTER installing @nestjs/throttler
// Run: npm install @nestjs/throttler
// import { Throttle } from '@nestjs/throttler';

import { AuthService } from './auth.service';
import { RegisterUserDto } from './types/register-user.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { Express } from 'express';
import { AuthenticatedRequest } from './types/authenticated-request';
import { LoginDto } from './types/dtos/login.dto';
import { ChangePasswordDto } from './types/dtos/change-password.dto';

@ApiTags('authentication')
@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiOperation({ summary: 'User login' })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(@Body() loginDto: LoginDto) {
    const identifier = loginDto.email;
    this.logger.log(`Login attempt for identifier: ${identifier}`);

    if (!identifier || !loginDto.password) {
      this.logger.warn('Login failed - missing credentials');
      throw new UnauthorizedException('Missing credentials');
    }

    try {
      const result = await this.authService.validateUserIdentifier(
        identifier,
        loginDto.password,
      );
      this.logger.log(`Login successful for: ${identifier}`);
      return {
        ...result,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.warn(`Login failed for: ${identifier} - ${errorMessage}`);
      throw new UnauthorizedException('Invalid email or password');
    }
  }

  @Post('register')
  @ApiOperation({ summary: 'Register a new user account' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status: 201, description: 'User registered successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 409, description: 'Email already exists' })
  @UseInterceptors(
    FileInterceptor('profilePicture', {
      storage: diskStorage({
        destination: './uploads/profiles',
        filename: (req, file, callback) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          callback(null, `profile-${uniqueSuffix}${ext}`);
        },
      }),
      fileFilter: (req, file, callback) => {
        if (!file.mimetype.startsWith('image/')) {
          return callback(new Error('Only image files are allowed'), false);
        }
        callback(null, true);
      },
      limits: {
        fileSize: 5 * 1024 * 1024,
      },
    }),
  )
  async register(
    @Body() registerDto: RegisterUserDto,
    @UploadedFile() profilePicture?: Express.Multer.File,
  ) {
    this.logger.log(`Registration attempt for: ${registerDto.email}`);

    try {
      const registrationData = {
        ...registerDto,
        profilePictureUrl: profilePicture
          ? `/uploads/profiles/${profilePicture.filename}`
          : undefined,
      };

      const result = await this.authService.registerUser(registrationData);
      this.logger.log(`Registration successful for: ${registerDto.email}`);
      return {
        success: true,
        user: result.user,
        data: result,
        message: 'Registration successful',
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Registration failed';
      this.logger.error(
        `Registration failed for: ${registerDto.email} - ${errorMessage}`,
      );
      throw error;
    }
  }

  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({
    status: 200,
    description: 'User profile retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getCurrentUser(@Request() req: AuthenticatedRequest) {
    try {
      const userId = req.user.userId;
      const user = await this.authService.findUserById(userId);
      return { success: true, user };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to retrieve user';
      this.logger.error(`Failed to get current user: ${errorMessage}`);
      throw new UnauthorizedException('Unable to retrieve user profile');
    }
  }

  @Patch('change-password')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Change user password' })
  @ApiResponse({ status: 200, description: 'Password changed successfully' })
  @ApiResponse({ status: 400, description: 'Invalid password data' })
  @ApiResponse({ status: 401, description: 'Current password incorrect' })
  async changePassword(
    @Request() req: AuthenticatedRequest,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    try {
      const userId = req.user.userId || req.user.id;
      this.logger.log(`Password change attempt for user: ${userId}`);

      const result = await this.authService.changePassword(
        userId,
        changePasswordDto,
      );

      this.logger.log(`Password changed successfully for: ${userId}`);
      return result;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Password change failed';
      this.logger.error(`Password change failed: ${errorMessage}`);

      if (error instanceof BadRequestException) {
        throw error;
      }
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new BadRequestException(errorMessage);
    }
  }
}
