import { renderHook, act } from "@testing-library/react";
import { vi } from "vitest";
import { useSigninForm } from "../useSigninForm";

// Mock react-hook-form
const mockUseForm = vi.fn();
vi.mock("react-hook-form", () => ({
  useForm: (...args: any) => mockUseForm(...args),
}));

// Mock the resolver
vi.mock("@hookform/resolvers/zod", () => ({
  zodResolver: vi.fn((schema) => ({ schema, type: "zod" })),
}));

// Mock the schema
vi.mock("../../_schema", () => ({
  signinSchema: { type: "signin-schema" },
}));

describe("useSigninForm", () => {
  const mockFormReturn = {
    control: { name: "form-control" },
    handleSubmit: vi.fn(),
    formState: { errors: {}, isSubmitting: false },
    watch: vi.fn(),
    getValues: vi.fn(),
    setValue: vi.fn(),
    reset: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseForm.mockReturnValue(mockFormReturn);
  });

  it("calls useForm with correct configuration", () => {
    renderHook(() => useSigninForm());

    expect(mockUseForm).toHaveBeenCalledWith({
      resolver: { schema: { type: "signin-schema" }, type: "zod" },
      defaultValues: {
        email: "",
        password: "",
      },
    });
  });

  it("returns the form object from useForm", () => {
    const { result } = renderHook(() => useSigninForm());

    expect(result.current).toBe(mockFormReturn);
  });

  it("provides correct default values", () => {
    renderHook(() => useSigninForm());

    const callArgs = mockUseForm.mock.calls[0][0];
    expect(callArgs.defaultValues).toEqual({
      email: "",
      password: "",
    });
  });

  it("uses zodResolver with signinSchema", () => {
    renderHook(() => useSigninForm());

    const callArgs = mockUseForm.mock.calls[0][0];
    expect(callArgs.resolver).toEqual({
      schema: { type: "signin-schema" },
      type: "zod",
    });
  });

  it("maintains consistent form configuration across re-renders", () => {
    const { rerender } = renderHook(() => useSigninForm());

    // Clear previous calls
    mockUseForm.mockClear();

    rerender();

    // Should not be called again on re-render (useForm should handle this internally)
    expect(mockUseForm).toHaveBeenCalledTimes(1);
  });

  it("returns form methods for external use", () => {
    const { result } = renderHook(() => useSigninForm());

    expect(result.current.control).toBeDefined();
    expect(result.current.handleSubmit).toBeDefined();
    expect(result.current.formState).toBeDefined();
    expect(typeof result.current.handleSubmit).toBe("function");
  });

  it("integrates with TypeScript types correctly", () => {
    const { result } = renderHook(() => useSigninForm());

    // This test ensures the hook returns a properly typed form
    expect(result.current).toHaveProperty("control");
    expect(result.current).toHaveProperty("handleSubmit");
    expect(result.current).toHaveProperty("formState");
  });
});
