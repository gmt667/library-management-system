import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { Payment } from '@/types';

export const usePayments = () => {
  return useQuery<Payment[]>({
    queryKey: ['payments'],
    queryFn: () => api.get('/payments'),
  });
};

export const useRecordPayment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (paymentData: { memberId: number; amount: number; note?: string }) =>
      api.post<Payment>('/payments', paymentData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      queryClient.invalidateQueries({ queryKey: ['members'] });
    },
  });
};
