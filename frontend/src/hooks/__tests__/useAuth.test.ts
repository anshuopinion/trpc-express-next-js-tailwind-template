import { renderHook, waitFor } from "@testing-library/react";
import { vi } from "vitest";
import { clearAuthCookies, setAuthCookies } from "@/lib/auth-utils";
import { getFromLocalStorage, removeFromLocalStorage } from "@/lib/utils";
import { useAuth } from "../useAuth";

// Mock dependencies
vi.mock("@/lib/utils", () => ({
  getFromLocalStorage: vi.fn(),
  removeFromLocalStorage: vi.fn(),
}));

vi.mock("@/lib/auth-utils", () => ({
  clearAuthCookies: vi.fn(),
  setAuthCookies: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

vi.mock("@tanstack/react-query", () => ({
  useQuery: vi.fn(() => ({
    data: null,
    isLoading: false,
    error: null,
  })),
}));

vi.mock("@/trpc/client", () => ({
  useTRPC: () => ({
    auth: {
      me: {
        queryOptions: vi.fn(() => ({
          queryKey: ["auth.me"],
          queryFn: vi.fn(),
        })),
      },
    },
  }),
}));

describe("useAuth Hook", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default mock implementation
    vi.mocked(getFromLocalStorage).mockReturnValue(null);
  });

  it("initializes with default state", () => {
    const { result } = renderHook(() => useAuth());

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
    expect(result.current.isLoading).toBe(false);
  });

  it("provides role-based helper functions", () => {
    const { result } = renderHook(() => useAuth());

    expect(typeof result.current.isAdmin).toBe("function");
    expect(typeof result.current.isUser).toBe("function");
    expect(typeof result.current.hasRole).toBe("function");
  });

  it("returns false for role checks when no user", () => {
    const { result } = renderHook(() => useAuth());

    expect(result.current.isAdmin()).toBe(false);
    expect(result.current.isUser()).toBe(false);
    expect(result.current.hasRole("admin")).toBe(false);
  });

  it("calls setAuthCookies on login", () => {
    const { result } = renderHook(() => useAuth());

    const tokens = {
      access_token: "test-access-token",
      refresh_token: "test-refresh-token",
      id: "test-user-id",
      role: "user",
    };

    result.current.login(tokens);

    expect(setAuthCookies).toHaveBeenCalledWith(tokens);
  });

  it("calls clearAuthCookies on logout", () => {
    const { result } = renderHook(() => useAuth());

    result.current.logout();

    expect(clearAuthCookies).toHaveBeenCalledOnce();
  });

  it("removes tokens from localStorage on error", async () => {
    // Mock useQuery to return an error
    const mockUseQuery = await import("@tanstack/react-query");
    vi.mocked(mockUseQuery.useQuery).mockReturnValue({
      data: null,
      isLoading: false,
      error: new Error("Unauthorized"),
    });

    renderHook(() => useAuth());

    await waitFor(() => {
      expect(removeFromLocalStorage).toHaveBeenCalledWith("accessToken");
      expect(removeFromLocalStorage).toHaveBeenCalledWith("refreshToken");
      expect(removeFromLocalStorage).toHaveBeenCalledWith("userId");
    });
  });
});
