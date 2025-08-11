"use client";

import { useTRPC } from "@/trpc/client";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import type { DashboardData } from "../_types";

export function useDashboardData() {
  const { user } = useAuth();
  const trpc = useTRPC();

  // Get health check data
  const {
    data: healthCheck,
    isLoading: healthLoading,
    error: healthError,
  } = useQuery(trpc.type.healthCheck.queryOptions());

  // Get app info data
  const {
    data: appInfo,
    isLoading: appInfoLoading,
    error: appInfoError,
  } = useQuery(trpc.type.getAppInfo.queryOptions());

  const isLoading = healthLoading || appInfoLoading;
  const hasError = !!healthError || !!appInfoError;

  const dashboardData: DashboardData = {
    user,
    healthCheck: healthCheck || null,
    appInfo: appInfo || null,
  };

  return {
    dashboardData,
    isLoading,
    hasError,
    errors: {
      health: healthError?.message || null,
      app: appInfoError?.message || null,
    },
  };
}
