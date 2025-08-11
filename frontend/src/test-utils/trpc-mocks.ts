import { vi } from "vitest";

// Mock tRPC client for testing
export const mockTrpcClient = {
  auth: {
    me: {
      queryOptions: vi.fn(() => ({
        queryKey: ["auth.me"],
        queryFn: vi.fn(),
      })),
    },
    signin: {
      mutationOptions: vi.fn(() => ({
        mutationFn: vi.fn(),
      })),
    },
    signup: {
      mutationOptions: vi.fn(() => ({
        mutationFn: vi.fn(),
      })),
    },
  },
  user: {
    updateProfile: {
      mutationOptions: vi.fn(() => ({
        mutationFn: vi.fn(),
      })),
    },
  },
  type: {
    healthCheck: {
      queryOptions: vi.fn(() => ({
        queryKey: ["type.healthCheck"],
        queryFn: vi.fn(),
      })),
    },
  },
};

// Helper to create mock tRPC provider for tests
export const createMockTrpcProvider = () => ({
  useTRPC: () => mockTrpcClient,
});

// Mock data for common API responses
export const mockUserData = {
  id: "test-user-id",
  email: "test@example.com",
  firstName: "John",
  lastName: "Doe",
  role: "user" as const,
  createdAt: new Date(),
  updatedAt: new Date(),
};

export const mockAdminData = {
  ...mockUserData,
  role: "admin" as const,
};

export const mockAuthTokens = {
  access_token: "mock-access-token",
  refresh_token: "mock-refresh-token",
  id: "test-user-id",
  role: "user",
};

export const mockHealthCheckData = {
  status: "healthy" as const,
  timestamp: new Date().toISOString(),
  uptime: 12345,
};
