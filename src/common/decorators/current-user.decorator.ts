import { createParamDecorator, ExecutionContext } from '@nestjs/common';

const getCurrentUserByContext = <T>(context: ExecutionContext): T => {
  return context.switchToHttp().getRequest().user as T;
};

export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext) =>
    getCurrentUserByContext(context),
);