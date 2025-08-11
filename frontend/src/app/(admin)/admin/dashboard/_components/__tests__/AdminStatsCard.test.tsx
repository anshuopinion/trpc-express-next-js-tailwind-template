import { render, screen } from "@testing-library/react";
import { Users } from "lucide-react";
import { vi } from "vitest";
import { AdminStatsCard } from "../AdminStatsCard";

// Mock UI components
vi.mock("@/components/ui/card", () => ({
  Card: ({ children, ...props }: any) => (
    <div data-testid="card" {...props}>
      {children}
    </div>
  ),
  CardContent: ({ children, ...props }: any) => (
    <div data-testid="card-content" {...props}>
      {children}
    </div>
  ),
  CardHeader: ({ children, className, ...props }: any) => (
    <div data-testid="card-header" className={className} {...props}>
      {children}
    </div>
  ),
  CardTitle: ({ children, className, ...props }: any) => (
    <h3 data-testid="card-title" className={className} {...props}>
      {children}
    </h3>
  ),
}));

// Mock icon component for testing
const MockIcon = ({ className }: any) => (
  <div data-testid="mock-icon" className={className}>
    Icon
  </div>
);

describe("AdminStatsCard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders card structure correctly", () => {
    render(
      <AdminStatsCard
        title="Total Users"
        value={150}
        description="Registered users in system"
        icon={MockIcon}
      />
    );

    expect(screen.getByTestId("card")).toBeInTheDocument();
    expect(screen.getByTestId("card-header")).toBeInTheDocument();
    expect(screen.getByTestId("card-content")).toBeInTheDocument();
  });

  it("renders title with correct text and classes", () => {
    render(
      <AdminStatsCard
        title="Total Users"
        value={150}
        description="Registered users in system"
        icon={MockIcon}
      />
    );

    const title = screen.getByTestId("card-title");
    expect(title).toHaveTextContent("Total Users");
    expect(title).toHaveClass("text-sm", "font-medium");
  });

  it("renders icon with correct classes", () => {
    render(
      <AdminStatsCard
        title="Total Users"
        value={150}
        description="Registered users in system"
        icon={MockIcon}
      />
    );

    const icon = screen.getByTestId("mock-icon");
    expect(icon).toBeInTheDocument();
    expect(icon).toHaveClass("h-4", "w-4", "text-muted-foreground");
  });

  it("applies correct CSS classes to card header", () => {
    render(
      <AdminStatsCard
        title="Total Users"
        value={150}
        description="Registered users in system"
        icon={MockIcon}
      />
    );

    const cardHeader = screen.getByTestId("card-header");
    expect(cardHeader).toHaveClass(
      "flex",
      "flex-row",
      "items-center",
      "justify-between",
      "space-y-0",
      "pb-2"
    );
  });

  it("renders numeric value correctly", () => {
    render(
      <AdminStatsCard
        title="Total Users"
        value={150}
        description="Registered users in system"
        icon={MockIcon}
      />
    );

    const value = screen.getByText("150");
    expect(value).toBeInTheDocument();
    expect(value).toHaveClass("text-2xl", "font-bold");
  });

  it("renders string value correctly", () => {
    render(
      <AdminStatsCard title="Status" value="Active" description="System status" icon={MockIcon} />
    );

    const value = screen.getByText("Active");
    expect(value).toBeInTheDocument();
    expect(value).toHaveClass("text-2xl", "font-bold");
  });

  it("renders description with correct styling", () => {
    render(
      <AdminStatsCard
        title="Total Users"
        value={150}
        description="Registered users in system"
        icon={MockIcon}
      />
    );

    const description = screen.getByText("Registered users in system");
    expect(description).toHaveClass("text-xs", "text-muted-foreground");
  });

  it("renders without trend when trend is not provided", () => {
    render(
      <AdminStatsCard
        title="Total Users"
        value={150}
        description="Registered users in system"
        icon={MockIcon}
      />
    );

    // Should only have description, no trend element
    const cardContent = screen.getByTestId("card-content");
    const flexContainer = cardContent.querySelector(".flex.items-center.justify-between");
    expect(flexContainer).toBeInTheDocument();
    expect(flexContainer?.children).toHaveLength(1); // Only description, no trend
  });

  it("renders positive trend correctly", () => {
    render(
      <AdminStatsCard
        title="Total Users"
        value={150}
        description="Registered users in system"
        icon={MockIcon}
        trend={{ value: 12, isPositive: true }}
      />
    );

    const trendElement = screen.getByText("+12%");
    expect(trendElement).toBeInTheDocument();
    expect(trendElement).toHaveClass("text-xs", "text-green-600");
  });

  it("renders negative trend correctly", () => {
    render(
      <AdminStatsCard
        title="Total Users"
        value={150}
        description="Registered users in system"
        icon={MockIcon}
        trend={{ value: 8, isPositive: false }}
      />
    );

    const trendElement = screen.getByText("8%");
    expect(trendElement).toBeInTheDocument();
    expect(trendElement).toHaveClass("text-xs", "text-red-600");
  });

  it("handles zero trend value", () => {
    render(
      <AdminStatsCard
        title="Total Users"
        value={150}
        description="Registered users in system"
        icon={MockIcon}
        trend={{ value: 0, isPositive: true }}
      />
    );

    const trendElement = screen.getByText("+0%");
    expect(trendElement).toBeInTheDocument();
    expect(trendElement).toHaveClass("text-xs", "text-green-600");
  });

  it("renders large values correctly", () => {
    render(
      <AdminStatsCard
        title="Total Users"
        value={1000000}
        description="One million users"
        icon={MockIcon}
      />
    );

    expect(screen.getByText("1000000")).toBeInTheDocument();
  });

  it("handles long descriptions gracefully", () => {
    const longDescription =
      "This is a very long description that might wrap to multiple lines in the UI and should be handled gracefully";

    render(
      <AdminStatsCard
        title="Total Users"
        value={150}
        description={longDescription}
        icon={MockIcon}
      />
    );

    expect(screen.getByText(longDescription)).toBeInTheDocument();
  });

  it("handles long titles gracefully", () => {
    render(
      <AdminStatsCard
        title="Very Long Title That Might Cause Layout Issues"
        value={150}
        description="Description"
        icon={MockIcon}
      />
    );

    expect(screen.getByText("Very Long Title That Might Cause Layout Issues")).toBeInTheDocument();
  });

  it("renders with different icon types", () => {
    const CustomIcon = ({ className }: any) => (
      <div data-testid="custom-icon" className={className}>
        Custom
      </div>
    );

    render(
      <AdminStatsCard
        title="Custom Stat"
        value={42}
        description="Custom description"
        icon={CustomIcon}
      />
    );

    expect(screen.getByTestId("custom-icon")).toBeInTheDocument();
    expect(screen.getByTestId("custom-icon")).toHaveClass("h-4", "w-4", "text-muted-foreground");
  });

  it("maintains correct layout structure with trend", () => {
    render(
      <AdminStatsCard
        title="Total Users"
        value={150}
        description="Registered users in system"
        icon={MockIcon}
        trend={{ value: 15, isPositive: true }}
      />
    );

    const cardContent = screen.getByTestId("card-content");
    const children = Array.from(cardContent.children);

    // Should have value element and flex container with description and trend
    expect(children).toHaveLength(2);
    expect(children[0]).toHaveTextContent("150"); // Value
    expect(children[1]).toContainElement(screen.getByText("Registered users in system")); // Description
    expect(children[1]).toContainElement(screen.getByText("+15%")); // Trend
  });

  it("maintains correct layout structure without trend", () => {
    render(
      <AdminStatsCard
        title="Total Users"
        value={150}
        description="Registered users in system"
        icon={MockIcon}
      />
    );

    const cardContent = screen.getByTestId("card-content");
    const children = Array.from(cardContent.children);

    // Should have value element and flex container with only description
    expect(children).toHaveLength(2);
    expect(children[0]).toHaveTextContent("150"); // Value
    expect(children[1]).toContainElement(screen.getByText("Registered users in system")); // Description
  });

  it("renders semantic HTML structure", () => {
    render(
      <AdminStatsCard
        title="Total Users"
        value={150}
        description="Registered users in system"
        icon={MockIcon}
      />
    );

    const title = screen.getByTestId("card-title");
    expect(title.tagName.toLowerCase()).toBe("h3");
  });

  it("handles special characters in title and description", () => {
    render(
      <AdminStatsCard
        title="Users (Active & Verified)"
        value={150}
        description="Users with special chars: @#$%^&*()"
        icon={MockIcon}
      />
    );

    expect(screen.getByText("Users (Active & Verified)")).toBeInTheDocument();
    expect(screen.getByText("Users with special chars: @#$%^&*()")).toBeInTheDocument();
  });

  it("renders negative values correctly", () => {
    render(
      <AdminStatsCard title="Change" value={-25} description="Negative change" icon={MockIcon} />
    );

    expect(screen.getByText("-25")).toBeInTheDocument();
  });

  it("renders decimal values correctly", () => {
    render(
      <AdminStatsCard title="Percentage" value="85.5%" description="Success rate" icon={MockIcon} />
    );

    expect(screen.getByText("85.5%")).toBeInTheDocument();
  });

  it("applies consistent spacing classes", () => {
    render(
      <AdminStatsCard
        title="Total Users"
        value={150}
        description="Registered users in system"
        icon={MockIcon}
        trend={{ value: 12, isPositive: true }}
      />
    );

    const flexContainer = screen.getByText("Registered users in system").parentElement;
    expect(flexContainer).toHaveClass("flex", "items-center", "justify-between");
  });

  it("handles empty or null values gracefully", () => {
    render(
      <AdminStatsCard
        title="Empty Value"
        value=""
        description="No data available"
        icon={MockIcon}
      />
    );

    // Should render but might be empty
    const valueElement = screen.getByTestId("card-content").firstElementChild;
    expect(valueElement).toBeInTheDocument();
  });

  it("renders with real Lucide React icon", () => {
    render(
      <AdminStatsCard
        title="Total Users"
        value={150}
        description="Registered users in system"
        icon={Users}
      />
    );

    // The icon should be rendered (though mocked in our test environment)
    expect(screen.getByTestId("card")).toBeInTheDocument();
  });
});
