import { Response } from 'express';
import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { ErrorTypeEnum } from '@src/common/exception/error.enum';
import { InternalException } from '@src/common/exception/internal.exception';
import { UnauthorizedException } from '@src/common/exception/unauthorized.exception';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let statusCode: number;
    let body: string | object;

    if (
      exception instanceof InternalException ||
      exception instanceof UnauthorizedException
    ) {
      statusCode = exception.getStatus();
      body = exception.getResponse();
    } else {
      statusCode = 500;
      body = {
        type: ErrorTypeEnum.INTERNAL_ERROR,
        description: '서버 에러(예외처리 필요)',
      };
    }

    response.status(statusCode).json(body);
  }
}
