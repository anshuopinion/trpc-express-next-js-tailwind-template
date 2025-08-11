import { BarChart3, Settings, Users } from "lucide-react";

// Admin-specific navigation routes (only routes that exist in (admin)/)
export const ADMIN_NAVIGATION_ITEMS = [
  {
    title: "Admin Dashboard",
    url: "/admin/dashboard",
    icon: BarChart3,
    description: "System overview and analytics",
  },
  {
    title: "User Management",
    url: "/admin/users",
    icon: Users,
    description: "Manage system users",
  },
  {
    title: "Admin Settings",
    url: "/admin/settings",
    icon: Settings,
    description: "System configuration",
  },
  // Future admin routes can be added here when implemented:
  // {
  //   title: "Security",
  //   url: "/admin/security",
  //   icon: Shield,
  //   description: "Security settings and logs"
  // },
  // {
  //   title: "System Logs",
  //   url: "/admin/logs",
  //   icon: Activity,
  //   description: "View system activity logs"
  // },
  // {
  //   title: "Database",
  //   url: "/admin/database",
  //   icon: Database,
  //   description: "Database management"
  // }
] as const;

export type AdminNavigationItem = (typeof ADMIN_NAVIGATION_ITEMS)[number];
