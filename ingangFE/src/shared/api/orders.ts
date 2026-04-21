import { http } from './http';

export type OrderItem = {
  id: number;
  orderId: number;
  lectureId: number;
  price: number;
  lecture: { id: number; title: string; thumbnail: string | null; price: number };
};

export type Order = {
  id: number;
  userId: string;
  status: 'PENDING' | 'PAID' | 'PARTIALLY_CANCELLED' | 'CANCELLED' | 'REFUNDED';
  totalAmount: number;
  createdAt: string;
  items: OrderItem[];
  payment?: {
    id: number;
    paymentKey: string;
    status: string;
    amount: number;
    paidAt: string | null;
    refundAmount: number | null;
  };
};

export const createOrder = async (userId: string, lectureIds: number[]): Promise<Order> => {
  const res = await http.post<Order>('/orders', { userId, lectureIds });
  return res.data;
};

export const getOrders = async (userId: string): Promise<Order[]> => {
  const res = await http.get<Order[]>(`/orders?userId=${encodeURIComponent(userId)}`);
  return res.data;
};
