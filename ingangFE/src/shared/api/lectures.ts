import { http } from './http';

export type LectureTag = { id?: number; name: string };

export type LectureInstructor = {
  id: string;
  name: string;
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

export type ApiLecture = {
  id: number;
  title: string;
  description?: string | null;
  descriptionDetail?: string | null;
  level?: string | null;
  thumbnail?: string | null;
  youtubeId?: string | null;
  price: number;
  instructor?: LectureInstructor | null;
  tags?: LectureTag[];
  learningGoals?: string[] | null;
  prerequisites?: string[] | null;
  includes?: string[] | null;
  sections?: ApiLectureSection[];
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

export type InstructorLecturePayload = {
  title: string;
  description?: string;
  descriptionDetail?: string;
  category?: string;
  difficulty?: string;
  price: number;
  thumbnail?: string;
  youtubeId?: string;
  learningGoals: string[];
  prerequisites: string[];
  includes: string[];
};

export type InstructorSectionPayload = {
  title: string;
  order?: number;
};

export type InstructorLessonPayload = {
  title: string;
  durationSec: number;
  youtubeId?: string;
  isPreview?: boolean;
  order?: number;
};

export const uploadThumbnail = async (file: File): Promise<string> => {
  const form = new FormData();
  form.append('file', file);
  const response = await http.post<{ url: string }>('/uploads/thumbnail', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  const base = (import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000') as string;
  return base + response.data.url;
};

export const getLectures = async (category?: string) => {
  const url = category ? `/lectures?category=${encodeURIComponent(category)}` : '/lectures';
  const response = await http.get<ApiLecture[]>(url);
  return response.data;
};

export const getLecture = async (id: number) => {
  const response = await http.get<ApiLectureDetail>(`/lectures/${id}`);
  return response.data;
};

export const syncLectureDurations = async (lectureId: number) => {
  const response = await http.post(`/lectures/${lectureId}/sync-durations`);
  return response.data;
};

export const patchLessonDuration = async (lessonId: number, durationSec: number) => {
  const response = await http.patch(`/lectures/lessons/${lessonId}/duration`, { durationSec });
  return response.data;
};

export const getInstructorLectures = async () => {
  const response = await http.get<ApiLecture[]>('/instructor/lectures');
  return response.data;
};

export const getInstructorLecture = async (id: number) => {
  const response = await http.get<ApiLectureDetail>(`/instructor/lectures/${id}`);
  return response.data;
};

export const createInstructorLecture = async (data: InstructorLecturePayload) => {
  const response = await http.post<ApiLectureDetail>('/instructor/lectures', data);
  return response.data;
};

export const updateInstructorLecture = async (id: number, data: InstructorLecturePayload) => {
  const response = await http.put<ApiLectureDetail>(`/instructor/lectures/${id}`, data);
  return response.data;
};

export const deleteInstructorLecture = async (id: number) => {
  const response = await http.delete(`/instructor/lectures/${id}`);
  return response.data;
};

export const createInstructorSection = async (
  lectureId: number,
  data: InstructorSectionPayload,
) => {
  const response = await http.post(`/instructor/lectures/${lectureId}/sections`, data);
  return response.data;
};

export const updateInstructorSection = async (
  sectionId: number,
  data: InstructorSectionPayload,
) => {
  const response = await http.put(`/instructor/sections/${sectionId}`, data);
  return response.data;
};

export const deleteInstructorSection = async (sectionId: number) => {
  const response = await http.delete(`/instructor/sections/${sectionId}`);
  return response.data;
};

export const moveInstructorSectionUp = async (sectionId: number) => {
  const response = await http.post(`/instructor/sections/${sectionId}/move-up`);
  return response.data;
};

export const moveInstructorSectionDown = async (sectionId: number) => {
  const response = await http.post(`/instructor/sections/${sectionId}/move-down`);
  return response.data;
};

export const createInstructorLesson = async (
  sectionId: number,
  data: InstructorLessonPayload,
) => {
  const response = await http.post(`/instructor/sections/${sectionId}/lessons`, data);
  return response.data;
};

export const updateInstructorLesson = async (
  lessonId: number,
  data: InstructorLessonPayload,
) => {
  const response = await http.put(`/instructor/lessons/${lessonId}`, data);
  return response.data;
};

export const deleteInstructorLesson = async (lessonId: number) => {
  const response = await http.delete(`/instructor/lessons/${lessonId}`);
  return response.data;
};

export const moveInstructorLessonUp = async (lessonId: number) => {
  const response = await http.post(`/instructor/lessons/${lessonId}/move-up`);
  return response.data;
};

export const moveInstructorLessonDown = async (lessonId: number) => {
  const response = await http.post(`/instructor/lessons/${lessonId}/move-down`);
  return response.data;
};

export const syncInstructorLectureDurations = async (lectureId: number) => {
  const response = await http.post(`/instructor/lectures/${lectureId}/sync-durations`);
  return response.data;
};

export type InstructorEnrollment = {
  enrollmentId: number;
  student: { userId: string; nickname: string; email: string };
  enrolledAt: string;
};

export type InstructorEnrollmentsResponse = {
  totalCount: number;
  enrollments: InstructorEnrollment[];
};

export const getInstructorLectureEnrollments = async (
  lectureId: number,
): Promise<InstructorEnrollmentsResponse> => {
  const response = await http.get(`/instructor/lectures/${lectureId}/enrollments`);
  return response.data;
};

export const removeInstructorLectureEnrollment = async (
  lectureId: number,
  enrollmentId: number,
): Promise<void> => {
  await http.delete(`/instructor/lectures/${lectureId}/enrollments/${enrollmentId}`);
};
