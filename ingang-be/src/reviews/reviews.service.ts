import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';

@Injectable()
export class ReviewsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateReviewDto) {
    const existing = await this.prisma.review.findFirst({
      where: { lectureId: dto.lectureId, userId: dto.userId },
    });
    if (existing) {
      throw new BadRequestException('이미 작성한 후기가 있습니다.');
    }

    const subscription = await this.prisma.subscription.findUnique({
      where: { lectureId_userId: { lectureId: dto.lectureId, userId: dto.userId } },
      include: {
        lecture: {
          include: {
            sections: { include: { videos: true } },
          },
        },
      },
    });
    if (!subscription) {
      throw new ForbiddenException('수강신청한 강의에만 후기를 작성할 수 있습니다.');
    }

    const totalLessons = subscription.lecture.sections.reduce(
      (sum, section) => sum + section.videos.length,
      0,
    );
    const completedCount = await this.prisma.subscriptionLesson.count({
      where: { subscriptionId: subscription.id },
    });

    if (totalLessons > 0 && completedCount < totalLessons) {
      throw new ForbiddenException('완강한 강의에만 후기를 작성할 수 있습니다.');
    }

    return this.prisma.review.create({
      data: {
        lectureId: dto.lectureId,
        userId: dto.userId,
        rating: dto.rating,
        comment: dto.comment,
      },
    });
  }

  async findByLecture(lectureId: number) {
    return this.prisma.review.findMany({
      where: { lectureId },
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { id: true, name: true } } },
    });
  }

  async update(id: number, dto: UpdateReviewDto) {
    const review = await this.prisma.review.findUnique({ where: { id } });
    if (!review) throw new NotFoundException('후기를 찾을 수 없습니다.');

    return this.prisma.review.update({
      where: { id },
      data: {
        rating: dto.rating,
        comment: dto.comment,
      },
    });
  }

  async remove(id: number) {
    const review = await this.prisma.review.findUnique({ where: { id } });
    if (!review) throw new NotFoundException('후기를 찾을 수 없습니다.');

    return this.prisma.review.delete({ where: { id } });
  }
}
