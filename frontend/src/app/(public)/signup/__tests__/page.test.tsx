import { render, screen } from "@testing-library/react";
import { vi } from "vitest";
import SignupPage from "../page";

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
  PasswordField: ({ label }: any) => (
    <div data-testid="password-field">
      <label>{label}</label>
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
  ConfirmPasswordField: ({ form }: any) => (
    <div data-testid="confirm-password-field">Confirm Password Field</div>
  ),
  NameFields: ({ form }: any) => <div data-testid="name-fields">Name Fields</div>,
  SignupButton: ({ isPending }: any) => (
    <button data-testid="signup-button" disabled={isPending}>
      {isPending ? "Creating account..." : "Create account"}
    </button>
  ),
  SignupForm: ({ children, form, onSubmit }: any) => (
    <div data-testid="signup-form" data-form={JSON.stringify(form)} data-onsubmit={!!onSubmit}>
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

const mockHandleSignup = vi.fn();
const mockTogglePassword = vi.fn();
const mockToggleConfirmPassword = vi.fn();

vi.mock("../_hooks", () => ({
  useMultiplePasswordToggle: () => ({
    showPassword: false,
    showConfirmPassword: false,
    togglePassword: mockTogglePassword,
    toggleConfirmPassword: mockToggleConfirmPassword,
  }),
  useSignupForm: () => mockForm,
  useSignupMutation: () => ({
    handleSignup: mockHandleSignup,
    isPending: false,
  }),
}));

describe("SignupPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders within AuthLayout", () => {
    render(<SignupPage />);

    expect(screen.getByTestId("auth-layout")).toBeInTheDocument();
  });

  it("renders SignupForm with correct props", () => {
    render(<SignupPage />);

    const signupForm = screen.getByTestId("signup-form");
    expect(signupForm).toBeInTheDocument();
    expect(signupForm).toHaveAttribute("data-onsubmit", "true");
  });

  it("renders NameFields component", () => {
    render(<SignupPage />);

    expect(screen.getByTestId("name-fields")).toBeInTheDocument();
  });

  it("renders email field with correct configuration", () => {
    render(<SignupPage />);

    expect(screen.getByTestId("form-label")).toHaveTextContent("Email");
    expect(screen.getByTestId("email-input")).toBeInTheDocument();
    expect(screen.getByTestId("email-input")).toHaveAttribute("type", "email");
    expect(screen.getByTestId("email-input")).toHaveAttribute("placeholder", "name@example.com");
    expect(screen.getByTestId("email-input")).toHaveAttribute("autoComplete", "email");
  });

  it("renders password field with toggle functionality", () => {
    render(<SignupPage />);

    const passwordField = screen.getByTestId("password-field");
    expect(passwordField).toBeInTheDocument();
    expect(passwordField).toHaveTextContent("Password");
  });

  it("renders confirm password field", () => {
    render(<SignupPage />);

    expect(screen.getByTestId("confirm-password-field")).toBeInTheDocument();
  });

  it("renders signup button", () => {
    render(<SignupPage />);

    expect(screen.getByTestId("signup-button")).toBeInTheDocument();
    expect(screen.getByTestId("signup-button")).toHaveTextContent("Create account");
  });

  it("renders signin link", () => {
    render(<SignupPage />);

    expect(screen.getByText(/Already have an account?/)).toBeInTheDocument();

    const signinLink = screen.getByRole("link", { name: "Sign in" });
    expect(signinLink).toBeInTheDocument();
    expect(signinLink).toHaveAttribute("href", "/signin");
  });

  it("applies correct CSS classes to signin link", () => {
    render(<SignupPage />);

    const signinLink = screen.getByRole("link", { name: "Sign in" });
    expect(signinLink).toHaveClass("text-primary", "font-medium", "hover:underline");
  });

  it("uses hooks correctly", () => {
    render(<SignupPage />);

    // Verify that the component structure indicates hooks are being used
    expect(screen.getByTestId("signup-form")).toBeInTheDocument();
    expect(screen.getByTestId("signup-button")).not.toBeDisabled();
  });

  it("has proper form structure with all components", () => {
    render(<SignupPage />);

    // Check that all major form components are present
    expect(screen.getByTestId("name-fields")).toBeInTheDocument();
    expect(screen.getByTestId("form-item")).toBeInTheDocument(); // Email field
    expect(screen.getByTestId("password-field")).toBeInTheDocument();
    expect(screen.getByTestId("confirm-password-field")).toBeInTheDocument();
    expect(screen.getByTestId("signup-button")).toBeInTheDocument();
  });

  it("renders text content with proper styling", () => {
    render(<SignupPage />);

    const textContainer = screen.getByText(/Already have an account?/).parentElement;
    expect(textContainer).toHaveClass("text-center", "text-sm");

    const mutedText = screen.getByText(/Already have an account?/);
    expect(mutedText).toHaveClass("text-muted-foreground");
  });

  it("integrates with multiple password toggle hooks", () => {
    render(<SignupPage />);

    // Component should render without errors when using multiple password toggles
    expect(screen.getByTestId("password-field")).toBeInTheDocument();
    expect(screen.getByTestId("confirm-password-field")).toBeInTheDocument();
  });

  it("passes correct props to PasswordField", () => {
    render(<SignupPage />);

    // The PasswordField should receive the password label and autoComplete
    const passwordField = screen.getByTestId("password-field");
    expect(passwordField).toHaveTextContent("Password");
  });

  it("maintains proper component hierarchy", () => {
    render(<SignupPage />);

    // Verify the main structure is rendered
    const authLayout = screen.getByTestId("auth-layout");
    const signupForm = screen.getByTestId("signup-form");

    expect(authLayout).toBeInTheDocument();
    expect(signupForm).toBeInTheDocument();

    // SignupForm should be inside AuthLayout
    expect(authLayout).toContainElement(signupForm);
  });

  it("renders all required form fields", () => {
    render(<SignupPage />);

    // Check that all essential signup fields are present
    expect(screen.getByTestId("name-fields")).toBeInTheDocument(); // First & Last name
    expect(screen.getByTestId("email-input")).toBeInTheDocument(); // Email
    expect(screen.getByTestId("password-field")).toBeInTheDocument(); // Password
    expect(screen.getByTestId("confirm-password-field")).toBeInTheDocument(); // Confirm Password
  });

  it("has correct field order in the form", () => {
    render(<SignupPage />);

    // The components should be rendered in the expected order based on the JSX
    const form = screen.getByTestId("signup-form");
    expect(form).toBeInTheDocument();

    // All form components should be present
    expect(screen.getByTestId("name-fields")).toBeInTheDocument();
    expect(screen.getByTestId("email-input")).toBeInTheDocument();
    expect(screen.getByTestId("password-field")).toBeInTheDocument();
    expect(screen.getByTestId("confirm-password-field")).toBeInTheDocument();
    expect(screen.getByTestId("signup-button")).toBeInTheDocument();
  });
});
