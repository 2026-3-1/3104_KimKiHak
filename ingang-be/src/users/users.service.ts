import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { createHash } from 'crypto';

const hashPassword = (plain: string) =>
  createHash('sha256').update(plain).digest('hex');

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateUserDto) {
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        name: dto.name,
        passwordHash: hashPassword(dto.password),
        type: dto.type === 'instructor' ? 'INSTRUCTOR' : 'STUDENT',
      },
    });

    return this.stripPassword(user);
  }

  async findAll() {
    const users = await this.prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return users.map((user) => this.stripPassword(user));
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('사용자를 찾을 수 없습니다.');
    return this.stripPassword(user);
  }

  async update(id: string, dto: UpdateUserDto) {
    const user = await this.prisma.user.update({
      where: { id },
      data: {
        name: dto.name,
        type: dto.type ? (dto.type === 'instructor' ? 'INSTRUCTOR' : 'STUDENT') : undefined,
      },
    });
    return this.stripPassword(user);
  }

  // 응답에서 비밀번호 해시를 제거
  private stripPassword(user: { passwordHash: string } & Record<string, any>) {
    const { passwordHash, ...rest } = user;
    return rest;
  }
}
