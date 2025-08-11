import { Server } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { HealthCheck } from "../_types";
import { formatStatus, formatUptime, getStatusColor } from "../_utils";

interface ServerStatusCardProps {
  healthCheck: HealthCheck | null;
}

export function ServerStatusCard({ healthCheck }: ServerStatusCardProps) {
  const statusColor = getStatusColor(healthCheck?.status || "unknown");

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Server Status</CardTitle>
        <Server className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{formatStatus(healthCheck?.status || "Unknown")}</div>
        <p className="text-xs text-muted-foreground">
          Uptime: {healthCheck?.uptime ? formatUptime(healthCheck.uptime) : "N/A"}
        </p>
        <div className="mt-4">
          <div className="flex items-center">
            <div
              className={`w-2 h-2 ${statusColor === "success" ? "bg-green-500" : statusColor === "warning" ? "bg-yellow-500" : "bg-red-500"} rounded-full mr-2`}
            ></div>
            <span className="text-sm text-muted-foreground">
              {statusColor === "success" ? "All systems operational" : "System issues detected"}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
