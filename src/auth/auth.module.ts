import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';

import { PassportModule } from '@nestjs/passport';
import { JwtAccessTokenStrategy } from '@src/auth/jwt/access-token.strategy';
import { JwtRefreshTokenStrategy } from '@src/auth/jwt/refresh-token.strategy';
import { AuthService } from '@src/auth/service/auth.service';
import { UserTokenRepository } from '@src/auth/repository/user-token.repository';
import { AuthController } from '@src/auth/auth.controller';
import { UserRepository } from '@src/user/repository/user.repository';
import { AuthRepository } from '@src/auth/repository/authentication.repository';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UserModule } from '@src/user/user.module';
import { CustomTypeOrmModule } from '@src/common/database/custom-typeorm.module';

@Module({
  imports: [
    CustomTypeOrmModule.forCustomRepository([AuthRepository, UserTokenRepository, UserRepository]),
    TypeOrmModule.forFeature([UserTokenRepository, UserRepository]),
    PassportModule.register({ defaultStrategy: 'jwt-access-token' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        global: true,
        secret: configService.get('JWT_ACCESS_TOKEN_SECRET'),
        signOptions: {
          expiresIn: `${configService.get('JWT_ACCESS_TOKEN_EXPIRE_TIME_IN_SEC')}s`,
        },
      }),
    }),
    UserModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtAccessTokenStrategy, JwtRefreshTokenStrategy],
  exports: [AuthModule, PassportModule, JwtAccessTokenStrategy, JwtRefreshTokenStrategy],
})
export class AuthModule {}
