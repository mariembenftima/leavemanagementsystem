import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response, Request } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus() || HttpStatus.INTERNAL_SERVER_ERROR;

    const exceptionResponse = exception.getResponse();

    let errorMessage: string;

    if (
      exceptionResponse &&
      typeof exceptionResponse === 'object' &&
      'message' in exceptionResponse
    ) {
      if (Array.isArray(exceptionResponse.message)) {
        errorMessage = exceptionResponse.message.join(', ');
      } else if (typeof exceptionResponse.message === 'string') {
        errorMessage = exceptionResponse.message;
      } else {
        errorMessage = String(exceptionResponse.message);
      }
    } else {
      errorMessage = exception.message || 'An error occurred';
    }

    const url = request && request.url ? request.url : 'unknown';

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: url,
      message: errorMessage,
    });
  }
}
