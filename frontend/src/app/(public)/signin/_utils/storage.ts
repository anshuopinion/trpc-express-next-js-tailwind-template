// Safe localStorage operations with SSR support
export const getFromLocalStorage = (key: string): string | null => {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(key);
  } catch (error) {
    console.warn(`Failed to get ${key} from localStorage:`, error);
    return null;
  }
};

export const setToLocalStorage = (key: string, value: string): void => {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, value);
  } catch (error) {
    console.warn(`Failed to set ${key} to localStorage:`, error);
  }
};

export const removeFromLocalStorage = (key: string): void => {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.warn(`Failed to remove ${key} from localStorage:`, error);
  }
};

export const clearAuthTokens = (): void => {
  removeFromLocalStorage("accessToken");
  removeFromLocalStorage("refreshToken");
  removeFromLocalStorage("userId");
};

export const setAuthTokens = (tokens: {
  access_token: string;
  refresh_token: string;
  id: string;
}): void => {
  setToLocalStorage("accessToken", tokens.access_token);
  setToLocalStorage("refreshToken", tokens.refresh_token);
  setToLocalStorage("userId", tokens.id);
};

export const getAccessToken = (): string | null => {
  return getFromLocalStorage("accessToken");
};

export const hasValidTokens = (): boolean => {
  const accessToken = getAccessToken();
  const refreshToken = getFromLocalStorage("refreshToken");
  const userId = getFromLocalStorage("userId");

  return Boolean(accessToken && refreshToken && userId);
};
