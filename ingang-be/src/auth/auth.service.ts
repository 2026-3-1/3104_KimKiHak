import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { createHash } from 'crypto';

const hashPassword = (plain: string) =>
  createHash('sha256').update(plain).digest('hex');

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  private makeToken(user: { id: string; type: string; email: string }) {
    return this.jwtService.sign(
      { sub: user.id, role: user.type, email: user.email },
      { audience: 'user' },
    );
  }

  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) {
      throw new UnauthorizedException('이미 존재하는 이메일입니다.');
    }

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
      accessToken: this.makeToken(user),
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
      accessToken: this.makeToken(user),
    };
  }

  private stripPassword(user: { passwordHash: string } & Record<string, unknown>) {
    const { passwordHash, ...rest } = user;
    return rest;
  }
}
