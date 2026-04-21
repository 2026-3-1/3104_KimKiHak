import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { CancelReason } from '@prisma/client';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  // 토스 결제 승인 (결제 성공 후 프론트에서 호출)
  @Post('confirm')
  confirm(
    @Body() body: { paymentKey: string; orderId: number; amount: number },
  ) {
    return this.paymentsService.confirmPayment(body.paymentKey, body.orderId, body.amount);
  }

  // 결제 취소 (환불)
  @Post('cancel')
  cancel(
    @Body()
    body: {
      paymentKey: string;
      reason: CancelReason;
      cancelAmount?: number;
      note?: string;
    },
  ) {
    return this.paymentsService.cancelPayment(
      body.paymentKey,
      body.reason,
      body.cancelAmount,
      body.note,
    );
  }

  // 결제/거래 내역 조회
  @Get()
  getHistory(@Query('userId') userId: string) {
    return this.paymentsService.getPaymentHistory(userId);
  }
}
