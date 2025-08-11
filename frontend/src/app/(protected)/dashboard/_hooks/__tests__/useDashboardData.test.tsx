import {
  QueryClient,
  QueryClientProvider,
  useQuery,
} from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { vi } from "vitest";
import type { User } from "../../_types";
import { useDashboardData } from "../useDashboardData";

// Mock dependencies
const mockUser: User = {
  id: "1",
  email: "test@example.com",
  first_name: "John",
  last_name: "Doe",
  is_email_verified: true,
};

const mockHealthCheck = {
  status: "healthy",
  timestamp: "2023-01-01T00:00:00Z",
  uptime: 3600,
};

const mockAppInfo = {
  name: "Test App",
  version: "1.0.0",
  description: "Test description",
};

// Mock useAuth hook
import { useAuth } from "@/hooks/useAuth";

vi.mock("@/hooks/useAuth", () => ({
  useAuth: vi.fn(() => ({
    user: mockUser,
    isAuthenticated: true,
    loading: false,
  })),
}));

const mockUseAuth = vi.mocked(useAuth);

// Mock useTRPC client
const mockTRPC = {
  type: {
    healthCheck: {
      queryOptions: vi.fn(() => ({
        queryKey: ["healthCheck"],
        queryFn: () => Promise.resolve(mockHealthCheck),
      })),
    },
    getAppInfo: {
      queryOptions: vi.fn(() => ({
        queryKey: ["getAppInfo"],
        queryFn: () => Promise.resolve(mockAppInfo),
      })),
    },
  },
};

vi.mock("@/trpc/client", () => ({
  useTRPC: vi.fn(() => mockTRPC),
}));

// Mock useQuery to control its behavior
vi.mock("@tanstack/react-query", async () => {
  const actual = await vi.importActual("@tanstack/react-query");
  return {
    ...actual,
    useQuery: vi.fn(),
  };
});

// Get mocked version of useQuery
const mockUseQuery = vi.mocked(useQuery);

