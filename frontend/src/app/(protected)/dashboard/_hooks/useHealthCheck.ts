"use client";

import { useTRPC } from "@/trpc/client";
import { useQuery } from "@tanstack/react-query";

export function useHealthCheck() {
  const trpc = useTRPC();

  const {
    data: healthCheck,
    isLoading,
    error,
    refetch,
  } = useQuery(
    trpc.type.healthCheck.queryOptions(void 0, {
      refetchInterval: 30000, // Refetch every 30 seconds
      staleTime: 15000, // Consider stale after 15 seconds
    }),
  );

  return {
    healthCheck,
    isLoading,
    error,
    refetch,
    isHealthy: healthCheck?.status?.toLowerCase() === "healthy",
  };
}
