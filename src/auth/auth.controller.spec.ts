import * as supertest from 'supertest';
import { DataSource } from 'typeorm';
import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { v4 as uuidv4 } from 'uuid';
import { ErrorTypeEnum } from '@src/common/exception/error.enum';
import { AuthService } from '@src/auth/service/auth.service';
import { AppModule } from '@src/app.module';
import { createUserFactory } from '@root/test/data-factory';
import { UserToken } from '@src/auth/entity/user-token.entity';
import { User } from '@src/user/entity/user.entity';

let app: INestApplication;

describe('AuthController', () => {
  let dataSource: DataSource;
  let authService: AuthService;
  let module: TestingModule;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = module.createNestApplication();

    dataSource = app.get<DataSource>(DataSource);
    authService = app.get<AuthService>(AuthService);

    await app.init();

    await dataSource.dropDatabase();
    await dataSource.synchronize();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /auth/v1/sign-up', () => {
    it(`이미 가입된 category & identification으로 회원가입 시도시 401  ${ErrorTypeEnum.UNAUTHORIZED_ERROR}를 반환한다.`, async () => {
      const userFactory = (await createUserFactory(module, { count: 1 }))[0];

      const res = await supertest.agent(app.getHttpServer()).post('/auth/v1/sign-up').send({
        category: userFactory.auth.category,
        identification: userFactory.auth.identification,
        password: userFactory.auth.originalPassword,
        nickname: userFactory.user.nickname,
      });

      expect(res.body.type).toEqual(ErrorTypeEnum.UNAUTHORIZED_ERROR);
      expect(res.statusCode).toEqual(401);
    });

    it('유효한 정보로 회원가입 시도 시, 유저 토큰을 반환한다.', async () => {
      const data = {
        category: 'email',
        identification: `test${uuidv4()}@gmail.com`,
        password: 'password',
        nickname: 'nickname',
      };

      const res = await supertest.agent(app.getHttpServer()).post('/auth/v1/sign-up').send(data);

      expect(res.statusCode).toEqual(200);
      expect(res.body.data).toEqual({
        id: expect.any(String),
        userId: expect.any(String),
        accessToken: expect.any(String),
        refreshToken: expect.any(String),
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
      });
    });
  });

  describe('POST /auth/v1/sign-in', () => {
    it(`존재하지 않는 회원정보로 로그인 요청시 401 ${ErrorTypeEnum.UNAUTHORIZED_ERROR}를 반환한다.`, async () => {
      // given
      const data = {
        category: 'email',
        identification: `test${uuidv4()}@gmail.com`,
        password: 'password',
      };

      const res = await supertest.agent(app.getHttpServer()).post('/auth/v1/sign-in').send(data);

      expect(res.body.type).toEqual(ErrorTypeEnum.UNAUTHORIZED_ERROR);
      expect(res.statusCode).toEqual(401);
    });

    it('유효한 회원 정보로 로그인 요청시  유저 토큰을 반환한다.', async () => {
      const userFactory = (await createUserFactory(module))[0];
      const data = {
        category: userFactory.auth.category,
        identification: userFactory.auth.identification,
        password: userFactory.auth.originalPassword,
      };

      const res = await supertest.agent(app.getHttpServer()).post('/auth/v1/sign-in').send(data);

      expect(res.statusCode).toEqual(200);
      expect(res.body.data).toEqual({
        id: expect.any(String),
        userId: expect.any(String),
        accessToken: expect.any(String),
        refreshToken: expect.any(String),
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
      });
    });
  });

  describe('POST /auth/v1/sign-out', () => {
    it('로그아웃 시, 유저 토큰이 제거된다.', async () => {
      const userFactory = (await createUserFactory(module))[0];
      const userId = userFactory.user.id;

      const res = await supertest
        .agent(app.getHttpServer())
        .post('/auth/v1/sign-out')
        .set('Authorization', `Bearer ${userFactory.userToken.accessToken}`);

      expect(res.body.data).toEqual(null);

      const resUserToken = await dataSource.getRepository(UserToken).findOne({ where: [{ userId }] });
      expect(resUserToken).toBeNull();
    });
  });

  describe('DELETE /auth/v1/withdrawal', () => {
    it('탈퇴 시, 유저 관련된 데이터들이 일괄 제거된다.', async () => {
      const userFactory = (await createUserFactory(module))[0];
      const userId = userFactory.user.id;

      const res = await supertest
        .agent(app.getHttpServer())
        .delete('/auth/v1/withdrawal')
        .set('Authorization', `Bearer ${userFactory.userToken.accessToken}`);

      expect(res.body.data).toEqual(null);

      const resUser = await dataSource.getRepository(User).findOne({ where: [{ id: userId }] });
      const resUserToken = await dataSource.getRepository(UserToken).findOne({ where: [{ userId }] });
      expect(resUser).toBeNull();
      expect(resUserToken).toBeNull();
    });
  });

  describe('PATCH /auth/v1/refresh', () => {
    beforeEach(async () => {
      await dataSource.dropDatabase();
      await dataSource.synchronize();
    });

    it(`헤더에 토큰 정보가 없는 경우, 401 ${ErrorTypeEnum.UNAUTHORIZED_TOKEN_ERROR}를 반환한다.`, async () => {
      const res = await supertest.agent(app.getHttpServer()).patch('/auth/v1/refresh').send();

      expect(res.status).toBe(401);
      expect(res.body.type).toEqual(ErrorTypeEnum.UNAUTHORIZED_TOKEN_ERROR);
    });

    it(`만료된 토큰을 사용하는 경우, 401 ${ErrorTypeEnum.REFRESH_TOKEN_EXPIRED_ERROR}를 반환하며, 로그아웃 처리된다. `, async () => {
      const userFactory = (await createUserFactory(module))[0];
      const userId = userFactory.user.id;
      const userToken = await authService.upsertUserToken(userId, undefined, undefined, 1);

      await new Promise((f) => setTimeout(f, 2000));

      const res = await supertest
        .agent(app.getHttpServer())
        .patch('/auth/v1/refresh')
        .set('Authorization', `Bearer ${userToken.refreshToken}`)
        .send();

      expect(res.status).toBe(401);
      expect(res.body.type).toEqual(ErrorTypeEnum.REFRESH_TOKEN_EXPIRED_ERROR);

      const resUserToken = await dataSource.getRepository(UserToken).findOne({ where: [{ userId }] });
      expect(resUserToken).toBeNull();
    });

    it(`DB에 토큰 정보가 없는 경우, 401 ${ErrorTypeEnum.UNAUTHORIZED_TOKEN_ERROR}를 반환한다.`, async () => {
      const userFactory = (await createUserFactory(module))[0];
      await dataSource.getRepository(UserToken).delete({ id: userFactory.userToken.id });

      const res = await supertest
        .agent(app.getHttpServer())
        .patch('/auth/v1/refresh')
        .set('Authorization', `Bearer ${userFactory.userToken.accessToken}`)
        .send();

      expect(res.status).toBe(401);
      expect(res.body.type).toEqual(ErrorTypeEnum.UNAUTHORIZED_TOKEN_ERROR);
    });

    it(`헤더의 토큰과 DB의 토큰 값이 서로 다른 경우, 401 ${ErrorTypeEnum.UNAUTHORIZED_TOKEN_ERROR}를 반환한다. `, async () => {
      const userFactory = (await createUserFactory(module))[0];
      const userId = userFactory.user.id;
      const invalidUserToken = await authService.upsertUserToken(userId);
      await authService.upsertUserToken(userId, undefined, 1000);

      const res = await supertest
        .agent(app.getHttpServer())
        .patch('/auth/v1/refresh')
        .set('Authorization', `Bearer ${invalidUserToken.accessToken}`)
        .send();

      expect(res.status).toBe(401);
      expect(res.body.type).toEqual(ErrorTypeEnum.UNAUTHORIZED_TOKEN_ERROR);
    });
  });
});
