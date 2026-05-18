import { IsInt, Min } from 'class-validator';

export class CompleteLessonDto {
  @IsInt()
  @Min(1)
  lessonId!: number;
}
