import { http } from './http';
import type { Review } from '../../types/course';

type ApiReview = {
  id: number;
  lectureId: number;
  userId: string;
  rating: number;
  comment: string;
  createdAt: string;
  user?: { id: string; name: string } | null;
};

const mapReview = (r: ApiReview): Review => ({
  id: r.id,
  author: r.user?.name ?? '익명',
  rating: r.rating,
  comment: r.comment,
  createdAt: new Date(r.createdAt).toLocaleDateString('ko-KR'),
  userId: r.userId,
});

export const getReviews = async (lectureId: number): Promise<Review[]> => {
  const response = await http.get<ApiReview[]>(`/reviews?lectureId=${lectureId}`);
  return response.data.map(mapReview);
};

export const createReview = async (data: {
  lectureId: number;
  userId: string;
  rating: number;
  comment: string;
}): Promise<Review> => {
  const response = await http.post<ApiReview>('/reviews', data);
  return mapReview(response.data);
};

export const updateReview = async (
  id: number,
  data: { rating?: number; comment?: string },
): Promise<Review> => {
  const response = await http.patch<ApiReview>(`/reviews/${id}`, data);
  return mapReview(response.data);
};

export const deleteReview = async (id: number): Promise<void> => {
  await http.delete(`/reviews/${id}`);
};
