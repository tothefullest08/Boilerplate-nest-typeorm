import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UnauthorizedException } from '@src/common/exception/unauthorized.exception';
import { ErrorTypeEnum } from '@src/common/exception/error.enum';

@Injectable()
export class JwtRefreshTokenGuard extends AuthGuard('jwt-refresh-token') {
  canActivate(context: ExecutionContext) {
    return super.canActivate(context);
  }

  handleRequest(err: any, user: any, info: any) {
    if (info) {
      throw new UnauthorizedException(ErrorTypeEnum.UNAUTHORIZED_TOKEN_ERROR, info.message, false);
    }
    if (err || !user) {
      throw err || new UnauthorizedException(err.response.type, err.response.description, false);
    }
    return user;
  }
}
