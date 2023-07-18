import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import config from '@src/common/config/config';

config();

const configService = new ConfigService();

const dataSource = new DataSource({
  type: 'postgres',
  host: configService.get('DB_HOST', 'localhost'),
  port: configService.get<number>('DB_PORT', 5433),
  database: configService.get('DB_NAME', 'postgresql'),
  username: configService.get('DB_USER', 'postgresql'),
  password: configService.get('DB_PASSWORD', 'admin123!'),
  synchronize: configService.get('NODE_ENV', 'development') === 'development',
  logging: configService.get('NODE_ENV', 'development') === 'development',
  entities: ['dist/**/*.entity{.ts,.js}'],
  migrations: ['dist/database/migrations/*{.ts,.js}'],
  migrationsTableName: 'migrations',
});

export default dataSource;
