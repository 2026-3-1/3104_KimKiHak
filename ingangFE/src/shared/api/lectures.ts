import { http } from './http';

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
};

export const getLectures = async () => {
  const response = await http.get<ApiLecture[]>('/lectures');
  return response.data;
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
  const response = await http.get<ApiLectureDetail>(`/lectures/${id}`);
  return response.data;
};
