import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface ApiResponse<T> {
  statusCode: number;
  data: T;
  timestamp: string;
}

interface LegacyResponse {
  success: boolean;
  data: unknown;
  message?: string;
}

@Injectable()
export class ResponseInterceptor<T>
  implements NestInterceptor<T, ApiResponse<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiResponse<T>> {
    const ctx = context.switchToHttp();
    const response = ctx.getResponse<Response>();

    return next.handle().pipe(
      map((data): ApiResponse<T> => {
        const statusCode = response.statusCode || HttpStatus.OK;

        if (this.isLegacyResponse(data)) {
          return {
            statusCode,
            data: data.data as T,
            timestamp: new Date().toISOString(),
          };
        }

        return {
          statusCode,
          data: data as T,
          timestamp: new Date().toISOString(),
        };
      }),
    );
  }

  private isLegacyResponse(data: unknown): data is LegacyResponse {
    return (
      typeof data === 'object' &&
      data !== null &&
      'success' in data &&
      'data' in data
    );
  }
}
