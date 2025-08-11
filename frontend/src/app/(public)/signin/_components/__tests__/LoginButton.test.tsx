import { render, screen } from "@testing-library/react";
import { vi } from "vitest";
import { LoginButton } from "../LoginButton";

// Mock the UI components
vi.mock("@/components/ui/button", () => ({
  Button: ({ children, disabled, type, className, variant, ...props }: any) => (
    <button type={type} disabled={disabled} className={className} data-variant={variant} {...props}>
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

describe("LoginButton", () => {
  it("renders sign in text when not pending", () => {
    render(<LoginButton isPending={false} />);

    expect(screen.getByRole("button")).toHaveTextContent("Sign in");
    expect(screen.queryByTestId("loader-icon")).not.toBeInTheDocument();
  });

  it("renders loading state when pending", () => {
    render(<LoginButton isPending={true} />);

    const button = screen.getByRole("button");
    expect(button).toHaveTextContent("Signing in...");
    expect(screen.getByTestId("loader-icon")).toBeInTheDocument();
  });

  it("is disabled when pending", () => {
    render(<LoginButton isPending={true} />);

    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("is enabled when not pending", () => {
    render(<LoginButton isPending={false} />);

    expect(screen.getByRole("button")).toBeEnabled();
  });

  it("applies correct CSS classes", () => {
    render(<LoginButton isPending={false} />);

    const button = screen.getByRole("button");
    expect(button).toHaveClass("w-full", "font-medium");
    expect(button).toHaveAttribute("data-variant", "default");
  });

  it("has submit type", () => {
    render(<LoginButton isPending={false} />);

    expect(screen.getByRole("button")).toHaveAttribute("type", "submit");
  });

  it("shows loader with correct classes when pending", () => {
    render(<LoginButton isPending={true} />);

    const loader = screen.getByTestId("loader-icon");
    expect(loader).toHaveClass("mr-2", "h-4", "w-4", "animate-spin");
  });

  it("can be clicked when not pending", () => {
    render(<LoginButton isPending={false} />);

    // Since it's a form submit button, we just verify it's clickable and enabled
    const button = screen.getByRole("button");
    expect(button).toBeInTheDocument();
    expect(button).not.toBeDisabled();
    expect(button).toHaveAttribute("type", "submit");
  });

  it("shows both loader and text in loading state", () => {
    render(<LoginButton isPending={true} />);

    expect(screen.getByTestId("loader-icon")).toBeInTheDocument();
    expect(screen.getByText("Signing in...")).toBeInTheDocument();
  });

  it("maintains consistent button structure", () => {
    const { rerender } = render(<LoginButton isPending={false} />);

    // Check initial state
    expect(screen.getByRole("button")).toBeInTheDocument();

    // Rerender with pending state
    rerender(<LoginButton isPending={true} />);

    // Button should still be there, just with different content
    expect(screen.getByRole("button")).toBeInTheDocument();
    expect(screen.getByRole("button")).toBeDisabled();
  });
});
