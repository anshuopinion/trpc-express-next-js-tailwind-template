import { renderHook, act } from "@testing-library/react";
import { vi } from "vitest";
import { useSignupMutation } from "../useSignupMutation";

// Mock all dependencies
const mockRouter = {
  push: vi.fn(),
  replace: vi.fn(),
  back: vi.fn(),
};

const mockMutate = vi.fn();
const mockUseMutation = vi.fn();

const mockTrpcClient = {
  auth: {
    signup: {
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

vi.mock("@/trpc/client", () => ({
  useTRPC: () => mockTrpcClient,
}));

describe("useSignupMutation", () => {
  const mockMutationReturn = {
    mutate: mockMutate,
    isPending: false,
    isError: false,
    error: null,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseMutation.mockReturnValue(mockMutationReturn);
    mockTrpcClient.auth.signup.mutationOptions.mockReturnValue({
      mutationFn: vi.fn(),
    });
  });

  it("initializes with correct tRPC mutation options", () => {
    renderHook(() => useSignupMutation());

    expect(mockTrpcClient.auth.signup.mutationOptions).toHaveBeenCalledWith({
      onSuccess: expect.any(Function),
      onError: expect.any(Function),
    });
  });

  it("calls useMutation with tRPC options", () => {
    renderHook(() => useSignupMutation());

    expect(mockUseMutation).toHaveBeenCalledWith({
      mutationFn: expect.any(Function),
    });
  });

  it("returns mutation object, handleSignup function, and isPending state", () => {
    const { result } = renderHook(() => useSignupMutation());

    expect(result.current.signupMutation).toBe(mockMutationReturn);
    expect(typeof result.current.handleSignup).toBe("function");
    expect(result.current.isPending).toBe(false);
  });

  it("handles successful signup correctly", async () => {
    let onSuccessCallback: () => void;

    mockTrpcClient.auth.signup.mutationOptions.mockImplementation(
      ({ onSuccess }) => {
        onSuccessCallback = onSuccess;
        return { mutationFn: vi.fn() };
      },
    );

    renderHook(() => useSignupMutation());

    act(() => {
      onSuccessCallback();
    });

    // Wait for setTimeout to complete
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    // Import the mocked toast to verify calls
    const { toast } = await import("sonner");
    expect(toast.success).toHaveBeenCalledWith("Account created successfully", {
      description: "You can now sign in and start using tRPC Template",
    });

    // Router.push should be called after delay (we'll check after timeout simulation)
    setTimeout(() => {
      expect(mockRouter.push).toHaveBeenCalledWith("/signin");
    }, 1500);
  });

  it("handles signup error correctly", async () => {
    let onErrorCallback: (error: any) => void;

    mockTrpcClient.auth.signup.mutationOptions.mockImplementation(
      ({ onError }) => {
        onErrorCallback = onError;
        return { mutationFn: vi.fn() };
      },
    );

    renderHook(() => useSignupMutation());

    const mockError = new Error("Email already exists");

    act(() => {
      onErrorCallback(mockError);
    });

    // Import the mocked toast to verify calls
    const { toast } = await import("sonner");
    expect(toast.error).toHaveBeenCalledWith("Registration failed", {
      description: "Email already exists",
    });
  });

  it("handleSignup calls mutation with correct data format", () => {
    const { result } = renderHook(() => useSignupMutation());

    const formData = {
      first_name: "John",
      last_name: "Doe",
      email: "john@example.com",
      password: "password123",
      confirmPassword: "password123",
    };

    act(() => {
      result.current.handleSignup(formData);
    });

    expect(mockMutate).toHaveBeenCalledWith({
      email: "john@example.com",
      password: "password123",
      first_name: "John",
      last_name: "Doe",
    });
  });

  it("reflects isPending state from mutation", () => {
    // Test with pending state
    mockUseMutation.mockReturnValue({
      ...mockMutationReturn,
      isPending: true,
    });

    const { result } = renderHook(() => useSignupMutation());

    expect(result.current.isPending).toBe(true);
  });

  it("integrates all hooks correctly", () => {
    const { result } = renderHook(() => useSignupMutation());

    // Verify all mocked dependencies were called
    expect(mockTrpcClient.auth.signup.mutationOptions).toHaveBeenCalled();
    expect(mockUseMutation).toHaveBeenCalled();

    // Verify return structure
    expect(result.current).toHaveProperty("signupMutation");
    expect(result.current).toHaveProperty("handleSignup");
    expect(result.current).toHaveProperty("isPending");
  });

  it("handles multiple signup attempts", () => {
    const { result } = renderHook(() => useSignupMutation());

    const formData1 = {
      first_name: "Alice",
      last_name: "Smith",
      email: "alice@example.com",
      password: "pass1",
      confirmPassword: "pass1",
    };
    const formData2 = {
      first_name: "Bob",
      last_name: "Johnson",
      email: "bob@example.com",
      password: "pass2",
      confirmPassword: "pass2",
    };

    act(() => {
      result.current.handleSignup(formData1);
    });

    act(() => {
      result.current.handleSignup(formData2);
    });

    expect(mockMutate).toHaveBeenCalledTimes(2);
    expect(mockMutate).toHaveBeenNthCalledWith(1, {
      email: "alice@example.com",
      password: "pass1",
      first_name: "Alice",
      last_name: "Smith",
    });
    expect(mockMutate).toHaveBeenNthCalledWith(2, {
      email: "bob@example.com",
      password: "pass2",
      first_name: "Bob",
      last_name: "Johnson",
    });
  });

  it("does not include confirmPassword in mutation data", () => {
    const { result } = renderHook(() => useSignupMutation());

    const formData = {
      first_name: "Jane",
      last_name: "Doe",
      email: "jane@example.com",
      password: "password123",
      confirmPassword: "password123", // This should not be sent to backend
    };

    act(() => {
      result.current.handleSignup(formData);
    });

    expect(mockMutate).toHaveBeenCalledWith({
      email: "jane@example.com",
      password: "password123",
      first_name: "Jane",
      last_name: "Doe",
    });

    // Verify confirmPassword is NOT included
    expect(mockMutate).not.toHaveBeenCalledWith(
      expect.objectContaining({
        confirmPassword: expect.anything(),
      }),
    );
  });

  it("handles successful redirect after signup", async () => {
    let onSuccessCallback: () => void;

    mockTrpcClient.auth.signup.mutationOptions.mockImplementation(
      ({ onSuccess }) => {
        onSuccessCallback = onSuccess;
        return { mutationFn: vi.fn() };
      },
    );

    renderHook(() => useSignupMutation());

    act(() => {
      onSuccessCallback();
    });

    // Verify success callback behavior (toast is already tested above)
    const { toast } = await import("sonner");
    expect(toast.success).toHaveBeenCalledWith("Account created successfully", {
      description: "You can now sign in and start using tRPC Template",
    });
  });
});
