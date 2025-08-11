"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTRPC } from "@/trpc/client";
import { useQuery } from "@tanstack/react-query";
import {
  getFromLocalStorage,
  setToLocalStorage,
  removeFromLocalStorage,
} from "@/lib/utils";
import { setAuthCookies, clearAuthCookies } from "@/lib/auth-utils";

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const trpc = useTRPC();

  const {
    data: user,
    isLoading: userLoading,
    error,
  } = useQuery(
    trpc.auth.me.queryOptions(void 0, {
      enabled: !!getFromLocalStorage("accessToken"),
      retry: false,
    }),
  );

  useEffect(() => {
    const token = getFromLocalStorage("accessToken");
    if (token && user) {
      setIsAuthenticated(true);
    } else if (error) {
      setIsAuthenticated(false);
      removeFromLocalStorage("accessToken");
      removeFromLocalStorage("refreshToken");
      removeFromLocalStorage("userId");
    }
    setIsLoading(userLoading);
  }, [user, userLoading, error]);

  const login = (tokens: {
    access_token: string;
    refresh_token: string;
    id: string;
    role?: string;
  }) => {
    // Use the new hybrid cookie system (cookies + localStorage)
    setAuthCookies(tokens);
    setIsAuthenticated(true);
  };

  const logout = () => {
    // Use the new hybrid cookie system
    clearAuthCookies();
    setIsAuthenticated(false);
    router.push("/signin");
  };

  // Role-based helper functions
  const isAdmin = () => user?.role === "admin";
  const isUser = () => user?.role === "user";
  const hasRole = (role: string) => user?.role === role;

  return {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    isAdmin,
    isUser,
    hasRole,
  };
}
