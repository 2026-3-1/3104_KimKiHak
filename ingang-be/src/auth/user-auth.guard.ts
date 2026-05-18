import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

export type UserJwtPayload = {
  sub: string;
  role: string;
  email: string;
};

type AuthenticatedRequest = Request & {
  user?: UserJwtPayload;
};

@Injectable()
export class UserAuthGuard implements CanActivate {
  constructor(private readonly jwt: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const header = req.headers.authorization;

    if (!header?.startsWith('Bearer ')) {
      throw new UnauthorizedException('로그인이 필요합니다.');
    }

    const token = header.slice(7).trim();
    if (!token) {
      throw new UnauthorizedException('로그인이 필요합니다.');
    }

    try {
      const payload = this.jwt.verify<UserJwtPayload>(token, {
        audience: 'user',
      });
      req.user = payload;
      return true;
    } catch {
      throw new UnauthorizedException('유효하지 않은 토큰입니다.');
    }
  }
}
