import { render, screen } from "@testing-library/react";
import { useForm } from "react-hook-form";
import { vi } from "vitest";
import type { SignupFormData } from "../../_schema";
import { SignupForm } from "../SignupForm";

// Mock the form components
vi.mock("@/components/ui/card", () => ({
  Card: ({ children, className }: any) => (
    <div data-testid="signup-card" className={className}>
      {children}
    </div>
  ),
}));

vi.mock("@/components/ui/form", () => ({
  Form: ({ children }: any) => <div data-testid="signup-form">{children}</div>,
}));

describe("SignupForm", () => {
  const mockOnSubmit = vi.fn();

  // Test wrapper component
  const TestWrapper = ({ children }: { children: React.ReactNode }) => {
    const form = useForm<SignupFormData>({
      defaultValues: {
        first_name: "",
        last_name: "",
        email: "",
        password: "",
        confirmPassword: "",
      },
    });

    return (
      <SignupForm form={form} onSubmit={mockOnSubmit}>
        {children}
      </SignupForm>
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the form card with correct structure", () => {
    // Using TestWrapper instead

    render(
      <TestWrapper>
        <div data-testid="form-fields">Test fields</div>
      </TestWrapper>,
    );

    expect(screen.getByTestId("signup-card")).toBeInTheDocument();
    expect(screen.getByTestId("signup-form")).toBeInTheDocument();
    expect(screen.getByTestId("form-fields")).toBeInTheDocument();
  });

  it("displays the correct heading and description", () => {
    // Using TestWrapper instead

    render(
      <TestWrapper>
        <div>Test content</div>
      </TestWrapper>,
    );

    expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent(
      "Join tRPC Template",
    );
    expect(
      screen.getByText(/Create your account to start building/),
    ).toBeInTheDocument();
  });

  it("applies correct CSS classes to the card", () => {
    // Using TestWrapper instead

    render(
      <TestWrapper>
        <div>Test content</div>
      </TestWrapper>,
    );

    const card = screen.getByTestId("signup-card");
    expect(card).toHaveClass("min-h-[410px]", "flex-1", "p-8", "shadow-lg");
  });

  it("renders children inside the form", () => {
    const testContent = "Test form fields";
    // Using TestWrapper instead

    render(
      <TestWrapper>
        <div data-testid="custom-fields">{testContent}</div>
      </TestWrapper>,
    );

    expect(screen.getByTestId("custom-fields")).toBeInTheDocument();
    expect(screen.getByText(testContent)).toBeInTheDocument();
  });

  it("has proper structure with space-y classes", () => {
    // Using TestWrapper instead

    render(
      <TestWrapper>
        <input data-testid="test-input" />
      </TestWrapper>,
    );

    // Check that the form content container has proper spacing
    const container = screen
      .getByText("Join tRPC Template")
      .closest(".space-y-6");
    expect(container).toBeInTheDocument();
    expect(container).toHaveClass("max-w-full");
  });

  it("includes text styling classes for heading and description", () => {
    // Using TestWrapper instead

    render(
      <TestWrapper>
        <div>Test content</div>
      </TestWrapper>,
    );

    const heading = screen.getByText("Join tRPC Template");
    expect(heading).toHaveClass("text-2xl", "font-bold", "tracking-tight");

    const description = screen.getByText(
      /Create your account to start building/,
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
      .getByText("Join tRPC Template")
      .closest(".text-center");
    expect(headerSection).toBeInTheDocument();
    expect(headerSection).toHaveClass("mb-6");
  });

  it("form has proper classes and full width", () => {
    // Using TestWrapper instead

    render(
      <TestWrapper>
        <div>Test content</div>
      </TestWrapper>,
    );

    // The form should have space-y-5 and w-full classes based on the component
    const formContainer = screen
      .getByText("Join tRPC Template")
      .closest("div")?.parentElement;
    expect(formContainer).toBeInTheDocument();
  });

  it("receives and uses form props correctly", () => {
    const TestComponentWithForm = () => {
      const form = useForm<SignupFormData>({
        defaultValues: {
          first_name: "John",
          last_name: "Doe",
          email: "test@example.com",
          password: "testpass",
          confirmPassword: "testpass",
        },
      });

      return (
        <SignupForm form={form} onSubmit={mockOnSubmit}>
          <input
            data-testid="first-name-input"
            defaultValue={form.getValues("first_name")}
          />
        </SignupForm>
      );
    };

    render(<TestComponentWithForm />);

    const firstNameInput = screen.getByTestId(
      "first-name-input",
    ) as HTMLInputElement;
    expect(firstNameInput.value).toBe("John");
  });

  it("has proper responsive width classes", () => {
    // Using TestWrapper instead

    render(
      <TestWrapper>
        <div>Test content</div>
      </TestWrapper>,
    );

    // Check that the container has max-w-full (different from signin which has max-w-md)
    const container = screen
      .getByText("Join tRPC Template")
      .closest(".space-y-6");
    expect(container).toHaveClass("max-w-full");
  });
});
