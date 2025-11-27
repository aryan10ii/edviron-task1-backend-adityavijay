import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export interface AuthUserPayload {
  id: string;
  email: string;
  role: string;
  schoolId?: string | null;
}

export const AuthUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): AuthUserPayload | null => {
    const request = ctx.switchToHttp().getRequest();
    return request.user || null;
  },
);
