import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { InstructorLecturesController, LecturesController } from './lectures.controller';
import { LecturesService } from './lectures.service';
import { YoutubeDurationService } from './youtube-duration.service';

@Module({
  imports: [AuthModule],
  controllers: [LecturesController, InstructorLecturesController],
  providers: [LecturesService, YoutubeDurationService],
})
export class LecturesModule {}
