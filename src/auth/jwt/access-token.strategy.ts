import { Request } from 'express';
import { Injectable } from '@nestjs/common';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ErrorTypeEnum } from '@src/common/exception/error.enum';
import { UnauthorizedException } from '@src/common/exception/unauthorized.exception';
import { AuthService } from '@src/auth/service/auth.service';

@Injectable()
export class JwtAccessTokenStrategy extends PassportStrategy(Strategy, 'jwt-access-token') {
  constructor(private readonly configService: ConfigService, private readonly authService: AuthService) {
    super({
      secretOrKey: configService.get('JWT_ACCESS_TOKEN_SECRET'),
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: true,
      passReqToCallback: true,
    });
  }

  async validate(
    req: Request,
    payload: {
      userId: string;
      iat: number;
      exp: number;
    },
  ) {
    const token = req.headers['authorization']?.split('Bearer ')[1];
    if (!token) {
      throw new UnauthorizedException(ErrorTypeEnum.UNAUTHORIZED_TOKEN_ERROR, '헤더에 토큰 정보가 존재하지 않음');
    }
    await this.authService.validateJwtToken({
      token,
      tokenType: 'access_token',
      userId: payload.userId,
      expiredAt: payload.exp,
    });

    // req.user 에 담김
    return { userId: payload.userId };
  }
}
