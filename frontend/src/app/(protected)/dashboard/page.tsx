"use client";

import { useAuth } from "@/hooks/useAuth";
import { AppInfoCard, ServerStatusCard, UserProfileCard, WelcomeSection } from "./_components";
import { useDashboardData } from "./_hooks";

export default function DashboardPage() {
  const { user } = useAuth();
  const { dashboardData, hasError } = useDashboardData();

  if (hasError) {
    return (
      <div className="flex flex-1 flex-col gap-4">
        <div className="text-center py-8">
          <p className="text-lg font-semibold text-destructive">Error loading dashboard</p>
          <p className="text-sm text-muted-foreground mt-1">
            Failed to load dashboard data. Please try refreshing the page.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-4">
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-foreground">Dashboard</h2>
        <p className="text-muted-foreground mt-1">
          Welcome back, {user?.first_name}! Here&apos;s your tRPC template dashboard.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <UserProfileCard user={dashboardData.user} />
        <ServerStatusCard healthCheck={dashboardData.healthCheck} />
        <AppInfoCard appInfo={dashboardData.appInfo} />
      </div>

      <WelcomeSection firstName={user?.first_name} />
    </div>
  );
}
