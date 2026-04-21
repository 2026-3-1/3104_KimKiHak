import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CancelReason, OrderStatus, PaymentStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PaymentsService {
  constructor(private readonly prisma: PrismaService) {}

  private get secretKey() {
    return process.env.TOSS_SECRET_KEY ?? '';
  }

  private authHeader() {
    return 'Basic ' + Buffer.from(`${this.secretKey}:`).toString('base64');
  }

  async confirmPayment(paymentKey: string, orderId: number, amount: number) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });
    if (!order) throw new NotFoundException('주문을 찾을 수 없습니다.');
    if (order.status !== 'PENDING') throw new BadRequestException('이미 처리된 주문입니다.');
    if (order.totalAmount !== amount) throw new BadRequestException('결제 금액이 일치하지 않습니다.');

    const isFree = amount === 0;
    // 무료 강의는 Toss API 호출 없이 바로 처리
    // paymentKey 충돌 방지를 위해 orderId 기반으로 고유 키 생성
    const finalPaymentKey = isFree ? `free_${orderId}` : paymentKey;
    let tossData: unknown = { type: 'free' };

    if (!isFree) {
      const tossRes = await fetch('https://api.tosspayments.com/v1/payments/confirm', {
        method: 'POST',
        headers: {
          Authorization: this.authHeader(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ paymentKey, orderId: String(orderId), amount }),
      });
      tossData = await tossRes.json();
      if (!tossRes.ok) {
        throw new BadRequestException((tossData as Record<string, string>).message ?? '토스 결제 승인 실패');
      }
    }

    const payment = await this.prisma.payment.create({
      data: {
        orderId,
        paymentKey: finalPaymentKey,
        status: PaymentStatus.DONE,
        amount,
        paidAt: new Date(),
        rawData: tossData as object,
      },
    });

    await this.prisma.order.update({
      where: { id: orderId },
      data: { status: OrderStatus.PAID },
    });

    // 수강 등록
    for (const item of order.items) {
      await this.prisma.subscription.upsert({
        where: { lectureId_userId: { lectureId: item.lectureId, userId: order.userId } },
        create: { lectureId: item.lectureId, userId: order.userId },
        update: {},
      });
    }

    // 장바구니에서 결제된 강의 제거
    const cart = await this.prisma.cart.findUnique({ where: { userId: order.userId } });
    if (cart) {
      await this.prisma.cartItem.deleteMany({
        where: { cartId: cart.id, lectureId: { in: order.items.map((i) => i.lectureId) } },
      });
    }

    return payment;
  }

  async cancelPayment(
    paymentKey: string,
    reason: CancelReason,
    cancelAmount?: number,
    note?: string,
  ) {
    const payment = await this.prisma.payment.findUnique({
      where: { paymentKey },
      include: { order: { include: { items: true } } },
    });
    if (!payment) throw new NotFoundException('결제 정보를 찾을 수 없습니다.');
    if (payment.status === PaymentStatus.CANCELLED) {
      throw new BadRequestException('이미 취소된 결제입니다.');
    }

    const refundAmount = cancelAmount ?? payment.amount;
    const isPartial = cancelAmount != null && cancelAmount < payment.amount;
    const newPaymentStatus = isPartial ? PaymentStatus.PARTIAL_CANCELLED : PaymentStatus.CANCELLED;
    const newOrderStatus = isPartial ? OrderStatus.PARTIALLY_CANCELLED : OrderStatus.CANCELLED;

    // 무료 결제는 Toss 취소 API 스킵
    if (payment.amount > 0 && !paymentKey.startsWith('free_')) {
      const cancelBody: Record<string, unknown> = {
        cancelReason: this.cancelReasonLabel(reason),
      };
      if (cancelAmount != null) cancelBody.cancelAmount = cancelAmount;

      const tossRes = await fetch(
        `https://api.tosspayments.com/v1/payments/${paymentKey}/cancel`,
        {
          method: 'POST',
          headers: {
            Authorization: this.authHeader(),
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(cancelBody),
        },
      );
      const tossData = await tossRes.json();
      if (!tossRes.ok) {
        throw new BadRequestException(tossData.message ?? '결제 취소 실패');
      }
    }

    await this.prisma.payment.update({
      where: { paymentKey },
      data: {
        status: newPaymentStatus,
        cancelledAt: new Date(),
        cancelReason: reason,
        refundAmount,
        cancelRecords: {
          create: { reason, cancelAmount: refundAmount, note },
        },
      },
    });

    await this.prisma.order.update({
      where: { id: payment.orderId },
      data: { status: newOrderStatus },
    });

    if (!isPartial) {
      const lectureIds = payment.order.items.map((i) => i.lectureId);
      await this.prisma.subscription.deleteMany({
        where: { userId: payment.order.userId, lectureId: { in: lectureIds } },
      });
    }

    return { message: '결제가 취소되었습니다.', refundAmount };
  }

  async getPaymentHistory(userId: string) {
    return this.prisma.payment.findMany({
      where: { order: { userId } },
      orderBy: { createdAt: 'desc' },
      include: {
        order: {
          include: {
            items: { include: { lecture: true } },
          },
        },
        cancelRecords: { orderBy: { cancelledAt: 'desc' } },
      },
    });
  }

  private cancelReasonLabel(reason: CancelReason): string {
    const labels: Record<CancelReason, string> = {
      USER_REQUEST: '고객 요청 취소',
      LECTURE_CANCELLED: '강의 폐강',
      CAPACITY_EXCEEDED: '정원 초과',
      ENROLLMENT_SHORTAGE: '수강 인원 미달',
    };
    return labels[reason];
  }
}
