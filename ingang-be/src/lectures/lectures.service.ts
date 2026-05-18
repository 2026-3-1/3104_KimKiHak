import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AddLectureTagDto } from './dto/add-lecture-tag.dto';
import {
  CreateLectureLessonDto,
  UpdateLectureLessonDto,
} from './dto/create-lecture-lesson.dto';
import {
  CreateLectureSectionDto,
  UpdateLectureSectionDto,
} from './dto/create-lecture-section.dto';
import { CreateLectureDto } from './dto/create-lecture.dto';
import { UpdateLectureDto } from './dto/update-lecture.dto';
import { YoutubeDurationService } from './youtube-duration.service';

type DbClient = PrismaService | Prisma.TransactionClient;

@Injectable()
export class LecturesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly youtubeDuration: YoutubeDurationService,
  ) {}

  async create(dto: CreateLectureDto) {
    const instructorId = dto.instructorId;
    if (!instructorId) {
      throw new BadRequestException('instructorId가 필요합니다.');
    }

    const lectureId = await this.prisma.$transaction(async (tx) => {
      const lecture = await tx.lecture.create({
        data: this.buildLectureCreateData(dto, instructorId),
      });
      await this.upsertPrimaryCategoryTag(tx, lecture.id, dto.category);
      return lecture.id;
    });

    return this.findOne(lectureId);
  }

  async findAll(category?: string) {
    const trimmedCategory = category?.trim();
    const where = trimmedCategory
      ? {
          tags: {
            some: {
              name: {
                contains: trimmedCategory.toLowerCase(),
                mode: Prisma.QueryMode.insensitive,
              },
            },
          },
        }
      : {};

    return this.prisma.lecture.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: this.lectureListInclude(),
    });
  }

  async findOne(id: number) {
    const lecture = await this.prisma.lecture.findUnique({
      where: { id },
      include: this.lectureDetailInclude(),
    });

    if (!lecture) {
      throw new NotFoundException('강의를 찾을 수 없습니다.');
    }

    return lecture;
  }

  async update(id: number, dto: UpdateLectureDto) {
    await this.ensureLecture(id);

    await this.prisma.$transaction(async (tx) => {
      await tx.lecture.update({
        where: { id },
        data: this.buildLectureUpdateData(dto),
      });
      await this.upsertPrimaryCategoryTag(tx, id, dto.category);
    });

    return this.findOne(id);
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
    return this.createSectionRecord(lectureId, dto);
  }

  async addLessonToLecture(lectureId: number, sectionId: number, dto: CreateLectureLessonDto) {
    await this.ensureSectionInLecture(sectionId, lectureId);
    return this.createLessonRecord(sectionId, dto);
  }

  async updateLessonDuration(lessonId: number, durationSec: number) {
    const normalized = Math.floor(Number(durationSec));
    if (!Number.isFinite(normalized) || normalized <= 0 || normalized > 24 * 60 * 60) {
      throw new BadRequestException('유효하지 않은 durationSec 입니다.');
    }

    const lesson = await this.prisma.lectureVideo.findUnique({ where: { id: lessonId } });
    if (!lesson) throw new NotFoundException('강의 영상을 찾을 수 없습니다.');

    if (lesson.durationSec === normalized) return lesson;

    return this.prisma.lectureVideo.update({
      where: { id: lessonId },
      data: { durationSec: normalized },
    });
  }

  async syncLectureDurations(lectureId: number) {
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
        // 기존 durationSec를 유지해도 플레이어 동작은 계속 가능하도록 둡니다.
      }
    }

    return { updatedCount, total: videos.length };
  }

  async findMineLectures(userId: string) {
    return this.prisma.lecture.findMany({
      where: { instructorId: userId },
      orderBy: { createdAt: 'desc' },
      include: this.lectureListInclude(),
    });
  }

  async findMineLecture(userId: string, lectureId: number) {
    await this.ensureOwnLecture(lectureId, userId);
    return this.findOne(lectureId);
  }

  async createInstructorLecture(userId: string, dto: CreateLectureDto) {
    const lectureId = await this.prisma.$transaction(async (tx) => {
      const lecture = await tx.lecture.create({
        data: this.buildLectureCreateData(dto, userId),
      });
      await this.upsertPrimaryCategoryTag(tx, lecture.id, dto.category);
      return lecture.id;
    });

    return this.findMineLecture(userId, lectureId);
  }

  async updateInstructorLecture(userId: string, lectureId: number, dto: UpdateLectureDto) {
    await this.ensureOwnLecture(lectureId, userId);

    await this.prisma.$transaction(async (tx) => {
      await tx.lecture.update({
        where: { id: lectureId },
        data: this.buildLectureUpdateData(dto),
      });
      await this.upsertPrimaryCategoryTag(tx, lectureId, dto.category);
    });

    return this.findMineLecture(userId, lectureId);
  }

  async deleteInstructorLecture(userId: string, lectureId: number) {
    await this.ensureOwnLecture(lectureId, userId);

    const [subscriptionCount, orderItemCount] = await this.prisma.$transaction([
      this.prisma.subscription.count({ where: { lectureId } }),
      this.prisma.orderItem.count({ where: { lectureId } }),
    ]);

    if (subscriptionCount > 0 || orderItemCount > 0) {
      throw new BadRequestException(
        '수강 또는 주문 이력이 있는 강의는 삭제할 수 없습니다.',
      );
    }

    return this.prisma.lecture.delete({ where: { id: lectureId } });
  }

  async createInstructorSection(
    userId: string,
    lectureId: number,
    dto: CreateLectureSectionDto,
  ) {
    await this.ensureOwnLecture(lectureId, userId);
    return this.createSectionRecord(lectureId, dto);
  }

  async updateInstructorSection(
    userId: string,
    sectionId: number,
    dto: UpdateLectureSectionDto,
  ) {
    const section = await this.ensureOwnSection(sectionId, userId);

    await this.prisma.lectureSection.update({
      where: { id: sectionId },
      data: { title: dto.title ?? section.title },
    });

    if (dto.order && dto.order !== section.order) {
      await this.moveSectionTo(section.lectureId, sectionId, dto.order);
    }

    return this.prisma.lectureSection.findUnique({
      where: { id: sectionId },
      include: { videos: { orderBy: { order: 'asc' } } },
    });
  }

  async deleteInstructorSection(userId: string, sectionId: number) {
    const section = await this.ensureOwnSection(sectionId, userId);
    await this.ensureSectionDeletionAllowed(sectionId);

    await this.prisma.lectureSection.delete({ where: { id: sectionId } });
    await this.normalizeSectionOrders(section.lectureId);

    return { ok: true };
  }

  async moveInstructorSectionUp(userId: string, sectionId: number) {
    const section = await this.ensureOwnSection(sectionId, userId);
    await this.swapSection(section.lectureId, sectionId, -1);
    return this.findMineLecture(userId, section.lectureId);
  }

  async moveInstructorSectionDown(userId: string, sectionId: number) {
    const section = await this.ensureOwnSection(sectionId, userId);
    await this.swapSection(section.lectureId, sectionId, 1);
    return this.findMineLecture(userId, section.lectureId);
  }

  async createInstructorLesson(
    userId: string,
    sectionId: number,
    dto: CreateLectureLessonDto,
  ) {
    await this.ensureOwnSection(sectionId, userId);
    return this.createLessonRecord(sectionId, dto);
  }

  async updateInstructorLesson(
    userId: string,
    lessonId: number,
    dto: UpdateLectureLessonDto,
  ) {
    const lesson = await this.ensureOwnLesson(lessonId, userId);

    await this.prisma.lectureVideo.update({
      where: { id: lessonId },
      data: {
        title: dto.title ?? lesson.title,
        durationSec: dto.durationSec ?? lesson.durationSec,
        youtubeId: dto.youtubeId ?? lesson.youtubeId,
        isPreview: dto.isPreview ?? lesson.isPreview,
      },
    });

    if (dto.order && dto.order !== lesson.order) {
      await this.moveLessonTo(lesson.lectureSectionId, lessonId, dto.order);
    }

    return this.prisma.lectureVideo.findUnique({ where: { id: lessonId } });
  }

  async deleteInstructorLesson(userId: string, lessonId: number) {
    const lesson = await this.ensureOwnLesson(lessonId, userId);
    await this.ensureLessonDeletionAllowed(lessonId);

    await this.prisma.lectureVideo.delete({ where: { id: lessonId } });
    await this.normalizeLessonOrders(lesson.lectureSectionId);

    return { ok: true };
  }

  async moveInstructorLessonUp(userId: string, lessonId: number) {
    const lesson = await this.ensureOwnLesson(lessonId, userId);
    await this.swapLesson(lesson.lectureSectionId, lessonId, -1);
    return this.prisma.lectureVideo.findUnique({ where: { id: lessonId } });
  }

  async moveInstructorLessonDown(userId: string, lessonId: number) {
    const lesson = await this.ensureOwnLesson(lessonId, userId);
    await this.swapLesson(lesson.lectureSectionId, lessonId, 1);
    return this.prisma.lectureVideo.findUnique({ where: { id: lessonId } });
  }

  async syncInstructorLectureDurations(userId: string, lectureId: number) {
    await this.ensureOwnLecture(lectureId, userId);
    return this.syncLectureDurations(lectureId);
  }

  async getEnrollments(userId: string, lectureId: number) {
    await this.ensureOwnLecture(lectureId, userId);

    const enrollments = await this.prisma.subscription.findMany({
      where: { lectureId },
      orderBy: { enrolledAt: 'desc' },
      include: { user: { select: { id: true, name: true, email: true } } },
    });

    return {
      totalCount: enrollments.length,
      enrollments: enrollments.map((e) => ({
        enrollmentId: e.id,
        student: { userId: e.userId, nickname: e.user.name, email: e.user.email },
        enrolledAt: e.enrolledAt,
      })),
    };
  }

  async removeEnrollment(userId: string, lectureId: number, enrollmentId: number) {
    await this.ensureOwnLecture(lectureId, userId);

    const enrollment = await this.prisma.subscription.findUnique({
      where: { id: enrollmentId },
    });

    if (!enrollment || enrollment.lectureId !== lectureId) {
      throw new NotFoundException('수강 정보를 찾을 수 없습니다.');
    }

    await this.prisma.subscription.delete({ where: { id: enrollmentId } });
  }

  private lectureListInclude() {
    return {
      tags: true,
      instructor: { select: { id: true, name: true } },
      sections: {
        include: {
          videos: { select: { durationSec: true } },
        },
      },
    } satisfies Prisma.LectureInclude;
  }

  private lectureDetailInclude() {
    return {
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
    } satisfies Prisma.LectureInclude;
  }

  private buildLectureCreateData(
    dto: CreateLectureDto,
    instructorId: string,
  ): Prisma.LectureUncheckedCreateInput {
    return {
      title: dto.title,
      description: dto.description,
      descriptionDetail: dto.descriptionDetail,
      level: dto.difficulty ?? dto.level,
      thumbnail: dto.thumbnail,
      youtubeId: dto.youtubeId,
      price: dto.price ?? 0,
      learningGoals: this.normalizeStringArray(dto.learningGoals),
      prerequisites: this.normalizeStringArray(dto.prerequisites),
      includes: this.normalizeStringArray(dto.includes),
      instructorId,
    };
  }

  private buildLectureUpdateData(dto: UpdateLectureDto): Prisma.LectureUpdateInput {
    const data: Prisma.LectureUpdateInput = {};

    if (dto.title !== undefined) data.title = dto.title;
    if (dto.description !== undefined) data.description = dto.description;
    if (dto.descriptionDetail !== undefined) {
      data.descriptionDetail = dto.descriptionDetail;
    }
    if (dto.difficulty !== undefined || dto.level !== undefined) {
      data.level = dto.difficulty ?? dto.level;
    }
    if (dto.thumbnail !== undefined) data.thumbnail = dto.thumbnail;
    if (dto.youtubeId !== undefined) data.youtubeId = dto.youtubeId;
    if (dto.price !== undefined) data.price = dto.price;
    if (dto.learningGoals !== undefined) {
      data.learningGoals = this.normalizeStringArray(dto.learningGoals);
    }
    if (dto.prerequisites !== undefined) {
      data.prerequisites = this.normalizeStringArray(dto.prerequisites);
    }
    if (dto.includes !== undefined) {
      data.includes = this.normalizeStringArray(dto.includes);
    }

    return data;
  }

  private normalizeStringArray(values?: string[]) {
    return (values ?? [])
      .map((value) => value.trim())
      .filter((value) => value.length > 0);
  }

  private async createSectionRecord(lectureId: number, dto: CreateLectureSectionDto) {
    const order = dto.order ?? (await this.nextSectionOrder(lectureId));
    const section = await this.prisma.lectureSection.create({
      data: {
        lectureId,
        title: dto.title,
        order,
      },
    });

    await this.normalizeSectionOrders(lectureId);
    if (dto.order && dto.order !== section.order) {
      await this.moveSectionTo(lectureId, section.id, dto.order);
    }

    return this.prisma.lectureSection.findUnique({
      where: { id: section.id },
      include: { videos: { orderBy: { order: 'asc' } } },
    });
  }

  private async createLessonRecord(sectionId: number, dto: CreateLectureLessonDto) {
    const order = dto.order ?? (await this.nextLessonOrder(sectionId));
    const lesson = await this.prisma.lectureVideo.create({
      data: {
        lectureSectionId: sectionId,
        title: dto.title,
        durationSec: dto.durationSec,
        youtubeId: dto.youtubeId,
        isPreview: dto.isPreview ?? false,
        order,
      },
    });

    await this.normalizeLessonOrders(sectionId);
    if (dto.order && dto.order !== lesson.order) {
      await this.moveLessonTo(sectionId, lesson.id, dto.order);
    }

    return this.prisma.lectureVideo.findUnique({ where: { id: lesson.id } });
  }

  private async nextSectionOrder(lectureId: number) {
    const count = await this.prisma.lectureSection.count({ where: { lectureId } });
    return count + 1;
  }

  private async nextLessonOrder(sectionId: number) {
    const count = await this.prisma.lectureVideo.count({
      where: { lectureSectionId: sectionId },
    });
    return count + 1;
  }

  private async normalizeSectionOrders(lectureId: number) {
    const sections = await this.prisma.lectureSection.findMany({
      where: { lectureId },
      orderBy: [{ order: 'asc' }, { id: 'asc' }],
      select: { id: true },
    });

    await this.prisma.$transaction(
      sections.map((section, index) =>
        this.prisma.lectureSection.update({
          where: { id: section.id },
          data: { order: index + 1 },
        }),
      ),
    );
  }

  private async normalizeLessonOrders(sectionId: number) {
    const lessons = await this.prisma.lectureVideo.findMany({
      where: { lectureSectionId: sectionId },
      orderBy: [{ order: 'asc' }, { id: 'asc' }],
      select: { id: true },
    });

    await this.prisma.$transaction(
      lessons.map((lesson, index) =>
        this.prisma.lectureVideo.update({
          where: { id: lesson.id },
          data: { order: index + 1 },
        }),
      ),
    );
  }

  private async moveSectionTo(lectureId: number, sectionId: number, requestedOrder: number) {
    await this.normalizeSectionOrders(lectureId);

    const sections = await this.prisma.lectureSection.findMany({
      where: { lectureId },
      orderBy: { order: 'asc' },
    });
    const index = sections.findIndex((section) => section.id === sectionId);
    if (index < 0) return;

    const [section] = sections.splice(index, 1);
    const targetIndex = Math.max(0, Math.min(requestedOrder - 1, sections.length));
    sections.splice(targetIndex, 0, section);

    await this.prisma.$transaction(
      sections.map((item, idx) =>
        this.prisma.lectureSection.update({
          where: { id: item.id },
          data: { order: idx + 1 },
        }),
      ),
    );
  }

  private async moveLessonTo(sectionId: number, lessonId: number, requestedOrder: number) {
    await this.normalizeLessonOrders(sectionId);

    const lessons = await this.prisma.lectureVideo.findMany({
      where: { lectureSectionId: sectionId },
      orderBy: { order: 'asc' },
    });
    const index = lessons.findIndex((lesson) => lesson.id === lessonId);
    if (index < 0) return;

    const [lesson] = lessons.splice(index, 1);
    const targetIndex = Math.max(0, Math.min(requestedOrder - 1, lessons.length));
    lessons.splice(targetIndex, 0, lesson);

    await this.prisma.$transaction(
      lessons.map((item, idx) =>
        this.prisma.lectureVideo.update({
          where: { id: item.id },
          data: { order: idx + 1 },
        }),
      ),
    );
  }

  private async swapSection(lectureId: number, sectionId: number, offset: -1 | 1) {
    await this.normalizeSectionOrders(lectureId);
    const sections = await this.prisma.lectureSection.findMany({
      where: { lectureId },
      orderBy: { order: 'asc' },
    });
    const currentIndex = sections.findIndex((section) => section.id === sectionId);
    const swapIndex = currentIndex + offset;

    if (currentIndex < 0 || swapIndex < 0 || swapIndex >= sections.length) {
      return;
    }

    const current = sections[currentIndex];
    const adjacent = sections[swapIndex];

    await this.prisma.$transaction([
      this.prisma.lectureSection.update({
        where: { id: current.id },
        data: { order: adjacent.order },
      }),
      this.prisma.lectureSection.update({
        where: { id: adjacent.id },
        data: { order: current.order },
      }),
    ]);
  }

  private async swapLesson(sectionId: number, lessonId: number, offset: -1 | 1) {
    await this.normalizeLessonOrders(sectionId);
    const lessons = await this.prisma.lectureVideo.findMany({
      where: { lectureSectionId: sectionId },
      orderBy: { order: 'asc' },
    });
    const currentIndex = lessons.findIndex((lesson) => lesson.id === lessonId);
    const swapIndex = currentIndex + offset;

    if (currentIndex < 0 || swapIndex < 0 || swapIndex >= lessons.length) {
      return;
    }

    const current = lessons[currentIndex];
    const adjacent = lessons[swapIndex];

    await this.prisma.$transaction([
      this.prisma.lectureVideo.update({
        where: { id: current.id },
        data: { order: adjacent.order },
      }),
      this.prisma.lectureVideo.update({
        where: { id: adjacent.id },
        data: { order: current.order },
      }),
    ]);
  }

  private async ensureOwnLecture(lectureId: number, userId: string) {
    const lecture = await this.prisma.lecture.findUnique({ where: { id: lectureId } });
    if (!lecture) {
      throw new NotFoundException('강의를 찾을 수 없습니다.');
    }
    if (lecture.instructorId !== userId) {
      throw new ForbiddenException('본인 강의만 관리할 수 있습니다.');
    }
    return lecture;
  }

  private async ensureOwnSection(sectionId: number, userId: string) {
    const section = await this.prisma.lectureSection.findUnique({
      where: { id: sectionId },
      include: { lecture: true },
    });
    if (!section) {
      throw new NotFoundException('섹션을 찾을 수 없습니다.');
    }
    if (section.lecture.instructorId !== userId) {
      throw new ForbiddenException('본인 강의의 섹션만 관리할 수 있습니다.');
    }
    return section;
  }

  private async ensureOwnLesson(lessonId: number, userId: string) {
    const lesson = await this.prisma.lectureVideo.findUnique({
      where: { id: lessonId },
      include: { section: { include: { lecture: true } } },
    });
    if (!lesson) {
      throw new NotFoundException('레슨을 찾을 수 없습니다.');
    }
    if (lesson.section.lecture.instructorId !== userId) {
      throw new ForbiddenException('본인 강의의 레슨만 관리할 수 있습니다.');
    }
    return lesson;
  }

  private async ensureSectionDeletionAllowed(sectionId: number) {
    const [lessonProgressCount, bookmarkCount] = await this.prisma.$transaction([
      this.prisma.subscriptionLesson.count({
        where: { lesson: { lectureSectionId: sectionId } },
      }),
      this.prisma.bookmark.count({
        where: { lesson: { lectureSectionId: sectionId } },
      }),
    ]);

    if (lessonProgressCount > 0 || bookmarkCount > 0) {
      throw new BadRequestException(
        '수강 진도 데이터가 있는 섹션은 삭제할 수 없습니다.',
      );
    }
  }

  private async ensureLessonDeletionAllowed(lessonId: number) {
    const [lessonProgressCount, bookmarkCount] = await this.prisma.$transaction([
      this.prisma.subscriptionLesson.count({ where: { lessonId } }),
      this.prisma.bookmark.count({ where: { lessonId } }),
    ]);

    if (lessonProgressCount > 0 || bookmarkCount > 0) {
      throw new BadRequestException(
        '수강 진도 데이터가 있는 레슨은 삭제할 수 없습니다.',
      );
    }
  }

  private async ensureSectionInLecture(sectionId: number, lectureId: number) {
    const section = await this.prisma.lectureSection.findUnique({ where: { id: sectionId } });
    if (!section || section.lectureId !== lectureId) {
      throw new NotFoundException('섹션을 찾을 수 없습니다.');
    }
    return section;
  }

  private async ensureLecture(lectureId: number) {
    const lecture = await this.prisma.lecture.findUnique({ where: { id: lectureId } });
    if (!lecture) throw new NotFoundException('강의를 찾을 수 없습니다.');
    return lecture;
  }

  private async upsertPrimaryCategoryTag(
    db: DbClient,
    lectureId: number,
    category?: string,
  ) {
    const normalized = category?.trim();
    if (!normalized) return;

    const existingTags = await db.lectureTag.findMany({
      where: { lectureId },
      orderBy: { id: 'asc' },
    });

    if (existingTags.length === 0) {
      await db.lectureTag.create({
        data: { lectureId, name: normalized },
      });
      return;
    }

    await db.lectureTag.update({
      where: { id: existingTags[0].id },
      data: { name: normalized },
    });
  }
}
