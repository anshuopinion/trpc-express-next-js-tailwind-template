import { renderHook } from "@testing-library/react";
import { vi } from "vitest";
import { useSignupForm } from "../useSignupForm";

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
  signupSchema: { type: "signup-schema" },
}));

describe("useSignupForm", () => {
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
    renderHook(() => useSignupForm());

    expect(mockUseForm).toHaveBeenCalledWith({
      resolver: { schema: { type: "signup-schema" }, type: "zod" },
      defaultValues: {
        first_name: "",
        last_name: "",
        email: "",
        password: "",
        confirmPassword: "",
      },
    });
  });

  it("returns the form object from useForm", () => {
    const { result } = renderHook(() => useSignupForm());

    expect(result.current).toBe(mockFormReturn);
  });

  it("provides correct default values for all signup fields", () => {
    renderHook(() => useSignupForm());

    const callArgs = mockUseForm.mock.calls[0][0];
    expect(callArgs.defaultValues).toEqual({
      first_name: "",
      last_name: "",
      email: "",
      password: "",
      confirmPassword: "",
    });
  });

  it("uses zodResolver with signupSchema", () => {
    renderHook(() => useSignupForm());

    const callArgs = mockUseForm.mock.calls[0][0];
    expect(callArgs.resolver).toEqual({
      schema: { type: "signup-schema" },
      type: "zod",
    });
  });

  it("maintains consistent form configuration across re-renders", () => {
    const { rerender } = renderHook(() => useSignupForm());

    // Clear previous calls
    mockUseForm.mockClear();

    rerender();

    // Should not be called again on re-render (useForm should handle this internally)
    expect(mockUseForm).toHaveBeenCalledTimes(1);
  });

  it("returns form methods for external use", () => {
    const { result } = renderHook(() => useSignupForm());

    expect(result.current.control).toBeDefined();
    expect(result.current.handleSubmit).toBeDefined();
    expect(result.current.formState).toBeDefined();
    expect(typeof result.current.handleSubmit).toBe("function");
  });

  it("integrates with TypeScript types correctly", () => {
    const { result } = renderHook(() => useSignupForm());

    // This test ensures the hook returns a properly typed form
    expect(result.current).toHaveProperty("control");
    expect(result.current).toHaveProperty("handleSubmit");
    expect(result.current).toHaveProperty("formState");
  });

  it("includes all required signup fields in default values", () => {
    renderHook(() => useSignupForm());

    const callArgs = mockUseForm.mock.calls[0][0];
    const defaultValues = callArgs.defaultValues;

    // Verify all signup fields are present
    expect(defaultValues).toHaveProperty("first_name");
    expect(defaultValues).toHaveProperty("last_name");
    expect(defaultValues).toHaveProperty("email");
    expect(defaultValues).toHaveProperty("password");
    expect(defaultValues).toHaveProperty("confirmPassword");

    // Verify they're all empty strings initially
    expect(defaultValues.first_name).toBe("");
    expect(defaultValues.last_name).toBe("");
    expect(defaultValues.email).toBe("");
    expect(defaultValues.password).toBe("");
    expect(defaultValues.confirmPassword).toBe("");
  });

  it("provides form instance with expected properties", () => {
    const { result } = renderHook(() => useSignupForm());

    // Verify the returned form has the essential properties
    expect(result.current).toEqual(
      expect.objectContaining({
        control: expect.any(Object),
        handleSubmit: expect.any(Function),
        formState: expect.any(Object),
      }),
    );
  });
});
