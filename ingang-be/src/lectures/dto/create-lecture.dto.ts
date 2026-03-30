export class CreateLectureDto {
  title: string;
  description?: string;
  level?: string;
  thumbnail?: string;
  youtubeId?: string;
  instructorId: string;
}
