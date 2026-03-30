export class CreateLectureLessonDto {
  title: string;
  durationSec: number;
  youtubeId?: string;
  isPreview?: boolean;
  order: number;
}
