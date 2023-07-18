import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { UserRepository } from '@src/user/repository/user.repository';
import { User } from '@src/user/entity/user.entity';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(
    @InjectRepository(UserRepository)
    private readonly userRepository: UserRepository,
  ) {}

  async getUsers(dto: { userIds: string[] }): Promise<User[]> {
    return await this.userRepository.getUsers(dto);
  }

  async getUser(userId: string): Promise<User> {
    return (await this.getUsers({ userIds: [userId] }))[0];
  }

  async createUser(nickname: string, profileImageName: string): Promise<User> {
    return this.userRepository.createUser(nickname, profileImageName);
  }
}
