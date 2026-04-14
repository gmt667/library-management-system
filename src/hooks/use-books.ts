import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { Book, BookCopy } from '@/types';

export const useBooks = () => {
  return useQuery<Book[]>({
    queryKey: ['books'],
    queryFn: () => api.get('/books'),
  });
};

export const useCreateBook = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (newBook: { title: string; author: string; isbn: string; coverUrl?: string }) =>
      api.post<Book>('/books', newBook),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['books'] });
    },
  });
};

export const useUpdateBook = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: { id: number; title: string; author: string; isbn: string; coverUrl?: string }) =>
      api.put<Book>(`/books/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['books'] });
    },
  });
};

export const useDeleteBook = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.delete(`/books/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['books'] });
    },
  });
};

export const useCreateCopy = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ bookId, barcode }: { bookId: number; barcode: string }) =>
      api.post<BookCopy>(`/books/${bookId}/copies`, { barcode }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['books'] });
    },
  });
};

export const useDeleteCopy = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (copyId: number) => api.delete(`/books/copies/${copyId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['books'] });
    },
  });
};
