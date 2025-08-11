import { act, renderHook } from "@testing-library/react";
import { vi } from "vitest";
import { useSigninMutation } from "../useSigninMutation";

// Mock all dependencies
const mockRouter = {
  push: vi.fn(),
  replace: vi.fn(),
  back: vi.fn(),
};

const mockLogin = vi.fn();
const mockMutate = vi.fn();
const mockUseMutation = vi.fn();

const mockTrpcClient = {
  auth: {
    signin: {
      mutationOptions: vi.fn(),
    },
  },
};

vi.mock("next/navigation", () => ({
  useRouter: () => mockRouter,
}));

vi.mock("@tanstack/react-query", () => ({
  useMutation: (...args: any) => mockUseMutation(...args),
}));

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock("@/hooks/useAuth", () => ({
  useAuth: () => ({ login: mockLogin }),
}));

vi.mock("@/trpc/client", () => ({
  useTRPC: () => mockTrpcClient,
}));

describe("useSigninMutation", () => {
  const mockMutationReturn = {
    mutate: mockMutate,
    isPending: false,
    isError: false,
    error: null,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseMutation.mockReturnValue(mockMutationReturn);
    mockTrpcClient.auth.signin.mutationOptions.mockReturnValue({
      mutationFn: vi.fn(),
    });
  });

  it("initializes with correct tRPC mutation options", () => {
    renderHook(() => useSigninMutation());

    expect(mockTrpcClient.auth.signin.mutationOptions).toHaveBeenCalledWith({
      onSuccess: expect.any(Function),
      onError: expect.any(Function),
    });
  });

  it("calls useMutation with tRPC options", () => {
    renderHook(() => useSigninMutation());

    expect(mockUseMutation).toHaveBeenCalledWith({
      mutationFn: expect.any(Function),
    });
  });

  it("returns mutation object, handleSignin function, and isPending state", () => {
    const { result } = renderHook(() => useSigninMutation());

    expect(result.current.signinMutation).toBe(mockMutationReturn);
    expect(typeof result.current.handleSignin).toBe("function");
    expect(result.current.isPending).toBe(false);
  });

  it("handles successful signin correctly", async () => {
    let onSuccessCallback: (data: any) => void;

    mockTrpcClient.auth.signin.mutationOptions.mockImplementation(({ onSuccess }) => {
      onSuccessCallback = onSuccess;
      return { mutationFn: vi.fn() };
    });

    renderHook(() => useSigninMutation());

    const mockData = {
      user: { id: "1", email: "test@example.com" },
      tokens: { accessToken: "token123" },
    };

    act(() => {
      onSuccessCallback(mockData);
    });

    expect(mockLogin).toHaveBeenCalledWith(mockData);
    // Import the mocked toast to verify calls
    const { toast } = await import("sonner");
    expect(toast.success).toHaveBeenCalledWith("Login successful", {
      description: "Redirecting to scanner dashboard...",
    });
    expect(mockRouter.replace).toHaveBeenCalledWith("/dashboard");
  });

  it("handles signin error correctly", async () => {
    let onErrorCallback: (error: any) => void;

    mockTrpcClient.auth.signin.mutationOptions.mockImplementation(({ onError }) => {
      onErrorCallback = onError;
      return { mutationFn: vi.fn() };
    });

    renderHook(() => useSigninMutation());

    const mockError = new Error("Invalid credentials");

    act(() => {
      onErrorCallback(mockError);
    });

    // Import the mocked toast to verify calls
    const { toast } = await import("sonner");
    expect(toast.error).toHaveBeenCalledWith("Authentication failed", {
      description: "Invalid credentials",
    });
  });

  it("handleSignin calls mutation with correct data", () => {
    const { result } = renderHook(() => useSigninMutation());

    const formData = {
      email: "test@example.com",
      password: "password123",
    };

    act(() => {
      result.current.handleSignin(formData);
    });

    expect(mockMutate).toHaveBeenCalledWith({
      email: "test@example.com",
      password: "password123",
    });
  });

  it("reflects isPending state from mutation", () => {
    // Test with pending state
    mockUseMutation.mockReturnValue({
      ...mockMutationReturn,
      isPending: true,
    });

    const { result } = renderHook(() => useSigninMutation());

    expect(result.current.isPending).toBe(true);
  });

  it("integrates all hooks correctly", () => {
    const { result } = renderHook(() => useSigninMutation());

    // Verify all mocked dependencies were called
    expect(mockTrpcClient.auth.signin.mutationOptions).toHaveBeenCalled();
    expect(mockUseMutation).toHaveBeenCalled();

    // Verify return structure
    expect(result.current).toHaveProperty("signinMutation");
    expect(result.current).toHaveProperty("handleSignin");
    expect(result.current).toHaveProperty("isPending");
  });

  it("handles multiple signin attempts", () => {
    const { result } = renderHook(() => useSigninMutation());

    const formData1 = { email: "user1@example.com", password: "pass1" };
    const formData2 = { email: "user2@example.com", password: "pass2" };

    act(() => {
      result.current.handleSignin(formData1);
    });

    act(() => {
      result.current.handleSignin(formData2);
    });

    expect(mockMutate).toHaveBeenCalledTimes(2);
    expect(mockMutate).toHaveBeenNthCalledWith(1, formData1);
    expect(mockMutate).toHaveBeenNthCalledWith(2, formData2);
  });
});
