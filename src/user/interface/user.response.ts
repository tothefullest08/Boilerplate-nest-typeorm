import { User } from '@src/user/entity/user.entity';

export type UserResponse = Omit<User, 'authentications' | 'members'>;
