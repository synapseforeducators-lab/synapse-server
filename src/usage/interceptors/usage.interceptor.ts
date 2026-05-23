import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';

import { Observable, tap } from 'rxjs';

import { Reflector } from '@nestjs/core';

import { UsageService } from '../usage.service';

@Injectable()
export class UsageInterceptor implements NestInterceptor {
  constructor(
    private readonly reflector: Reflector,

    private readonly usageService: UsageService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();

    const type = this.reflector.get('usage_type', context.getHandler());

    if (!type) {
      return next.handle();
    }

    return next.handle().pipe(
      tap(async () => {
        await this.usageService.increment(request.user.id, type);
      }),
    );
  }
}
