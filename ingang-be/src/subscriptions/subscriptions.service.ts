import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { CompleteLessonDto } from './dto/complete-lesson.dto';

@Injectable()
export class SubscriptionsService {
  constructor(private readonly prisma: PrismaService) {}

  async enroll(dto: CreateSubscriptionDto) {
    const existing = await this.prisma.subscription.findUnique({
      where: { lectureId_userId: { lectureId: dto.lectureId, userId: dto.userId } },
      include: { lessons: true },
    });
    if (existing) return existing;

    return this.prisma.subscription.create({
      data: {
        lectureId: dto.lectureId,
        userId: dto.userId,
      },
      include: { lessons: true },
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
        lessons: true,
      },
    });
  }

  async completeLesson(subscriptionId: number, dto: CompleteLessonDto) {
    const subscription = await this.prisma.subscription.findUnique({
      where: { id: subscriptionId },
      include: {
        lecture: {
          include: {
            sections: { include: { videos: true } },
          },
        },
      },
    });

    if (!subscription) throw new NotFoundException('수강 정보를 찾을 수 없습니다.');

    const lesson = await this.prisma.lectureVideo.findUnique({ where: { id: dto.lessonId } });
    if (!lesson) throw new NotFoundException('강의 영상을 찾을 수 없습니다.');

    const section = subscription.lecture.sections.find((s) => s.id === lesson.lectureSectionId);
    if (!section) throw new NotFoundException('해당 강의에 포함되지 않은 영상입니다.');

    await this.prisma.subscriptionLesson.upsert({
      where: { subscriptionId_lessonId: { subscriptionId, lessonId: dto.lessonId } },
      update: {},
      create: {
        subscriptionId,
        lessonId: dto.lessonId,
      },
    });

    // 완료 영상 수 / 전체 영상 수로 진행률 계산
    const totalLessons = subscription.lecture.sections.reduce(
      (sum, s) => sum + s.videos.length,
      0,
    );
    const completedCount = await this.prisma.subscriptionLesson.count({
      where: { subscriptionId },
    });

    const progress = totalLessons === 0 ? 0 : Math.round((completedCount / totalLessons) * 100);

    return this.prisma.subscription.update({
      where: { id: subscriptionId },
      data: { progress },
      include: { lessons: true },
    });
  }
}
