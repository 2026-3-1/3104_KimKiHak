import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService) {}

  async createOrder(userId: string, lectureIds: number[]) {
    if (!lectureIds.length) throw new BadRequestException('선택된 강의가 없습니다.');

    const lectures = await this.prisma.lecture.findMany({
      where: { id: { in: lectureIds } },
    });

    if (lectures.length !== lectureIds.length) {
      throw new BadRequestException('존재하지 않는 강의가 포함되어 있습니다.');
    }

    const totalAmount = lectures.reduce((sum, l) => sum + l.price, 0);

    const order = await this.prisma.order.create({
      data: {
        userId,
        totalAmount,
        items: {
          create: lectures.map((l) => ({ lectureId: l.id, price: l.price })),
        },
      },
      include: {
        items: { include: { lecture: true } },
      },
    });

    return order;
  }

  async getOrders(userId: string) {
    return this.prisma.order.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        items: { include: { lecture: true } },
        payment: { include: { cancelRecords: true } },
      },
    });
  }
}
