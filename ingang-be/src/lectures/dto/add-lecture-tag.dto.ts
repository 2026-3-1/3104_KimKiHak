import { IsString, MinLength } from 'class-validator';

export class AddLectureTagDto {
  @IsString()
  @MinLength(1)
  name: string;
}
