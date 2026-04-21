import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post, Query } from '@nestjs/common';
import { LecturesService } from './lectures.service';
import { CreateLectureDto } from './dto/create-lecture.dto';
import { UpdateLectureDto } from './dto/update-lecture.dto';
import { AddLectureTagDto } from './dto/add-lecture-tag.dto';
import { CreateLectureSectionDto } from './dto/create-lecture-section.dto';
import { CreateLectureLessonDto } from './dto/create-lecture-lesson.dto';
import { UpdateLessonDurationDto } from './dto/update-lesson-duration.dto';

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
