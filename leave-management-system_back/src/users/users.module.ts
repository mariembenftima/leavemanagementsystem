import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { User } from './entities/users.entity';
import { ProfilePictureService } from './profile-picture.service';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  providers: [UsersService, ProfilePictureService],
  controllers: [UsersController],

  exports: [UsersService],
})
export class UsersModule {}
