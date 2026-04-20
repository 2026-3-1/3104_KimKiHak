import { http } from './http';
// [주석처리] mock 데이터 import (백엔드 연동 완료 후 불필요)
// import { mockLectures, mockLectureDetails } from './mockLectures';

export type LectureTag = { name: string };

export type LectureInstructor = {
  id: string;
  name: string;
};

export type ApiLecture = {
  id: number;
  title: string;
  description?: string | null;
  level?: string | null;
  thumbnail?: string | null;
  youtubeId?: string | null;
  instructor?: LectureInstructor | null;
  tags?: LectureTag[];
  learningGoals?: string[] | null;
  prerequisites?: string[] | null;
  includes?: string[] | null;
};

export const getLectures = async (category?: string) => {
  const url = category ? `/lectures?category=${encodeURIComponent(category)}` : '/lectures';

  try {
    const response = await http.get<ApiLecture[]>(url);
    return response.data;
  } catch (error) {
    // [주석처리] mock 데이터 fallback (백엔드 연동 완료)
    // console.warn('getLectures API 실패, 임시 mock 데이터를 사용합니다.', error);
    // if (!category) { return mockLectures; }
    // return mockLectures.filter((lecture) => lecture.tags.some((tag) => tag.name.toLowerCase().includes(category.toLowerCase())));
    throw error;
  }
};

export type ApiLectureVideo = {
  id: number;
  title: string;
  durationSec: number;
  youtubeId?: string | null;
  isPreview?: boolean | null;
  order: number;
};

export type ApiLectureSection = {
  id: number;
  title: string;
  order: number;
  videos: ApiLectureVideo[];
};

export type ApiLectureReview = {
  id: number;
  rating: number;
  comment: string;
  createdAt: string;
  user?: {
    id: string;
    name: string;
  } | null;
};

export type ApiLectureDetail = ApiLecture & {
  sections: ApiLectureSection[];
  reviews: ApiLectureReview[];
};

export const getLecture = async (id: number) => {
  try {
    const response = await http.get<ApiLectureDetail>(`/lectures/${id}`);
    return response.data;
  } catch (error) {
    // [주석처리] mock 데이터 fallback (백엔드 연동 완료)
    // console.warn(`getLecture(${id}) API 실패, 임시 mock 강의 상세 데이터를 사용합니다.`, error);
    // if (mockLectureDetails[id]) { return mockLectureDetails[id]; }
    throw error;
  }
};
