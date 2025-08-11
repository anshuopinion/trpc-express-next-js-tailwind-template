export enum UserRole {
  ADMIN = "admin",
  USER = "user",
}

export interface AdminUser {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: UserRole;
  is_email_verified: boolean;
  createdAt?: string;
}

export interface SystemStats {
  totalUsers: number;
  adminUsers: number;
  regularUsers: number;
  verifiedUsers: number;
  unverifiedUsers: number;
  recentUsers: AdminUser[];
  systemHealth: {
    status: string;
    uptime: number;
    timestamp: string;
  };
}

export interface AdminStatsCardProps {
  title: string;
  value: string | number;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

export interface UserListResponse {
  users: AdminUser[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
