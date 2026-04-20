import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLectureDto } from './dto/create-lecture.dto';
import { UpdateLectureDto } from './dto/update-lecture.dto';
import { AddLectureTagDto } from './dto/add-lecture-tag.dto';
import { CreateLectureSectionDto } from './dto/create-lecture-section.dto';
import { CreateLectureLessonDto } from './dto/create-lecture-lesson.dto';

@Injectable()
export class LecturesService {
  constructor(private readonly prisma: PrismaService) {}

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

  private async ensureLecture(lectureId: number) {
    const lecture = await this.prisma.lecture.findUnique({ where: { id: lectureId } });
    if (!lecture) throw new NotFoundException('강의를 찾을 수 없습니다.');
  }
}
