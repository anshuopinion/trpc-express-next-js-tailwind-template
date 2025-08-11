import "server-only";

import { createTRPCClient, httpBatchLink } from "@trpc/client";
import { createTRPCOptionsProxy } from "@trpc/tanstack-react-query";
import { QueryClient } from "@tanstack/react-query";
import { cache } from "react";
import { getServerAuthTokens } from "@/lib/server-auth-utils";
import type { AppRouter } from "../../../backend/types/routes";

// Create a stable getter for the query client
export const getQueryClient = cache(() => makeQueryClient());

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000, // 1 minute
        gcTime: 5 * 60 * 1000, // 5 minutes
        retry: 1,
      },
    },
  });
}

// Create server-side tRPC client with authentication support
function createAuthenticatedServerTrpcClient() {
  return createTRPCClient<AppRouter>({
    links: [
      httpBatchLink({
        url:
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/trpc` ||
          "http://localhost:4005/trpc",
        headers: async () => {
          try {
            const { accessToken } = await getServerAuthTokens();
            return accessToken
              ? { authorization: `Bearer ${accessToken}` }
              : {};
          } catch (error) {
            console.error("Failed to get server auth tokens:", error);
            return {};
          }
        },
      }),
    ],
  });
}

// Create direct server-side tRPC client for server calls (cached)
export const getServerTrpcClient = cache(() =>
  createAuthenticatedServerTrpcClient(),
);

// Create server-side tRPC options proxy with authentication for React Query
export const serverTrpc = createTRPCOptionsProxy<AppRouter>({
  client: getServerTrpcClient(),
  queryClient: getQueryClient,
});

// Helper function for server-side data prefetching with error handling
export async function serverTrpcCall<T>(
  queryFn: () => Promise<T>,
): Promise<{ data: T | null; error: string | null }> {
  try {
    const data = await queryFn();
    return { data, error: null };
  } catch (error) {
    console.error("Server tRPC call failed:", error);
    return {
      data: null,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// Export types
export type { AppRouter } from "../../../backend/types/routes";
