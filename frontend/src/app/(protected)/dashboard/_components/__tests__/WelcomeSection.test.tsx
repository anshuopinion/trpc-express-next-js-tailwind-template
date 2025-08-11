import { render, screen } from "@testing-library/react";
import { vi } from "vitest";
import { WelcomeSection } from "../WelcomeSection";

// Mock UI components
vi.mock("@/components/ui/card", () => ({
  Card: ({ children, ...props }: any) => (
    <div data-testid="card" {...props}>
      {children}
    </div>
  ),
  CardContent: ({ children, className, ...props }: any) => (
    <div data-testid="card-content" className={className} {...props}>
      {children}
    </div>
  ),
  CardDescription: ({ children, ...props }: any) => (
    <p data-testid="card-description" {...props}>
      {children}
    </p>
  ),
  CardHeader: ({ children, ...props }: any) => (
    <div data-testid="card-header" {...props}>
      {children}
    </div>
  ),
  CardTitle: ({ children, className, ...props }: any) => (
    <h3 data-testid="card-title" className={className} {...props}>
      {children}
    </h3>
  ),
}));

describe("WelcomeSection", () => {
  it("renders card structure correctly", () => {
    render(<WelcomeSection />);

    expect(screen.getByTestId("card")).toBeInTheDocument();
    expect(screen.getByTestId("card-header")).toBeInTheDocument();
    expect(screen.getByTestId("card-content")).toBeInTheDocument();
  });

  it("renders title without firstName", () => {
    render(<WelcomeSection />);

    const title = screen.getByTestId("card-title");
    expect(title).toHaveTextContent("🎉 Welcome to your Dashboard!");
    expect(title).toHaveClass("text-xl");
  });

  it("renders title with firstName", () => {
    render(<WelcomeSection firstName="John" />);

    const title = screen.getByTestId("card-title");
    expect(title).toHaveTextContent("🎉 Welcome to your Dashboard, John!");
  });

  it("renders title with empty firstName gracefully", () => {
    render(<WelcomeSection firstName="" />);

    const title = screen.getByTestId("card-title");
    expect(title).toHaveTextContent("🎉 Welcome to your Dashboard!");
  });

  it("renders title with undefined firstName gracefully", () => {
    render(<WelcomeSection firstName={undefined} />);

    const title = screen.getByTestId("card-title");
    expect(title).toHaveTextContent("🎉 Welcome to your Dashboard!");
  });

  it("renders card description", () => {
    render(<WelcomeSection />);

    const description = screen.getByTestId("card-description");
    expect(description).toHaveTextContent(
      "You've successfully authenticated using tRPC and JWT tokens. This dashboard demonstrates:",
    );
  });

  it("renders all feature list items", () => {
    render(<WelcomeSection />);

    expect(
      screen.getByText("Type-safe API calls with tRPC and React Query"),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "JWT-based authentication with automatic token management",
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Protected routes that redirect unauthenticated users"),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "Modern Next.js 15 app structure with server and client components",
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Real-time data fetching and caching"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("shadcn/ui components with Tailwind CSS styling"),
    ).toBeInTheDocument();
  });

  it("applies correct CSS classes to card content", () => {
    render(<WelcomeSection />);

    const cardContent = screen.getByTestId("card-content");
    expect(cardContent).toHaveClass("space-y-4");
  });

  it("renders feature list with correct styling", () => {
    render(<WelcomeSection />);

    const featureList = screen.getByRole("list");
    expect(featureList).toHaveClass(
      "list-disc",
      "list-inside",
      "space-y-2",
      "text-sm",
      "text-muted-foreground",
    );
  });

  it("renders template highlight section", () => {
    render(<WelcomeSection />);

    expect(screen.getByText("This is a clean template!")).toBeInTheDocument();
    expect(
      screen.getByText(/You can use this as a starting point/),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/includes authentication, user management/),
    ).toBeInTheDocument();
  });

  it("applies correct CSS classes to template highlight section", () => {
    render(<WelcomeSection />);

    const highlightContainer = screen
      .getByText("This is a clean template!")
      .closest("div")?.parentElement?.parentElement;
    expect(highlightContainer).toHaveClass(
      "mt-6",
      "p-4",
      "bg-primary/5",
      "rounded-lg",
      "border",
      "border-primary/20",
    );

    const sparkleIcon = screen.getByText("✨");
    expect(sparkleIcon).toHaveClass("text-2xl");

    const highlightTitle = screen.getByText("This is a clean template!");
    expect(highlightTitle).toHaveClass("font-semibold", "text-primary", "mb-1");

    const highlightDescription = screen.getByText(
      /You can use this as a starting point/,
    );
    expect(highlightDescription).toHaveClass(
      "text-sm",
      "text-muted-foreground",
    );
  });

  it("renders all technology badges", () => {
    render(<WelcomeSection />);

    const badges = [
      "Next.js 15",
      "tRPC",
      "React Query",
      "TypeScript",
      "shadcn/ui",
      "Tailwind CSS",
    ];

    badges.forEach((badge) => {
      expect(screen.getByText(badge)).toBeInTheDocument();
    });
  });

  it("applies correct CSS classes to technology badges", () => {
    render(<WelcomeSection />);

    const badgesContainer = screen.getByText("Next.js 15").parentElement;
    expect(badgesContainer).toHaveClass("flex", "flex-wrap", "gap-2", "mt-4");

    const firstBadge = screen.getByText("Next.js 15");
    expect(firstBadge).toHaveClass(
      "px-2",
      "py-1",
      "bg-secondary",
      "text-secondary-foreground",
      "rounded-md",
      "text-xs",
    );
  });

  it("renders flex container with icons correctly", () => {
    render(<WelcomeSection />);

    const flexContainer = screen.getByText("✨").parentElement;
    expect(flexContainer).toHaveClass("flex", "items-start", "space-x-3");
  });

  it("renders semantic HTML structure", () => {
    render(<WelcomeSection />);

    // Should have proper heading structure
    const title = screen.getByTestId("card-title");
    expect(title.tagName.toLowerCase()).toBe("h3");

    // Should have proper list structure
    const featureList = screen.getByRole("list");
    expect(featureList.tagName.toLowerCase()).toBe("ul");

    const listItems = screen.getAllByRole("listitem");
    expect(listItems).toHaveLength(6);
  });

  it("handles long firstName gracefully", () => {
    render(
      <WelcomeSection firstName="VeryLongFirstNameThatMightCauseLayoutIssues" />,
    );

    const title = screen.getByTestId("card-title");
    expect(title).toHaveTextContent(
      "🎉 Welcome to your Dashboard, VeryLongFirstNameThatMightCauseLayoutIssues!",
    );
  });

  it("handles special characters in firstName", () => {
    render(<WelcomeSection firstName="José-María" />);

    const title = screen.getByTestId("card-title");
    expect(title).toHaveTextContent(
      "🎉 Welcome to your Dashboard, José-María!",
    );
  });

  it("renders all content sections in correct order", () => {
    render(<WelcomeSection />);

    const cardContent = screen.getByTestId("card-content");
    const children = Array.from(cardContent.children);

    // Should have feature list, highlight section, and badges section
    expect(children).toHaveLength(3);

    // First child should contain the feature list
    expect(children[0]).toContainElement(screen.getByRole("list"));

    // Second child should contain the highlight section
    expect(children[1]).toContainElement(
      screen.getByText("This is a clean template!"),
    );

    // Third child should contain the badges
    expect(children[2]).toContainElement(screen.getByText("Next.js 15"));
  });

  it("maintains consistent spacing and layout", () => {
    render(<WelcomeSection />);

    const cardContent = screen.getByTestId("card-content");
    expect(cardContent).toHaveClass("space-y-4");
  });

  it("renders emoji icons correctly", () => {
    render(<WelcomeSection />);

    expect(screen.getByText(/🎉/)).toBeInTheDocument();
    expect(screen.getByText("✨")).toBeInTheDocument();
  });
});
