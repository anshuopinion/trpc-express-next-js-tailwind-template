import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { AdminStatsCardProps } from "../_types";

export function AdminStatsCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
}: AdminStatsCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">{description}</p>
          {trend && (
            <div
              className={`text-xs ${trend.isPositive ? "text-green-600" : "text-red-600"}`}
            >
              {trend.isPositive ? "+" : ""}
              {trend.value}%
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
