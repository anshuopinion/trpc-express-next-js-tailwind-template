import { Activity } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { AppInfo } from "../_types";
import { formatVersion } from "../_utils";

interface AppInfoCardProps {
  appInfo: AppInfo | null;
}

export function AppInfoCard({ appInfo }: AppInfoCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Application</CardTitle>
        <Activity className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{appInfo?.name || "tRPC Template"}</div>
        <p className="text-xs text-muted-foreground">
          Version {formatVersion(appInfo?.version || "1.0.0")}
        </p>
        <div className="mt-4">
          <span className="text-sm text-muted-foreground">
            {appInfo?.description || "Modern tRPC template with role-based authentication"}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
