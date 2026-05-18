import { IsInt, IsString, Min } from 'class-validator';

export class CreateSubscriptionDto {
  @IsInt()
  @Min(1)
  lectureId!: number;

  @IsString()
  userId!: string;
}
