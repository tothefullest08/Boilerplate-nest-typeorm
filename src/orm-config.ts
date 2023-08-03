import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import config from '@src/common/config/config';

const serverConfig = config().server;
const dbConfig = config().database;

const ormConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  host: dbConfig.host,
  port: dbConfig.port,
  database: dbConfig.name,
  username: dbConfig.user,
  password: dbConfig.password,
  synchronize: serverConfig.nodeEnv === 'development',
  logging: serverConfig.nodeEnv === 'development',
  entities: ['src/**/*.entity{.ts,.js}'],
  ssl: false,
};

export default ormConfig;
