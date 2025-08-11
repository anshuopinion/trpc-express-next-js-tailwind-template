export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  avatar?: string | null;
  is_email_verified: boolean;
}

export interface HealthCheck {
  status: string;
  timestamp: string;
  uptime: number;
}

export interface AppInfo {
  name: string;
  version: string;
  description: string;
}

export interface StatsCardProps {
  title: string;
  value: string | number;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  status?: "success" | "warning" | "error";
}

export interface DashboardData {
  user: User | null | undefined;
  healthCheck: HealthCheck | null;
  appInfo: AppInfo | null;
}

export interface CardVariant {
  bgColor: string;
  iconColor: string;
  borderColor: string;
}
