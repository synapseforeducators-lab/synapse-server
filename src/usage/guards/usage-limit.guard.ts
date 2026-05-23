import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';

import { Reflector } from '@nestjs/core';

import { UsageService } from '../usage.service';

@Injectable()
export class UsageLimitGuard
  implements CanActivate
{
  constructor(
    private readonly reflector: Reflector,

    private readonly usageService: UsageService,
  ) {}

  async canActivate(
    context: ExecutionContext,
  ) {
    const request =
      context.switchToHttp().getRequest();

    const type =
      this.reflector.get(
        'usage_type',
        context.getHandler(),
      );

    if (!type) {
      return true;
    }

    const result =
      await this.usageService.canUse(
        request.user.id,
        type,
      );

    if (!result.allowed) {
      throw new ForbiddenException(
        `Usage limit reached for ${type}`,
      );
    }

    request.usage = result;

    return true;
  }
}