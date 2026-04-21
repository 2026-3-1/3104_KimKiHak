import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { OrdersService } from './orders.service';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  createOrder(@Body() body: { userId: string; lectureIds: number[] }) {
    return this.ordersService.createOrder(body.userId, body.lectureIds);
  }

  @Get()
  getOrders(@Query('userId') userId: string) {
    return this.ordersService.getOrders(userId);
  }
}
