import { Injectable } from '@nestjs/common';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { UnauthorizedException } from '@src/common/exception/unauthorized.exception';
import { ErrorTypeEnum } from '@src/common/exception/error.enum';
import { AuthService } from '@src/auth/service/auth.service';

@Injectable()
export class JwtRefreshTokenStrategy extends PassportStrategy(Strategy, 'jwt-refresh-token') {
  constructor(private readonly configService: ConfigService, private readonly authService: AuthService) {
    super({
      secretOrKey: configService.get('JWT_REFRESH_TOKEN_SECRET'),
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
    const header = req.headers as any;
    const authorization = header['authorization'] as string;
    const token: string = authorization.split(' ')[1];
    if (!token) {
      throw new UnauthorizedException(ErrorTypeEnum.UNAUTHORIZED_TOKEN_ERROR, '헤더에 토큰 정보가 존재하지 않음');
    }
    try {
      await this.authService.validateJwtToken({
        token,
        tokenType: 'refresh_token',
        userId: payload.userId,
        expiredAt: payload.exp,
      });
    } catch (e: any) {
      if (e.response.type === ErrorTypeEnum.REFRESH_TOKEN_EXPIRED_ERROR) {
        await this.authService.signOut(payload.userId);
      }
      throw new UnauthorizedException(e.response.type, e.response.message);
    }

    // req.user 에 담김
    return { userId: payload.userId };
  }
}
