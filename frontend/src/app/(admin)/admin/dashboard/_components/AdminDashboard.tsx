
import { SystemOverview } from "./SystemOverview";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Activity, Server } from "lucide-react";
import type { SystemStats } from "../_types";

interface AdminDashboardProps {
  initialSystemStats?: SystemStats | null;
  initialHealthCheck?: any;
  initialAppInfo?: any;
  serverErrors: {
    stats: string | null;
    health: string | null;
    app: string | null;
  };
}

export function AdminDashboard({
  initialSystemStats,
  initialHealthCheck,
  initialAppInfo,
  serverErrors,
}: AdminDashboardProps) {
  // Use server-prefetched data directly (no client-side refetching)
  const systemStats = initialSystemStats;
  const healthCheck = initialHealthCheck;
  const appInfo = initialAppInfo;

  // Show errors if server failed
  const hasErrors =
    serverErrors.stats || serverErrors.health || serverErrors.app;

  if (hasErrors) {
    return (
      <div className="text-center py-8">
        <p className="text-lg font-semibold text-destructive">
          Error loading admin dashboard
        </p>
        <p className="text-sm text-muted-foreground mt-1">
          {serverErrors.stats ||
            serverErrors.health ||
            serverErrors.app ||
            "Failed to load dashboard data"}
        </p>
      </div>
    );
  }

  return (
    <>
      <SystemOverview systemStats={systemStats as SystemStats} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        {/* Server Health Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div>
              <CardTitle className="text-lg">Server Health</CardTitle>
              <CardDescription>System status and uptime</CardDescription>
            </div>
            <Server className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Status</span>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    healthCheck?.status === "healthy"
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {healthCheck?.status || "Unknown"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Uptime</span>
                <span className="text-sm text-muted-foreground">
                  {healthCheck?.uptime
                    ? Math.floor(healthCheck.uptime / 60) + " minutes"
                    : "N/A"}
                </span>
              </div>
              {serverErrors.health && (
                <p className="text-xs text-red-600">{serverErrors.health}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Application Info Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div>
              <CardTitle className="text-lg">Application Info</CardTitle>
              <CardDescription>Version and details</CardDescription>
            </div>
            <Activity className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Name</span>
                <span className="text-sm text-muted-foreground">
                  {appInfo?.name || "tRPC Template"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Version</span>
                <span className="text-sm text-muted-foreground">
                  {appInfo?.version || "1.0.0"}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {appInfo?.description ||
                  "Modern tRPC template with role-based authentication"}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
