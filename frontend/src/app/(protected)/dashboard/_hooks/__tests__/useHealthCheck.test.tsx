import {
  QueryClient,
  QueryClientProvider,
  useQuery,
} from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { vi } from "vitest";
import { useHealthCheck } from "../useHealthCheck";

// Mock health check data
const mockHealthyData = {
  status: "healthy",
  timestamp: "2023-01-01T00:00:00Z",
  uptime: 3600,
};

const mockUnhealthyData = {
  status: "error",
  timestamp: "2023-01-01T00:00:00Z",
  uptime: 1800,
};

// Mock useTRPC client
const mockTRPC = {
  type: {
    healthCheck: {
      queryOptions: vi.fn(() => ({
        queryKey: ["healthCheck"],
        queryFn: () => Promise.resolve(mockHealthyData),
      })),
    },
  },
};

vi.mock("@/trpc/client", () => ({
  useTRPC: vi.fn(() => mockTRPC),
}));

// Mock useQuery to control its behavior
const mockRefetch = vi.fn();

vi.mock("@tanstack/react-query", async () => {
  const actual = await vi.importActual("@tanstack/react-query");
  return {
    ...actual,
    useQuery: vi.fn(),
  };
});

// Get mocked version of useQuery
const mockUseQuery = vi.mocked(useQuery);

