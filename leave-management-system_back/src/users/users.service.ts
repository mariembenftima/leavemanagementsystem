import { Injectable } from '@nestjs/common';
import { CreateUsersDto } from './types/dtos/create-users.dto';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/users.entity';

@Injectable()
export class UsersService {
  async findByUsername(username: string) {
    return this.usersRepository.findOneBy({ username });
  }
  async findByEmail(email: string) {
    return this.usersRepository.findOneBy({ email });
  }
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async getUser() {
    return this.usersRepository.find();
  }
  async getUserById(id: string) {
    const fetchedUser = await this.usersRepository.findOneBy({ id });
    if (!fetchedUser) {
      throw new Error(`User with id ${id} not found`);
    }
    return fetchedUser;
  }
  async createUser(createUserDto: CreateUsersDto) {
    const newUser = this.usersRepository.create(createUserDto);
    return this.usersRepository.save(newUser);
  }
  async updateUser(id: string, updateUserDto: Partial<CreateUsersDto>) {
    const user = await this.getUserById(id);
    const {
      fullname,
      email,
      password,
      phoneNumber,
      roles,
      profilePictureUrl,
      bio,
      address,
      dateOfBirth,
    } = updateUserDto;
    if (fullname) {
      user.fullname = fullname;
    }
    if (email) {
      user.email = email;
    }
    if (password) {
      user.password = password;
    }
    if (phoneNumber) {
      user.phoneNumber = phoneNumber;
    }
    if (roles) {
      user.roles = roles;
    }
    if (profilePictureUrl) {
      user.profilePictureUrl = profilePictureUrl;
    }
    if (bio) {
      user.bio = bio;
    }
    if (address) {
      user.address = address;
    }
    if (dateOfBirth) {
      user.dateOfBirth = new Date(dateOfBirth);
    }
    return this.usersRepository.save(user);
  }
  async deleteUser(id: string) {
    const user = await this.getUserById(id);
    return this.usersRepository.delete(user.id);
  }
}
