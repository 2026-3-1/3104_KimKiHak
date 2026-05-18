import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { CompleteLessonDto } from './dto/complete-lesson.dto';

@Injectable()
export class SubscriptionsService {
  constructor(private readonly prisma: PrismaService) {}

  async enroll(dto: CreateSubscriptionDto) {
    const include = {
      lessons: true,
      lecture: { include: { instructor: { select: { id: true, name: true } } } },
    };

    const existing = await this.prisma.subscription.findUnique({
      where: { lectureId_userId: { lectureId: dto.lectureId, userId: dto.userId } },
      include,
    });
    if (existing) return existing;

    return this.prisma.subscription.create({
      data: { lectureId: dto.lectureId, userId: dto.userId },
      include,
    });
  }

  async findByUser(userId: string) {
    return this.prisma.subscription.findMany({
      where: { userId },
      orderBy: { enrolledAt: 'desc' },
      include: {
        lecture: {
          include: {
            tags: true,
            instructor: { select: { id: true, name: true } },
          },
        },
        lessons: { orderBy: { lastWatchedAt: 'desc' } },
      },
    });
  }

  async completeLesson(subscriptionId: number, dto: CompleteLessonDto) {
    const subscription = await this.prisma.subscription.findUnique({
      where: { id: subscriptionId },
      include: {
        lecture: { include: { sections: { include: { videos: true } } } },
      },
    });
    if (!subscription) throw new NotFoundException('수강 정보를 찾을 수 없습니다.');

    const video = await this.prisma.lectureVideo.findUnique({ where: { id: dto.lessonId } });
    if (!video) throw new NotFoundException('강의 영상을 찾을 수 없습니다.');

    const section = subscription.lecture.sections.find((s) => s.id === video.lectureSectionId);
    if (!section) throw new NotFoundException('해당 강의에 포함되지 않은 영상입니다.');

    // 완료 시 watchedSeconds를 영상 전체 길이로 설정 → 진행률 100% 반영
    await this.prisma.subscriptionLesson.upsert({
      where: { subscriptionId_lessonId: { subscriptionId, lessonId: dto.lessonId } },
      update:  { watchedSeconds: video.durationSec },
      create:  { subscriptionId, lessonId: dto.lessonId, watchedSeconds: video.durationSec },
    });

    const progress = await this.recalculateProgress(subscriptionId);

    return this.prisma.subscription.update({
      where: { id: subscriptionId },
      data: { progress },
      include: { lessons: true },
    });
  }

  // ── 시청 진도 저장 ──────────────────────────────────

  async saveProgress(subscriptionId: number, lessonId: number, watchedSeconds: number) {
    // 기존 레코드의 watchedSeconds보다 클 때만 업데이트 (되감기로 줄어드는 것 방지)
    const existing = await this.prisma.subscriptionLesson.findUnique({
      where: { subscriptionId_lessonId: { subscriptionId, lessonId } },
    });

    const newSeconds = existing
      ? Math.max(existing.watchedSeconds, watchedSeconds)
      : watchedSeconds;

    await this.prisma.subscriptionLesson.upsert({
      where: { subscriptionId_lessonId: { subscriptionId, lessonId } },
      create: { subscriptionId, lessonId, watchedSeconds: newSeconds },
      update: { watchedSeconds: newSeconds },
    });

    const progress = await this.recalculateProgress(subscriptionId);
    await this.prisma.subscription.update({
      where: { id: subscriptionId },
      data: { progress },
    });

    return { ok: true, progress };
  }

  async getLastPosition(subscriptionId: number) {
    const lesson = await this.prisma.subscriptionLesson.findFirst({
      where: { subscriptionId, watchedSeconds: { gt: 0 } },
      orderBy: { lastWatchedAt: 'desc' },
    });
    return {
      lessonId: lesson?.lessonId ?? null,
      watchedSeconds: lesson?.watchedSeconds ?? 0,
    };
  }

  // ── 진행률 재계산 (시청 시간 기반) ─────────────────
  // 진행률 = Σ min(watchedSeconds, durationSec) / Σ durationSec * 100

  private async recalculateProgress(subscriptionId: number): Promise<number> {
    const subscription = await this.prisma.subscription.findUnique({
      where: { id: subscriptionId },
      include: {
        lecture: { include: { sections: { include: { videos: true } } } },
        lessons: true,
      },
    });
    if (!subscription) return 0;

    const allVideos = subscription.lecture.sections.flatMap((s) => s.videos);
    const totalDuration = allVideos.reduce((sum, v) => sum + v.durationSec, 0);
    if (totalDuration === 0) return 0;

    const lessonMap = new Map(subscription.lessons.map((l) => [l.lessonId, l.watchedSeconds]));

    const totalWatched = allVideos.reduce((sum, v) => {
      const watched = lessonMap.get(v.id) ?? 0;
      return sum + Math.min(watched, v.durationSec);
    }, 0);

    return Math.min(100, Math.round((totalWatched / totalDuration) * 100));
  }

  // ── 북마크 ────────────────────────────────────────

  async addBookmark(subscriptionId: number, lessonId: number, seconds: number, label: string) {
    const subscription = await this.prisma.subscription.findUnique({
      where: { id: subscriptionId },
    });
    if (!subscription) throw new NotFoundException('수강 정보를 찾을 수 없습니다.');

    return this.prisma.bookmark.create({
      data: { subscriptionId, lessonId, seconds, label },
    });
  }

  async getBookmarks(subscriptionId: number) {
    return this.prisma.bookmark.findMany({
      where: { subscriptionId },
      orderBy: [{ lessonId: 'asc' }, { seconds: 'asc' }],
    });
  }

  async removeBookmark(subscriptionId: number, bookmarkId: number) {
    const bookmark = await this.prisma.bookmark.findUnique({ where: { id: bookmarkId } });
    if (!bookmark || bookmark.subscriptionId !== subscriptionId) {
      throw new NotFoundException('북마크를 찾을 수 없습니다.');
    }
    return this.prisma.bookmark.delete({ where: { id: bookmarkId } });
  }
}
