import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  Min,
  MinLength,
} from 'class-validator';

export class CreateLectureLessonDto {
  @IsString()
  @MinLength(1)
  title: string;

  @IsInt()
  @Min(1)
  durationSec: number;

  @IsOptional()
  @IsString()
  youtubeId?: string;

  @IsOptional()
  @IsBoolean()
  isPreview?: boolean;

  @IsOptional()
  @IsInt()
  @Min(1)
  order?: number;
}

export class UpdateLectureLessonDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  title?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  durationSec?: number;

  @IsOptional()
  @IsString()
  youtubeId?: string;

  @IsOptional()
  @IsBoolean()
  isPreview?: boolean;

  @IsOptional()
  @IsInt()
  @Min(1)
  order?: number;
}
