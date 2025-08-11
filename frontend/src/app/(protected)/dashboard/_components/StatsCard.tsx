import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { StatsCardProps } from "../_types";

export function StatsCard({
  title,
  value,
  description,
  icon: Icon,
  status = "success",
}: StatsCardProps) {
  const statusStyles = {
    success: "text-green-600",
    warning: "text-yellow-600",
    error: "text-red-600",
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className={`h-4 w-4 ${statusStyles[status]}`} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}
