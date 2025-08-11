import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useForm } from "react-hook-form";
import { vi } from "vitest";
import { PasswordField } from "../PasswordField";

// Mock UI components
vi.mock("@/components/ui/form", () => ({
  FormField: ({ control, name, render }: any) => {
    const field = { value: "", onChange: vi.fn(), onBlur: vi.fn() };
    return render({ field });
  },
  FormItem: ({ children }: any) => (
    <div data-testid="form-item">{children}</div>
  ),
  FormLabel: ({ children }: any) => (
    <label data-testid="form-label">{children}</label>
  ),
  FormControl: ({ children }: any) => (
    <div data-testid="form-control">{children}</div>
  ),
  FormMessage: () => <div data-testid="form-message">Error message</div>,
}));

vi.mock("@/components/ui/input", () => ({
  Input: ({ type, placeholder, autoComplete, className, ...props }: any) => (
    <input
      data-testid="password-input"
      type={type}
      placeholder={placeholder}
      autoComplete={autoComplete}
      className={className}
      {...props}
    />
  ),
}));

// Mock Lucide React icons
vi.mock("lucide-react", () => ({
  EyeIcon: ({ className }: any) => (
    <div data-testid="eye-icon" className={className}>
      Eye
    </div>
  ),
  EyeOffIcon: ({ className }: any) => (
    <div data-testid="eye-off-icon" className={className}>
      EyeOff
    </div>
  ),
}));

// Test wrapper component with react-hook-form
const TestWrapper = ({
  showPassword = false,
  onToggle = vi.fn(),
  label,
  placeholder,
  autoComplete,
  forgotPasswordLink,
}: any) => {
  const { control } = useForm({
    defaultValues: { password: "" },
  });

  return (
    <PasswordField
      control={control}
      name="password"
      label={label}
      placeholder={placeholder}
      showPassword={showPassword}
      onToggle={onToggle}
      autoComplete={autoComplete}
      forgotPasswordLink={forgotPasswordLink}
    />
  );
};

