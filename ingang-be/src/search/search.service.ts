import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SearchQueryDto } from './dto/search-query.dto';

@Injectable()
export class SearchService {
  constructor(private readonly prisma: PrismaService) {}

  async searchLectures(query: SearchQueryDto) {
    const q = query.q?.trim();
    const tag = query.tag?.trim();
    const level = query.level?.trim();

    // 제목/설명/강사명/태그를 대상으로 간단 검색
    return this.prisma.lecture.findMany({
      where: {
        AND: [
          q
            ? {
                OR: [
                  { title: { contains: q } },
                  { description: { contains: q } },
                  { instructor: { name: { contains: q } } },
                  { tags: { some: { name: { contains: q } } } },
                ],
              }
            : {},
          tag ? { tags: { some: { name: { contains: tag } } } } : {},
          level ? { level: { contains: level } } : {},
        ],
      },
      include: {
        tags: true,
        instructor: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
