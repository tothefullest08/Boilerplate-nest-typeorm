import { DeleteResult, InsertResult, Repository } from 'typeorm';
import { UserToken } from '@src/auth/entity/user-token.entity';
import typia from 'typia';
import { InternalException } from '@src/common/exception/internal.exception';
import { ErrorTypeEnum } from '@src/common/exception/error.enum';
import { Logger } from '@nestjs/common';
import { CustomRepository } from '@src/common/database/custom-typeorm.decorator';

@CustomRepository(UserToken)
export class UserTokenRepository extends Repository<UserToken> {
  private readonly logger = new Logger(UserTokenRepository.name);

  async upsertUserToken(dto: { userId: string; accessToken: string; refreshToken: string }): Promise<InsertResult> {
    return this.createQueryBuilder()
      .insert()
      .into(UserToken)
      .values({
        userId: dto.userId,
        accessToken: dto.accessToken,
        refreshToken: dto.refreshToken,
      })
      .orUpdate(['user_id', 'access_token', 'refresh_token'], ['user_id'])
      .execute()
      .catch((e) => {
        this.logger.error(`유저 토큰 upsert 실패,  dto: ${typia.stringify(dto)}, e: ${e}`);
        throw new InternalException(ErrorTypeEnum.UPDATE_DATA_ERROR, `유저 토큰 upsert 실패`);
      });
  }

  async getUserToken(userId: string): Promise<UserToken | null> {
    return this.findOne({
      where: { userId },
    }).catch((e) => {
      this.logger.error(`유저 토큰 조회 실패, userId: ${userId}, e: ${e}`);
      throw new InternalException(ErrorTypeEnum.GET_DATA_ERROR, `유저 토큰 조회 실패`);
    });
  }

  async deleteUserToken(userId: string): Promise<DeleteResult> {
    return this.delete({ userId }).catch((e) => {
      this.logger.error(`유저 토큰 삭제 실패,  userId: ${userId}, e: ${e}`);
      throw new InternalException(ErrorTypeEnum.DELETE_DATA_ERROR, `유저 토큰 삭제 실패`);
    });
  }
}
