import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { Transaction, BookCopy } from '@/types';

export const useTransactions = () => {
  return useQuery<Transaction[]>({
    queryKey: ['transactions'],
    queryFn: () => api.get('/transactions'),
  });
};

export const useLookupBarcode = (barcode: string) => {
  return useQuery<{ copy: BookCopy; activeTransaction: Transaction | null }>({
    queryKey: ['barcode', barcode],
    queryFn: () => api.get(`/transactions/lookup/${barcode}`),
    enabled: !!barcode,
    retry: false,
  });
};

export const useBorrowBook = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ barcode, memberId }: { barcode: string; memberId: number }) => 
      api.post<Transaction>('/transactions/borrow', { barcode, memberId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['books'] });
    },
  });
};

export const useReturnBook = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (barcode: string) => 
      api.post<{ message: string; transaction: Transaction; fineAmount: number }>('/transactions/return', { barcode }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['books'] });
    },
  });
};
