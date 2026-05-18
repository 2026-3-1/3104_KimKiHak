import { IsInt, Min } from 'class-validator';

export class UpdateLessonDurationDto {
  @IsInt()
  @Min(1)
  durationSec!: number;
}
