import { Injectable } from '@angular/core';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpResponse } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { DataMapperService } from './data-mapper.service';

@Injectable()
export class SnakeToCamelInterceptor implements HttpInterceptor {
  constructor(private mapper: DataMapperService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      map((event) => {
        if (event instanceof HttpResponse && event.body) {
          const newBody = this.mapper.fromApi(event.body);
          return event.clone({ body: newBody });
        }
        return event;
      })
    );
  }
}
