"use client";

import { useTRPC } from "@/trpc/client";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Server, User, Activity } from "lucide-react";

export default function DashboardPage() {
  const { user } = useAuth();
  const trpc = useTRPC();
  
  const { data: healthCheck } = useQuery(trpc.type.healthCheck.queryOptions());
  const { data: appInfo } = useQuery(trpc.type.getAppInfo.queryOptions());

  return (
    <div className="flex flex-1 flex-col gap-4">
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-foreground">Dashboard</h2>
          <p className="text-muted-foreground mt-1">
            Welcome back, {user?.first_name}! Here's your tRPC template dashboard.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* User Info Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">User Profile</CardTitle>
              <User className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {user?.first_name} {user?.last_name}
              </div>
              <p className="text-xs text-muted-foreground">{user?.email}</p>
              <div className="mt-4 flex items-center">
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center mr-2">
                  <span className="text-primary font-semibold text-sm">
                    {user?.first_name?.[0]}{user?.last_name?.[0]}
                  </span>
                </div>
                <span className="text-sm text-muted-foreground">
                  {user?.is_email_verified ? "Verified" : "Unverified"} Account
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Server Status Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Server Status</CardTitle>
              <Server className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {healthCheck?.status || "Loading..."}
              </div>
              <p className="text-xs text-muted-foreground">
                Uptime: {healthCheck?.uptime ? Math.floor(healthCheck.uptime / 60) : 0} minutes
              </p>
              <div className="mt-4">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  <span className="text-sm text-muted-foreground">All systems operational</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Application Info Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Application</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {appInfo?.name || "Loading..."}
              </div>
              <p className="text-xs text-muted-foreground">
                Version {appInfo?.version || "1.0.0"}
              </p>
              <div className="mt-4">
                <span className="text-sm text-muted-foreground">
                  {appInfo?.description || "Template application"}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Welcome Message */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">🎉 Welcome to your Dashboard!</CardTitle>
            <CardDescription>
              You&apos;ve successfully authenticated using tRPC and JWT tokens. This dashboard demonstrates:
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
              <li>Type-safe API calls with tRPC and React Query</li>
              <li>JWT-based authentication with automatic token management</li>
              <li>Protected routes that redirect unauthenticated users</li>
              <li>Modern Next.js 15 app structure with server and client components</li>
              <li>Real-time data fetching and caching</li>
              <li>shadcn/ui components with Tailwind CSS styling</li>
            </ul>
            
            <div className="mt-6 p-4 bg-primary/5 rounded-lg border border-primary/20">
              <div className="flex items-start space-x-3">
                <div className="text-2xl">✨</div>
                <div>
                  <h4 className="font-semibold text-primary mb-1">This is a clean template!</h4>
                  <p className="text-sm text-muted-foreground">
                    You can use this as a starting point for your own tRPC applications. The template includes 
                    authentication, user management, and a solid foundation for building type-safe full-stack applications.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mt-4">
              <div className="px-2 py-1 bg-secondary text-secondary-foreground rounded-md text-xs">Next.js 15</div>
              <div className="px-2 py-1 bg-secondary text-secondary-foreground rounded-md text-xs">tRPC</div>
              <div className="px-2 py-1 bg-secondary text-secondary-foreground rounded-md text-xs">React Query</div>
              <div className="px-2 py-1 bg-secondary text-secondary-foreground rounded-md text-xs">TypeScript</div>
              <div className="px-2 py-1 bg-secondary text-secondary-foreground rounded-md text-xs">shadcn/ui</div>
              <div className="px-2 py-1 bg-secondary text-secondary-foreground rounded-md text-xs">Tailwind CSS</div>
            </div>
          </CardContent>
        </Card>
    </div>
  );
}