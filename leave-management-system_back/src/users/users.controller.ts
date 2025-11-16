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
  async getUser() {
    const users = await this.usersService.getUser();
    return {
      success: true,
      data: users,
      message: 'Users retrieved successfully',
    };
  }

  @Post()
  async createUser(@Body() createUserDto: CreateUsersDto) {
    return this.usersService.createUser(createUserDto);
  }

  @Patch(':id')
  async updateUser(
    @Body() updateUserDto: UpdateUsersDto,
    @Param('id', new ParseUUIDPipe()) id: string,
  ) {
    const dto: Partial<CreateUsersDto> = {
      ...updateUserDto,
      dateOfBirth: updateUserDto.dateOfBirth
        ? new Date(updateUserDto.dateOfBirth)
        : undefined,
    };
    return this.usersService.updateUser(id, dto);
  }
  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.HR)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all users (Admin/HR only)' })
  @ApiResponse({ status: 200, description: 'Users retrieved successfully' })
  async getAllUsers(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('search') search?: string,
    @Query('role') role?: string,
    @Query('hasProfile') hasProfile?: string,
  ) {
    const users = await this.usersService.getAllUsers({
      page: Number(page),
      limit: Number(limit),
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

  @Get('stats')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.HR)
  @ApiBearerAuth()
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
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user by ID' })
  async getUserById(@Param('id', new ParseUUIDPipe()) id: string) {
    const user = await this.usersService.getUserById(id);
    return {
      success: true,
      data: user,
      message: 'User retrieved successfully',
    };
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete user (Admin only)' })
  async deleteUser(@Param('id', new ParseUUIDPipe()) id: string) {
    await this.usersService.deleteUser(id);
    return {
      success: true,
      message: 'User deleted successfully',
    };
  }

  @Post(':id/profile-pic')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Upload profile picture' })
  async uploadProfilePicture(
    @Param('id', new ParseUUIDPipe()) id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    try {
      if (!file) {
        throw new BadRequestException('No file uploaded');
      }

      if (!ProfilePictureService.validateFile(file)) {
        throw new BadRequestException(
          'Invalid file. Only JPG, JPEG, PNG, WEBP files under 5MB are allowed',
        );
      }

      const profilePicUrl =
        await this.profilePictureService.uploadProfilePicture(id, file);

      return {
        success: true,
        data: { profilePicUrl },
        message: 'Profile picture uploaded successfully',
      };
    } catch (error) {
      throw new BadRequestException(
        `Profile picture upload failed: ${error.message}`,
      );
    }
  }

  @Patch(':id/roles')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update user roles (Admin only)' })
  async updateUserRoles(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body('roles') roles: string[],
  ) {
    const user = await this.usersService.updateUserRoles(id, roles);
    return {
      success: true,
      data: user,
      message: 'User roles updated successfully',
    };
  }

  @Patch(':id/activate')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.HR)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Activate user account (Admin/HR only)' })
  async activateUser(@Param('id', new ParseUUIDPipe()) id: string) {
    const user = await this.usersService.updateUserStatus(id, true);
    return {
      success: true,
      data: user,
      message: 'User activated successfully',
    };
  }

  @Patch(':id/deactivate')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.HR)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Deactivate user account (Admin/HR only)' })
  async deactivateUser(@Param('id', new ParseUUIDPipe()) id: string) {
    const user = await this.usersService.updateUserStatus(id, false);
    return {
      success: true,
      data: user,
      message: 'User deactivated successfully',
    };
  }
}
