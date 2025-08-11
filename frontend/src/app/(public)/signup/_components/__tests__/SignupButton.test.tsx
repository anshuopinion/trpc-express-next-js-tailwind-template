import { render, screen } from "@testing-library/react";
import { vi } from "vitest";
import { SignupButton } from "../SignupButton";

// Mock the UI components
vi.mock("@/components/ui/button", () => ({
  Button: ({ children, disabled, type, className, ...props }: any) => (
    <button type={type} disabled={disabled} className={className} {...props}>
      {children}
    </button>
  ),
}));

// Mock lucide-react
vi.mock("lucide-react", () => ({
  Loader2: ({ className }: any) => (
    <div data-testid="loader-icon" className={className}>
      Loading...
    </div>
  ),
}));

describe("SignupButton", () => {
  it("renders create account text when not pending", () => {
    render(<SignupButton isPending={false} />);

    expect(screen.getByRole("button")).toHaveTextContent("Create account");
    expect(screen.queryByTestId("loader-icon")).not.toBeInTheDocument();
  });

  it("renders loading state when pending", () => {
    render(<SignupButton isPending={true} />);

    const button = screen.getByRole("button");
    expect(button).toHaveTextContent("Creating account...");
    expect(screen.getByTestId("loader-icon")).toBeInTheDocument();
  });

  it("is disabled when pending", () => {
    render(<SignupButton isPending={true} />);

    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("is enabled when not pending", () => {
    render(<SignupButton isPending={false} />);

    expect(screen.getByRole("button")).toBeEnabled();
  });

  it("applies correct CSS classes", () => {
    render(<SignupButton isPending={false} />);

    const button = screen.getByRole("button");
    expect(button).toHaveClass("w-full", "font-medium");
  });

  it("has submit type", () => {
    render(<SignupButton isPending={false} />);

    expect(screen.getByRole("button")).toHaveAttribute("type", "submit");
  });

  it("shows loader with correct classes when pending", () => {
    render(<SignupButton isPending={true} />);

    const loader = screen.getByTestId("loader-icon");
    expect(loader).toHaveClass("mr-2", "h-4", "w-4", "animate-spin");
  });

  it("shows both loader and text in loading state", () => {
    render(<SignupButton isPending={true} />);

    expect(screen.getByTestId("loader-icon")).toBeInTheDocument();
    expect(screen.getByText("Creating account...")).toBeInTheDocument();
  });

  it("maintains consistent button structure", () => {
    const { rerender } = render(<SignupButton isPending={false} />);

    // Check initial state
    expect(screen.getByRole("button")).toBeInTheDocument();

    // Rerender with pending state
    rerender(<SignupButton isPending={true} />);

    // Button should still be there, just with different content
    expect(screen.getByRole("button")).toBeInTheDocument();
    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("has proper button styling for signup", () => {
    render(<SignupButton isPending={false} />);

    const button = screen.getByRole("button");
    expect(button).toHaveClass("w-full");
    expect(button).toHaveClass("font-medium");
  });

  it("handles state changes correctly", () => {
    const { rerender } = render(<SignupButton isPending={false} />);

    // Initial state
    expect(screen.getByRole("button")).toHaveTextContent("Create account");
    expect(screen.getByRole("button")).not.toBeDisabled();

    // Change to pending
    rerender(<SignupButton isPending={true} />);
    expect(screen.getByRole("button")).toHaveTextContent("Creating account...");
    expect(screen.getByRole("button")).toBeDisabled();

    // Change back to not pending
    rerender(<SignupButton isPending={false} />);
    expect(screen.getByRole("button")).toHaveTextContent("Create account");
    expect(screen.getByRole("button")).not.toBeDisabled();
  });

  it("loader appears only when pending", () => {
    const { rerender } = render(<SignupButton isPending={false} />);

    expect(screen.queryByTestId("loader-icon")).not.toBeInTheDocument();

    rerender(<SignupButton isPending={true} />);
    expect(screen.getByTestId("loader-icon")).toBeInTheDocument();

    rerender(<SignupButton isPending={false} />);
    expect(screen.queryByTestId("loader-icon")).not.toBeInTheDocument();
  });

  it("has correct text content for signup context", () => {
    render(<SignupButton isPending={false} />);

    // Should say "Create account" not "Sign in"
    expect(screen.getByRole("button")).toHaveTextContent("Create account");
    expect(screen.getByRole("button")).not.toHaveTextContent("Sign in");
  });

  it("has correct pending text for signup context", () => {
    render(<SignupButton isPending={true} />);

    // Should say "Creating account..." not "Signing in..."
    expect(screen.getByRole("button")).toHaveTextContent("Creating account...");
    expect(screen.getByRole("button")).not.toHaveTextContent("Signing in...");
  });
});
