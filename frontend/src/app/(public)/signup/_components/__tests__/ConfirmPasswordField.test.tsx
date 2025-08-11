import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useForm } from "react-hook-form";
import { vi } from "vitest";
import type { SignupFormData } from "../../_schema";
import { ConfirmPasswordField } from "../ConfirmPasswordField";

// Mock the form components
vi.mock("@/components/ui/form", () => ({
  FormControl: ({ children }: any) => <div data-testid="form-control">{children}</div>,
  FormField: ({ render }: any) => render({ field: { value: "", onChange: vi.fn() } }),
  FormItem: ({ children }: any) => <div data-testid="form-item">{children}</div>,
  FormLabel: ({ children }: any) => <label data-testid="form-label">{children}</label>,
  FormMessage: () => <div data-testid="form-message" />,
}));

vi.mock("@/components/ui/input", () => ({
  Input: (props: any) => <input data-testid="confirm-password-input" {...props} />,
}));

// Mock lucide-react icons
vi.mock("lucide-react", () => ({
  EyeIcon: ({ className }: any) => (
    <div data-testid="eye-icon" className={className}>
      👁️
    </div>
  ),
  EyeOffIcon: ({ className }: any) => (
    <div data-testid="eye-off-icon" className={className}>
      🚫👁️
    </div>
  ),
}));

describe("ConfirmPasswordField", () => {
  const mockOnToggle = vi.fn();

  const TestWrapper = ({
    showPassword = false,
    defaultValues = {},
  }: {
    showPassword?: boolean;
    defaultValues?: Partial<SignupFormData>;
  }) => {
    const form = useForm<SignupFormData>({
      defaultValues: {
        first_name: "",
        last_name: "",
        email: "",
        password: "",
        confirmPassword: "",
        ...defaultValues,
      },
    });

    return <ConfirmPasswordField form={form} showPassword={showPassword} onToggle={mockOnToggle} />;
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders confirm password field with correct label", () => {
    render(<TestWrapper />);

    expect(screen.getByTestId("form-label")).toHaveTextContent("Confirm Password");
  });

  it("renders input with correct attributes when password is hidden", () => {
    render(<TestWrapper showPassword={false} />);

    const input = screen.getByTestId("confirm-password-input");
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute("type", "password");
    expect(input).toHaveAttribute("placeholder", "••••••••");
    expect(input).toHaveAttribute("autoComplete", "new-password");
    expect(input).toHaveClass("pr-10");
  });

  it("renders input with text type when password is visible", () => {
    render(<TestWrapper showPassword={true} />);

    const input = screen.getByTestId("confirm-password-input");
    expect(input).toHaveAttribute("type", "text");
  });

  it("renders toggle button with correct positioning", () => {
    render(<TestWrapper />);

    const toggleButton = screen.getByRole("button");
    expect(toggleButton).toBeInTheDocument();
    expect(toggleButton).toHaveAttribute("type", "button");
    expect(toggleButton).toHaveClass(
      "absolute",
      "right-3",
      "top-1/2",
      "transform",
      "-translate-y-1/2",
      "text-muted-foreground",
      "hover:text-foreground",
      "transition-colors"
    );
  });

  it("shows eye icon when password is hidden", () => {
    render(<TestWrapper showPassword={false} />);

    expect(screen.getByTestId("eye-icon")).toBeInTheDocument();
    expect(screen.queryByTestId("eye-off-icon")).not.toBeInTheDocument();
  });

  it("shows eye-off icon when password is visible", () => {
    render(<TestWrapper showPassword={true} />);

    expect(screen.getByTestId("eye-off-icon")).toBeInTheDocument();
    expect(screen.queryByTestId("eye-icon")).not.toBeInTheDocument();
  });

  it("calls onToggle when toggle button is clicked", async () => {
    const user = userEvent.setup();
    render(<TestWrapper />);

    const toggleButton = screen.getByRole("button");
    await user.click(toggleButton);

    expect(mockOnToggle).toHaveBeenCalledOnce();
  });

  it("has proper form structure", () => {
    render(<TestWrapper />);

    expect(screen.getByTestId("form-item")).toBeInTheDocument();
    expect(screen.getByTestId("form-control")).toBeInTheDocument();
    expect(screen.getByTestId("form-message")).toBeInTheDocument();
  });

  it("has relative container for absolute positioned toggle button", () => {
    render(<TestWrapper />);

    const relativeContainer = screen.getByTestId("confirm-password-input").parentElement;
    expect(relativeContainer).toHaveClass("relative");
  });

  it("icons have correct styling classes", () => {
    render(<TestWrapper showPassword={false} />);

    const eyeIcon = screen.getByTestId("eye-icon");
    expect(eyeIcon).toHaveClass("h-4", "w-4");
  });

  it("icons have correct styling classes when visible", () => {
    render(<TestWrapper showPassword={true} />);

    const eyeOffIcon = screen.getByTestId("eye-off-icon");
    expect(eyeOffIcon).toHaveClass("h-4", "w-4");
  });

  it("integrates with form validation", () => {
    const TestWithValidation = () => {
      const form = useForm<SignupFormData>({
        defaultValues: {
          first_name: "",
          last_name: "",
          email: "",
          password: "password123",
          confirmPassword: "different",
        },
      });

      return <ConfirmPasswordField form={form} showPassword={false} onToggle={mockOnToggle} />;
    };

    render(<TestWithValidation />);

    // Should render without errors even with different password values
    expect(screen.getByTestId("form-label")).toBeInTheDocument();
  });

  it("maintains accessibility with button type and proper labeling", () => {
    render(<TestWrapper />);

    const toggleButton = screen.getByRole("button");
    expect(toggleButton).toHaveAttribute("type", "button");

    // Button should be properly accessible
    expect(toggleButton).toBeInTheDocument();
  });

  it("handles multiple toggle interactions", async () => {
    const user = userEvent.setup();
    render(<TestWrapper />);

    const toggleButton = screen.getByRole("button");

    await user.click(toggleButton);
    await user.click(toggleButton);
    await user.click(toggleButton);

    expect(mockOnToggle).toHaveBeenCalledTimes(3);
  });
});
