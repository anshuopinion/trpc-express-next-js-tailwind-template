import { Home, Settings, User, Bell } from "lucide-react";

// User-specific navigation routes (only routes that exist in (protected)/)
export const USER_NAVIGATION_ITEMS = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: Home,
    description: "Your main dashboard",
  },
  // Future user routes can be added here when implemented:
  // {
  //   title: "Profile",
  //   url: "/profile",
  //   icon: User,
  //   description: "Manage your profile"
  // },
  // {
  //   title: "Settings",
  //   url: "/settings",
  //   icon: Settings,
  //   description: "Account settings"
  // },
  // {
  //   title: "Notifications",
  //   url: "/notifications",
  //   icon: Bell,
  //   description: "Your notifications"
  // }
] as const;

export type UserNavigationItem = (typeof USER_NAVIGATION_ITEMS)[number];
