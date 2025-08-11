import { afterEach, beforeEach, vi } from "vitest";
import {
  clearAuthCookies,
  getAuthToken,
  getFromLocalStorage,
  getUserRole,
  removeFromLocalStorage,
  setAuthCookies,
  setToLocalStorage,
} from "../auth-utils";

// Mock localStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  length: 0,
  key: vi.fn(),
};

// Mock document.cookie with accumulating behavior
const mockCookie = {
  value: "",
  get cookie() {
    return this.value;
  },
  set cookie(val: string) {
    // Accumulate cookie assignments for multi-cookie testing
    if (this.value && !val.includes("expires=Thu, 01 Jan 1970")) {
      this.value += "; " + val;
    } else {
      this.value = val;
    }
  },
};

// Mock environment
const mockEnvironment = (isServer = false) => {
  if (isServer) {
    Object.defineProperty(window, "window", {
      value: undefined,
      writable: true,
    });
  } else {
    Object.defineProperty(global, "window", {
      value: global,
      writable: true,
    });
    Object.defineProperty(global, "localStorage", {
      value: mockLocalStorage,
      writable: true,
    });
    Object.defineProperty(global, "document", {
      value: mockCookie,
      writable: true,
    });
  }
};

describe("auth-utils", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCookie.value = "";
    mockEnvironment(false); // Client environment by default

    // Reset document.cookie to working state in case other tests modified it
    Object.defineProperty(global, "document", {
      value: mockCookie,
      writable: true,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("getFromLocalStorage", () => {
    it("returns value from localStorage when in client environment", () => {
      mockLocalStorage.getItem.mockReturnValue("test-value");

      const result = getFromLocalStorage("test-key");

      expect(mockLocalStorage.getItem).toHaveBeenCalledWith("test-key");
      expect(result).toBe("test-value");
    });

    it("returns null when key does not exist", () => {
      mockLocalStorage.getItem.mockReturnValue(null);

      const result = getFromLocalStorage("non-existent-key");

      expect(result).toBe(null);
    });

    it("returns null in server environment", () => {
      mockEnvironment(true); // Server environment

      const result = getFromLocalStorage("test-key");

      expect(result).toBe(null);
      expect(mockLocalStorage.getItem).not.toHaveBeenCalled();
    });

    it("handles empty string values", () => {
      mockLocalStorage.getItem.mockReturnValue("");

      const result = getFromLocalStorage("empty-key");

      expect(result).toBe("");
    });

    it("handles special characters in keys", () => {
      const specialKey = "test-key@#$%^&*()";
      mockLocalStorage.getItem.mockReturnValue("special-value");

      const result = getFromLocalStorage(specialKey);

      expect(mockLocalStorage.getItem).toHaveBeenCalledWith(specialKey);
      expect(result).toBe("special-value");
    });
  });

  describe("setToLocalStorage", () => {
    it("sets value in localStorage when in client environment", () => {
      setToLocalStorage("test-key", "test-value");

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith("test-key", "test-value");
    });

    it("does nothing in server environment", () => {
      mockEnvironment(true); // Server environment

      setToLocalStorage("test-key", "test-value");

      expect(mockLocalStorage.setItem).not.toHaveBeenCalled();
    });

    it("handles empty string values", () => {
      setToLocalStorage("empty-key", "");

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith("empty-key", "");
    });

    it("handles special characters in keys and values", () => {
      const specialKey = "test-key@#$%";
      const specialValue = "value!@#$%^&*()";

      setToLocalStorage(specialKey, specialValue);

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(specialKey, specialValue);
    });

    it("handles very long values", () => {
      const longValue = "a".repeat(10000);

      setToLocalStorage("long-key", longValue);

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith("long-key", longValue);
    });
  });

  describe("removeFromLocalStorage", () => {
    it("removes item from localStorage when in client environment", () => {
      removeFromLocalStorage("test-key");

      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith("test-key");
    });

    it("does nothing in server environment", () => {
      mockEnvironment(true); // Server environment

      removeFromLocalStorage("test-key");

      expect(mockLocalStorage.removeItem).not.toHaveBeenCalled();
    });

    it("handles non-existent keys gracefully", () => {
      removeFromLocalStorage("non-existent-key");

      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith("non-existent-key");
    });

    it("handles special characters in keys", () => {
      const specialKey = "test-key@#$%^&*()";

      removeFromLocalStorage(specialKey);

      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith(specialKey);
    });
  });

  describe("getAuthToken", () => {
    it("returns access token from localStorage", () => {
      mockLocalStorage.getItem.mockReturnValue("mock-access-token");

      const result = getAuthToken();

      expect(mockLocalStorage.getItem).toHaveBeenCalledWith("accessToken");
      expect(result).toBe("mock-access-token");
    });

    it("returns null when no access token exists", () => {
      mockLocalStorage.getItem.mockReturnValue(null);

      const result = getAuthToken();

      expect(result).toBe(null);
    });

    it("returns null in server environment", () => {
      mockEnvironment(true);

      const result = getAuthToken();

      expect(result).toBe(null);
    });
  });

  describe("getUserRole", () => {
    it("returns user role from localStorage", () => {
      mockLocalStorage.getItem.mockReturnValue("admin");

      const result = getUserRole();

      expect(mockLocalStorage.getItem).toHaveBeenCalledWith("userRole");
      expect(result).toBe("admin");
    });

    it("returns null when no user role exists", () => {
      mockLocalStorage.getItem.mockReturnValue(null);

      const result = getUserRole();

      expect(result).toBe(null);
    });

    it("returns null in server environment", () => {
      mockEnvironment(true);

      const result = getUserRole();

      expect(result).toBe(null);
    });
  });

  describe("setAuthCookies", () => {
    const mockTokens = {
      access_token: "access-token-123",
      refresh_token: "refresh-token-456",
      id: "user-id-789",
      role: "admin",
    };

    it("sets all cookies and localStorage in development", () => {
      process.env.NODE_ENV = "development";

      setAuthCookies(mockTokens);

      // Check cookies (mocked as string assignments)
      expect(mockCookie.value).toContain("accessToken=access-token-123");
      expect(mockCookie.value).toContain("path=/");
      expect(mockCookie.value).toContain("max-age=900"); // 15 minutes
      expect(mockCookie.value).toContain("samesite=lax");
      expect(mockCookie.value).not.toContain("secure");

      // Check localStorage
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith("accessToken", "access-token-123");
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith("refreshToken", "refresh-token-456");
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith("userId", "user-id-789");
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith("userRole", "admin");
    });

    it("sets cookies with secure flag in production", () => {
      process.env.NODE_ENV = "production";

      setAuthCookies(mockTokens);

      expect(mockCookie.value).toContain("secure");
    });

    it("handles tokens without role", () => {
      const tokensWithoutRole = {
        access_token: "access-token-123",
        refresh_token: "refresh-token-456",
        id: "user-id-789",
      };

      setAuthCookies(tokensWithoutRole);

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith("accessToken", "access-token-123");
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith("refreshToken", "refresh-token-456");
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith("userId", "user-id-789");
      expect(mockLocalStorage.setItem).not.toHaveBeenCalledWith("userRole", expect.anything());
    });

    it("does nothing in server environment", () => {
      mockEnvironment(true);

      setAuthCookies(mockTokens);

      expect(mockLocalStorage.setItem).not.toHaveBeenCalled();
    });

    it("sets correct cookie expiration times", () => {
      setAuthCookies(mockTokens);

      // Access token: 15 minutes = 900 seconds
      expect(mockCookie.value).toContain("max-age=900");

      // Refresh token: 7 days = 604800 seconds
      expect(mockCookie.value).toContain("max-age=604800");
    });

    it("handles empty string role", () => {
      const tokensWithEmptyRole = {
        ...mockTokens,
        role: "",
      };

      setAuthCookies(tokensWithEmptyRole);

      // Verify all expected localStorage calls including empty role
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith("accessToken", "access-token-123");
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith("refreshToken", "refresh-token-456");
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith("userId", "user-id-789");
      // Empty string role should NOT call setItem for userRole (falsy check)
      expect(mockLocalStorage.setItem).not.toHaveBeenCalledWith("userRole", expect.anything());
    });

    it("handles special characters in tokens", () => {
      const specialTokens = {
        access_token: "token@#$%^&*()",
        refresh_token: "refresh!@#$%",
        id: "id-with-special-chars_123",
        role: "admin-role",
      };

      setAuthCookies(specialTokens);

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith("accessToken", "token@#$%^&*()");
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith("refreshToken", "refresh!@#$%");
    });
  });

  describe("clearAuthCookies", () => {
    it("clears all cookies and localStorage in client environment", () => {
      clearAuthCookies();

      // Check that cookies are cleared with past expiration date
      expect(mockCookie.value).toContain("expires=Thu, 01 Jan 1970 00:00:01 GMT");

      // Check localStorage clearing
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith("accessToken");
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith("refreshToken");
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith("userId");
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith("userRole");
    });

    it("does nothing in server environment", () => {
      mockEnvironment(true);

      clearAuthCookies();

      expect(mockLocalStorage.removeItem).not.toHaveBeenCalled();
    });

    it("clears cookies with correct path", () => {
      clearAuthCookies();

      expect(mockCookie.value).toContain("path=/");
    });
  });

  describe("Integration scenarios", () => {
    it("handles complete authentication flow", () => {
      const tokens = {
        access_token: "new-access-token",
        refresh_token: "new-refresh-token",
        id: "user-123",
        role: "user",
      };

      // Set tokens
      setAuthCookies(tokens);

      // Verify we can retrieve them
      mockLocalStorage.getItem.mockImplementation((key) => {
        const values: Record<string, string> = {
          accessToken: "new-access-token",
          userRole: "user",
        };
        return values[key] || null;
      });

      expect(getAuthToken()).toBe("new-access-token");
      expect(getUserRole()).toBe("user");

      // Clear tokens
      clearAuthCookies();

      expect(mockLocalStorage.removeItem).toHaveBeenCalledTimes(4);
    });

    it("handles partial token data gracefully", () => {
      const partialTokens = {
        access_token: "token",
        refresh_token: "refresh",
        id: "123",
      };

      setAuthCookies(partialTokens);

      expect(mockLocalStorage.setItem).toHaveBeenCalledTimes(3); // No role
    });

    it("maintains backwards compatibility with localStorage-only usage", () => {
      // Direct localStorage operations
      setToLocalStorage("accessToken", "direct-token");
      mockLocalStorage.getItem.mockReturnValue("direct-token");

      expect(getAuthToken()).toBe("direct-token");

      removeFromLocalStorage("accessToken");
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith("accessToken");
    });

    it("handles environment switching gracefully", () => {
      // Start in client
      setToLocalStorage("test", "value");
      expect(mockLocalStorage.setItem).toHaveBeenCalled();

      // Switch to server
      mockEnvironment(true);
      const result = getFromLocalStorage("test");
      expect(result).toBe(null);

      // Switch back to client
      mockEnvironment(false);
      mockLocalStorage.getItem.mockReturnValue("value");
      const clientResult = getFromLocalStorage("test");
      expect(clientResult).toBe("value");
    });
  });

  describe("Error handling", () => {
    it("handles localStorage exceptions gracefully", () => {
      mockLocalStorage.setItem.mockImplementation(() => {
        throw new Error("Storage quota exceeded");
      });

      expect(() => {
        setToLocalStorage("key", "value");
      }).toThrow("Storage quota exceeded");
    });

    it("handles localStorage getItem exceptions gracefully", () => {
      mockLocalStorage.getItem.mockImplementation(() => {
        throw new Error("Storage access denied");
      });

      expect(() => {
        getFromLocalStorage("key");
      }).toThrow("Storage access denied");
    });

    it("handles document.cookie assignment exceptions gracefully", () => {
      // Save original cookie descriptor
      const originalDescriptor = Object.getOwnPropertyDescriptor(document, "cookie");

      Object.defineProperty(document, "cookie", {
        set: () => {
          throw new Error("Cookie setting blocked");
        },
        configurable: true,
      });

      expect(() => {
        setAuthCookies({
          access_token: "token",
          refresh_token: "refresh",
          id: "id",
        });
      }).toThrow("Cookie setting blocked");

      // Restore original cookie behavior after test
      if (originalDescriptor) {
        Object.defineProperty(document, "cookie", originalDescriptor);
      } else {
        // Restore to our mock if no original descriptor
        Object.defineProperty(document, "cookie", {
          get() {
            return mockCookie.cookie;
          },
          set(val: string) {
            mockCookie.cookie = val;
          },
          configurable: true,
        });
      }
    });
  });

  describe("Edge cases", () => {
    it("handles undefined values in localStorage", () => {
      mockLocalStorage.getItem.mockReturnValue(undefined as any);

      const result = getFromLocalStorage("key");

      expect(result).toBeUndefined();
    });

    it("handles extremely long token values", () => {
      const longToken = "a".repeat(100000);
      const tokens = {
        access_token: longToken,
        refresh_token: longToken,
        id: "id",
      };

      setAuthCookies(tokens);

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith("accessToken", longToken);
    });

    it("handles tokens with newlines and special characters", () => {
      const complexTokens = {
        access_token: "token\nwith\nnewlines",
        refresh_token: "token\twith\ttabs",
        id: "id with spaces",
        role: "role-with-dashes_and_underscores",
      };

      setAuthCookies(complexTokens);

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith("accessToken", "token\nwith\nnewlines");
    });
  });
});
