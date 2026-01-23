import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  ParseUUIDPipe,
  Patch,
  Delete,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
  Query,
  UseGuards,
  DefaultValuePipe,
  ParseIntPipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UsersService } from './users.service';
import { ProfilePictureService } from './profile-picture.service';
import { CreateUsersDto } from './types/dtos/create-users.dto';
import { UpdateUsersDto } from './types/dtos/update-users.dto';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from './roleguard';
import { Roles } from './roledecorator';
import { UserRole } from './types/enums/user-role.enum';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly profilePictureService: ProfilePictureService,
  ) {}

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.HR)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get all users (Admin/HR only)' })
  @ApiResponse({ status: 200, description: 'Users retrieved successfully' })
  async getAllUsers(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('search') search?: string,
    @Query('role') role?: string,
    @Query('hasProfile') hasProfile?: string,
  ) {
    const users = await this.usersService.getAllUsers({
      page,
      limit,
      search,
      role,
      hasProfile:
        hasProfile === 'true'
          ? true
          : hasProfile === 'false'
            ? false
            : undefined,
    });

    return {
      success: true,
      data: users.data,
      pagination: {
        total: users.total,
        page: users.page,
        limit: users.limit,
        totalPages: users.totalPages,
      },
      message: 'Users retrieved successfully',
    };
  }

  @Post()
  async createUser(@Body() createUserDto: CreateUsersDto) {
    return this.usersService.createUser(createUserDto);
  }

  @Get('stats')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.HR)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get user statistics (Admin/HR only)' })
  async getUserStats() {
    const stats = await this.usersService.getUserStats();
    return {
      success: true,
      data: stats,
      message: 'User statistics retrieved successfully',
    };
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get user by ID' })
  async getUserById(@Param('id', ParseUUIDPipe) id: string) {
    const user = await this.usersService.getUserById(id);
    return {
      success: true,
      data: user,
      message: 'User retrieved successfully',
    };
  }

  @Patch(':id')
  async updateUser(
    @Body() updateUserDto: UpdateUsersDto,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    const dto: Partial<CreateUsersDto> = {
      ...updateUserDto,
      dateOfBirth: updateUserDto.dateOfBirth
        ? new Date(updateUserDto.dateOfBirth)
        : undefined,
    };
    return this.usersService.updateUser(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Delete user (Admin only)' })
  async deleteUser(@Param('id', ParseUUIDPipe) id: string) {
    await this.usersService.deleteUser(id);
    return {
      success: true,
      message: 'User deleted successfully',
    };
  }

  @Post(':id/profile-pic')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Upload profile picture' })
  async uploadProfilePicture(
    @Param('id', ParseUUIDPipe) id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    // ✅ Validate file was uploaded
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    // ✅ Basic validation using static method
    if (!ProfilePictureService.validateFile(file)) {
      throw new BadRequestException(
        'Invalid file. Only JPG, JPEG, PNG, WEBP, and GIF files up to 5MB are allowed.',
      );
    }

    try {
      // ✅ Upload with comprehensive validation in service
      const profilePicUrl =
        await this.profilePictureService.uploadProfilePicture(id, file);

      return {
        success: true,
        data: { profilePicUrl },
        message: 'Profile picture uploaded successfully',
      };
    } catch (error) {
      // ✅ Properly typed error handling
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Failed to upload profile picture';

      throw new BadRequestException(errorMessage);
    }
  }
}
