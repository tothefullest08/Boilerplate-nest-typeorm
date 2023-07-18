import * as dotenv from 'dotenv';

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
});
