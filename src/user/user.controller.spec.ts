import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import * as supertest from 'supertest';
import { DataSource } from 'typeorm';
import { AppModule } from '@src/app.module';
import { createUserFactory } from '@root/test/data-factory';

let app: INestApplication;

describe('UserController', () => {
  let dataSource: DataSource;
  let module: TestingModule;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = module.createNestApplication();

    dataSource = app.get<DataSource>(DataSource);

    await app.init();

    await dataSource.dropDatabase();
    await dataSource.synchronize();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /users/v1/:userId', () => {
    it('유저 조회 성공', async () => {
      const userFactory = (await createUserFactory(module))[0];
      const userId = userFactory.user.id;

      const res = await supertest
        .agent(app.getHttpServer())
        .get(`/users/v1/${userId}`)
        .set('Authorization', `Bearer ${userFactory.userToken.accessToken}`)
        .send();

      expect(res.status).toBe(200);
      expect(res.body.data.id).toBe(userId);
    });
  });
});
