import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Query } from '@nestjs/common';
import { CartService } from './cart.service';

@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  getCart(@Query('userId') userId?: string) {
    if (!userId) return { userId: '', items: [] };
    return this.cartService.getCart(userId);
  }

  @Post('items')
  addItem(@Body() body: { userId: string; lectureId: number }) {
    if (!body.userId || !body.lectureId) {
      throw new Error('userId와 lectureId는 필수입니다.');
    }
    return this.cartService.addItem(body.userId, body.lectureId);
  }

  @Delete('items/:lectureId')
  removeItem(
    @Query('userId') userId?: string,
    @Param('lectureId', ParseIntPipe) lectureId?: number,
  ) {
    if (!userId || !lectureId) return { userId: userId ?? '', items: [] };
    return this.cartService.removeItem(userId, lectureId);
  }
}
