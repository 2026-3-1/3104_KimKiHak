import { http } from './http';

export const confirmPayment = async (
  paymentKey: string,
  orderId: number,
  amount: number,
): Promise<void> => {
  await http.post('/payments/confirm', { paymentKey, orderId, amount });
};

export const cancelPayment = async (
  paymentKey: string,
  reason: 'USER_REQUEST' | 'LECTURE_CANCELLED' | 'CAPACITY_EXCEEDED' | 'ENROLLMENT_SHORTAGE',
  cancelAmount?: number,
  note?: string,
): Promise<{ message: string; refundAmount: number }> => {
  const res = await http.post<{ message: string; refundAmount: number }>('/payments/cancel', {
    paymentKey,
    reason,
    cancelAmount,
    note,
  });
  return res.data;
};
