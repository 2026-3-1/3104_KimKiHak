require('dotenv/config');
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL가 설정되어 있지 않습니다. .env 파일 또는 환경 변수를 확인하세요.');
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

async function main() {
  const instructorEmail = 'instructor@ingang.test';

  const instructor = await prisma.user.upsert({
    where: { email: instructorEmail },
    update: {},
    create: {
      email: instructorEmail,
      name: 'Ingang Instructor',
      passwordHash: 'temporary-password',
      type: 'INSTRUCTOR',
    },
  });

  const studentPrimary = await prisma.user.upsert({
    where: { email: 'student@ingang.test' },
    update: {},
    create: {
      email: 'student@ingang.test',
      name: 'Ingang Student',
      passwordHash: 'temporary-password',
      type: 'STUDENT',
    },
  });

  const studentSecondary = await prisma.user.upsert({
    where: { email: 'student2@ingang.test' },
    update: {},
    create: {
      email: 'student2@ingang.test',
      name: 'Ingang Student 2',
      passwordHash: 'temporary-password',
      type: 'STUDENT',
    },
  });

  await prisma.lecture.deleteMany({
    where: {
      instructorId: instructor.id,
    },
  });

  const lecture = await prisma.lecture.create({
    data: {
      title: '타일 시공 기초: 바닥 준비부터 줄눈까지',
      description:
        '현장 실무 감각을 익히기 위한 타일 시공 기초 강의입니다. 바닥 준비부터 타일 시공, 줄눈 마감까지 따라가며 학습합니다.',
      level: '초급',
      thumbnail: 'https://img.youtube.com/vi/42Xfl3Q0Swc/hqdefault.jpg',
      youtubeId: '42Xfl3Q0Swc',
      learningGoals: [
        '바닥 준비 및 평탄화의 핵심 포인트를 이해합니다.',
        '타일 부착 순서와 기본 공구 사용법을 익힙니다.',
        '줄눈(그라우트) 마감 품질 기준을 설명할 수 있습니다.',
      ],
      prerequisites: [
        '기본적인 공구 사용 경험',
        '현장 안전 수칙에 대한 이해',
      ],
      includes: [
        '영상 4편 풀 커리큘럼',
        '타일 시공 작업 체크리스트',
        '수강 완료 확인용 퀴즈 가이드',
      ],
      instructorId: instructor.id,
      tags: {
        create: [
          { name: '기초기술' },
          { name: '타일' },
          { name: '시공' },
          { name: '바닥' },
          { name: '줄눈' },
        ],
      },
      sections: {
        create: [
          {
            title: '커리큘럼',
            order: 1,
            videos: {
              create: [
                {
                  title: '강의소개',
                  durationSec: 240,
                  youtubeId: '42Xfl3Q0Swc',
                  isPreview: true,
                  order: 1,
                },
                {
                  title: '타일 붙이는 방법 (기초)',
                  durationSec: 600,
                  youtubeId: '8d3i2kX0YcE',
                  isPreview: false,
                  order: 2,
                },
                {
                  title: '줄눈(그라우트) 작업',
                  durationSec: 420,
                  youtubeId: 'U7dF5mVxk0I',
                  isPreview: false,
                  order: 3,
                },
                {
                  title: '바닥 준비 (평탄화)',
                  durationSec: 540,
                  youtubeId: 'V6h9x2zFz0Y',
                  isPreview: false,
                  order: 4,
                },
              ],
            },
          },
        ],
      },
    },
  });

  await prisma.review.createMany({
    data: [
      {
        lectureId: lecture.id,
        userId: studentPrimary.id,
        rating: 5,
        comment: '작업 순서가 명확해서 처음 보는 사람도 이해하기 쉬웠어요.',
      },
      {
        lectureId: lecture.id,
        userId: studentSecondary.id,
        rating: 4,
        comment: '줄눈 작업 팁이 도움됐습니다. 현장 적용하기 좋아요.',
      },
    ],
  });

  console.log('샘플 강의(1개)와 리뷰가 추가되었습니다.');
}

main()
  .catch((error) => {
    console.error('시드 생성 중 오류가 발생했습니다:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
