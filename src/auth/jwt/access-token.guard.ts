import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ErrorTypeEnum } from '@src/common/exception/error.enum';
import { UnauthorizedException } from '@src/common/exception/unauthorized.exception';

@Injectable()
export class JwtAccessTokenGuard extends AuthGuard('jwt-access-token') {
  canActivate(context: ExecutionContext) {
    return super.canActivate(context);
  }

  handleRequest(err: any, user: any, info: any) {
    // You can throw an exception based on either "info" or "err" arguments
    if (info) {
      throw new UnauthorizedException(ErrorTypeEnum.UNAUTHORIZED_TOKEN_ERROR, info.message, false);
    }
    if (err || !user) {
      throw err || new UnauthorizedException(err.response.type, err.response.description, false);
    }
    return user;
  }
}
