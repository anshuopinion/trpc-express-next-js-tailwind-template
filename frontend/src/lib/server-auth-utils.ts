import "server-only";

import { cookies } from "next/headers";

const ACCESS_TOKEN_COOKIE = "accessToken";
const REFRESH_TOKEN_COOKIE = "refreshToken";
const USER_ID_COOKIE = "userId";
const USER_ROLE_COOKIE = "userRole";

// Server-side cookie utilities (for SSR)
export async function getServerAuthTokens() {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;
    const refreshToken = cookieStore.get(REFRESH_TOKEN_COOKIE)?.value;
    const userId = cookieStore.get(USER_ID_COOKIE)?.value;
    const userRole = cookieStore.get(USER_ROLE_COOKIE)?.value;

    return {
      accessToken,
      refreshToken,
      userId,
      userRole,
    };
  } catch {
    return {
      accessToken: null,
      refreshToken: null,
      userId: null,
      userRole: null,
    };
  }
}

// Check if user has admin role on server
export async function isServerAdmin(): Promise<boolean> {
  const { userRole } = await getServerAuthTokens();
  return userRole === "admin";
}

// Check if user is authenticated on server
export async function isServerAuthenticated(): Promise<boolean> {
  const { accessToken } = await getServerAuthTokens();
  return !!accessToken;
}

// Hybrid authentication utilities (works on both server and client)
export function getAuthToken(): string | null {
  // Server-side: get from cookies
  if (typeof window === "undefined") {
    const { accessToken } = getServerAuthTokens();
    return accessToken;
  }

  // This shouldn't be called from client components
  return null;
}

export function getUserRole(): string | null {
  // Server-side: get from cookies
  if (typeof window === "undefined") {
    const { userRole } = getServerAuthTokens();
    return userRole;
  }

  // This shouldn't be called from client components
  return null;
}
