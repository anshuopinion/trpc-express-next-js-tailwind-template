import { render, screen } from "@testing-library/react";
import { vi } from "vitest";
import type { HealthCheck } from "../../_types";
import { ServerStatusCard } from "../ServerStatusCard";
import { formatStatus, formatUptime, getStatusColor } from "../../_utils";

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

// Mock Lucide React icon
vi.mock("lucide-react", () => ({
  Server: ({ className }: any) => (
    <div data-testid="server-icon" className={className}>
      Server Icon
    </div>
  ),
}));

// Mock utility functions
vi.mock("../../_utils", () => ({
  formatStatus: vi.fn((status: string) => status.toLowerCase()),
  formatUptime: vi.fn((seconds: number) => {
    if (seconds < 60) return `${Math.floor(seconds)} seconds`;
    if (seconds < 3600) {
      const minutes = Math.floor(seconds / 60);
      return `${minutes} minute${minutes !== 1 ? "s" : ""}`;
    }
    if (seconds < 86400) {
      const hours = Math.floor(seconds / 3600);
      return `${hours} hour${hours !== 1 ? "s" : ""}`;
    }
    const days = Math.floor(seconds / 86400);
    return `${days} day${days !== 1 ? "s" : ""}`;
  }),
  getStatusColor: vi.fn((status: string) => {
    switch (status.toLowerCase()) {
      case "healthy":
      case "active":
      case "online":
        return "success";
      case "warning":
      case "pending":
        return "warning";
      case "error":
      case "offline":
      case "failed":
        return "error";
      default:
        return "success";
    }
  }),
}));

const mockHealthyHealthCheck: HealthCheck = {
  status: "healthy",
  timestamp: "2023-01-01T00:00:00Z",
  uptime: 7200, // 2 hours
};

const mockUnhealthyHealthCheck: HealthCheck = {
  status: "error",
  timestamp: "2023-01-01T00:00:00Z",
  uptime: 300, // 5 minutes
};

