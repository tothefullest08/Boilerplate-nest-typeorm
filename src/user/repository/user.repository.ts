import { DeleteResult, In, Repository, UpdateResult } from 'typeorm';
import { User } from '@src/user/entity/user.entity';

import typia from 'typia';
import { InternalException } from '@src/common/exception/internal.exception';
import { ErrorTypeEnum } from '@src/common/exception/error.enum';
import { Logger } from '@nestjs/common';
import { CustomRepository } from '@src/common/database/custom-typeorm.decorator';

@CustomRepository(User)
export class UserRepository extends Repository<User> {
  private readonly logger = new Logger(UserRepository.name);

  async createUser(nickname: string, profileImageName: string): Promise<User> {
    return await this.save({ nickname, profileImageName }).catch((e) => {
      this.logger.error(`유저 생성 실패,  nickname: ${nickname}, e: ${e}`);
      throw new InternalException(ErrorTypeEnum.GET_DATA_ERROR, `유저 생성 조회 실패`);
    });
  }

  async getUsers(dto: { userIds: string[] }): Promise<User[]> {
    return await this.find({ where: [{ id: In(dto.userIds) }] }).catch((e) => {
      this.logger.error(`유저 목록 조회 실패,  dto: ${typia.stringify(dto.userIds)}, e: ${e}`);
      throw new InternalException(ErrorTypeEnum.GET_DATA_ERROR, `유저 목록 조회 실패`);
    });
  }

  async getUser(dto: { userId: string }): Promise<User> {
    return (
      await this.getUsers({ userIds: [dto.userId] }).catch((e) => {
        this.logger.error(`유저 조회 실패,  dto: ${dto.userId}, e: ${e}`);
        throw new InternalException(ErrorTypeEnum.GET_DATA_ERROR, `유저 조회 실패`);
      })
    )[0];
  }

  async updateUser(dto: { userId: string; nickname?: string }): Promise<UpdateResult> {
    const entity: Partial<User> = {
      nickname: dto.nickname,
    };

    return await this.update({ id: dto.userId }, entity).catch((e) => {
      this.logger.error(`유저 업데이트 실패,  dto: ${typia.stringify(dto)}, e: ${e}`);
      throw new InternalException(ErrorTypeEnum.UPDATE_DATA_ERROR, `유저 업데이트 실패`);
    });
  }

  async deleteUser(id: string): Promise<DeleteResult> {
    return await this.delete(id).catch((e) => {
      this.logger.error(`유저 삭제 실패,  id: ${id}, e: ${e}`);
      throw new InternalException(ErrorTypeEnum.DELETE_DATA_ERROR, '유저 삭제 실패');
    });
  }
}