describe("useHealthCheck", () => {
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

    // Default successful response
    mockUseQuery.mockReturnValue({
      data: mockHealthyData,
      isLoading: false,
      error: null,
      refetch: mockRefetch,
    });
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  it("returns health check data when successful", () => {
    const { result } = renderHook(() => useHealthCheck(), { wrapper });

    expect(result.current.healthCheck).toEqual(mockHealthyData);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBe(null);
    expect(result.current.isHealthy).toBe(true);
    expect(typeof result.current.refetch).toBe("function");
  });

  it("returns loading state correctly", () => {
    mockUseQuery.mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
      refetch: mockRefetch,
    });

    const { result } = renderHook(() => useHealthCheck(), { wrapper });

    expect(result.current.healthCheck).toBeUndefined();
    expect(result.current.isLoading).toBe(true);
    expect(result.current.error).toBe(null);
    expect(result.current.isHealthy).toBe(false);
  });

  it("handles error state correctly", () => {
    const error = new Error("Health check failed");
    mockUseQuery.mockReturnValue({
      data: undefined,
      isLoading: false,
      error,
      refetch: mockRefetch,
    });

    const { result } = renderHook(() => useHealthCheck(), { wrapper });

    expect(result.current.healthCheck).toBeUndefined();
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBe(error);
    expect(result.current.isHealthy).toBe(false);
  });

  it("correctly determines isHealthy for healthy status", () => {
    const { result } = renderHook(() => useHealthCheck(), { wrapper });

    expect(result.current.isHealthy).toBe(true);
  });

  it("correctly determines isHealthy for unhealthy status", () => {
    mockUseQuery.mockReturnValue({
      data: mockUnhealthyData,
      isLoading: false,
      error: null,
      refetch: mockRefetch,
    });

    const { result } = renderHook(() => useHealthCheck(), { wrapper });

    expect(result.current.isHealthy).toBe(false);
  });

  it("correctly determines isHealthy for case-insensitive healthy status", () => {
    const uppercaseHealthyData = {
      ...mockHealthyData,
      status: "HEALTHY",
    };

    mockUseQuery.mockReturnValue({
      data: uppercaseHealthyData,
      isLoading: false,
      error: null,
      refetch: mockRefetch,
    });

    const { result } = renderHook(() => useHealthCheck(), { wrapper });

    expect(result.current.isHealthy).toBe(true);
  });

  it("correctly determines isHealthy for mixed case healthy status", () => {
    const mixedCaseHealthyData = {
      ...mockHealthyData,
      status: "Healthy",
    };

    mockUseQuery.mockReturnValue({
      data: mixedCaseHealthyData,
      isLoading: false,
      error: null,
      refetch: mockRefetch,
    });

    const { result } = renderHook(() => useHealthCheck(), { wrapper });

    expect(result.current.isHealthy).toBe(true);
  });

  it("handles undefined healthCheck data gracefully", () => {
    mockUseQuery.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: null,
      refetch: mockRefetch,
    });

    const { result } = renderHook(() => useHealthCheck(), { wrapper });

    expect(result.current.healthCheck).toBeUndefined();
    expect(result.current.isHealthy).toBe(false);
  });

  it("handles null healthCheck data gracefully", () => {
    mockUseQuery.mockReturnValue({
      data: null,
      isLoading: false,
      error: null,
      refetch: mockRefetch,
    });

    const { result } = renderHook(() => useHealthCheck(), { wrapper });

    expect(result.current.healthCheck).toBe(null);
    expect(result.current.isHealthy).toBe(false);
  });

  it("handles healthCheck data without status property", () => {
    const incompleteData = {
      timestamp: "2023-01-01T00:00:00Z",
      uptime: 3600,
    } as any;

    mockUseQuery.mockReturnValue({
      data: incompleteData,
      isLoading: false,
      error: null,
      refetch: mockRefetch,
    });

    const { result } = renderHook(() => useHealthCheck(), { wrapper });

    expect(result.current.healthCheck).toBe(incompleteData);
    expect(result.current.isHealthy).toBe(false);
  });

  it("calls tRPC queryOptions with correct parameters", () => {
    renderHook(() => useHealthCheck(), { wrapper });

    expect(mockTRPC.type.healthCheck.queryOptions).toHaveBeenCalledWith(
      void 0,
      {
        refetchInterval: 30000,
        staleTime: 15000,
      },
    );
  });

  it("provides refetch function", () => {
    const { result } = renderHook(() => useHealthCheck(), { wrapper });

    expect(result.current.refetch).toBe(mockRefetch);
    expect(typeof result.current.refetch).toBe("function");
  });

  it("can call refetch function", () => {
    const { result } = renderHook(() => useHealthCheck(), { wrapper });

    result.current.refetch();

    expect(mockRefetch).toHaveBeenCalledTimes(1);
  });

  it("handles different status values correctly", () => {
    const statusTests = [
      { status: "healthy", expected: true },
      { status: "HEALTHY", expected: true },
      { status: "Healthy", expected: true },
      { status: "error", expected: false },
      { status: "warning", expected: false },
      { status: "offline", expected: false },
      { status: "maintenance", expected: false },
      { status: "", expected: false },
      { status: null, expected: false },
      { status: undefined, expected: false },
    ];

    statusTests.forEach(({ status, expected }) => {
      const testData = {
        ...mockHealthyData,
        status,
      };

      mockUseQuery.mockReturnValue({
        data: testData,
        isLoading: false,
        error: null,
        refetch: mockRefetch,
      });

      const { result } = renderHook(() => useHealthCheck(), { wrapper });

      expect(result.current.isHealthy).toBe(expected);
    });
  });

  it("maintains consistent return shape across different states", () => {
    const { result, rerender } = renderHook(() => useHealthCheck(), {
      wrapper,
    });

    // Initial successful state
    expect(result.current).toHaveProperty("healthCheck");
    expect(result.current).toHaveProperty("isLoading");
    expect(result.current).toHaveProperty("error");
    expect(result.current).toHaveProperty("refetch");
    expect(result.current).toHaveProperty("isHealthy");

    // Change to loading state
    mockUseQuery.mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
      refetch: mockRefetch,
    });

    rerender();

    expect(result.current).toHaveProperty("healthCheck");
    expect(result.current).toHaveProperty("isLoading");
    expect(result.current).toHaveProperty("error");
    expect(result.current).toHaveProperty("refetch");
    expect(result.current).toHaveProperty("isHealthy");

    // Change to error state
    mockUseQuery.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: new Error("Failed"),
      refetch: mockRefetch,
    });

    rerender();

    expect(result.current).toHaveProperty("healthCheck");
    expect(result.current).toHaveProperty("isLoading");
    expect(result.current).toHaveProperty("error");
    expect(result.current).toHaveProperty("refetch");
    expect(result.current).toHaveProperty("isHealthy");
  });

  it("handles query options being called multiple times", () => {
    const { rerender } = renderHook(() => useHealthCheck(), { wrapper });

    expect(mockTRPC.type.healthCheck.queryOptions).toHaveBeenCalledTimes(1);

    rerender();

    expect(mockTRPC.type.healthCheck.queryOptions).toHaveBeenCalledTimes(2);
  });

  it("passes correct query options to useQuery", () => {
    renderHook(() => useHealthCheck(), { wrapper });

    expect(mockTRPC.type.healthCheck.queryOptions).toHaveBeenCalledWith(
      void 0,
      {
        refetchInterval: 30000,
        staleTime: 15000,
      },
    );
  });

  it("handles changing health check data", () => {
    const { result, rerender } = renderHook(() => useHealthCheck(), {
      wrapper,
    });

    expect(result.current.healthCheck).toBe(mockHealthyData);
    expect(result.current.isHealthy).toBe(true);

    // Change to unhealthy data
    mockUseQuery.mockReturnValue({
      data: mockUnhealthyData,
      isLoading: false,
      error: null,
      refetch: mockRefetch,
    });

    rerender();

    expect(result.current.healthCheck).toBe(mockUnhealthyData);
    expect(result.current.isHealthy).toBe(false);
  });

  it("handles transition from loading to success", () => {
    // Start with loading state
    mockUseQuery.mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
      refetch: mockRefetch,
    });

    const { result, rerender } = renderHook(() => useHealthCheck(), {
      wrapper,
    });

    expect(result.current.isLoading).toBe(true);
    expect(result.current.healthCheck).toBeUndefined();
    expect(result.current.isHealthy).toBe(false);

    // Transition to success
    mockUseQuery.mockReturnValue({
      data: mockHealthyData,
      isLoading: false,
      error: null,
      refetch: mockRefetch,
    });

    rerender();

    expect(result.current.isLoading).toBe(false);
    expect(result.current.healthCheck).toBe(mockHealthyData);
    expect(result.current.isHealthy).toBe(true);
  });

  it("handles transition from loading to error", () => {
    // Start with loading state
    mockUseQuery.mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
      refetch: mockRefetch,
    });

    const { result, rerender } = renderHook(() => useHealthCheck(), {
      wrapper,
    });

    expect(result.current.isLoading).toBe(true);
    expect(result.current.error).toBe(null);
    expect(result.current.isHealthy).toBe(false);

    // Transition to error
    const error = new Error("Network failure");
    mockUseQuery.mockReturnValue({
      data: undefined,
      isLoading: false,
      error,
      refetch: mockRefetch,
    });

    rerender();

    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBe(error);
    expect(result.current.isHealthy).toBe(false);
  });

  it("handles complex health check data", () => {
    const complexHealthData = {
      status: "healthy",
      timestamp: "2023-01-01T12:00:00.000Z",
      uptime: 86400, // 24 hours
      version: "1.2.3",
      services: {
        database: "connected",
        cache: "connected",
      },
    };

    mockUseQuery.mockReturnValue({
      data: complexHealthData,
      isLoading: false,
      error: null,
      refetch: mockRefetch,
    });

    const { result } = renderHook(() => useHealthCheck(), { wrapper });

    expect(result.current.healthCheck).toBe(complexHealthData);
    expect(result.current.isHealthy).toBe(true);
  });

  it("handles refetch with different parameters", () => {
    const { result } = renderHook(() => useHealthCheck(), { wrapper });

    // Call refetch with no parameters
    result.current.refetch();
    expect(mockRefetch).toHaveBeenCalledTimes(1);

    // Call refetch with parameters
    result.current.refetch({ throwOnError: true });
    expect(mockRefetch).toHaveBeenCalledTimes(2);
    expect(mockRefetch).toHaveBeenLastCalledWith({ throwOnError: true });
  });

  it("correctly handles edge case where status is an empty string", () => {
    const emptyStatusData = {
      ...mockHealthyData,
      status: "",
    };

    mockUseQuery.mockReturnValue({
      data: emptyStatusData,
      isLoading: false,
      error: null,
      refetch: mockRefetch,
    });

    const { result } = renderHook(() => useHealthCheck(), { wrapper });

    expect(result.current.isHealthy).toBe(false);
  });

  it("correctly handles whitespace-only status", () => {
    const whitespaceStatusData = {
      ...mockHealthyData,
      status: "   ",
    };

    mockUseQuery.mockReturnValue({
      data: whitespaceStatusData,
      isLoading: false,
      error: null,
      refetch: mockRefetch,
    });

    const { result } = renderHook(() => useHealthCheck(), { wrapper });

    expect(result.current.isHealthy).toBe(false);
  });

  it("handles status with surrounding whitespace", () => {
    const whitespaceHealthyData = {
      ...mockHealthyData,
      status: "  healthy  ",
    };

    mockUseQuery.mockReturnValue({
      data: whitespaceHealthyData,
      isLoading: false,
      error: null,
      refetch: mockRefetch,
    });

    const { result } = renderHook(() => useHealthCheck(), { wrapper });

    // The toLowerCase comparison should handle whitespace correctly
    expect(result.current.isHealthy).toBe(false); // Since we don't trim in the actual code
  });
});
