import { http } from './http';
import type { EnrolledCourse, Bookmark } from '../../types/course';

type ApiSubscriptionLesson = {
  id: number;
  subscriptionId: number;
  lessonId: number;
  watchedSeconds: number;
  lastWatchedAt: string;
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

const mapSubscription = (sub: ApiSubscription): EnrolledCourse => {
  const sortedLessons = [...sub.lessons].sort(
    (a, b) => new Date(b.lastWatchedAt).getTime() - new Date(a.lastWatchedAt).getTime(),
  );
  return {
    id: sub.lecture.id,
    subscriptionId: sub.id,
    title: sub.lecture.title,
    instructor: sub.lecture.instructor?.name ?? '알 수 없음',
    thumbnail: sub.lecture.thumbnail ?? '',
    enrolledAt: sub.enrolledAt,
    progress: sub.progress,
    completedLessons: sub.lessons.map((l) => l.lessonId),
    lessonProgress: Object.fromEntries(sub.lessons.map((l) => [l.lessonId, l.watchedSeconds])),
    lastWatchedLessonId:
      sortedLessons.length > 0 && sortedLessons[0].watchedSeconds > 0
        ? sortedLessons[0].lessonId
        : null,
  };
};

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

// ── 시청 진도 ──────────────────────────────────────────

export const saveProgress = async (
  subscriptionId: number,
  lessonId: number,
  watchedSeconds: number,
): Promise<void> => {
  await http.patch(`/subscriptions/${subscriptionId}/lessons/${lessonId}/progress`, {
    watchedSeconds,
  });
};

export const getLastPosition = async (
  subscriptionId: number,
): Promise<{ lessonId: number | null; watchedSeconds: number }> => {
  const res = await http.get<{ lessonId: number | null; watchedSeconds: number }>(
    `/subscriptions/${subscriptionId}/last-position`,
  );
  return res.data;
};

// ── 북마크 ────────────────────────────────────────────

export const addBookmark = async (
  subscriptionId: number,
  lessonId: number,
  seconds: number,
  label: string,
): Promise<Bookmark> => {
  const res = await http.post<Bookmark>(`/subscriptions/${subscriptionId}/bookmarks`, {
    lessonId,
    seconds,
    label,
  });
  return res.data;
};

export const getBookmarks = async (subscriptionId: number): Promise<Bookmark[]> => {
  const res = await http.get<Bookmark[]>(`/subscriptions/${subscriptionId}/bookmarks`);
  return res.data;
};

export const removeBookmark = async (
  subscriptionId: number,
  bookmarkId: number,
): Promise<void> => {
  await http.delete(`/subscriptions/${subscriptionId}/bookmarks/${bookmarkId}`);
};
