// Client-side authentication utilities

const ACCESS_TOKEN_COOKIE = "accessToken";
const REFRESH_TOKEN_COOKIE = "refreshToken";
const USER_ID_COOKIE = "userId";
const USER_ROLE_COOKIE = "userRole";

// Client-side utilities (for CSR) - backwards compatible
export function getFromLocalStorage(key: string): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(key);
}

export function setToLocalStorage(key: string, value: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, value);
}

export function removeFromLocalStorage(key: string): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(key);
}

// Client-side authentication utilities
export function getAuthToken(): string | null {
  // Client-side: get from localStorage
  return getFromLocalStorage("accessToken");
}

export function getUserRole(): string | null {
  // Client-side: get from localStorage
  return getFromLocalStorage("userRole");
}

// Client-side cookie setting utilities (for when we want to sync cookies)
export function setAuthCookies(tokens: {
  access_token: string;
  refresh_token: string;
  id: string;
  role?: string;
}): void {
  if (typeof window === "undefined") return;

  // Set cookies for SSR
  document.cookie = `${ACCESS_TOKEN_COOKIE}=${tokens.access_token}; path=/; max-age=${15 * 60}; samesite=lax${process.env.NODE_ENV === "production" ? "; secure" : ""}`;
  document.cookie = `${REFRESH_TOKEN_COOKIE}=${tokens.refresh_token}; path=/; max-age=${7 * 24 * 60 * 60}; samesite=lax${process.env.NODE_ENV === "production" ? "; secure" : ""}`;
  document.cookie = `${USER_ID_COOKIE}=${tokens.id}; path=/; samesite=lax${process.env.NODE_ENV === "production" ? "; secure" : ""}`;

  if (tokens.role) {
    document.cookie = `${USER_ROLE_COOKIE}=${tokens.role}; path=/; samesite=lax${process.env.NODE_ENV === "production" ? "; secure" : ""}`;
  }

  // Also keep localStorage for backwards compatibility
  setToLocalStorage("accessToken", tokens.access_token);
  setToLocalStorage("refreshToken", tokens.refresh_token);
  setToLocalStorage("userId", tokens.id);
  if (tokens.role) {
    setToLocalStorage("userRole", tokens.role);
  }
}

export function clearAuthCookies(): void {
  if (typeof window === "undefined") return;

  // Clear cookies
  document.cookie = `${ACCESS_TOKEN_COOKIE}=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;`;
  document.cookie = `${REFRESH_TOKEN_COOKIE}=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;`;
  document.cookie = `${USER_ID_COOKIE}=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;`;
  document.cookie = `${USER_ROLE_COOKIE}=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;`;

  // Also clear localStorage for backwards compatibility
  removeFromLocalStorage("accessToken");
  removeFromLocalStorage("refreshToken");
  removeFromLocalStorage("userId");
  removeFromLocalStorage("userRole");
}
