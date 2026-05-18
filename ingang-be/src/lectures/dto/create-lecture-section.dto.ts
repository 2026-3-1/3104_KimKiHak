import { IsInt, IsOptional, IsString, Min, MinLength } from 'class-validator';

export class CreateLectureSectionDto {
  @IsString()
  @MinLength(1)
  title: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  order?: number;
}

export class UpdateLectureSectionDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  title?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  order?: number;
}
