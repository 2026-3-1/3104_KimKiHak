import { http } from './http';
import type { LectureInstructor, LectureTag } from './lectures';

export type CartLecture = {
  id: number;
  title: string;
  thumbnail: string | null;
  price: number;
  level: string | null;
  instructor: LectureInstructor | null;
  tags: LectureTag[];
};

export type CartItem = {
  id: number;
  cartId: number;
  lectureId: number;
  addedAt: string;
  lecture: CartLecture;
};

export type Cart = {
  userId: string;
  items: CartItem[];
};

export const getCart = async (userId: string): Promise<Cart> => {
  const res = await http.get<Cart>(`/cart?userId=${encodeURIComponent(userId)}`);
  return res.data;
};

export const addToCart = async (userId: string, lectureId: number): Promise<Cart> => {
  const res = await http.post<Cart>('/cart/items', { userId, lectureId });
  return res.data;
};

export const removeFromCart = async (userId: string, lectureId: number): Promise<Cart> => {
  const res = await http.delete<Cart>(
    `/cart/items/${lectureId}?userId=${encodeURIComponent(userId)}`,
  );
  return res.data;
};
