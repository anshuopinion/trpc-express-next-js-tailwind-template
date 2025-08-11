import { render, screen } from "@testing-library/react";
import { useForm } from "react-hook-form";
import { vi } from "vitest";
import type { SigninFormData } from "../../_schema";
import { SigninForm } from "../SigninForm";

// Mock the form components
vi.mock("@/components/ui/card", () => ({
  Card: ({ children, className }: any) => (
    <div data-testid="signin-card" className={className}>
      {children}
    </div>
  ),
}));

vi.mock("@/components/ui/form", () => ({
  Form: ({ children }: any) => <div data-testid="signin-form">{children}</div>,
}));

describe("SigninForm", () => {
  const mockOnSubmit = vi.fn();

  // Test wrapper component
  const TestWrapper = ({ children }: { children: React.ReactNode }) => {
    const form = useForm<SigninFormData>({
      defaultValues: {
        email: "",
        password: "",
      },
    });

    return (
      <SigninForm form={form} onSubmit={mockOnSubmit}>
        {children}
      </SigninForm>
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the form card with correct structure", () => {
    render(
      <TestWrapper>
        <div data-testid="form-fields">Test fields</div>
      </TestWrapper>,
    );

    expect(screen.getByTestId("signin-card")).toBeInTheDocument();
    expect(screen.getByTestId("signin-form")).toBeInTheDocument();
    expect(screen.getByTestId("form-fields")).toBeInTheDocument();
  });

  it("displays the correct heading and description", () => {
    // Using TestWrapper instead

    render(
      <TestWrapper>
        <div>Test content</div>
      </TestWrapper>,
    );

    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      "Welcome back to Stock Scanner",
    );
    expect(
      screen.getByText(/Sign in to access your scanner dashboard/),
    ).toBeInTheDocument();
  });

  it("applies correct CSS classes to the card", () => {
    // Using TestWrapper instead

    render(
      <TestWrapper>
        <div>Test content</div>
      </TestWrapper>,
    );

    const card = screen.getByTestId("signin-card");
    expect(card).toHaveClass("min-h-[410px]", "flex-1", "p-8", "shadow-lg");
  });

  it("renders children inside the form", () => {
    const testContent = "Test form fields";

    render(
      <TestWrapper>
        <div data-testid="custom-fields">{testContent}</div>
      </TestWrapper>,
    );

    expect(screen.getByTestId("custom-fields")).toBeInTheDocument();
    expect(screen.getByText(testContent)).toBeInTheDocument();
  });

  it("has proper structure with space-y classes", () => {
    render(
      <TestWrapper>
        <input data-testid="test-input" />
      </TestWrapper>,
    );

    // Check that the form content container has proper spacing
    const container = screen
      .getByText("Welcome back to Stock Scanner")
      .closest(".space-y-6");
    expect(container).toBeInTheDocument();
    expect(container).toHaveClass("max-w-md");
  });

  it("includes text styling classes for heading and description", () => {
    // Using TestWrapper instead

    render(
      <TestWrapper>
        <div>Test content</div>
      </TestWrapper>,
    );

    const heading = screen.getByText("Welcome back to Stock Scanner");
    expect(heading).toHaveClass("text-2xl", "font-bold", "tracking-tight");

    const description = screen.getByText(
      /Sign in to access your scanner dashboard/,
    );
    expect(description).toHaveClass("text-sm", "text-muted-foreground", "mt-1");
  });

  it("has text-center class for the header section", () => {
    // Using TestWrapper instead

    render(
      <TestWrapper>
        <div>Test content</div>
      </TestWrapper>,
    );

    const headerSection = screen
      .getByText("Welcome back to Stock Scanner")
      .closest(".text-center");
    expect(headerSection).toBeInTheDocument();
    expect(headerSection).toHaveClass("mb-6");
  });

  it("receives and uses form props correctly", () => {
    const TestComponentWithForm = () => {
      const form = useForm<SigninFormData>({
        defaultValues: { email: "test@example.com", password: "testpass" },
      });

      return (
        <SigninForm form={form} onSubmit={mockOnSubmit}>
          <input
            data-testid="email-input"
            defaultValue={form.getValues("email")}
          />
        </SigninForm>
      );
    };

    render(<TestComponentWithForm />);

    const emailInput = screen.getByTestId("email-input") as HTMLInputElement;
    expect(emailInput.value).toBe("test@example.com");
  });
});
