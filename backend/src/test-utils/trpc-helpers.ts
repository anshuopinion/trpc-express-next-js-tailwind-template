import { vi } from "vitest";

/**
 * Create a mock tRPC context for testing
 */
export const createMockTRPCContext = (overrides: any = {}) => ({
  user: null,
  isAuthenticated: false,
  ...overrides,
});

/**
 * Create a mock authenticated tRPC context
 */
export const createMockAuthenticatedContext = (user: any) => ({
  user,
  isAuthenticated: true,
});

/**
 * Create a mock admin tRPC context
 */
export const createMockAdminContext = (user: any) => ({
  user: { ...user, role: "admin" },
  isAuthenticated: true,
});

/**
 * Mock tRPC input validator
 */
export const mockTRPCInput = <T>(input: T): T => input;

/**
 * Mock successful tRPC response
 */
export const mockTRPCSuccess = <T>(data: T) => ({
  ok: true,
  data,
  error: null,
});

/**
 * Mock tRPC error response
 */
export const mockTRPCError = (message: string, code = "BAD_REQUEST") => ({
  ok: false,
  data: null,
  error: {
    message,
    code,
  },
});

/**
 * Mock tRPC procedure calls for unit testing
 */
export const createTRPCMocks = () => ({
  // Auth procedures
  auth: {
    signin: vi.fn(),
    signup: vi.fn(),
    logout: vi.fn(),
    me: vi.fn(),
    refresh: vi.fn(),
  },

  // User procedures
  user: {
    updateProfile: vi.fn(),
    changePassword: vi.fn(),
    deleteAccount: vi.fn(),
  },

  // Admin procedures
  admin: {
    getAllUsers: vi.fn(),
    updateUserRole: vi.fn(),
    deleteUser: vi.fn(),
    getSystemStats: vi.fn(),
  },

  // Type procedures
  type: {
    healthCheck: vi.fn(),
    getAppInfo: vi.fn(),
    validateEmail: vi.fn(),
  },
});

/**
 * Mock data for common tRPC responses
 */
export const mockTRPCData = {
  // User data
  user: {
    id: "test-user-id",
    email: "test@example.com",
    first_name: "Test",
    last_name: "User",
    role: "user" as const,
    is_email_verified: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },

  // Admin data
  admin: {
    id: "test-admin-id",
    email: "admin@example.com",
    first_name: "Test",
    last_name: "Admin",
    role: "admin" as const,
    is_email_verified: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },

  // Auth tokens
  tokens: {
    access_token: "mock-access-token",
    refresh_token: "mock-refresh-token",
    expires_at: Math.floor(Date.now() / 1000) + 60 * 15,
  },

  // Health check
  healthCheck: {
    status: "healthy" as const,
    timestamp: new Date().toISOString(),
    uptime: 12345,
  },

  // System stats
  systemStats: {
    totalUsers: 10,
    totalAdmins: 2,
    activeUsers: 8,
    serverUptime: "2 days",
  },

  // App info
  appInfo: {
    name: "tRPC Express Template",
    version: "1.0.0",
    environment: "test",
  },
};

/**
 * Assert tRPC error with specific code
 */
export const expectTRPCError = (error: any, code: string, message?: string) => {
  expect(error).toBeDefined();
  expect(error.code).toBe(code);
  if (message) {
    expect(error.message).toContain(message);
  }
};

/**
 * Assert successful tRPC response
 */
export const expectTRPCSuccess = (response: any, expectedData?: any) => {
  expect(response).toBeDefined();
  if (expectedData) {
    expect(response).toMatchObject(expectedData);
  }
};

/**
 * Create test input data for tRPC procedures
 */
export const createTestInput = {
  // Signin input
  signin: (overrides: any = {}) => ({
    email: "test@example.com",
    password: "Test123!",
    ...overrides,
  }),

  // Signup input
  signup: (overrides: any = {}) => ({
    email: "test@example.com",
    password: "Test123!",
    first_name: "Test",
    last_name: "User",
    ...overrides,
  }),

  // Update profile input
  updateProfile: (overrides: any = {}) => ({
    first_name: "Updated",
    last_name: "Name",
    ...overrides,
  }),

  // Change password input
  changePassword: (overrides: any = {}) => ({
    currentPassword: "OldPassword123!",
    newPassword: "NewPassword123!",
    ...overrides,
  }),

  // Update user role input
  updateUserRole: (overrides: any = {}) => ({
    userId: "test-user-id",
    role: "admin" as const,
    ...overrides,
  }),
};
