import { Injectable, NotFoundException } from '@nestjs/common';
import { BadRequestException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLectureDto } from './dto/create-lecture.dto';
import { UpdateLectureDto } from './dto/update-lecture.dto';
import { AddLectureTagDto } from './dto/add-lecture-tag.dto';
import { CreateLectureSectionDto } from './dto/create-lecture-section.dto';
import { CreateLectureLessonDto } from './dto/create-lecture-lesson.dto';
import { YoutubeDurationService } from './youtube-duration.service';

@Injectable()
export class LecturesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly youtubeDuration: YoutubeDurationService,
  ) {}

  async create(dto: CreateLectureDto) {
    const lecture = await this.prisma.lecture.create({
      data: {
        title: dto.title,
        description: dto.description,
        level: dto.level,
        thumbnail: dto.thumbnail,
        youtubeId: dto.youtubeId,
        instructorId: dto.instructorId,
      },
    });
    return lecture;
  }

  async findAll(category?: string) {
    const where = category
      ? {
          tags: {
            some: {
              name: {
                contains: category.toLowerCase(),
                mode: Prisma.QueryMode.insensitive,
              },
            },
          },
        }
      : {};

    return this.prisma.lecture.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        tags: true,
        instructor: { select: { id: true, name: true } },
        sections: {
          include: {
            videos: { select: { durationSec: true } },
          },
        },
      },
    });
  }

  async findOne(id: number) {
    // FE에서 사용하는 커리큘럼(섹션/영상)과 리뷰를 한번에 내려줍니다.
    const lecture = await this.prisma.lecture.findUnique({
      where: { id },
      include: {
        tags: true,
        instructor: { select: { id: true, name: true } },
        sections: {
          orderBy: { order: 'asc' },
          include: {
            videos: { orderBy: { order: 'asc' } },
          },
        },
        reviews: {
          orderBy: { createdAt: 'desc' },
          include: { user: { select: { id: true, name: true } } },
        },
      },
    });

    if (!lecture) throw new NotFoundException('강의를 찾을 수 없습니다.');
    return lecture;
  }

  async update(id: number, dto: UpdateLectureDto) {
    return this.prisma.lecture.update({
      where: { id },
      data: {
        title: dto.title,
        description: dto.description,
        level: dto.level,
        thumbnail: dto.thumbnail,
        youtubeId: dto.youtubeId,
      },
    });
  }

  async addTag(lectureId: number, dto: AddLectureTagDto) {
    await this.ensureLecture(lectureId);
    return this.prisma.lectureTag.create({
      data: {
        lectureId,
        name: dto.name,
      },
    });
  }

  async addSection(lectureId: number, dto: CreateLectureSectionDto) {
    await this.ensureLecture(lectureId);
    return this.prisma.lectureSection.create({
      data: {
        lectureId,
        title: dto.title,
        order: dto.order,
      },
    });
  }

  async addLessonToLecture(lectureId: number, sectionId: number, dto: CreateLectureLessonDto) {
    const section = await this.prisma.lectureSection.findUnique({ where: { id: sectionId } });
    if (!section || section.lectureId !== lectureId) {
      throw new NotFoundException('섹션을 찾을 수 없습니다.');
    }

    return this.prisma.lectureVideo.create({
      data: {
        lectureSectionId: sectionId,
        title: dto.title,
        durationSec: dto.durationSec,
        youtubeId: dto.youtubeId,
        isPreview: dto.isPreview ?? false,
        order: dto.order,
      },
    });
  }

  async updateLessonDuration(lessonId: number, durationSec: number) {
    const normalized = Math.floor(Number(durationSec));
    if (!Number.isFinite(normalized) || normalized <= 0 || normalized > 24 * 60 * 60) {
      throw new BadRequestException('유효하지 않은 durationSec 입니다.');
    }

    const lesson = await this.prisma.lectureVideo.findUnique({ where: { id: lessonId } });
    if (!lesson) throw new NotFoundException('강의 영상을 찾을 수 없습니다.');

    // 불필요한 DB write 방지
    if (lesson.durationSec === normalized) return lesson;

    return this.prisma.lectureVideo.update({
      where: { id: lessonId },
      data: { durationSec: normalized },
    });
  }

  async syncLectureDurations(lectureId: number) {
    // 플레이어 없이도 항상 정확한 durationSec를 보장하기 위한 서버 동기화
    const videos = await this.prisma.lectureVideo.findMany({
      where: { section: { lectureId } },
      select: { id: true, youtubeId: true, durationSec: true },
      orderBy: { id: 'asc' },
    });

    let updatedCount = 0;

    for (const video of videos) {
      if (!video.youtubeId) continue;
      try {
        const actual = await this.youtubeDuration.getDurationSec(video.youtubeId);
        if (Math.abs(actual - video.durationSec) <= 1) continue;

        await this.prisma.lectureVideo.update({
          where: { id: video.id },
          data: { durationSec: actual },
        });
        updatedCount += 1;
      } catch {
        // 동기화 실패는 화면을 막지 않도록 무시 (기존 durationSec 사용)
      }
    }

    return { updatedCount, total: videos.length };
  }

  private async ensureLecture(lectureId: number) {
    const lecture = await this.prisma.lecture.findUnique({ where: { id: lectureId } });
    if (!lecture) throw new NotFoundException('강의를 찾을 수 없습니다.');
  }
}
