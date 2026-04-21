import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query } from '@nestjs/common';
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

  // ── 시청 진도 ──────────────────────────────────────

  @Patch(':id/lessons/:lessonId/progress')
  saveProgress(
    @Param('id', ParseIntPipe) subscriptionId: number,
    @Param('lessonId', ParseIntPipe) lessonId: number,
    @Body('watchedSeconds') watchedSeconds: number,
  ) {
    return this.subscriptionsService.saveProgress(subscriptionId, lessonId, watchedSeconds);
  }

  @Get(':id/last-position')
  getLastPosition(@Param('id', ParseIntPipe) subscriptionId: number) {
    return this.subscriptionsService.getLastPosition(subscriptionId);
  }

  // ── 북마크 ────────────────────────────────────────

  @Post(':id/bookmarks')
  addBookmark(
    @Param('id', ParseIntPipe) subscriptionId: number,
    @Body() body: { lessonId: number; seconds: number; label: string },
  ) {
    return this.subscriptionsService.addBookmark(
      subscriptionId,
      body.lessonId,
      body.seconds,
      body.label,
    );
  }

  @Get(':id/bookmarks')
  getBookmarks(@Param('id', ParseIntPipe) subscriptionId: number) {
    return this.subscriptionsService.getBookmarks(subscriptionId);
  }

  @Delete(':id/bookmarks/:bookmarkId')
  removeBookmark(
    @Param('id', ParseIntPipe) subscriptionId: number,
    @Param('bookmarkId', ParseIntPipe) bookmarkId: number,
  ) {
    return this.subscriptionsService.removeBookmark(subscriptionId, bookmarkId);
  }
}
