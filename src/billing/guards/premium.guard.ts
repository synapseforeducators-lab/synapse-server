import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';

import { AccessResolverService } from '../access/access-resolver.service';

@Injectable()
export class PremiumGuard implements CanActivate {
  constructor(private readonly accessResolver: AccessResolverService) {}

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();

    const access = await this.accessResolver.resolve(request.user.id);

    if (!access.premium) {
      throw new ForbiddenException('Premium subscription required');
    }

    return true;
  }
}
