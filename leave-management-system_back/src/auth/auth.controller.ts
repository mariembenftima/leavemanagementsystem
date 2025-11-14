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
  Query,
  ForbiddenException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiConsumes,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterUserDto } from './types/register-user.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { Express } from 'express';
import { AuthenticatedRequest } from './types/authenticated-request';
import { LoginDto } from './types/dtos/login.dto';

@ApiTags('authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('dev-token')
  async devToken(@Query('userId') userId: string) {
    if (process.env.NODE_ENV === 'production') {
      throw new ForbiddenException('Not available in production');
    }
    if (!userId) {
      return { success: false, message: 'userId query parameter is required' };
    }

    try {
      const user = await this.authService.findUserById(userId);
      const result = await this.authService.login(user);
      // Mirror login response structure
      return result;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      return { success: false, message };
    }
  }

  @Post('login')
  @ApiOperation({ summary: 'User login' })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(@Body() loginDto: LoginDto) {
    const identifier = loginDto.email;
    console.log('🔍 Login attempt received for email:', identifier);

    if (!identifier || !loginDto.password) {
      console.log('❌ Login failed - missing email or password');
      throw new UnauthorizedException('Missing credentials');
    }

    try {
      const result = await this.authService.validateUserIdentifier(
        identifier,
        loginDto.password,
      );
      console.log('✅ Login successful for:', identifier);
      return {
        ...result,
        access_token: result.data?.access_token,
        user: result.data?.user,
      };
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      console.log('❌ Login failed for:', identifier, errorMessage);
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
    console.log('🔍 Registration attempt received:', registerDto.email);
    console.log(
      '📁 Profile picture:',
      profilePicture ? profilePicture.filename : 'No file uploaded',
    );

    try {
      const registrationData = {
        ...registerDto,
        profilePictureUrl: profilePicture
          ? `/uploads/profiles/${profilePicture.filename}`
          : undefined,
      };

      const result = await this.authService.registerUser(registrationData);
      console.log('✅ Registration successful for:', registerDto.email);
      return {
        success: true,
        user: result.data.user,
        data: result.data,
        message: 'Registration successful',
      };
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Registration failed';
      console.log(
        '❌ Registration failed for:',
        registerDto.email,
        errorMessage,
      );
      throw error;
    }
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({
    status: 200,
    description: 'User profile retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getCurrentUser(@Request() req: AuthenticatedRequest) {
    const userId = req.user.userId;
    const user = await this.authService.findUserById(userId);
    return { success: true, user };
  }
  catch(error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : 'Failed to retrieve user';
    console.log('❌ Failed to get current user:', errorMessage);
    throw new UnauthorizedException('Unable to retrieve user profile');
  }
}
