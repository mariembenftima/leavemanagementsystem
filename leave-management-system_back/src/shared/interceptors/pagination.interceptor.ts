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

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedData<T> {
  data: T[];
  pagination: PaginationMeta;
}

export interface PaginatedResponse<T> {
  statusCode: number;
  data: T[];
  pagination: PaginationMeta;
  timestamp: string;
}

export interface StandardResponse<T> {
  statusCode: number;
  data: T;
  timestamp: string;
}

@Injectable()
export class PaginationInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const ctx = context.switchToHttp();
    const response = ctx.getResponse<Response>();

    return next.handle().pipe(
      map((responseData: unknown) => {
        const statusCode = response.statusCode || HttpStatus.OK;
        const timestamp = new Date().toISOString();

        if (this.isPaginatedData(responseData)) {
          return {
            statusCode,
            data: responseData.data,
            pagination: responseData.pagination,
            timestamp,
          };
        }

        return {
          statusCode,
          data: responseData,
          timestamp,
        };
      }),
    );
  }

  private isPaginatedData(data: unknown): data is PaginatedData<unknown> {
    return (
      typeof data === 'object' &&
      data !== null &&
      'data' in data &&
      'pagination' in data &&
      this.isValidPagination((data as PaginatedData<unknown>).pagination)
    );
  }

  private isValidPagination(pagination: unknown): pagination is PaginationMeta {
    return (
      typeof pagination === 'object' &&
      pagination !== null &&
      'page' in pagination &&
      'limit' in pagination &&
      'total' in pagination &&
      'totalPages' in pagination &&
      typeof (pagination as PaginationMeta).page === 'number' &&
      typeof (pagination as PaginationMeta).limit === 'number' &&
      typeof (pagination as PaginationMeta).total === 'number' &&
      typeof (pagination as PaginationMeta).totalPages === 'number'
    );
  }
}
