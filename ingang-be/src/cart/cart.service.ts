import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CartService {
  constructor(private readonly prisma: PrismaService) {}

  async getCart(userId: string) {
    const cart = await this.prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            lecture: {
              include: {
                instructor: { select: { id: true, name: true } },
                tags: true,
              },
            },
          },
          orderBy: { addedAt: 'desc' },
        },
      },
    });
    return cart ?? { userId, items: [] };
  }

  async addItem(userId: string, lectureId: number) {
    const cart = await this.prisma.cart.upsert({
      where: { userId },
      create: { userId },
      update: {},
    });

    await this.prisma.cartItem.upsert({
      where: { cartId_lectureId: { cartId: cart.id, lectureId } },
      create: { cartId: cart.id, lectureId },
      update: {},
    });

    return this.getCart(userId);
  }

  async removeItem(userId: string, lectureId: number) {
    const cart = await this.prisma.cart.findUnique({ where: { userId } });
    if (!cart) return { userId, items: [] };

    await this.prisma.cartItem.deleteMany({
      where: { cartId: cart.id, lectureId },
    });

    return this.getCart(userId);
  }
}
