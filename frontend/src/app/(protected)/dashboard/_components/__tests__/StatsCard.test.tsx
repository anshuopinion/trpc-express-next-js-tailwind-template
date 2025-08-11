import { render, screen } from "@testing-library/react";
import { Activity, Server, Users } from "lucide-react";
import { vi } from "vitest";
import { StatsCard } from "../StatsCard";

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
    Mock Icon
  </div>
);

const MockUsersIcon = ({ className }: any) => (
  <div data-testid="users-icon" className={className}>
    Users Icon
  </div>
);

const MockServerIcon = ({ className }: any) => (
  <div data-testid="server-icon" className={className}>
    Server Icon
  </div>
);

describe("StatsCard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders card structure correctly", () => {
    render(
      <StatsCard title="Total Users" value={150} description="Registered users" icon={MockIcon} />
    );

    expect(screen.getByTestId("card")).toBeInTheDocument();
    expect(screen.getByTestId("card-header")).toBeInTheDocument();
    expect(screen.getByTestId("card-content")).toBeInTheDocument();
  });

  it("renders title with correct text and classes", () => {
    render(
      <StatsCard title="Total Users" value={150} description="Registered users" icon={MockIcon} />
    );

    const title = screen.getByTestId("card-title");
    expect(title).toHaveTextContent("Total Users");
    expect(title).toHaveClass("text-sm", "font-medium");
  });

  it("applies correct CSS classes to card header", () => {
    render(
      <StatsCard title="Total Users" value={150} description="Registered users" icon={MockIcon} />
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

  it("renders numeric value with correct styling", () => {
    render(
      <StatsCard title="Total Users" value={150} description="Registered users" icon={MockIcon} />
    );

    const value = screen.getByText("150");
    expect(value).toBeInTheDocument();
    expect(value).toHaveClass("text-2xl", "font-bold");
  });

  it("renders string value with correct styling", () => {
    render(
      <StatsCard title="Status" value="Active" description="Current status" icon={MockIcon} />
    );

    const value = screen.getByText("Active");
    expect(value).toBeInTheDocument();
    expect(value).toHaveClass("text-2xl", "font-bold");
  });

  it("renders description with correct styling", () => {
    render(
      <StatsCard
        title="Total Users"
        value={150}
        description="Registered users in the system"
        icon={MockIcon}
      />
    );

    const description = screen.getByText("Registered users in the system");
    expect(description).toHaveClass("text-xs", "text-muted-foreground");
    expect(description.tagName.toLowerCase()).toBe("p");
  });

  it("renders icon with default success status styling", () => {
    render(
      <StatsCard title="Total Users" value={150} description="Registered users" icon={MockIcon} />
    );

    const icon = screen.getByTestId("mock-icon");
    expect(icon).toBeInTheDocument();
    expect(icon).toHaveClass("h-4", "w-4", "text-green-600");
  });

  it("renders icon with success status styling", () => {
    render(
      <StatsCard
        title="Total Users"
        value={150}
        description="Registered users"
        icon={MockIcon}
        status="success"
      />
    );

    const icon = screen.getByTestId("mock-icon");
    expect(icon).toHaveClass("h-4", "w-4", "text-green-600");
  });

  it("renders icon with warning status styling", () => {
    render(
      <StatsCard
        title="Pending Users"
        value={15}
        description="Users awaiting approval"
        icon={MockIcon}
        status="warning"
      />
    );

    const icon = screen.getByTestId("mock-icon");
    expect(icon).toHaveClass("h-4", "w-4", "text-yellow-600");
  });

  it("renders icon with error status styling", () => {
    render(
      <StatsCard
        title="Failed Requests"
        value={5}
        description="Requests with errors"
        icon={MockIcon}
        status="error"
      />
    );

    const icon = screen.getByTestId("mock-icon");
    expect(icon).toHaveClass("h-4", "w-4", "text-red-600");
  });

  it("handles large numeric values", () => {
    render(
      <StatsCard
        title="Total Users"
        value={1000000}
        description="One million users"
        icon={MockIcon}
      />
    );

    expect(screen.getByText("1000000")).toBeInTheDocument();
  });

  it("handles decimal values", () => {
    render(
      <StatsCard
        title="Success Rate"
        value="99.5%"
        description="Request success rate"
        icon={MockIcon}
      />
    );

    expect(screen.getByText("99.5%")).toBeInTheDocument();
  });

  it("handles negative values", () => {
    render(
      <StatsCard title="Change" value={-25} description="Decrease in users" icon={MockIcon} />
    );

    expect(screen.getByText("-25")).toBeInTheDocument();
  });

  it("handles zero values", () => {
    render(<StatsCard title="Errors" value={0} description="No errors reported" icon={MockIcon} />);

    expect(screen.getByText("0")).toBeInTheDocument();
  });

  it("handles long titles gracefully", () => {
    render(
      <StatsCard
        title="Very Long Title That Might Cause Layout Issues"
        value={42}
        description="Test description"
        icon={MockIcon}
      />
    );

    expect(screen.getByText("Very Long Title That Might Cause Layout Issues")).toBeInTheDocument();
  });

  it("handles long descriptions gracefully", () => {
    const longDescription = "This is a very long description that might wrap to multiple lines";

    render(<StatsCard title="Test" value={42} description={longDescription} icon={MockIcon} />);

    expect(screen.getByText(longDescription)).toBeInTheDocument();
  });

  it("renders with different icon types", () => {
    render(
      <StatsCard title="User Stats" value={100} description="Active users" icon={MockUsersIcon} />
    );

    expect(screen.getByTestId("users-icon")).toBeInTheDocument();
    expect(screen.getByTestId("users-icon")).toHaveClass("h-4", "w-4", "text-green-600");
  });

  it("handles special characters in title", () => {
    render(
      <StatsCard
        title="Users (Active & Verified)"
        value={150}
        description="Special chars test"
        icon={MockIcon}
      />
    );

    expect(screen.getByText("Users (Active & Verified)")).toBeInTheDocument();
  });

  it("handles special characters in description", () => {
    render(
      <StatsCard title="Test" value={42} description="Special chars: @#$%^&*()" icon={MockIcon} />
    );

    expect(screen.getByText("Special chars: @#$%^&*()")).toBeInTheDocument();
  });

  it("maintains consistent layout structure", () => {
    render(
      <StatsCard title="Total Users" value={150} description="Registered users" icon={MockIcon} />
    );

    const cardContent = screen.getByTestId("card-content");
    const children = Array.from(cardContent.children);

    // Should have value and description
    expect(children).toHaveLength(2);
    expect(children[0]).toHaveTextContent("150"); // Value
    expect(children[1]).toHaveTextContent("Registered users"); // Description
  });

  it("renders semantic HTML structure", () => {
    render(
      <StatsCard title="Total Users" value={150} description="Registered users" icon={MockIcon} />
    );

    const title = screen.getByTestId("card-title");
    expect(title.tagName.toLowerCase()).toBe("h3");

    const description = screen.getByText("Registered users");
    expect(description.tagName.toLowerCase()).toBe("p");
  });

  it("applies status styles correctly for all status types", () => {
    const statuses = [
      { status: "success" as const, expectedClass: "text-green-600" },
      { status: "warning" as const, expectedClass: "text-yellow-600" },
      { status: "error" as const, expectedClass: "text-red-600" },
    ];

    statuses.forEach(({ status, expectedClass }) => {
      const { unmount } = render(
        <StatsCard
          title={`${status} Test`}
          value={100}
          description="Test description"
          icon={MockIcon}
          status={status}
        />
      );

      const icon = screen.getByTestId("mock-icon");
      expect(icon).toHaveClass(expectedClass);

      unmount();
    });
  });

  it("handles empty string values", () => {
    render(
      <StatsCard title="Empty Value" value="" description="No data available" icon={MockIcon} />
    );

    // Should render but might be empty
    const cardContent = screen.getByTestId("card-content");
    expect(cardContent).toBeInTheDocument();
  });

  it("handles null-like values gracefully", () => {
    render(
      <StatsCard title="Null Value" value="N/A" description="Data not available" icon={MockIcon} />
    );

    expect(screen.getByText("N/A")).toBeInTheDocument();
  });

  it("renders with real Lucide React icons", () => {
    render(
      <StatsCard
        title="Server Stats"
        value={5}
        description="Active servers"
        icon={Server}
        status="success"
      />
    );

    // The icon should be rendered (though mocked in our test environment)
    expect(screen.getByTestId("card")).toBeInTheDocument();
  });

  it("applies consistent text hierarchy", () => {
    render(
      <StatsCard title="Total Users" value={150} description="Registered users" icon={MockIcon} />
    );

    // Title should be small and medium weight
    const title = screen.getByTestId("card-title");
    expect(title).toHaveClass("text-sm", "font-medium");

    // Value should be large and bold
    const value = screen.getByText("150");
    expect(value).toHaveClass("text-2xl", "font-bold");

    // Description should be extra small
    const description = screen.getByText("Registered users");
    expect(description).toHaveClass("text-xs");
  });

  it("applies consistent muted text coloring", () => {
    render(
      <StatsCard title="Total Users" value={150} description="Registered users" icon={MockIcon} />
    );

    const description = screen.getByText("Registered users");
    expect(description).toHaveClass("text-muted-foreground");
  });

  it("handles formatted currency values", () => {
    render(
      <StatsCard title="Revenue" value="$1,234.56" description="Monthly revenue" icon={MockIcon} />
    );

    expect(screen.getByText("$1,234.56")).toBeInTheDocument();
  });

  it("handles formatted percentage values", () => {
    render(
      <StatsCard
        title="Growth Rate"
        value="+15.7%"
        description="Year over year growth"
        icon={MockIcon}
      />
    );

    expect(screen.getByText("+15.7%")).toBeInTheDocument();
  });

  it("handles complex value strings", () => {
    render(
      <StatsCard
        title="System Load"
        value="2.3 / 4.0"
        description="Current / Maximum"
        icon={MockIcon}
      />
    );

    expect(screen.getByText("2.3 / 4.0")).toBeInTheDocument();
  });

  it("maintains icon positioning with different content lengths", () => {
    render(
      <StatsCard
        title="Very Long Title That Might Push Icon"
        value={999999}
        description="Very long description that might affect layout"
        icon={MockIcon}
      />
    );

    const cardHeader = screen.getByTestId("card-header");
    expect(cardHeader).toHaveClass("justify-between");

    const icon = screen.getByTestId("mock-icon");
    expect(icon).toBeInTheDocument();
  });

  it("renders multiple stats cards with different statuses", () => {
    const { rerender } = render(
      <StatsCard
        title="Success"
        value={100}
        description="All good"
        icon={MockIcon}
        status="success"
      />
    );

    expect(screen.getByTestId("mock-icon")).toHaveClass("text-green-600");

    rerender(
      <StatsCard
        title="Warning"
        value={50}
        description="Needs attention"
        icon={MockIcon}
        status="warning"
      />
    );

    expect(screen.getByTestId("mock-icon")).toHaveClass("text-yellow-600");

    rerender(
      <StatsCard
        title="Error"
        value={0}
        description="Critical issue"
        icon={MockIcon}
        status="error"
      />
    );

    expect(screen.getByTestId("mock-icon")).toHaveClass("text-red-600");
  });
});
