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
  ParseIntPipe,
  DefaultValuePipe,
  HttpCode,
  HttpStatus,
  ClassSerializerInterceptor,
  SerializeOptions,
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
import { UserResponseDto } from './types/dtos/user-response.dto';

@ApiTags('users')
@Controller('users')
@UseInterceptors(ClassSerializerInterceptor)
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly profilePictureService: ProfilePictureService,
  ) {}

  @Get('simple')
  getUser() {
    return this.usersService.getUser();
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.HR)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get all users with pagination and filters (Admin/HR only)',
  })
  @ApiResponse({ status: 200, description: 'Users retrieved successfully' })
  getAllUsers(
    @Query('page', DefaultValuePipe, ParseIntPipe) page: number,
    @Query('limit', DefaultValuePipe, ParseIntPipe) limit: number,
    @Query('search') search?: string,
    @Query('role') role?: string,
    @Query('hasProfile') hasProfile?: string,
  ) {
    return this.usersService.getAllUsers({
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
  }

  @Get('stats')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.HR)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user statistics (Admin/HR only)' })
  getUserStats() {
    return this.usersService.getUserStats();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @SerializeOptions({ type: UserResponseDto })
  @ApiOperation({ summary: 'Get user by ID' })
  getUserById(@Param('id', ParseUUIDPipe) id: string) {
    return this.usersService.getUserById(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new user' })
  @ApiResponse({ status: 201, description: 'User created successfully' })
  createUser(@Body() createUserDto: CreateUsersDto) {
    return this.usersService.createUser(createUserDto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update user information' })
  updateUser(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateUserDto: UpdateUsersDto,
  ) {
    return this.usersService.updateUser(id, updateUserDto);
  }

  @Patch(':id/roles')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update user roles (Admin only)' })
  updateUserRoles(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('roles') roles: string[],
  ) {
    return this.usersService.updateUserRoles(id, roles);
  }

  @Patch(':id/activate')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.HR)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Activate user account (Admin/HR only)' })
  activateUser(@Param('id', ParseUUIDPipe) id: string) {
    return this.usersService.updateUserStatus(id, true);
  }

  @Patch(':id/deactivate')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.HR)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Deactivate user account (Admin/HR only)' })
  deactivateUser(@Param('id', ParseUUIDPipe) id: string) {
    return this.usersService.updateUserStatus(id, false);
  }

  @Post(':id/profile-pic')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Upload profile picture' })
  async uploadProfilePicture(
    @Param('id', ParseUUIDPipe) id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    if (!ProfilePictureService.validateFile(file)) {
      throw new BadRequestException(
        'Invalid file. Only JPG, JPEG, PNG, WEBP files under 5MB are allowed',
      );
    }

    const profilePicUrl = await this.profilePictureService.uploadProfilePicture(
      id,
      file,
    );

    return { profilePicUrl };
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete user (Admin only)' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteUser(@Param('id', ParseUUIDPipe) id: string) {
    await this.usersService.deleteUser(id);
  }
}
