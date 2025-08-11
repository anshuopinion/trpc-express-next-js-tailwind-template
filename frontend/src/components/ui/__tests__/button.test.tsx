import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";
import { Button } from "../button";

describe("Button Component", () => {
  it("renders button with text", () => {
    render(<Button>Click me</Button>);

    const button = screen.getByRole("button", { name: "Click me" });
    expect(button).toBeInTheDocument();
  });

  it("applies default variant and size classes", () => {
    render(<Button>Default Button</Button>);

    const button = screen.getByRole("button");
    expect(button).toHaveClass("bg-primary", "text-primary-foreground", "h-9", "px-4");
  });

  it("applies custom variant classes", () => {
    render(<Button variant="destructive">Delete</Button>);

    const button = screen.getByRole("button");
    expect(button).toHaveClass("bg-destructive", "text-destructive-foreground");
  });

  it("applies custom size classes", () => {
    render(<Button size="lg">Large Button</Button>);

    const button = screen.getByRole("button");
    expect(button).toHaveClass("h-10", "px-8");
  });

  it("handles click events", async () => {
    const user = userEvent.setup();
    const mockClick = vi.fn();

    render(<Button onClick={mockClick}>Clickable</Button>);

    const button = screen.getByRole("button");
    await user.click(button);

    expect(mockClick).toHaveBeenCalledOnce();
  });

  it("is disabled when disabled prop is true", () => {
    render(<Button disabled>Disabled Button</Button>);

    const button = screen.getByRole("button");
    expect(button).toBeDisabled();
    expect(button).toHaveClass("disabled:opacity-50", "disabled:pointer-events-none");
  });

  it("renders as child component when asChild is true", () => {
    render(
      <Button asChild>
        <a href="/test">Link Button</a>
      </Button>
    );

    const link = screen.getByRole("link", { name: "Link Button" });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "/test");
  });

  it("applies custom className", () => {
    render(<Button className="custom-class">Custom</Button>);

    const button = screen.getByRole("button");
    expect(button).toHaveClass("custom-class");
  });
});
