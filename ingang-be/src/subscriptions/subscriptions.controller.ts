import { Body, Controller, Get, Param, ParseIntPipe, Post, Query } from '@nestjs/common';
import { SubscriptionsService } from './subscriptions.service';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { CompleteLessonDto } from './dto/complete-lesson.dto';

@Controller('subscriptions')
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @Post()
  enroll(@Body() dto: CreateSubscriptionDto) {
    return this.subscriptionsService.enroll(dto);
  }

  @Get()
  findByUser(@Query('userId') userId?: string) {
    if (!userId) return [];
    return this.subscriptionsService.findByUser(userId);
  }

  @Post(':id/lessons')
  completeLesson(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CompleteLessonDto,
  ) {
    return this.subscriptionsService.completeLesson(id, dto);
  }
}
