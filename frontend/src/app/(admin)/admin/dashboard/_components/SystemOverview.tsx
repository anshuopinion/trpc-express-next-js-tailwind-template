import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AdminStatsCard } from "./AdminStatsCard";
import { Users, UserCheck, Shield, AlertCircle } from "lucide-react";
import type { SystemStats } from "../_types";

interface SystemOverviewProps {
  systemStats?: SystemStats;
}

export function SystemOverview({ systemStats }: SystemOverviewProps) {
  if (!systemStats) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-4 bg-muted rounded w-3/4"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-muted rounded w-1/2 mb-2"></div>
              <div className="h-3 bg-muted rounded w-full"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <AdminStatsCard
          title="Total Users"
          value={systemStats.totalUsers}
          description="Registered users in system"
          icon={Users}
        />

        <AdminStatsCard
          title="Verified Users"
          value={systemStats.verifiedUsers}
          description={`${Math.round((systemStats.verifiedUsers / systemStats.totalUsers) * 100)}% verification rate`}
          icon={UserCheck}
        />

        <AdminStatsCard
          title="Admin Users"
          value={systemStats.adminUsers}
          description="System administrators"
          icon={Shield}
        />

        <AdminStatsCard
          title="Unverified"
          value={systemStats.unverifiedUsers}
          description="Pending email verification"
          icon={AlertCircle}
        />
      </div>

      {systemStats.recentUsers && systemStats.recentUsers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Users</CardTitle>
            <CardDescription>Latest registered users</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {systemStats.recentUsers.slice(0, 5).map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between py-2 border-b last:border-0"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="text-primary font-semibold text-sm">
                        {user.first_name?.[0]}
                        {user.last_name?.[0]}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-sm">
                        {user.first_name} {user.last_name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        user.role === "admin"
                          ? "bg-purple-100 text-purple-800"
                          : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {user.role}
                    </span>
                    {user.is_email_verified ? (
                      <UserCheck className="w-4 h-4 text-green-600" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-yellow-600" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
