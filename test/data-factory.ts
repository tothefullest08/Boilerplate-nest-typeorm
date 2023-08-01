import { v4 as uuidv4 } from 'uuid';
import { User } from '@src/user/entity/user.entity';
import { DataSource } from 'typeorm';
import { TestingModule } from '@nestjs/testing';
import { AuthService } from '@src/auth/service/auth.service';
import { Authentication } from '@src/auth/entity/auth.entity';
import { UserToken } from '@src/auth/entity/user-token.entity';
import { AuthCategoryEnum } from '@src/auth/auth.enum';
import { encrypt } from '@src/common/cipher/cipher';

export type CreateUserFactoryType = {
  user: User;
  auth: Authentication & {
    originalPassword: string;
  };
  userToken: UserToken;
};

export async function createUserFactory(
  module: TestingModule,
  dto: {
    category?: AuthCategoryEnum;
    count?: number;
  } = {},
): Promise<CreateUserFactoryType[]> {
  if (!dto.category) {
    dto.category = 'email';
  }
  if (!dto.count) {
    dto.count = 1;
  }

  const dataSource = module.get<DataSource>(DataSource);
  const authService = module.get<AuthService>(AuthService);

  const dummyIdentification = () => {
    return `${uuidv4()}@gmail.com`;
  };

  const res: CreateUserFactoryType[] = [];
  for (let i = 0; i < dto.count; i++) {
    const userId = uuidv4();
    const user = await dataSource.getRepository(User).save({ id: userId, nickname: 'nick' });

    const originalPassword = 'password';
    const password = await encrypt(originalPassword);

    const auth = await dataSource.getRepository(Authentication).save({
      userId,
      category: dto.category,
      identification: dummyIdentification(),
      password: password,
    });

    const userToken = await authService.upsertUserToken(userId);

    res.push({ user, auth: { ...auth, originalPassword: originalPassword }, userToken });
  }
  return res;
}
