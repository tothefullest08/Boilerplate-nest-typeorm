import { DataSource } from 'typeorm';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '@src/auth/service/auth.service';
import { User } from '@src/user/entity/user.entity';
import { ErrorTypeEnum } from '@src/common/exception/error.enum';
import { UserToken } from '@src/auth/entity/user-token.entity';
import { UnauthorizedException } from '@src/common/exception/unauthorized.exception';
import { createUserFactory } from '@root/test/data-factory';
import { AppModule } from '@src/app.module';
import { AuthCategoryEnum } from '@src/auth/auth.enum';
import { v4 as uuidv4 } from 'uuid';

describe('AuthService', () => {
  let authService: AuthService;
  let dataSource: DataSource;
  let module: TestingModule;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    dataSource = module.get<DataSource>(DataSource);
    authService = module.get<AuthService>(AuthService);
  });

  afterAll(async () => {
    await dataSource.dropDatabase();
    await dataSource.synchronize();
  });

  describe('signIn', () => {
    it('로그인 성공', async () => {
      const userFactory = (await createUserFactory(module, { count: 1 }))[0];

      const result = await authService.signIn({
        category: <AuthCategoryEnum>userFactory.auth.category,
        identification: userFactory.auth.identification,
        password: userFactory.auth.originalPassword,
      });

      expect(result.accessToken).not.toBeNull();
      expect(result.refreshToken).not.toBeNull();
    });

    it(`가입된 적 없는 유저로 로그인 시도시, ${ErrorTypeEnum.UNAUTHORIZED_ERROR} 예외를 던진다.`, async () => {
      async function loginFunc() {
        await authService.signIn({
          category: 'email',
          identification: `test${uuidv4()}@gmail.com`,
          password: 'password',
        });
      }

      await expect(async () => await loginFunc()).rejects.toThrowError(
        new UnauthorizedException(ErrorTypeEnum.UNAUTHORIZED_ERROR, ''),
      );
    });
  });

  describe('signUp', () => {
    it('회원가입 성공', async () => {
      const data = {
        nickname: 'nickname',
        category: <AuthCategoryEnum>'email',
        identification: `test${uuidv4()}@gmail.com`,
        password: 'password',
      };

      const result = await authService.signUp(data);

      const expected = {
        id: expect.any(String),
        userId: expect.any(String),
        accessToken: expect.any(String),
        refreshToken: expect.any(String),
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      };
      expect(result).toEqual(expected);
    });
  });

  describe('signOut', () => {
    beforeEach(async () => {
      await dataSource.dropDatabase();
      await dataSource.synchronize();
    });

    it('로그아웃 시, 노티 토큰과 유저 토큰이 제거되어야한다', async () => {
      const userFactory = (await createUserFactory(module, { count: 1 }))[0];
      const userId = userFactory.user.id;

      await authService.signOut(userId);

      const resUserToken = await dataSource.getRepository(UserToken).findOne({ where: [{ userId }] });
      expect(resUserToken).toBeNull();
    });
  });

  describe('withdraw auth', () => {
    it('유저 탈퇴 시 모든 데이터들이 제거되어야 한다', async () => {
      const userFactory = (await createUserFactory(module, { count: 1 }))[0];
      const userId = userFactory.user.id;

      await authService.withdrawAuth(userId);

      const resUser = await dataSource.getRepository(User).findOne({ where: [{ id: userId }] });
      const resUserToken = await dataSource.getRepository(UserToken).findOne({ where: [{ userId }] });
      expect(resUser).toBeNull();
      expect(resUserToken).toBeNull();
    });
  });
});
