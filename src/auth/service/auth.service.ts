import typia from 'typia';
import { DataSource, EntityManager } from 'typeorm';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { UserTokenRepository } from '@src/auth/repository/user-token.repository';
import { JwtTokenDto } from '@src/auth/interface/auth.dto';
import { InternalException } from '@src/common/exception/internal.exception';
import { AuthRepository } from '@src/auth/repository/authentication.repository';
import { UserToken } from '@src/auth/entity/user-token.entity';
import { ErrorTypeEnum } from '@src/common/exception/error.enum';
import { UserRepository } from '@src/user/repository/user.repository';
import { AuthCategoryEnum, JwtTokenTypeEnum } from '@src/auth/auth.enum';
import { UnauthorizedException } from '@src/common/exception/unauthorized.exception';
import { compareEncryption, encrypt } from '@src/common/cipher/cipher';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly dataSource: DataSource,
    private readonly jwtService: JwtService,
    private readonly userRepository: UserRepository,
    private readonly userTokenRepository: UserTokenRepository,
    private readonly authRepository: AuthRepository,
  ) {}

  async signIn(dto: { category: AuthCategoryEnum; identification: string; password: string }): Promise<UserToken> {
    const auth = await this.authRepository.getAuth({ category: dto.category, identification: dto.identification });
    if (!auth) {
      this.logger.error(`존재하지 않는 유저에 대한 로그인 시도, dto: ${typia.stringify(dto)}}`);
      throw new UnauthorizedException(ErrorTypeEnum.UNAUTHORIZED_ERROR, '');
    }

    await this.validatePassword({ ...dto, encryptedPassword: auth.password });

    try {
      return await this.upsertUserToken(auth.userId);
    } catch (e) {
      this.logger.error(`유저 토큰 생성 에러,  dto: ${typia.stringify(dto)}, e: ${e}`);
      throw new InternalException(ErrorTypeEnum.UPSERT_DATA_ERROR, '유저 토큰 생성 에러');
    }
  }

  async validatePassword(dto: {
    category: AuthCategoryEnum;
    identification: string;
    password: string;
    encryptedPassword: string;
  }): Promise<boolean> {
    const res = await compareEncryption(dto.password, dto.encryptedPassword);
    if (!res) {
      this.logger.error(`비밀번호 불일치, identification: ${dto.identification}, dto: ${typia.stringify(dto)}}`);
      throw new UnauthorizedException(ErrorTypeEnum.UNAUTHORIZED_ERROR, '비밀번호 불일치');
    }
    return res;
  }

  async signUp(dto: {
    nickname: string;
    category: AuthCategoryEnum;
    identification: string;
    password: string;
  }): Promise<UserToken> {
    const { nickname, category, identification, password } = dto;

    await this.validateNewUser(category, identification);
    const encryptedPassword = await this.encryptPassword(password);

    return this.dataSource
      .transaction(async (manager) => {
        const userRepository = manager.withRepository(this.userRepository);
        const authRepository = manager.withRepository(this.authRepository);

        const user = await userRepository.createUser(nickname);
        await authRepository.createAuth({ userId: user.id, category, identification, password: encryptedPassword });
        return await this.upsertUserToken(user.id, manager);
      })
      .catch((e) => {
        this.logger.error(`회원가입 데이터 생성 실패, dto: ${typia.stringify(dto)}, e: ${e}`);
        throw new InternalException(ErrorTypeEnum.CREATE_DATA_ERROR, '회원가입 데이터 생성 실패');
      });
  }

  private async encryptPassword(password: string): Promise<string> {
    return await encrypt(password);
  }

  private async validateNewUser(category: AuthCategoryEnum, identification: string): Promise<void> {
    const user = await this.authRepository.getAuth({ category, identification });
    if (user) {
      this.logger.error(
        `유저 데이터 이미 존재함. 회원가입 불가, category: ${category}, identification: ${identification}`,
      );
      throw new UnauthorizedException(ErrorTypeEnum.UNAUTHORIZED_ERROR, '');
    }
  }

  async signOut(userId: string): Promise<void> {
    return this.dataSource
      .transaction(async (manager) => {
        await this.deleteUserToken(userId, manager);
        return;
      })
      .catch((e) => {
        this.logger.error(`로그아웃 실패, userId: ${userId}, e: ${e}`);
        throw new InternalException(ErrorTypeEnum.DELETE_DATA_ERROR, '로그아웃 실패');
      });
  }

  async withdrawAuth(userId: string): Promise<void> {
    await this.userRepository.deleteUser(userId);
  }

  private async deleteUserToken(userId: string, entityManger?: EntityManager) {
    const repo = entityManger ? entityManger.withRepository(this.userTokenRepository) : this.userTokenRepository;
    await repo.deleteUserToken(userId);
  }

  async refreshUserToken(userId: string): Promise<UserToken> {
    try {
      return await this.upsertUserToken(userId);
    } catch (e) {
      this.logger.error(`유저 토큰 refresh 에러,  userId: ${userId}, e: ${e}`);
      throw new InternalException(ErrorTypeEnum.UPSERT_DATA_ERROR, '유저 토큰 업데이트 실패');
    }
  }

  async upsertUserToken(
    userId: string,
    manager?: EntityManager,
    accessTokenExp?: number,
    refreshTokenExp?: number,
  ): Promise<UserToken> {
    const jwtToken = await this.createJwtToken(userId, accessTokenExp, refreshTokenExp);

    const repo = manager ? manager.withRepository(this.userTokenRepository) : this.userTokenRepository;
    await repo.upsertUserToken({
      userId,
      accessToken: jwtToken.accessToken,
      refreshToken: jwtToken.refreshToken,
    });
    const token = await repo.getUserToken(userId);
    if (!token) {
      throw new InternalException(ErrorTypeEnum.GET_DATA_ERROR, '유저 토큰 조회 실패');
    }

    return token;
  }

  private async createJwtToken(
    userId: string,
    accessTokenExp?: number,
    refreshTokenExp?: number,
  ): Promise<JwtTokenDto> {
    const accessTokenExpireTime = accessTokenExp || this.configService.get('JWT_ACCESS_TOKEN_EXPIRE_TIME_IN_SEC', 3600);
    const refreshTokenExpireTime =
      refreshTokenExp || this.configService.get('JWT_REFRESH_TOKEN_EXPIRE_TIME_IN_SEC', 72000);

    const payload = { userId };
    const algorithm = 'HS256';

    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_ACCESS_TOKEN_SECRET'),
      expiresIn: `${accessTokenExpireTime}s`,
      algorithm,
    });
    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_REFRESH_TOKEN_SECRET'),
      expiresIn: `${refreshTokenExpireTime}s`,
      algorithm,
    });
    return {
      accessToken,
      refreshToken,
    };
  }

  async validateJwtToken(dto: {
    userId: string;
    token: string;
    tokenType: JwtTokenTypeEnum;
    expiredAt: number;
  }): Promise<void> {
    // 토큰 만료 시간 검사
    if (new Date() > new Date(dto.expiredAt * 1000)) {
      this.logger.error(`${dto.tokenType} 토큰 만료됨, userId: ${dto.userId}`);
      throw new UnauthorizedException(
        dto.tokenType == 'access_token'
          ? ErrorTypeEnum.ACCESS_TOKEN_EXPIRED_ERROR
          : ErrorTypeEnum.REFRESH_TOKEN_EXPIRED_ERROR,
        `${dto.tokenType} 만료됨`,
        false,
      );
    }

    // 토큰 존재 여부 검사
    const userToken = await this.userTokenRepository.getUserToken(dto.userId);
    if (!userToken) {
      this.logger.error(`${dto.tokenType}이 존재하지 않음. userId: ${dto.userId}`);
      throw new UnauthorizedException(ErrorTypeEnum.UNAUTHORIZED_TOKEN_ERROR, `${dto.tokenType} 존재하지 않는 토큰`);
    }

    let tokenFromRDS: string;
    switch (dto.tokenType) {
      case 'access_token':
      default: {
        tokenFromRDS = userToken.accessToken;
        break;
      }
      case 'refresh_token': {
        tokenFromRDS = userToken.refreshToken;
        break;
      }
    }

    // 토큰 값 검사
    if (dto.token !== tokenFromRDS) {
      this.logger.error(`${dto.tokenType} , userId: ${dto.userId}`);
      throw new UnauthorizedException(ErrorTypeEnum.UNAUTHORIZED_TOKEN_ERROR, `${dto.tokenType} 유효하지 않은 토큰`);
    }
  }
}
