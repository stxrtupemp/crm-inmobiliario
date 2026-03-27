import { QueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { AxiosError } from 'axios';
import type { ApiResponse } from './api';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime:          1000 * 60 * 2,   // 2 min
      gcTime:             1000 * 60 * 10,  // 10 min
      retry:              1,
      refetchOnWindowFocus: false,
    },
    mutations: {
      onError: (error) => {
        const axiosError = error as AxiosError<ApiResponse>;
        const message =
          axiosError.response?.data?.error?.message ??
          (error instanceof Error ? error.message : 'An unexpected error occurred');
        toast.error(message);
      },
    },
  },
});
