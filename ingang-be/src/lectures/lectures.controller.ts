import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { UserAuthGuard, UserJwtPayload } from '../auth/user-auth.guard';
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
import { UpdateLessonDurationDto } from './dto/update-lesson-duration.dto';
import { LecturesService } from './lectures.service';

type AuthenticatedRequest = Request & {
  user: UserJwtPayload;
};

@Controller('lectures')
export class LecturesController {
  constructor(private readonly lecturesService: LecturesService) {}

  @Post()
  create(@Body() dto: CreateLectureDto) {
    return this.lecturesService.create(dto);
  }

  @Get()
  findAll(@Query('category') category?: string) {
    return this.lecturesService.findAll(category);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.lecturesService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateLectureDto) {
    return this.lecturesService.update(id, dto);
  }

  @Post(':id/tags')
  addTag(@Param('id', ParseIntPipe) id: number, @Body() dto: AddLectureTagDto) {
    return this.lecturesService.addTag(id, dto);
  }

  @Post(':id/sections')
  addSection(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CreateLectureSectionDto,
  ) {
    return this.lecturesService.addSection(id, dto);
  }

  @Post(':id/sections/:sectionId/lessons')
  addLesson(
    @Param('id', ParseIntPipe) id: number,
    @Param('sectionId', ParseIntPipe) sectionId: number,
    @Body() dto: CreateLectureLessonDto,
  ) {
    return this.lecturesService.addLessonToLecture(id, sectionId, dto);
  }

  @Patch('lessons/:lessonId/duration')
  updateLessonDuration(
    @Param('lessonId', ParseIntPipe) lessonId: number,
    @Body() dto: UpdateLessonDurationDto,
  ) {
    return this.lecturesService.updateLessonDuration(lessonId, dto.durationSec);
  }

  @Post(':id/sync-durations')
  syncDurations(@Param('id', ParseIntPipe) id: number) {
    return this.lecturesService.syncLectureDurations(id);
  }
}

@Controller('instructor')
@UseGuards(UserAuthGuard)
export class InstructorLecturesController {
  constructor(private readonly lecturesService: LecturesService) {}

  @Get('lectures')
  findMine(@Req() req: AuthenticatedRequest) {
    return this.lecturesService.findMineLectures(this.instructorId(req));
  }

  @Get('lectures/:id')
  findMineOne(
    @Req() req: AuthenticatedRequest,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.lecturesService.findMineLecture(this.instructorId(req), id);
  }

  @Post('lectures')
  createLecture(@Req() req: AuthenticatedRequest, @Body() dto: CreateLectureDto) {
    return this.lecturesService.createInstructorLecture(this.instructorId(req), dto);
  }

  @Put('lectures/:id')
  updateLecture(
    @Req() req: AuthenticatedRequest,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateLectureDto,
  ) {
    return this.lecturesService.updateInstructorLecture(this.instructorId(req), id, dto);
  }

  @Delete('lectures/:id')
  deleteLecture(
    @Req() req: AuthenticatedRequest,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.lecturesService.deleteInstructorLecture(this.instructorId(req), id);
  }

  @Post('lectures/:id/sections')
  createSection(
    @Req() req: AuthenticatedRequest,
    @Param('id', ParseIntPipe) lectureId: number,
    @Body() dto: CreateLectureSectionDto,
  ) {
    return this.lecturesService.createInstructorSection(
      this.instructorId(req),
      lectureId,
      dto,
    );
  }

  @Put('sections/:sectionId')
  updateSection(
    @Req() req: AuthenticatedRequest,
    @Param('sectionId', ParseIntPipe) sectionId: number,
    @Body() dto: UpdateLectureSectionDto,
  ) {
    return this.lecturesService.updateInstructorSection(
      this.instructorId(req),
      sectionId,
      dto,
    );
  }

  @Delete('sections/:sectionId')
  deleteSection(
    @Req() req: AuthenticatedRequest,
    @Param('sectionId', ParseIntPipe) sectionId: number,
  ) {
    return this.lecturesService.deleteInstructorSection(this.instructorId(req), sectionId);
  }

  @Post('sections/:sectionId/move-up')
  moveSectionUp(
    @Req() req: AuthenticatedRequest,
    @Param('sectionId', ParseIntPipe) sectionId: number,
  ) {
    return this.lecturesService.moveInstructorSectionUp(this.instructorId(req), sectionId);
  }

  @Post('sections/:sectionId/move-down')
  moveSectionDown(
    @Req() req: AuthenticatedRequest,
    @Param('sectionId', ParseIntPipe) sectionId: number,
  ) {
    return this.lecturesService.moveInstructorSectionDown(this.instructorId(req), sectionId);
  }

  @Post('sections/:sectionId/lessons')
  createLesson(
    @Req() req: AuthenticatedRequest,
    @Param('sectionId', ParseIntPipe) sectionId: number,
    @Body() dto: CreateLectureLessonDto,
  ) {
    return this.lecturesService.createInstructorLesson(
      this.instructorId(req),
      sectionId,
      dto,
    );
  }

  @Put('lessons/:lessonId')
  updateLesson(
    @Req() req: AuthenticatedRequest,
    @Param('lessonId', ParseIntPipe) lessonId: number,
    @Body() dto: UpdateLectureLessonDto,
  ) {
    return this.lecturesService.updateInstructorLesson(
      this.instructorId(req),
      lessonId,
      dto,
    );
  }

  @Delete('lessons/:lessonId')
  deleteLesson(
    @Req() req: AuthenticatedRequest,
    @Param('lessonId', ParseIntPipe) lessonId: number,
  ) {
    return this.lecturesService.deleteInstructorLesson(this.instructorId(req), lessonId);
  }

  @Post('lessons/:lessonId/move-up')
  moveLessonUp(
    @Req() req: AuthenticatedRequest,
    @Param('lessonId', ParseIntPipe) lessonId: number,
  ) {
    return this.lecturesService.moveInstructorLessonUp(this.instructorId(req), lessonId);
  }

  @Post('lessons/:lessonId/move-down')
  moveLessonDown(
    @Req() req: AuthenticatedRequest,
    @Param('lessonId', ParseIntPipe) lessonId: number,
  ) {
    return this.lecturesService.moveInstructorLessonDown(this.instructorId(req), lessonId);
  }

  @Get('lectures/:id/enrollments')
  getEnrollments(
    @Req() req: AuthenticatedRequest,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.lecturesService.getEnrollments(this.instructorId(req), id);
  }

  @Delete('lectures/:id/enrollments/:enrollmentId')
  @HttpCode(204)
  removeEnrollment(
    @Req() req: AuthenticatedRequest,
    @Param('id', ParseIntPipe) id: number,
    @Param('enrollmentId', ParseIntPipe) enrollmentId: number,
  ) {
    return this.lecturesService.removeEnrollment(this.instructorId(req), id, enrollmentId);
  }

  @Post('lectures/:id/sync-durations')
  syncMineDurations(
    @Req() req: AuthenticatedRequest,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.lecturesService.syncInstructorLectureDurations(this.instructorId(req), id);
  }

  private instructorId(req: AuthenticatedRequest) {
    if (req.user.role !== 'INSTRUCTOR') {
      throw new ForbiddenException('강사 권한이 필요합니다.');
    }
    return req.user.sub;
  }
}
