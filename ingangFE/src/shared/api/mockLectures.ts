import type { ApiLecture, ApiLectureDetail } from './lectures'

export const mockLectures: ApiLecture[] = [
  {
    id: 1,
    title: '현장 철거/타설 기초 강의',
    description: '현장 철거와 타설 공정의 기초를 안전하게 익히는 입문 강의입니다.',
    level: '입문',
    thumbnail: 'https://img.youtube.com/vi/3GwjfUFyY6M/hqdefault.jpg',
    youtubeId: '3GwjfUFyY6M',
    instructor: { id: '1', name: '강사1' },
    tags: [{ name: '철거/타설' }],
  },
  {
    id: 2,
    title: '전기 배선 안전 교육',
    description: '배선 안전과 전기 설비 관리의 기초를 학습합니다.',
    level: '초급',
    thumbnail: 'https://img.youtube.com/vi/5NV6Rdv1a3I/hqdefault.jpg',
    youtubeId: '5NV6Rdv1a3I',
    instructor: { id: '2', name: '강사2' },
    tags: [{ name: '전기/배선' }],
  },
  {
    id: 3,
    title: '배관 설비 유지보수 실무',
    description: '배관 설비 점검과 유지보수 절차를 단계별로 배웁니다.',
    level: '중급',
    thumbnail: 'https://img.youtube.com/vi/L_jWHffIx5E/hqdefault.jpg',
    youtubeId: 'L_jWHffIx5E',
    instructor: { id: '3', name: '강사3' },
    tags: [{ name: '배관/설비' }],
  },
]

export const mockLectureDetails: Record<number, ApiLectureDetail> = {
  1: {
    id: 1,
    title: '현장 철거/타설 기초 강의',
    description: '현장 철거와 타설 공정의 기초를 안전하게 익히는 입문 강의입니다.',
    level: '입문',
    thumbnail: 'https://img.youtube.com/vi/3GwjfUFyY6M/hqdefault.jpg',
    youtubeId: '3GwjfUFyY6M',
    instructor: { id: '1', name: '강사1' },
    tags: [{ name: '철거/타설' }],
    sections: [
      {
        id: 11,
        title: '강의 소개 및 안전 수칙',
        order: 1,
        videos: [
          {
            id: 101,
            title: '강의 소개',
            durationSec: 180,
            youtubeId: '3GwjfUFyY6M',
            isPreview: true,
            order: 1,
          },
          {
            id: 102,
            title: '현장 안전 수칙',
            durationSec: 420,
            youtubeId: '3GwjfUFyY6M',
            isPreview: false,
            order: 2,
          },
        ],
      },
      {
        id: 12,
        title: '철거/타설 기본 공정',
        order: 2,
        videos: [
          {
            id: 103,
            title: '철거 준비 및 장비',
            durationSec: 360,
            youtubeId: '3GwjfUFyY6M',
            isPreview: false,
            order: 1,
          },
          {
            id: 104,
            title: '타설 공정 흐름 이해',
            durationSec: 540,
            youtubeId: '3GwjfUFyY6M',
            isPreview: false,
            order: 2,
          },
        ],
      },
    ],
    learningGoals: [
      '현장 철거와 타설 공정의 기본 절차를 이해합니다.',
      '안전 관리 포인트와 보호구 사용법을 학습합니다.',
      '철거 준비부터 타설 마무리까지 전체 공정을 확인합니다.',
    ],
    prerequisites: [
      '기본적인 건설 현장 안전 수칙 이해',
      '기초적인 공구 사용 경험',
      '기본적인 작업 흐름을 읽을 수 있는 능력',
    ],
    includes: [
      '실습 중심의 공정 사례',
      '현장 안전 체크리스트',
      '강의 영상 및 자료 제공',
    ],
    reviews: [
      {
        id: 1,
        rating: 5,
        comment: '현장에서 바로 적용할 수 있는 강의였습니다.',
        createdAt: '2026-04-01T10:30:00.000Z',
        user: { id: 's1', name: '김학생' },
      },
      {
        id: 2,
        rating: 4,
        comment: '설명이 명확하고 실습 예제가 좋았습니다.',
        createdAt: '2026-04-03T14:20:00.000Z',
        user: { id: 's2', name: '이학생' },
      },
    ],
  },
  2: {
    id: 2,
    title: '전기 배선 안전 교육',
    description: '배선 안전과 전기 설비 관리의 기초를 학습합니다.',
    level: '초급',
    thumbnail: 'https://img.youtube.com/vi/5NV6Rdv1a3I/hqdefault.jpg',
    youtubeId: '5NV6Rdv1a3I',
    instructor: { id: '2', name: '강사2' },
    tags: [{ name: '전기/배선' }],
    sections: [
      {
        id: 21,
        title: '전기 배선의 기초',
        order: 1,
        videos: [
          {
            id: 201,
            title: '배선 시스템 이해하기',
            durationSec: 300,
            youtubeId: '5NV6Rdv1a3I',
            isPreview: true,
            order: 1,
          },
          {
            id: 202,
            title: '안전 장비와 보호구',
            durationSec: 360,
            youtubeId: '5NV6Rdv1a3I',
            isPreview: false,
            order: 2,
          },
        ],
      },
      {
        id: 22,
        title: '배선 설치 실습',
        order: 2,
        videos: [
          {
            id: 203,
            title: '전선 설치 단계',
            durationSec: 480,
            youtubeId: '5NV6Rdv1a3I',
            isPreview: false,
            order: 1,
          },
          {
            id: 204,
            title: '누전 및 감전 방지',
            durationSec: 420,
            youtubeId: '5NV6Rdv1a3I',
            isPreview: false,
            order: 2,
          },
        ],
      },
    ],
    learningGoals: [
      '배선 안전 규정을 정확히 이해합니다.',
      '안전 보호구와 장비 사용법을 익힙니다.',
      '누전 및 감전 방지 기술을 학습합니다.',
    ],
    prerequisites: [
      '기본적인 전기 용어 이해',
      '전기 배선 작업 경험 또는 학습 준비',
      '안전 규정 준수 의식',
    ],
    includes: [
      '배선 설치 실습 가이드',
      '안전 점검 체크리스트',
      '강의 영상 자료 제공',
    ],
    reviews: [
      {
        id: 3,
        rating: 5,
        comment: '기초를 다시 정리하기에 좋았습니다.',
        createdAt: '2026-04-02T09:15:00.000Z',
        user: { id: 's3', name: '박학생' },
      },
    ],
  },
}
