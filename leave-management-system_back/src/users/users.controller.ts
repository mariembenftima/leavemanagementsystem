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
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UsersService } from './users.service';
import { ProfilePictureService } from './profile-picture.service';
import { CreateUsersDto } from './types/dtos/create-users.dto';
import { UpdateUsersDto } from './types/dtos/update-users.dto';

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

  @Get(':id')
  async getUserById(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.usersService.getUserById(id);
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
    // Convert dateOfBirth to Date if it's a string
    const dto: Partial<CreateUsersDto> = {
      ...updateUserDto,
      dateOfBirth: updateUserDto.dateOfBirth
        ? new Date(updateUserDto.dateOfBirth)
        : undefined,
    };
    return this.usersService.updateUser(id, dto);
  }
  @Delete(':id')
  async deleteUser(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.usersService.deleteUser(id);
  }

  @Post(':id/profile-pic')
  @UseInterceptors(FileInterceptor('file'))
  async uploadProfilePicture(
    @Param('id', new ParseUUIDPipe()) id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    try {
      // Validate file exists
      if (!file) {
        throw new BadRequestException('No file uploaded');
      }

      // Validate file type and size
      if (!ProfilePictureService.validateFile(file)) {
        throw new BadRequestException(
          'Invalid file. Only JPG, JPEG, PNG, WEBP files under 5MB are allowed',
        );
      }

      // Upload and update profile picture
      const profilePicUrl =
        await this.profilePictureService.uploadProfilePicture(id, file);

      return { profilePicUrl };
    } catch (error) {
      console.error('❌ Profile picture upload error:', error);
      if (error.message.includes('not found')) {
        throw new BadRequestException(error.message);
      }
      throw error;
    }
  }
}
