import { CallHandler, ExecutionContext, NestInterceptor } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { BEARER_TOKEN } from '../../constants';

export class UserInterceptor implements NestInterceptor {
  async intercept(context: ExecutionContext, handler: CallHandler) {
    const request = context.switchToHttp().getRequest();
    const token = request?.headers?.authorization?.split(`${BEARER_TOKEN} `)[1];
    const user = await jwt.decode(token);
    request.user = user;

    return handler.handle();
  }
}
