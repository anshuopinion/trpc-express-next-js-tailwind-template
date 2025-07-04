import 'server-only';

import { createTRPCClient, httpBatchLink } from '@trpc/client';
import { createTRPCOptionsProxy } from '@trpc/tanstack-react-query';
import { QueryClient } from '@tanstack/react-query';
import { cache } from 'react';
import type { AppRouter } from '../../../backend/src/routes';

// Create a stable getter for the query client
export const getQueryClient = cache(() => makeQueryClient());

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000, // 1 minute
        gcTime: 5 * 60 * 1000, // 5 minutes
      },
    },
  });
}

// Create server-side tRPC client
const serverTrpcClient = createTRPCClient<AppRouter>({
  links: [
    httpBatchLink({
      url: `${process.env.NEXT_PUBLIC_BACKEND_URL}/trpc` || 'http://localhost:4005/trpc',
      headers: () => {
        // Note: For server-side calls, you might need to handle authentication differently
        // depending on your setup (cookies, headers forwarding, etc.)
        return {};
      },
    }),
  ],
});

// Create server-side tRPC options proxy
export const serverTrpc = createTRPCOptionsProxy<AppRouter>({
  client: serverTrpcClient,
  queryClient: getQueryClient,
});

// Export types
export type { AppRouter } from '../../../backend/src/routes';