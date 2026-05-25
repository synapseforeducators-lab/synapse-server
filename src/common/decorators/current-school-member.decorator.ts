// common/decorators/current-school-member.decorator.ts

import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentSchoolMember = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.schoolMembership;
  },
);
