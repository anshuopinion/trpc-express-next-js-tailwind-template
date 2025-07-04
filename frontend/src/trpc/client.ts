'use client';

import { QueryClient } from '@tanstack/react-query';
import { createTRPCClient, httpBatchLink } from '@trpc/client';
import { createTRPCOptionsProxy } from '@trpc/tanstack-react-query';
import { useMemo } from 'react';
import type { AppRouter } from '../../../backend/types/routes';

// Create a query client
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 1,
    },
  },
});

// Create the vanilla tRPC client
export const trpcClient = createTRPCClient<AppRouter>({
  links: [
    httpBatchLink({
      url: `${process.env.NEXT_PUBLIC_BACKEND_URL}/trpc` || 'http://localhost:4005/trpc',
      headers: () => {
        const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
        return token ? { authorization: `Bearer ${token}` } : {};
      },
    }),
  ],
});

// Create tRPC options proxy for modern usage
export const trpc = createTRPCOptionsProxy<AppRouter>({
  client: trpcClient,
  queryClient,
});

// Custom hook to access tRPC in components
export function useTRPC() {
  return useMemo(() => trpc, []);
}

// Export types for type inference
export type { AppRouter } from '../../../backend/types/routes';

// Type inference helpers
import type { inferRouterInputs, inferRouterOutputs } from '@trpc/server';
export type RouterInputs = inferRouterInputs<AppRouter>;
export type RouterOutputs = inferRouterOutputs<AppRouter>;