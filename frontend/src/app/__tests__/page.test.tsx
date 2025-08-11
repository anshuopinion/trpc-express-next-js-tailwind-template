import { render, screen } from "@testing-library/react";
import { vi } from "vitest";
import HomePage from "../page";

// Mock Next.js Link component
vi.mock("next/link", () => ({
  __esModule: true,
  default: ({ children, href, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

describe("HomePage", () => {
  it("renders the main heading and description", () => {
    render(<HomePage />);

    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      "Welcome to tRPC Template",
    );
    expect(
      screen.getByText(/A modern, type-safe full-stack template/),
    ).toBeInTheDocument();
  });

  it("renders navigation links with correct attributes", () => {
    render(<HomePage />);

    const signInLink = screen.getByRole("link", { name: "Sign In" });
    const signUpLink = screen.getByRole("link", { name: "Sign Up" });

    expect(signInLink).toBeInTheDocument();
    expect(signInLink).toHaveAttribute("href", "/signin");
    expect(signUpLink).toBeInTheDocument();
    expect(signUpLink).toHaveAttribute("href", "/signup");
  });

  it("applies correct CSS classes to navigation links", () => {
    render(<HomePage />);

    const signInLink = screen.getByRole("link", { name: "Sign In" });
    const signUpLink = screen.getByRole("link", { name: "Sign Up" });

    expect(signInLink).toHaveClass(
      "bg-blue-600",
      "hover:bg-blue-700",
      "text-white",
    );
    expect(signUpLink).toHaveClass(
      "bg-white",
      "hover:bg-gray-50",
      "text-blue-600",
      "border-2",
      "border-blue-600",
    );
  });

  it("renders all feature cards with correct content", () => {
    render(<HomePage />);

    // Modern Stack card
    expect(
      screen.getByRole("heading", { level: 3, name: "🚀 Modern Stack" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Built with Next.js 15, tRPC, React Query/),
    ).toBeInTheDocument();

    // Authentication card
    expect(
      screen.getByRole("heading", { level: 3, name: "🔐 Authentication" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/JWT-based authentication with refresh tokens/),
    ).toBeInTheDocument();

    // Responsive card
    expect(
      screen.getByRole("heading", { level: 3, name: "📱 Responsive" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Mobile-first design with Tailwind CSS/),
    ).toBeInTheDocument();
  });

  it("has proper semantic structure", () => {
    render(<HomePage />);

    // Check main container
    const mainContainer = screen
      .getByText("Welcome to tRPC Template")
      .closest("div");
    expect(mainContainer).toHaveClass("text-center");

    // Check feature grid exists
    const modernStackCard = screen.getByText("🚀 Modern Stack").closest("div");
    expect(modernStackCard).toHaveClass(
      "bg-white",
      "rounded-lg",
      "shadow-md",
      "p-6",
    );
  });

  it("renders with responsive layout classes", () => {
    render(<HomePage />);

    const container = screen
      .getByText("Welcome to tRPC Template")
      .closest(".container");
    expect(container).toHaveClass("mx-auto", "px-4", "py-16");

    // Check grid responsive classes
    const gridContainer = screen
      .getByText("🚀 Modern Stack")
      .closest("div")?.parentElement;
    expect(gridContainer).toHaveClass(
      "grid",
      "grid-cols-1",
      "md:grid-cols-3",
      "gap-8",
    );
  });

  it("has accessible heading hierarchy", () => {
    render(<HomePage />);

    const h1 = screen.getByRole("heading", { level: 1 });
    const h3Headings = screen.getAllByRole("heading", { level: 3 });

    expect(h1).toBeInTheDocument();
    expect(h3Headings).toHaveLength(3);

    // Verify heading content
    expect(h3Headings[0]).toHaveTextContent("🚀 Modern Stack");
    expect(h3Headings[1]).toHaveTextContent("🔐 Authentication");
    expect(h3Headings[2]).toHaveTextContent("📱 Responsive");
  });

  it("renders with gradient background", () => {
    render(<HomePage />);

    const mainDiv = screen.getByText("Welcome to tRPC Template").closest("div")
      ?.parentElement?.parentElement;
    expect(mainDiv).toHaveClass(
      "min-h-screen",
      "bg-gradient-to-br",
      "from-blue-50",
      "to-indigo-100",
    );
  });

  it("has proper spacing and layout structure", () => {
    render(<HomePage />);

    // Check description spacing
    const description = screen.getByText(
      /A modern, type-safe full-stack template/,
    );
    expect(description).toHaveClass("text-xl", "text-gray-600", "mb-8");

    // Check button container spacing
    const buttonContainer = screen.getByRole("link", {
      name: "Sign In",
    }).parentElement;
    expect(buttonContainer).toHaveClass("flex", "justify-center", "space-x-4");
  });
});
