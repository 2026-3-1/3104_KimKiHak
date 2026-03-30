import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { createHash, randomBytes } from 'crypto';

const hashPassword = (plain: string) =>
  createHash('sha256').update(plain).digest('hex');

// 데모용 토큰 (JWT 대신 간단히 랜덤 토큰을 반환합니다.)
const makeToken = () => randomBytes(24).toString('base64url');

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService) {}

  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) {
      throw new UnauthorizedException('이미 존재하는 이메일입니다.');
    }

    // 간단한 SHA256 해시 (실서비스에서는 bcrypt/argon2를 사용하세요.)
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        name: dto.name,
        passwordHash: hashPassword(dto.password),
        type: dto.type === 'instructor' ? 'INSTRUCTOR' : 'STUDENT',
      },
    });

    return {
      user: this.stripPassword(user),
      accessToken: makeToken(),
    };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (!user) {
      throw new UnauthorizedException('이메일 또는 비밀번호가 올바르지 않습니다.');
    }

    const isValid = user.passwordHash === hashPassword(dto.password);
    if (!isValid) {
      throw new UnauthorizedException('이메일 또는 비밀번호가 올바르지 않습니다.');
    }

    return {
      user: this.stripPassword(user),
      accessToken: makeToken(),
    };
  }

  private stripPassword(user: { passwordHash: string } & Record<string, any>) {
    const { passwordHash, ...rest } = user;
    return rest;
  }
}
