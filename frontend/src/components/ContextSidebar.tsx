"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTRPC } from "@/trpc/client";
import { useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { User, LogOut, ChevronUp, Settings, X, Shield } from "lucide-react";
import Link from "next/link";

// Import navigation constants
import { USER_NAVIGATION_ITEMS } from "@/app/(protected)/_constants";
import { ADMIN_NAVIGATION_ITEMS } from "@/app/(admin)/_constants";

interface ContextSidebarProps {
  className?: string;
  onClose?: () => void;
  context: "user" | "admin";
}

export function ContextSidebar({
  className = "",
  onClose,
  context,
}: ContextSidebarProps) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const trpc = useTRPC();

  const logoutMutation = useMutation(
    trpc.auth.logout.mutationOptions({
      onSuccess: () => {
        logout();
        router.push("/signin");
      },
      onSettled: () => {
        setIsLoggingOut(false);
      },
    }),
  );

  const handleLogout = () => {
    setIsLoggingOut(true);
    logoutMutation.mutate();
  };

  // Determine navigation items and branding based on context
  const isAdmin = context === "admin";
  const navigationItems = isAdmin
    ? ADMIN_NAVIGATION_ITEMS
    : USER_NAVIGATION_ITEMS;
  const headerTitle = isAdmin ? "Admin Panel" : "tRPC Template";
  const headerIcon = isAdmin ? (
    <Shield className="h-4 w-4 text-primary-foreground" />
  ) : (
    <span className="text-primary-foreground font-bold text-xs">T</span>
  );
  const menuLabel = isAdmin ? "Admin Menu" : "Menu";
  const userSubtitle = isAdmin ? "Administrator" : user?.email;

  return (
    <div
      className={`w-[200px] max-w-[200px] bg-sidebar border-r border-sidebar-border flex flex-col ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-sidebar-border">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary">
            {headerIcon}
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-sidebar-foreground">
              {headerTitle}
            </span>
          </div>
        </div>
        {onClose && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8 md:hidden"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Navigation */}
      <div className="flex-1 p-3">
        <div className="space-y-1">
          <div className="px-2 py-1 text-xs font-medium text-sidebar-foreground/70 uppercase tracking-wider">
            {menuLabel}
          </div>
          {navigationItems.map((item) => (
            <Link
              key={item.title}
              href={item.url}
              className="flex items-center gap-2 px-2 py-2 rounded-md text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors text-sm"
              onClick={onClose}
              title={item.description}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              <span className="font-medium truncate">{item.title}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-sidebar-border">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="w-full justify-start gap-2 h-auto p-2 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            >
              <Avatar className="h-6 w-6">
                <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                  {user?.first_name?.[0]}
                  {user?.last_name?.[0]}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 text-left text-xs leading-tight min-w-0">
                <div className="truncate font-semibold">
                  {user?.first_name} {user?.last_name}
                </div>
                <div className="truncate text-xs text-sidebar-foreground/70">
                  {userSubtitle}
                </div>
              </div>
              <ChevronUp className="ml-auto h-3 w-3 shrink-0" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-48 rounded-lg"
            side="top"
            align="end"
            sideOffset={4}
          >
            {/* Context-specific menu items */}
            {isAdmin ? (
              <DropdownMenuItem asChild>
                <Link href="/dashboard" className="cursor-pointer">
                  <User className="mr-2 h-4 w-4" />
                  User Dashboard
                </Link>
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem className="cursor-pointer">
                <User className="mr-2 h-4 w-4" />
                Profile
              </DropdownMenuItem>
            )}
            <DropdownMenuItem className="cursor-pointer">
              <Settings className="mr-2 h-4 w-4" />
              {isAdmin ? "Admin Settings" : "Settings"}
            </DropdownMenuItem>
            <DropdownMenuItem
              className="cursor-pointer text-red-600"
              onClick={handleLogout}
              disabled={isLoggingOut}
            >
              <LogOut className="mr-2 h-4 w-4" />
              {isLoggingOut ? "Signing out..." : "Sign Out"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
