import { v4 as uuidv4 } from 'uuid';
import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { DataSource } from 'typeorm';
import { LoggerModule } from 'nestjs-pino';
import { User } from '@src/user/entity/user.entity';
import { UserModule } from '@src/user/user.module';
import { UserRepository } from '@src/user/repository/user.repository';
import config from '@src/common/config/config';
import { DatabaseModule } from '@src/common/database/database.module';

describe('UserRepository', () => {
  let dataSource: DataSource;
  let userRepo: UserRepository;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        LoggerModule.forRoot(),
        ConfigModule.forRoot({ load: [config], isGlobal: true }),
        DatabaseModule,
        UserModule,
      ],
    }).compile();

    dataSource = module.get<DataSource>(DataSource);
    userRepo = module.get<UserRepository>(UserRepository);

    await dataSource.dropDatabase();
    await dataSource.synchronize();
  });

  describe('createUser', () => {
    it('유저 생성 성공', async () => {
      const nickname = 'nickname';

      const res = await userRepo.createUser(nickname);

      expect(res.nickname).toEqual(nickname);
    });
  });

  describe('getUsers', () => {
    it('유저 목록 조회 성공', async () => {
      const userIds: string[] = [];
      for (let i = 0; i < 10; i++) {
        const user = await dataSource.getRepository(User).save({ nickname: `nickname${i}` });
        userIds.push(user.id);
      }
      const res = await userRepo.getUsers({ userIds });

      expect(res.length).toEqual(10);
    });
  });

  describe('getUser', () => {
    it('유저 조회 성공', async () => {
      const userId = uuidv4();
      await dataSource.getRepository(User).save({ id: userId, nickname: 'nickname' });

      const res = await userRepo.getUser({ userId });

      expect(res).not.toBeNull();
    });
  });
});
