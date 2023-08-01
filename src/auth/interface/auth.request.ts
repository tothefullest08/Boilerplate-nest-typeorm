import { Authentication } from '@src/auth/entity/auth.entity';
import { User } from '@src/user/entity/user.entity';

export type SignUpRequest = Pick<Authentication, 'category' | 'identification' | 'password'> & Pick<User, 'nickname'>;

export type SignInRequest = Pick<Authentication, 'category' | 'identification' | 'password'>;