describe("useDashboardData", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  it("returns dashboard data with user, health check, and app info", () => {
    // Set up successful responses for both useQuery calls
    mockUseQuery
      .mockReturnValueOnce({
        data: mockHealthCheck,
        isLoading: false,
        error: null,
      })
      .mockReturnValueOnce({
        data: mockAppInfo,
        isLoading: false,
        error: null,
      });

    const { result } = renderHook(() => useDashboardData(), { wrapper });

    expect(result.current.dashboardData).toEqual({
      user: mockUser,
      healthCheck: mockHealthCheck,
      appInfo: mockAppInfo,
    });
    expect(result.current.isLoading).toBe(false);
    expect(result.current.hasError).toBe(false);
  });

  it("returns loading state when health check is loading", () => {
    // Set up health loading, app successful
    mockUseQuery
      .mockReturnValueOnce({
        data: undefined,
        isLoading: true,
        error: null,
      })
      .mockReturnValueOnce({
        data: mockAppInfo,
        isLoading: false,
        error: null,
      });

    const { result } = renderHook(() => useDashboardData(), { wrapper });

    expect(result.current.isLoading).toBe(true);
    expect(result.current.dashboardData.healthCheck).toBe(null);
  });

  it("returns loading state when app info is loading", () => {
    // Set up health successful, app loading
    mockUseQuery
      .mockReturnValueOnce({
        data: mockHealthCheck,
        isLoading: false,
        error: null,
      })
      .mockReturnValueOnce({
        data: undefined,
        isLoading: true,
        error: null,
      });

    const { result } = renderHook(() => useDashboardData(), { wrapper });

    expect(result.current.isLoading).toBe(true);
    expect(result.current.dashboardData.appInfo).toBe(null);
  });

  it("returns loading state when both queries are loading", () => {
    // Set up both queries loading
    mockUseQuery
      .mockReturnValueOnce({
        data: undefined,
        isLoading: true,
        error: null,
      })
      .mockReturnValueOnce({
        data: undefined,
        isLoading: true,
        error: null,
      });

    const { result } = renderHook(() => useDashboardData(), { wrapper });

    expect(result.current.isLoading).toBe(true);
  });

  it("handles health check error", () => {
    const healthError = new Error("Health check failed");

    // Set up health error, app successful
    mockUseQuery
      .mockReturnValueOnce({
        data: undefined,
        isLoading: false,
        error: healthError,
      })
      .mockReturnValueOnce({
        data: mockAppInfo,
        isLoading: false,
        error: null,
      });

    const { result } = renderHook(() => useDashboardData(), { wrapper });

    expect(result.current.hasError).toBe(true);
    expect(result.current.errors.health).toBe("Health check failed");
    expect(result.current.errors.app).toBe(null);
    expect(result.current.dashboardData.healthCheck).toBe(null);
  });

  it("handles app info error", () => {
    const appError = new Error("App info failed");

    // Set up health successful, app error
    mockUseQuery
      .mockReturnValueOnce({
        data: mockHealthCheck,
        isLoading: false,
        error: null,
      })
      .mockReturnValueOnce({
        data: undefined,
        isLoading: false,
        error: appError,
      });

    const { result } = renderHook(() => useDashboardData(), { wrapper });

    expect(result.current.hasError).toBe(true);
    expect(result.current.errors.health).toBe(null);
    expect(result.current.errors.app).toBe("App info failed");
    expect(result.current.dashboardData.appInfo).toBe(null);
  });

  it("handles both queries having errors", () => {
    const healthError = new Error("Health check failed");
    const appError = new Error("App info failed");

    // Set up both queries with errors
    mockUseQuery
      .mockReturnValueOnce({
        data: undefined,
        isLoading: false,
        error: healthError,
      })
      .mockReturnValueOnce({
        data: undefined,
        isLoading: false,
        error: appError,
      });

    const { result } = renderHook(() => useDashboardData(), { wrapper });

    expect(result.current.hasError).toBe(true);
    expect(result.current.errors.health).toBe("Health check failed");
    expect(result.current.errors.app).toBe("App info failed");
    expect(result.current.dashboardData.healthCheck).toBe(null);
    expect(result.current.dashboardData.appInfo).toBe(null);
  });

  it("handles null user from useAuth", () => {
    // Set up null user but successful queries
    mockUseAuth.mockReturnValueOnce({
      user: null,
      isAuthenticated: false,
      loading: false,
    });

    mockUseQuery
      .mockReturnValueOnce({
        data: mockHealthCheck,
        isLoading: false,
        error: null,
      })
      .mockReturnValueOnce({
        data: mockAppInfo,
        isLoading: false,
        error: null,
      });

    const { result } = renderHook(() => useDashboardData(), { wrapper });

    expect(result.current.dashboardData.user).toBe(null);
  });

  it("calls tRPC query options correctly", () => {
    // Set up successful responses
    mockUseQuery
      .mockReturnValueOnce({
        data: mockHealthCheck,
        isLoading: false,
        error: null,
      })
      .mockReturnValueOnce({
        data: mockAppInfo,
        isLoading: false,
        error: null,
      });

    renderHook(() => useDashboardData(), { wrapper });

    expect(mockTRPC.type.healthCheck.queryOptions).toHaveBeenCalledWith();
    expect(mockTRPC.type.getAppInfo.queryOptions).toHaveBeenCalledWith();
  });

  it("handles undefined data gracefully", () => {
    mockUseQuery
      .mockReturnValueOnce({
        data: undefined,
        isLoading: false,
        error: null,
      })
      .mockReturnValueOnce({
        data: undefined,
        isLoading: false,
        error: null,
      });

    const { result } = renderHook(() => useDashboardData(), { wrapper });

    expect(result.current.dashboardData.healthCheck).toBe(null);
    expect(result.current.dashboardData.appInfo).toBe(null);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.hasError).toBe(false);
  });

  it("handles partial data with one query successful and one failed", () => {
    const healthError = new Error("Network error");

    mockUseQuery
      .mockReturnValueOnce({
        data: undefined,
        isLoading: false,
        error: healthError,
      })
      .mockReturnValueOnce({
        data: mockAppInfo,
        isLoading: false,
        error: null,
      });

    const { result } = renderHook(() => useDashboardData(), { wrapper });

    expect(result.current.dashboardData.healthCheck).toBe(null);
    expect(result.current.dashboardData.appInfo).toBe(mockAppInfo);
    expect(result.current.hasError).toBe(true);
    expect(result.current.isLoading).toBe(false);
  });

  it("handles error objects without message property", () => {
    const healthError = { code: 500, details: "Server error" } as any;

    mockUseQuery
      .mockReturnValueOnce({
        data: undefined,
        isLoading: false,
        error: healthError,
      })
      .mockReturnValueOnce({
        data: mockAppInfo,
        isLoading: false,
        error: null,
      });

    const { result } = renderHook(() => useDashboardData(), { wrapper });

    expect(result.current.errors.health).toBe(null);
    expect(result.current.hasError).toBe(true);
  });

  it("maintains consistent return shape across different states", () => {
    // Set up initial successful responses
    mockUseQuery
      .mockReturnValueOnce({
        data: mockHealthCheck,
        isLoading: false,
        error: null,
      })
      .mockReturnValueOnce({
        data: mockAppInfo,
        isLoading: false,
        error: null,
      });

    const { result, rerender } = renderHook(() => useDashboardData(), {
      wrapper,
    });

    // Initial successful state
    expect(result.current).toHaveProperty("dashboardData");
    expect(result.current).toHaveProperty("isLoading");
    expect(result.current).toHaveProperty("hasError");
    expect(result.current).toHaveProperty("errors");

    // Change to loading state
    mockUseQuery
      .mockReturnValueOnce({
        data: undefined,
        isLoading: true,
        error: null,
      })
      .mockReturnValueOnce({
        data: undefined,
        isLoading: true,
        error: null,
      });

    rerender();

    expect(result.current).toHaveProperty("dashboardData");
    expect(result.current).toHaveProperty("isLoading");
    expect(result.current).toHaveProperty("hasError");
    expect(result.current).toHaveProperty("errors");
  });

  it("returns correct error structure", () => {
    // Set up successful responses
    mockUseQuery
      .mockReturnValueOnce({
        data: mockHealthCheck,
        isLoading: false,
        error: null,
      })
      .mockReturnValueOnce({
        data: mockAppInfo,
        isLoading: false,
        error: null,
      });

    const { result } = renderHook(() => useDashboardData(), { wrapper });

    expect(result.current.errors).toEqual({
      health: null,
      app: null,
    });
  });

  it("handles complex user object correctly", () => {
    const complexUser: User = {
      id: "user-123",
      email: "complex.user@example.com",
      first_name: "Jane",
      last_name: "Smith",
      is_email_verified: false,
      avatar: "https://example.com/avatar.jpg",
    };

    mockUseAuth.mockReturnValueOnce({
      user: complexUser,
      isAuthenticated: true,
      loading: false,
    });

    // Set up successful responses
    mockUseQuery
      .mockReturnValueOnce({
        data: mockHealthCheck,
        isLoading: false,
        error: null,
      })
      .mockReturnValueOnce({
        data: mockAppInfo,
        isLoading: false,
        error: null,
      });

    const { result } = renderHook(() => useDashboardData(), { wrapper });

    expect(result.current.dashboardData.user).toEqual(complexUser);
  });

  it("handles query options being called multiple times", () => {
    // Set up successful responses for initial render
    mockUseQuery
      .mockReturnValueOnce({
        data: mockHealthCheck,
        isLoading: false,
        error: null,
      })
      .mockReturnValueOnce({
        data: mockAppInfo,
        isLoading: false,
        error: null,
      });

    const { rerender } = renderHook(() => useDashboardData(), { wrapper });

    expect(mockTRPC.type.healthCheck.queryOptions).toHaveBeenCalledTimes(1);
    expect(mockTRPC.type.getAppInfo.queryOptions).toHaveBeenCalledTimes(1);

    // Set up responses for rerender
    mockUseQuery
      .mockReturnValueOnce({
        data: mockHealthCheck,
        isLoading: false,
        error: null,
      })
      .mockReturnValueOnce({
        data: mockAppInfo,
        isLoading: false,
        error: null,
      });

    rerender();

    expect(mockTRPC.type.healthCheck.queryOptions).toHaveBeenCalledTimes(2);
    expect(mockTRPC.type.getAppInfo.queryOptions).toHaveBeenCalledTimes(2);
  });

  it("handles changing health check data", () => {
    // Set up initial successful responses
    mockUseQuery
      .mockReturnValueOnce({
        data: mockHealthCheck,
        isLoading: false,
        error: null,
      })
      .mockReturnValueOnce({
        data: mockAppInfo,
        isLoading: false,
        error: null,
      });

    const { result, rerender } = renderHook(() => useDashboardData(), {
      wrapper,
    });

    expect(result.current.dashboardData.healthCheck).toBe(mockHealthCheck);

    const updatedHealthCheck = {
      ...mockHealthCheck,
      status: "warning",
      uptime: 7200,
    };

    mockUseQuery
      .mockReturnValueOnce({
        data: updatedHealthCheck,
        isLoading: false,
        error: null,
      })
      .mockReturnValueOnce({
        data: mockAppInfo,
        isLoading: false,
        error: null,
      });

    rerender();

    expect(result.current.dashboardData.healthCheck).toBe(updatedHealthCheck);
  });

  it("handles changing app info data", () => {
    // Set up initial successful responses
    mockUseQuery
      .mockReturnValueOnce({
        data: mockHealthCheck,
        isLoading: false,
        error: null,
      })
      .mockReturnValueOnce({
        data: mockAppInfo,
        isLoading: false,
        error: null,
      });

    const { result, rerender } = renderHook(() => useDashboardData(), {
      wrapper,
    });

    expect(result.current.dashboardData.appInfo).toBe(mockAppInfo);

    const updatedAppInfo = {
      ...mockAppInfo,
      version: "2.0.0",
      name: "Updated App",
    };

    mockUseQuery
      .mockReturnValueOnce({
        data: mockHealthCheck,
        isLoading: false,
        error: null,
      })
      .mockReturnValueOnce({
        data: updatedAppInfo,
        isLoading: false,
        error: null,
      });

    rerender();

    expect(result.current.dashboardData.appInfo).toBe(updatedAppInfo);
  });

  it("correctly determines loading state logic", () => {
    // Test all combinations of loading states
    const combinations = [
      { health: true, app: true, expected: true },
      { health: true, app: false, expected: true },
      { health: false, app: true, expected: true },
      { health: false, app: false, expected: false },
    ];

    combinations.forEach(({ health, app, expected }) => {
      mockUseQuery
        .mockReturnValueOnce({
          data: health ? undefined : mockHealthCheck,
          isLoading: health,
          error: null,
        })
        .mockReturnValueOnce({
          data: app ? undefined : mockAppInfo,
          isLoading: app,
          error: null,
        });

      const { result } = renderHook(() => useDashboardData(), { wrapper });

      expect(result.current.isLoading).toBe(expected);
    });
  });

  it("correctly determines error state logic", () => {
    // Test all combinations of error states
    const healthError = new Error("Health failed");
    const appError = new Error("App failed");

    const combinations = [
      { health: healthError, app: null, expected: true },
      { health: null, app: appError, expected: true },
      { health: healthError, app: appError, expected: true },
      { health: null, app: null, expected: false },
    ];

    combinations.forEach(({ health, app, expected }) => {
      mockUseQuery
        .mockReturnValueOnce({
          data: health ? undefined : mockHealthCheck,
          isLoading: false,
          error: health,
        })
        .mockReturnValueOnce({
          data: app ? undefined : mockAppInfo,
          isLoading: false,
          error: app,
        });

      const { result } = renderHook(() => useDashboardData(), { wrapper });

      expect(result.current.hasError).toBe(expected);
    });
  });
});
