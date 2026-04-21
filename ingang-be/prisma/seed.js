require('dotenv/config');
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const https = require('https');

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL가 설정되어 있지 않습니다. .env 파일 또는 환경 변수를 확인하세요.');
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

const fetchText = (url) =>
  new Promise((resolve, reject) => {
    https
      .get(
        url,
        {
          headers: {
            // YouTube가 UA에 따라 다른 HTML을 주는 경우가 있어 브라우저 UA로 고정
            'User-Agent':
              'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
            'Accept-Language': 'ko-KR,ko;q=0.9,en;q=0.8',
          },
        },
        (res) => {
          if (res.statusCode && res.statusCode >= 400) {
            reject(new Error(`HTTP ${res.statusCode}`));
            res.resume();
            return;
          }
          let data = '';
          res.setEncoding('utf8');
          res.on('data', (chunk) => (data += chunk));
          res.on('end', () => resolve(data));
        },
      )
      .on('error', reject);
  });

const getYoutubeDurationSec = async (youtubeId) => {
  if (!youtubeId) throw new Error('youtubeId missing');
  const html = await fetchText(`https://www.youtube.com/watch?v=${encodeURIComponent(youtubeId)}`);

  // watch 페이지 HTML 내에 lengthSeconds가 포함됩니다.
  const match = html.match(/\"lengthSeconds\"\s*:\s*\"(\d+)\"/);
  if (!match) throw new Error('lengthSeconds not found');

  const seconds = Number(match[1]);
  if (!Number.isFinite(seconds) || seconds <= 0) throw new Error('invalid lengthSeconds');
  return seconds;
};

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

  const rawVideos = [
    {
      title: '강의소개',
      youtubeId: '42Xfl3Q0Swc',
      isPreview: true,
      order: 1,
      fallbackDurationSec: 240,
    },
    {
      title: '타일 붙이는 방법 (기초)',
      youtubeId: 'luNpI11x8Ec',
      isPreview: false,
      order: 2,
      fallbackDurationSec: 600,
    },
    {
      title: '줄눈(그라우트) 작업',
      youtubeId: 'K9vpggy-elE',
      isPreview: false,
      order: 3,
      fallbackDurationSec: 420,
    },
    {
      title: '바닥 준비 (평탄화)',
      youtubeId: 'jIDA_a4H1Lg',
      isPreview: false,
      order: 4,
      fallbackDurationSec: 540,
    },
  ];

  const videos = await Promise.all(
    rawVideos.map(async (v) => {
      try {
        const durationSec = await getYoutubeDurationSec(v.youtubeId);
        return { ...v, durationSec };
      } catch (e) {
        console.warn(`[seed] duration fetch failed (${v.youtubeId}), using fallback`, e?.message ?? e);
        return { ...v, durationSec: v.fallbackDurationSec };
      }
    }),
  );

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
                ...videos.map(({ fallbackDurationSec, ...rest }) => rest),
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
