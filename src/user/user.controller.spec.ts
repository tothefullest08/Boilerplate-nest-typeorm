import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { v4 as uuidv4 } from 'uuid';
import { User } from '@src/user/entity/user.entity';
import * as supertest from 'supertest';
import { DataSource } from 'typeorm';
import { AppModule } from '@src/app.module';

let app: INestApplication;

describe('UserController', () => {
  let dataSource: DataSource;
  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    dataSource = app.get<DataSource>(DataSource);

    await app.init();

    await dataSource.dropDatabase();
    await dataSource.synchronize();
  });

  afterAll(async () => {
    await dataSource.dropDatabase();
    await dataSource.destroy();
    await app.close();
  });

  describe('GET /users/v1/:userId', () => {
    it('유저 조회 성공', async () => {
      const userId = uuidv4();
      await dataSource.getRepository(User).save({ id: userId, nickname: 'nick' });

      const res = await supertest.agent(app.getHttpServer()).get(`/users/v1/${userId}`).send();

      expect(res.status).toBe(200);
      expect(res.body.data.id).toBe(userId);
    });
  });
});
