import { UserToken } from '@src/auth/entity/user-token.entity';

export type UserTokenResponse = Pick<
  UserToken,
  'id' | 'userId' | 'accessToken' | 'refreshToken' | 'createdAt' | 'updatedAt'
>;
