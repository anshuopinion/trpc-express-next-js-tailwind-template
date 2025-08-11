import { render, screen } from "@testing-library/react";
import { vi } from "vitest";
import SigninPage from "../page";

// Mock all dependencies
vi.mock("next/link", () => ({
  __esModule: true,
  default: ({ children, href, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

vi.mock("@/components/forms", () => ({
  PasswordField: ({ label, forgotPasswordLink }: any) => (
    <div data-testid="password-field">
      <label>{label}</label>
      {forgotPasswordLink}
    </div>
  ),
}));

vi.mock("@/components/ui/form", () => ({
  FormControl: ({ children }: any) => <div data-testid="form-control">{children}</div>,
  FormField: ({ render }: any) => render({ field: { value: "", onChange: vi.fn() } }),
  FormItem: ({ children }: any) => <div data-testid="form-item">{children}</div>,
  FormLabel: ({ children }: any) => <label data-testid="form-label">{children}</label>,
  FormMessage: () => <div data-testid="form-message" />,
}));

vi.mock("@/components/ui/input", () => ({
  Input: (props: any) => <input data-testid="email-input" {...props} />,
}));

vi.mock("@/layout/auth-layout/auth-layout", () => ({
  __esModule: true,
  default: ({ children }: any) => <div data-testid="auth-layout">{children}</div>,
}));

vi.mock("../_components", () => ({
  LoginButton: ({ isPending }: any) => (
    <button data-testid="login-button" disabled={isPending}>
      {isPending ? "Signing in..." : "Sign in"}
    </button>
  ),
  SigninForm: ({ children, form, onSubmit }: any) => (
    <div data-testid="signin-form" data-form={JSON.stringify(form)} data-onsubmit={!!onSubmit}>
      {children}
    </div>
  ),
}));

// Mock hooks
const mockForm = {
  control: { name: "test-control" },
  handleSubmit: vi.fn(),
  formState: { errors: {} },
};

const mockHandleSignin = vi.fn();
const mockTogglePassword = vi.fn();

vi.mock("../_hooks", () => ({
  usePasswordToggle: () => ({
    showPassword: false,
    togglePassword: mockTogglePassword,
  }),
  useSigninForm: () => mockForm,
  useSigninMutation: () => ({
    handleSignin: mockHandleSignin,
    isPending: false,
  }),
}));

vi.mock("@/hooks/useAuth", () => ({
  useAuth: () => ({ isAuthenticated: false }),
}));

describe("SigninPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders within AuthLayout", () => {
    render(<SigninPage />);

    expect(screen.getByTestId("auth-layout")).toBeInTheDocument();
  });

  it("renders SigninForm with correct props", () => {
    render(<SigninPage />);

    const signinForm = screen.getByTestId("signin-form");
    expect(signinForm).toBeInTheDocument();
    expect(signinForm).toHaveAttribute("data-onsubmit", "true");
  });

  it("renders email field with correct configuration", () => {
    render(<SigninPage />);

    expect(screen.getByTestId("form-label")).toHaveTextContent("Email");
    expect(screen.getByTestId("email-input")).toBeInTheDocument();
    expect(screen.getByTestId("email-input")).toHaveAttribute("placeholder", "name@example.com");
    expect(screen.getByTestId("email-input")).toHaveAttribute("autoComplete", "email");
  });

  it("renders password field with toggle functionality", () => {
    render(<SigninPage />);

    const passwordField = screen.getByTestId("password-field");
    expect(passwordField).toBeInTheDocument();
    expect(passwordField).toHaveTextContent("Password");
  });

  it("renders forgot password link", () => {
    render(<SigninPage />);

    const forgotLink = screen.getByRole("link", { name: "Forgot password?" });
    expect(forgotLink).toBeInTheDocument();
    expect(forgotLink).toHaveAttribute("href", "/forgot-password");
  });

  it("renders login button", () => {
    render(<SigninPage />);

    expect(screen.getByTestId("login-button")).toBeInTheDocument();
    expect(screen.getByTestId("login-button")).toHaveTextContent("Sign in");
  });

  it("renders signup link", () => {
    render(<SigninPage />);

    expect(screen.getByText(/Don't have an account?/)).toBeInTheDocument();

    const signupLink = screen.getByRole("link", { name: "Create one now" });
    expect(signupLink).toBeInTheDocument();
    expect(signupLink).toHaveAttribute("href", "/signup");
  });

  it("applies correct CSS classes to signup link", () => {
    render(<SigninPage />);

    const signupLink = screen.getByRole("link", { name: "Create one now" });
    expect(signupLink).toHaveClass("text-primary", "font-medium", "hover:underline");
  });

  it("uses hooks correctly", () => {
    render(<SigninPage />);

    // Verify that the component structure indicates hooks are being used
    expect(screen.getByTestId("signin-form")).toBeInTheDocument();
    expect(screen.getByTestId("login-button")).not.toBeDisabled();
  });

  it("integrates with hooks and components properly", () => {
    render(<SigninPage />);

    // Verify that the page renders with all expected components
    expect(screen.getByTestId("signin-form")).toBeInTheDocument();
    expect(screen.getByTestId("login-button")).toBeInTheDocument();
    expect(screen.getByTestId("password-field")).toBeInTheDocument();
  });

  it("has proper form structure with FormItems", () => {
    render(<SigninPage />);

    // Check that we have at least one form item (email field)
    const formItems = screen.getAllByTestId("form-item");
    expect(formItems.length).toBeGreaterThanOrEqual(1);

    expect(screen.getByTestId("form-control")).toBeInTheDocument();
    expect(screen.getByTestId("form-message")).toBeInTheDocument();
  });

  it("renders text content with proper styling", () => {
    render(<SigninPage />);

    const textContainer = screen.getByText(/Don't have an account?/).parentElement;
    expect(textContainer).toHaveClass("text-center", "text-sm");

    const mutedText = screen.getByText(/Don't have an account?/);
    expect(mutedText).toHaveClass("text-muted-foreground");
  });
});
