import { Repository } from 'typeorm';
import { Authentication } from '@src/auth/entity/auth.entity';
import typia from 'typia';
import { InternalException } from '@src/common/exception/internal.exception';
import { ErrorTypeEnum } from '@src/common/exception/error.enum';
import { Logger } from '@nestjs/common';
import { AuthCategoryEnum } from '@src/auth/auth.enum';
import { CustomRepository } from '@src/common/database/custom-typeorm.decorator';

@CustomRepository(Authentication)
export class AuthRepository extends Repository<Authentication> {
  private readonly logger = new Logger(AuthRepository.name);

  async createAuth(dto: {
    userId: string;
    category: AuthCategoryEnum;
    identification: string;
    password: string;
  }): Promise<Authentication> {
    return await this.save(dto).catch((e) => {
      this.logger.error(`auth 생성 실패,  dto: ${typia.stringify(dto)}, e: ${e}`);
      throw new InternalException(ErrorTypeEnum.GET_DATA_ERROR, `auth 생성 실패`);
    });
  }

  async getAuth(dto: { category: AuthCategoryEnum; identification: string }): Promise<Authentication | null> {
    return await this.findOne({ where: [dto] }).catch((e) => {
      this.logger.error(`auth 조회 실패,  dto: ${typia.stringify(dto)}, e: ${e}`);
      throw new InternalException(ErrorTypeEnum.GET_DATA_ERROR, `auth 조회 실패`);
    });
  }
}