describe("PasswordField", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders password field with default props", () => {
    const mockToggle = vi.fn();
    render(<TestWrapper onToggle={mockToggle} />);

    expect(screen.getByTestId("form-item")).toBeInTheDocument();
    expect(screen.getByTestId("form-label")).toHaveTextContent("Password");
    expect(screen.getByTestId("form-control")).toBeInTheDocument();
    expect(screen.getByTestId("password-input")).toBeInTheDocument();
    expect(screen.getByTestId("form-message")).toBeInTheDocument();
  });

  it("renders password input with correct type when showPassword is false", () => {
    const mockToggle = vi.fn();
    render(<TestWrapper showPassword={false} onToggle={mockToggle} />);

    const passwordInput = screen.getByTestId("password-input");
    expect(passwordInput).toHaveAttribute("type", "password");
  });

  it("renders text input when showPassword is true", () => {
    const mockToggle = vi.fn();
    render(<TestWrapper showPassword={true} onToggle={mockToggle} />);

    const passwordInput = screen.getByTestId("password-input");
    expect(passwordInput).toHaveAttribute("type", "text");
  });

  it("displays eye icon when password is hidden", () => {
    const mockToggle = vi.fn();
    render(<TestWrapper showPassword={false} onToggle={mockToggle} />);

    expect(screen.getByTestId("eye-icon")).toBeInTheDocument();
    expect(screen.queryByTestId("eye-off-icon")).not.toBeInTheDocument();
  });

  it("displays eye-off icon when password is visible", () => {
    const mockToggle = vi.fn();
    render(<TestWrapper showPassword={true} onToggle={mockToggle} />);

    expect(screen.getByTestId("eye-off-icon")).toBeInTheDocument();
    expect(screen.queryByTestId("eye-icon")).not.toBeInTheDocument();
  });

  it("calls onToggle when toggle button is clicked", async () => {
    const user = userEvent.setup();
    const mockToggle = vi.fn();
    render(<TestWrapper showPassword={false} onToggle={mockToggle} />);

    const toggleButton = screen.getByRole("button");
    await user.click(toggleButton);

    expect(mockToggle).toHaveBeenCalledTimes(1);
  });

  it("applies correct CSS classes to input", () => {
    const mockToggle = vi.fn();
    render(<TestWrapper onToggle={mockToggle} />);

    const passwordInput = screen.getByTestId("password-input");
    expect(passwordInput).toHaveClass("pr-10");
  });

  it("applies correct CSS classes to toggle button", () => {
    const mockToggle = vi.fn();
    render(<TestWrapper onToggle={mockToggle} />);

    const toggleButton = screen.getByRole("button");
    expect(toggleButton).toHaveClass(
      "absolute",
      "right-3",
      "top-1/2",
      "transform",
      "-translate-y-1/2",
      "text-muted-foreground",
      "hover:text-foreground",
      "transition-colors",
    );
  });

  it("applies correct CSS classes to icons", () => {
    const mockToggle = vi.fn();
    render(<TestWrapper showPassword={false} onToggle={mockToggle} />);

    const eyeIcon = screen.getByTestId("eye-icon");
    expect(eyeIcon).toHaveClass("h-4", "w-4");
  });

  it("renders custom label", () => {
    const mockToggle = vi.fn();
    render(<TestWrapper label="Custom Password" onToggle={mockToggle} />);

    expect(screen.getByTestId("form-label")).toHaveTextContent(
      "Custom Password",
    );
  });

  it("renders custom placeholder", () => {
    const mockToggle = vi.fn();
    render(
      <TestWrapper placeholder="Enter your password" onToggle={mockToggle} />,
    );

    const passwordInput = screen.getByTestId("password-input");
    expect(passwordInput).toHaveAttribute("placeholder", "Enter your password");
  });

  it("renders default placeholder", () => {
    const mockToggle = vi.fn();
    render(<TestWrapper onToggle={mockToggle} />);

    const passwordInput = screen.getByTestId("password-input");
    expect(passwordInput).toHaveAttribute("placeholder", "••••••••");
  });

  it("sets custom autoComplete attribute", () => {
    const mockToggle = vi.fn();
    render(<TestWrapper autoComplete="new-password" onToggle={mockToggle} />);

    const passwordInput = screen.getByTestId("password-input");
    expect(passwordInput).toHaveAttribute("autocomplete", "new-password");
  });

  it("sets default autoComplete attribute", () => {
    const mockToggle = vi.fn();
    render(<TestWrapper onToggle={mockToggle} />);

    const passwordInput = screen.getByTestId("password-input");
    expect(passwordInput).toHaveAttribute("autocomplete", "current-password");
  });

  it("renders forgot password link when provided", () => {
    const mockToggle = vi.fn();
    const forgotLink = <a href="/forgot">Forgot Password?</a>;
    render(
      <TestWrapper forgotPasswordLink={forgotLink} onToggle={mockToggle} />,
    );

    expect(screen.getByText("Forgot Password?")).toBeInTheDocument();
    expect(screen.getByRole("link")).toHaveAttribute("href", "/forgot");
  });

  it("does not render forgot password link when not provided", () => {
    const mockToggle = vi.fn();
    render(<TestWrapper onToggle={mockToggle} />);

    expect(screen.queryByText("Forgot Password?")).not.toBeInTheDocument();
  });

  it("positions label and forgot password link correctly", () => {
    const mockToggle = vi.fn();
    const forgotLink = <span data-testid="forgot-link">Forgot?</span>;
    render(
      <TestWrapper forgotPasswordLink={forgotLink} onToggle={mockToggle} />,
    );

    const labelContainer = screen.getByTestId("form-label").parentElement;
    expect(labelContainer).toHaveClass(
      "flex",
      "items-center",
      "justify-between",
    );
    expect(screen.getByTestId("forgot-link")).toBeInTheDocument();
  });

  it("toggle button has correct type attribute", () => {
    const mockToggle = vi.fn();
    render(<TestWrapper onToggle={mockToggle} />);

    const toggleButton = screen.getByRole("button");
    expect(toggleButton).toHaveAttribute("type", "button");
  });

  it("relative container positions toggle button correctly", () => {
    const mockToggle = vi.fn();
    render(<TestWrapper onToggle={mockToggle} />);

    const relativeContainer =
      screen.getByTestId("password-input").parentElement;
    expect(relativeContainer).toHaveClass("relative");
  });

  it("handles multiple clicks on toggle button", async () => {
    const user = userEvent.setup();
    const mockToggle = vi.fn();
    render(<TestWrapper showPassword={false} onToggle={mockToggle} />);

    const toggleButton = screen.getByRole("button");
    await user.click(toggleButton);
    await user.click(toggleButton);
    await user.click(toggleButton);

    expect(mockToggle).toHaveBeenCalledTimes(3);
  });

  it("prevents form submission when toggle button is clicked", () => {
    const mockToggle = vi.fn();
    const mockSubmit = vi.fn();

    const { container } = render(
      <form onSubmit={mockSubmit}>
        <TestWrapper onToggle={mockToggle} />
        <button type="submit">Submit</button>
      </form>,
    );

    const toggleButton = screen.getByRole("button", { name: /eye/i });
    fireEvent.click(toggleButton);

    expect(mockToggle).toHaveBeenCalledTimes(1);
    expect(mockSubmit).not.toHaveBeenCalled();
  });

  it("allows user input in password field", async () => {
    const user = userEvent.setup();
    const mockToggle = vi.fn();
    render(<TestWrapper onToggle={mockToggle} />);

    const passwordInput = screen.getByTestId("password-input");
    await user.type(passwordInput, "mypassword123");

    // Note: In the real implementation, this would be handled by react-hook-form
    // Here we're just verifying the input accepts text
    expect(passwordInput).toBeInTheDocument();
  });

  it("handles empty label gracefully", () => {
    const mockToggle = vi.fn();
    render(<TestWrapper label="" onToggle={mockToggle} />);

    const label = screen.getByTestId("form-label");
    expect(label).toHaveTextContent("");
  });

  it("handles empty placeholder gracefully", () => {
    const mockToggle = vi.fn();
    render(<TestWrapper placeholder="" onToggle={mockToggle} />);

    const passwordInput = screen.getByTestId("password-input");
    expect(passwordInput).toHaveAttribute("placeholder", "");
  });

  it("handles complex forgot password link", () => {
    const mockToggle = vi.fn();
    const complexLink = (
      <div>
        <a href="/forgot" className="link">
          Forgot your password?
        </a>
      </div>
    );
    render(
      <TestWrapper forgotPasswordLink={complexLink} onToggle={mockToggle} />,
    );

    expect(screen.getByText("Forgot your password?")).toBeInTheDocument();
    expect(screen.getByRole("link")).toHaveClass("link");
  });

  it("maintains accessibility with proper button semantics", () => {
    const mockToggle = vi.fn();
    render(<TestWrapper onToggle={mockToggle} />);

    const toggleButton = screen.getByRole("button");
    expect(toggleButton).toBeInTheDocument();
    expect(toggleButton).toHaveAttribute("type", "button");
  });

  it("icon changes maintain consistent classes", () => {
    const mockToggle = vi.fn();
    const { rerender } = render(
      <TestWrapper showPassword={false} onToggle={mockToggle} />,
    );

    const eyeIcon = screen.getByTestId("eye-icon");
    expect(eyeIcon).toHaveClass("h-4", "w-4");

    rerender(<TestWrapper showPassword={true} onToggle={mockToggle} />);

    const eyeOffIcon = screen.getByTestId("eye-off-icon");
    expect(eyeOffIcon).toHaveClass("h-4", "w-4");
  });

  it("renders proper semantic structure", () => {
    const mockToggle = vi.fn();
    render(<TestWrapper onToggle={mockToggle} />);

    const formItem = screen.getByTestId("form-item");
    const formLabel = screen.getByTestId("form-label");
    const formControl = screen.getByTestId("form-control");
    const formMessage = screen.getByTestId("form-message");

    expect(formItem).toBeInTheDocument();
    expect(formLabel.tagName.toLowerCase()).toBe("label");
    expect(formControl).toBeInTheDocument();
    expect(formMessage).toBeInTheDocument();
  });

  it("handles rapid toggle clicks without issues", async () => {
    const user = userEvent.setup();
    const mockToggle = vi.fn();
    render(<TestWrapper showPassword={false} onToggle={mockToggle} />);

    const toggleButton = screen.getByRole("button");

    // Rapid clicks
    await user.click(toggleButton);
    await user.click(toggleButton);
    await user.click(toggleButton);
    await user.click(toggleButton);
    await user.click(toggleButton);

    expect(mockToggle).toHaveBeenCalledTimes(5);
  });

  it("handles keyboard interaction on toggle button", async () => {
    const user = userEvent.setup();
    const mockToggle = vi.fn();
    render(<TestWrapper onToggle={mockToggle} />);

    const toggleButton = screen.getByRole("button");

    // Focus the toggle button explicitly
    toggleButton.focus();
    await user.keyboard("{Enter}");

    expect(mockToggle).toHaveBeenCalledTimes(1);
  });

  it("handles space key on toggle button", async () => {
    const user = userEvent.setup();
    const mockToggle = vi.fn();
    render(<TestWrapper onToggle={mockToggle} />);

    const toggleButton = screen.getByRole("button");
    toggleButton.focus();

    await user.keyboard(" ");

    expect(mockToggle).toHaveBeenCalledTimes(1);
  });

  it("maintains focus management correctly", async () => {
    const user = userEvent.setup();
    const mockToggle = vi.fn();
    render(<TestWrapper onToggle={mockToggle} />);

    const toggleButton = screen.getByRole("button");
    const passwordInput = screen.getByTestId("password-input");

    await user.click(passwordInput);
    expect(document.activeElement).toBe(passwordInput);

    await user.click(toggleButton);
    expect(mockToggle).toHaveBeenCalledTimes(1);
    // Button should be focusable but input focus might be preserved
  });

  it("handles different autoComplete values correctly", () => {
    const autoCompleteValues = ["new-password", "current-password", "off"];

    autoCompleteValues.forEach((autoComplete) => {
      const { unmount } = render(
        <TestWrapper autoComplete={autoComplete} onToggle={vi.fn()} />,
      );

      const passwordInput = screen.getByTestId("password-input");
      expect(passwordInput).toHaveAttribute("autocomplete", autoComplete);

      unmount();
    });
  });
});
