import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { user } from 'src/user/user.entity';
import { AuthRequest } from '../models/AuthRequest';

export const CurrentUser = createParamDecorator(
  (data: unknown, context: ExecutionContext): user => {
    const request = context.switchToHttp().getRequest<AuthRequest>();

    return request.user;
  },
);