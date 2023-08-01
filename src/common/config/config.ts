import * as dotenv from 'dotenv';
import * as process from 'process';

dotenv.config();

console.log('process.env.NODE_ENV', process.env.NODE_ENV);

export interface ServerConfig {
  nodeEnv: 'production' | 'development';
  host: string;
  port: number;
}

export interface DatabaseConfig {
  host: string;
  port: number;
  name: string;
  username: string;
  password: string;
}

export interface AuthConfig {
  jwtAccessTokenSecret: string;
  jwtAccessTokenExpireTimeInSec: number;
  jwtRefreshTokenSecret: string;
  jwtRefreshTokenExpireTimeInSec: number;
  saltRounds: number;
}

export default () => ({
  server: {
    nodeEnv: process.env.NODE_ENV || 'development',
    host: process.env.HOST || 'localhost',
    port: +(process.env.PORT || '3000'),
  },
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: +(process.env.DB_PORT || '5433'),
    name: process.env.DB_NAME || 'postgresql',
    user: process.env.DB_USER || 'postgresql',
    password: process.env.DB_PASSWORD || 'admin123!',
  },
  auth: {
    jwtAccessTokenSecret: process.env.JWT_ACCESS_TOKEN_SECRET || 'Secret1234',
    jwtAccessTokenExpireTimeInSec: +(process.env.JWT_ACCESS_TOKEN_EXPIRE_TIME_IN_SEC || '3600'),
    jwtRefreshTokenSecret: process.env.JWT_REFRESH_TOKEN_SECRET || 'RefreshSecret1234',
    jwtRefreshTokenExpireTimeInSec: +(process.env.JWT_REFRESH_TOKEN_EXPIRE_TIME_IN_SEC || '72000'),
    saltRounds: +(process.env.SALT_ROUNDS || '10'),
  },
});
