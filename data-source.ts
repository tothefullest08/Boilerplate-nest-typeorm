import { DataSource, DataSourceOptions } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { SeederOptions } from 'typeorm-extension';

const configService = new ConfigService();

const options: DataSourceOptions & SeederOptions = {
  type: 'postgres',
  host: configService.get('DB_HOST', 'localhost'),
  port: configService.get<number>('DB_PORT', 5433),
  database: configService.get('DB_NAME', 'postgresql'),
  username: configService.get('DB_USER', 'postgresql'),
  password: configService.get('DB_PASSWORD', 'admin123!'),
  synchronize: configService.get('NODE_ENV', 'development') === 'development',
  logging: configService.get('NODE_ENV', 'development') === 'development',
  entities: ['dist/**/*.entity{.ts,.js}'],
  seeds: ['dist/src/common/database/seeder{.ts,.js}'],
  migrations: ['dist/src/common/database/migrations/*{.ts,.js}'],
  migrationsTableName: 'migrations',
};

const dataSource = new DataSource(options);

export default dataSource;
