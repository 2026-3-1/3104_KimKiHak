import { http } from './http';
import type { EnrolledCourse } from '../../types/course';

type ApiSubscriptionLesson = {
  id: number;
  subscriptionId: number;
  lessonId: number;
};

type ApiSubscription = {
  id: number;
  lectureId: number;
  userId: string;
  enrolledAt: string;
  progress: number;
  lessons: ApiSubscriptionLesson[];
  lecture: {
    id: number;
    title: string;
    thumbnail: string | null;
    instructor: { id: string; name: string } | null;
  };
};

const mapSubscription = (sub: ApiSubscription): EnrolledCourse => ({
  id: sub.lecture.id,
  subscriptionId: sub.id,
  title: sub.lecture.title,
  instructor: sub.lecture.instructor?.name ?? '알 수 없음',
  thumbnail: sub.lecture.thumbnail ?? '',
  enrolledAt: sub.enrolledAt,
  progress: sub.progress,
  completedLessons: sub.lessons.map((l) => l.lessonId),
});

export const getMySubscriptions = async (userId: string): Promise<EnrolledCourse[]> => {
  const response = await http.get<ApiSubscription[]>(
    `/subscriptions?userId=${encodeURIComponent(userId)}`,
  );
  return response.data.map(mapSubscription);
};

export const enrollLecture = async (
  lectureId: number,
  userId: string,
): Promise<EnrolledCourse> => {
  const response = await http.post<ApiSubscription>('/subscriptions', { lectureId, userId });
  return mapSubscription(response.data);
};

export const completeLessonApi = async (
  subscriptionId: number,
  lessonId: number,
): Promise<EnrolledCourse> => {
  const response = await http.post<ApiSubscription>(
    `/subscriptions/${subscriptionId}/lessons`,
    { lessonId },
  );
  return mapSubscription(response.data);
};
