import { Response } from 'express';
import { ArgumentsHost, Catch, ExceptionFilter, Logger, NotFoundException } from '@nestjs/common';
import { ErrorTypeEnum } from '@src/common/exception/error.enum';
import { InternalException } from '@src/common/exception/internal.exception';
import { UnauthorizedException } from '@src/common/exception/unauthorized.exception';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let statusCode: number;
    let body: string | object;

    if (exception instanceof InternalException || exception instanceof UnauthorizedException) {
      statusCode = exception.getStatus();
      body = exception.getResponse();
    } else if (exception instanceof NotFoundException) {
      this.logger.error(
        `잘못된 요청, message: ${exception.message}, stack: ${exception.stack}, name: ${exception.name}`,
      );
      statusCode = 400;
      body = {
        type: ErrorTypeEnum.REQUEST_NOT_ROUND_ERROR,
        description: '잘못된 요청',
      };
    } else {
      this.logger.error(
        `서버에러 (예외 처리 필요), message: ${exception.message}, stack: ${exception.stack}, name: ${exception.name}}`,
      );
      statusCode = 500;
      body = {
        type: ErrorTypeEnum.INTERNAL_ERROR,
        description: '서버 에러(예외처리 필요)',
      };
    }

    response.status(statusCode).json(body);
  }
}
