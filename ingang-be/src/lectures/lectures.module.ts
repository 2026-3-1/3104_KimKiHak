import { Module } from '@nestjs/common';
import { LecturesController } from './lectures.controller';
import { LecturesService } from './lectures.service';
import { YoutubeDurationService } from './youtube-duration.service';

@Module({
  controllers: [LecturesController],
  providers: [LecturesService, YoutubeDurationService],
})
export class LecturesModule {}
