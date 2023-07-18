import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { LoggerModule } from 'nestjs-pino';
import config from '@src/common/config/config';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from '@src/user/user.module';
import { DatabaseModule } from '@src/common/database/database.module';
import { APP_FILTER } from '@nestjs/core';
import { HttpExceptionFilter } from '@src/common/exception/http-exception.filter';

@Module({
  imports: [
    LoggerModule.forRoot({
      pinoHttp: {
        quietReqLogger: true,
        autoLogging: true,
        transport: {
          target: 'pino-pretty',
          options: {
            singleLine: true,
          },
        },
      },
    }),
    ConfigModule.forRoot({
      load: [config],
      isGlobal: true,
    }),
    UserModule,
    DatabaseModule,
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
  ],
})
export class AppModule {}
