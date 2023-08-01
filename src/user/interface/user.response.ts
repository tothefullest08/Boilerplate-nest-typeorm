import { User } from '@src/user/entity/user.entity';

export type UserResponse = Pick<User, 'id' | 'nickname' | 'createdAt' | 'updatedAt'>;