describe("ServerStatusCard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders card structure correctly", () => {
    render(<ServerStatusCard healthCheck={mockHealthyHealthCheck} />);

    expect(screen.getByTestId("card")).toBeInTheDocument();
    expect(screen.getByTestId("card-header")).toBeInTheDocument();
    expect(screen.getByTestId("card-content")).toBeInTheDocument();
  });

  it("renders title and icon correctly", () => {
    render(<ServerStatusCard healthCheck={mockHealthyHealthCheck} />);

    expect(screen.getByTestId("card-title")).toHaveTextContent("Server Status");
    expect(screen.getByTestId("server-icon")).toBeInTheDocument();
  });

  it("applies correct CSS classes to header", () => {
    render(<ServerStatusCard healthCheck={mockHealthyHealthCheck} />);

    const cardHeader = screen.getByTestId("card-header");
    expect(cardHeader).toHaveClass(
      "flex",
      "flex-row",
      "items-center",
      "justify-between",
      "space-y-0",
      "pb-2",
    );
  });

  it("applies correct CSS classes to title", () => {
    render(<ServerStatusCard healthCheck={mockHealthyHealthCheck} />);

    const title = screen.getByTestId("card-title");
    expect(title).toHaveClass("text-sm", "font-medium");
  });

  it("applies correct CSS classes to server icon", () => {
    render(<ServerStatusCard healthCheck={mockHealthyHealthCheck} />);

    const icon = screen.getByTestId("server-icon");
    expect(icon).toHaveClass("h-4", "w-4", "text-muted-foreground");
  });

  it("displays formatted status correctly for healthy server", () => {
    render(<ServerStatusCard healthCheck={mockHealthyHealthCheck} />);

    const status = screen.getByText("healthy");
    expect(status).toBeInTheDocument();
    expect(status).toHaveClass("text-2xl", "font-bold");
  });

  it("displays formatted status correctly for error server", () => {
    render(<ServerStatusCard healthCheck={mockUnhealthyHealthCheck} />);

    const status = screen.getByText("error");
    expect(status).toBeInTheDocument();
    expect(status).toHaveClass("text-2xl", "font-bold");
  });

  it("displays uptime with correct formatting", () => {
    render(<ServerStatusCard healthCheck={mockHealthyHealthCheck} />);

    expect(screen.getByText(/Uptime: 2 hours/)).toBeInTheDocument();
    expect(screen.getByText(/Uptime: 2 hours/)).toHaveClass(
      "text-xs",
      "text-muted-foreground",
    );
  });

  it("displays different uptime formats correctly", () => {
    const shortUptimeHealthCheck = { ...mockHealthyHealthCheck, uptime: 45 };
    render(<ServerStatusCard healthCheck={shortUptimeHealthCheck} />);

    expect(screen.getByText(/Uptime: 45 seconds/)).toBeInTheDocument();
  });

  it("displays minute format for uptime correctly", () => {
    const minuteUptimeHealthCheck = { ...mockHealthyHealthCheck, uptime: 300 };
    render(<ServerStatusCard healthCheck={minuteUptimeHealthCheck} />);

    expect(screen.getByText(/Uptime: 5 minutes/)).toBeInTheDocument();
  });

  it("displays day format for uptime correctly", () => {
    const dayUptimeHealthCheck = { ...mockHealthyHealthCheck, uptime: 172800 }; // 2 days
    render(<ServerStatusCard healthCheck={dayUptimeHealthCheck} />);

    expect(screen.getByText(/Uptime: 2 days/)).toBeInTheDocument();
  });

  it("renders status indicator with green color for healthy server", () => {
    render(<ServerStatusCard healthCheck={mockHealthyHealthCheck} />);

    const statusIndicator = document.querySelector(".bg-green-500");
    expect(statusIndicator).toBeInTheDocument();
    expect(statusIndicator).toHaveClass("w-2", "h-2", "rounded-full", "mr-2");
  });

  it("renders status indicator with red color for error server", () => {
    render(<ServerStatusCard healthCheck={mockUnhealthyHealthCheck} />);

    const statusIndicator = document.querySelector(".bg-red-500");
    expect(statusIndicator).toBeInTheDocument();
    expect(statusIndicator).toHaveClass("w-2", "h-2", "rounded-full", "mr-2");
  });

  it("renders status indicator with yellow color for warning server", () => {
    const warningHealthCheck = { ...mockHealthyHealthCheck, status: "warning" };
    render(<ServerStatusCard healthCheck={warningHealthCheck} />);

    const statusIndicator = document.querySelector(".bg-yellow-500");
    expect(statusIndicator).toBeInTheDocument();
  });

  it("displays correct status message for healthy server", () => {
    render(<ServerStatusCard healthCheck={mockHealthyHealthCheck} />);

    expect(screen.getByText("All systems operational")).toBeInTheDocument();
    expect(screen.getByText("All systems operational")).toHaveClass(
      "text-sm",
      "text-muted-foreground",
    );
  });

  it("displays correct status message for unhealthy server", () => {
    render(<ServerStatusCard healthCheck={mockUnhealthyHealthCheck} />);

    expect(screen.getByText("System issues detected")).toBeInTheDocument();
    expect(screen.getByText("System issues detected")).toHaveClass(
      "text-sm",
      "text-muted-foreground",
    );
  });

  it("handles null healthCheck gracefully", () => {
    render(<ServerStatusCard healthCheck={null} />);

    expect(screen.getByText("unknown")).toBeInTheDocument(); // formatStatus("Unknown") returns "unknown"
    expect(screen.getByText(/Uptime: N\/A/)).toBeInTheDocument();
    expect(screen.getByText("All systems operational")).toBeInTheDocument(); // Default to success for unknown
  });

  it("handles healthCheck with missing uptime", () => {
    const noUptimeHealthCheck = {
      status: "healthy",
      timestamp: "2023-01-01T00:00:00Z",
    } as HealthCheck;

    render(<ServerStatusCard healthCheck={noUptimeHealthCheck} />);

    expect(screen.getByText(/Uptime: N\/A/)).toBeInTheDocument();
  });

  it("handles healthCheck with missing status", () => {
    const noStatusHealthCheck = {
      timestamp: "2023-01-01T00:00:00Z",
      uptime: 3600,
    } as HealthCheck;

    render(<ServerStatusCard healthCheck={noStatusHealthCheck} />);

    expect(screen.getByText("unknown")).toBeInTheDocument();
  });

  it("applies correct CSS classes to status indicator container", () => {
    render(<ServerStatusCard healthCheck={mockHealthyHealthCheck} />);

    const indicatorContainer = screen
      .getByText("All systems operational")
      .closest(".flex");
    expect(indicatorContainer).toHaveClass("flex", "items-center");
  });

  it("applies correct CSS classes to main status display", () => {
    render(<ServerStatusCard healthCheck={mockHealthyHealthCheck} />);

    // Find the div with mt-4 class (the status indicator container)
    const statusIndicatorContainer = screen.getByText("All systems operational")
      .parentElement?.parentElement;
    expect(statusIndicatorContainer).toHaveClass("mt-4");
  });

  it("renders semantic HTML structure", () => {
    render(<ServerStatusCard healthCheck={mockHealthyHealthCheck} />);

    const title = screen.getByTestId("card-title");
    expect(title.tagName.toLowerCase()).toBe("h3");
  });

  it("handles edge case with zero uptime", () => {
    const zeroUptimeHealthCheck = { ...mockHealthyHealthCheck, uptime: 0 };
    render(<ServerStatusCard healthCheck={zeroUptimeHealthCheck} />);

    // When uptime is 0 (falsy), the component shows "N/A" instead of calling formatUptime
    expect(screen.getByText(/Uptime: N\/A/)).toBeInTheDocument();
  });

  it("handles edge case with very large uptime", () => {
    const largeUptimeHealthCheck = {
      ...mockHealthyHealthCheck,
      uptime: 604800,
    }; // 7 days
    render(<ServerStatusCard healthCheck={largeUptimeHealthCheck} />);

    expect(screen.getByText(/Uptime: 7 days/)).toBeInTheDocument();
  });

  it("calls utility functions with correct parameters", () => {
    const mockFormatStatus = vi.mocked(formatStatus);
    const mockFormatUptime = vi.mocked(formatUptime);
    const mockGetStatusColor = vi.mocked(getStatusColor);

    render(<ServerStatusCard healthCheck={mockHealthyHealthCheck} />);

    expect(mockFormatStatus).toHaveBeenCalledWith("healthy");
    expect(mockFormatUptime).toHaveBeenCalledWith(7200);
    expect(mockGetStatusColor).toHaveBeenCalledWith("healthy");
  });

  it("calls utility functions with fallback values for null healthCheck", () => {
    const mockFormatStatus = vi.mocked(formatStatus);
    const mockGetStatusColor = vi.mocked(getStatusColor);

    render(<ServerStatusCard healthCheck={null} />);

    expect(mockFormatStatus).toHaveBeenCalledWith("Unknown");
    expect(mockGetStatusColor).toHaveBeenCalledWith("unknown");
  });

  it("maintains consistent layout structure", () => {
    render(<ServerStatusCard healthCheck={mockHealthyHealthCheck} />);

    const cardContent = screen.getByTestId("card-content");
    const children = Array.from(cardContent.children);

    // Should have status display, uptime, and status indicator container
    expect(children).toHaveLength(3);
    expect(children[0]).toHaveTextContent("healthy"); // Status
    expect(children[1]).toHaveTextContent("Uptime: 2 hours"); // Uptime
    expect(children[2]).toHaveClass("mt-4"); // Status indicator container
  });

  it("handles different status values correctly", () => {
    const customStatusHealthCheck = {
      ...mockHealthyHealthCheck,
      status: "maintenance",
    };
    render(<ServerStatusCard healthCheck={customStatusHealthCheck} />);

    expect(screen.getByText("maintenance")).toBeInTheDocument();
    expect(screen.getByText("All systems operational")).toBeInTheDocument(); // Default success behavior
  });

  it("applies consistent spacing and layout classes", () => {
    render(<ServerStatusCard healthCheck={mockHealthyHealthCheck} />);

    // Check uptime paragraph styling
    const uptimeText = screen.getByText(/Uptime: 2 hours/);
    expect(uptimeText).toHaveClass("text-xs", "text-muted-foreground");

    // Check status indicator container
    const statusContainer = document.querySelector(".mt-4");
    expect(statusContainer).toBeInTheDocument();
  });

  it("handles special characters in status gracefully", () => {
    const specialStatusHealthCheck = {
      ...mockHealthyHealthCheck,
      status: "healthy-v2.0",
    };
    render(<ServerStatusCard healthCheck={specialStatusHealthCheck} />);

    expect(screen.getByText("healthy-v2.0")).toBeInTheDocument();
  });

  it("renders status indicator dot with proper positioning", () => {
    render(<ServerStatusCard healthCheck={mockHealthyHealthCheck} />);

    const statusDot = document.querySelector(".w-2.h-2.bg-green-500");
    expect(statusDot).toBeInTheDocument();
    expect(statusDot).toHaveClass("rounded-full", "mr-2");

    // Check that it's properly aligned with text
    const container = statusDot?.parentElement;
    expect(container).toHaveClass("flex", "items-center");
  });

  it("displays proper text hierarchy with correct font weights", () => {
    render(<ServerStatusCard healthCheck={mockHealthyHealthCheck} />);

    const status = screen.getByText("healthy");
    expect(status).toHaveClass("text-2xl", "font-bold");

    const uptime = screen.getByText(/Uptime: 2 hours/);
    expect(uptime).toHaveClass("text-xs");

    const statusMessage = screen.getByText("All systems operational");
    expect(statusMessage).toHaveClass("text-sm");
  });
});
