import { render, screen } from "@testing-library/react";
import { vi } from "vitest";
import { AdminDashboard } from "../AdminDashboard";

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
  CardDescription: ({ children, ...props }: any) => (
    <p data-testid="card-description" {...props}>
      {children}
    </p>
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

// Mock lucide-react icons
vi.mock("lucide-react", () => ({
  Activity: ({ className }: any) => (
    <div data-testid="activity-icon" className={className}>
      Activity Icon
    </div>
  ),
  Server: ({ className }: any) => (
    <div data-testid="server-icon" className={className}>
      Server Icon
    </div>
  ),
}));

// Mock SystemOverview component
vi.mock("../SystemOverview", () => ({
  SystemOverview: ({ systemStats }: any) => (
    <div data-testid="system-overview">
      System Overview - Users: {systemStats?.totalUsers || 0}
    </div>
  ),
}));

const mockSystemStats = {
  totalUsers: 150,
  adminUsers: 5,
  regularUsers: 145,
  verifiedUsers: 120,
  unverifiedUsers: 30,
  recentUsers: [
    {
      id: "1",
      email: "john@example.com",
      first_name: "John",
      last_name: "Doe",
      role: "USER" as const,
      is_email_verified: true,
    },
  ],
  systemHealth: {
    status: "healthy",
    uptime: 3600,
    timestamp: "2023-01-01T00:00:00Z",
  },
};

const mockHealthCheck = {
  status: "healthy",
  uptime: 7200,
  timestamp: "2023-01-01T00:00:00Z",
};

const mockAppInfo = {
  name: "tRPC Template",
  version: "1.2.0",
  description: "Modern tRPC template with role-based authentication",
};

const mockServerErrors = {
  stats: null,
  health: null,
  app: null,
};

describe("AdminDashboard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders SystemOverview with system stats", () => {
    render(
      <AdminDashboard
        initialSystemStats={mockSystemStats}
        initialHealthCheck={mockHealthCheck}
        initialAppInfo={mockAppInfo}
        serverErrors={mockServerErrors}
      />,
    );

    const systemOverview = screen.getByTestId("system-overview");
    expect(systemOverview).toBeInTheDocument();
    expect(systemOverview).toHaveTextContent("System Overview - Users: 150");
  });

  it("renders server health card with correct structure", () => {
    render(
      <AdminDashboard
        initialSystemStats={mockSystemStats}
        initialHealthCheck={mockHealthCheck}
        initialAppInfo={mockAppInfo}
        serverErrors={mockServerErrors}
      />,
    );

    const healthCard = screen
      .getByText("Server Health")
      .closest("[data-testid='card']");
    expect(healthCard).toBeInTheDocument();

    expect(screen.getByText("Server Health")).toBeInTheDocument();
    expect(screen.getByText("System status and uptime")).toBeInTheDocument();
    expect(screen.getByTestId("server-icon")).toBeInTheDocument();
  });

  it("renders application info card with correct structure", () => {
    render(
      <AdminDashboard
        initialSystemStats={mockSystemStats}
        initialHealthCheck={mockHealthCheck}
        initialAppInfo={mockAppInfo}
        serverErrors={mockServerErrors}
      />,
    );

    const appInfoCard = screen
      .getByText("Application Info")
      .closest("[data-testid='card']");
    expect(appInfoCard).toBeInTheDocument();

    expect(screen.getByText("Application Info")).toBeInTheDocument();
    expect(screen.getByText("Version and details")).toBeInTheDocument();
    expect(screen.getByTestId("activity-icon")).toBeInTheDocument();
  });

  it("displays server health status with correct styling for healthy status", () => {
    render(
      <AdminDashboard
        initialSystemStats={mockSystemStats}
        initialHealthCheck={mockHealthCheck}
        initialAppInfo={mockAppInfo}
        serverErrors={mockServerErrors}
      />,
    );

    const healthyStatus = screen.getByText("healthy");
    expect(healthyStatus).toHaveClass("bg-green-100", "text-green-800");
  });

  it("displays server health status with correct styling for unhealthy status", () => {
    const unhealthyHealthCheck = { ...mockHealthCheck, status: "error" };

    render(
      <AdminDashboard
        initialSystemStats={mockSystemStats}
        initialHealthCheck={unhealthyHealthCheck}
        initialAppInfo={mockAppInfo}
        serverErrors={mockServerErrors}
      />,
    );

    const unhealthyStatus = screen.getByText("error");
    expect(unhealthyStatus).toHaveClass("bg-red-100", "text-red-800");
  });

  it("displays server uptime in minutes", () => {
    render(
      <AdminDashboard
        initialSystemStats={mockSystemStats}
        initialHealthCheck={mockHealthCheck}
        initialAppInfo={mockAppInfo}
        serverErrors={mockServerErrors}
      />,
    );

    expect(screen.getByText("120 minutes")).toBeInTheDocument(); // 7200 seconds = 120 minutes
  });

  it("displays application info correctly", () => {
    render(
      <AdminDashboard
        initialSystemStats={mockSystemStats}
        initialHealthCheck={mockHealthCheck}
        initialAppInfo={mockAppInfo}
        serverErrors={mockServerErrors}
      />,
    );

    expect(screen.getByText("tRPC Template")).toBeInTheDocument();
    expect(screen.getByText("1.2.0")).toBeInTheDocument();
    expect(
      screen.getByText("Modern tRPC template with role-based authentication"),
    ).toBeInTheDocument();
  });

  it("handles null health check data", () => {
    render(
      <AdminDashboard
        initialSystemStats={mockSystemStats}
        initialHealthCheck={null}
        initialAppInfo={mockAppInfo}
        serverErrors={mockServerErrors}
      />,
    );

    expect(screen.getByText("Unknown")).toBeInTheDocument();
    expect(screen.getByText("N/A")).toBeInTheDocument();
  });

  it("handles null app info data with fallbacks", () => {
    render(
      <AdminDashboard
        initialSystemStats={mockSystemStats}
        initialHealthCheck={mockHealthCheck}
        initialAppInfo={null}
        serverErrors={mockServerErrors}
      />,
    );

    expect(screen.getByText("tRPC Template")).toBeInTheDocument(); // fallback
    expect(screen.getByText("1.0.0")).toBeInTheDocument(); // fallback
    expect(
      screen.getByText("Modern tRPC template with role-based authentication"),
    ).toBeInTheDocument(); // fallback
  });

  it("displays error state when server errors exist", () => {
    const errorServerErrors = {
      stats: "Database connection failed",
      health: null,
      app: null,
    };

    render(
      <AdminDashboard
        initialSystemStats={mockSystemStats}
        initialHealthCheck={mockHealthCheck}
        initialAppInfo={mockAppInfo}
        serverErrors={errorServerErrors}
      />,
    );

    expect(
      screen.getByText("Error loading admin dashboard"),
    ).toBeInTheDocument();
    expect(screen.getByText("Database connection failed")).toBeInTheDocument();
  });

  it("displays multiple error messages in priority order", () => {
    const multipleErrorServerErrors = {
      stats: "Stats service down",
      health: "Health check failed",
      app: "App service unavailable",
    };

    render(
      <AdminDashboard
        initialSystemStats={mockSystemStats}
        initialHealthCheck={mockHealthCheck}
        initialAppInfo={mockAppInfo}
        serverErrors={multipleErrorServerErrors}
      />,
    );

    expect(
      screen.getByText("Error loading admin dashboard"),
    ).toBeInTheDocument();
    expect(screen.getByText("Stats service down")).toBeInTheDocument(); // First error should be displayed
  });

  it("does not render dashboard components when errors exist", () => {
    const errorServerErrors = {
      stats: "Database error",
      health: null,
      app: null,
    };

    render(
      <AdminDashboard
        initialSystemStats={mockSystemStats}
        initialHealthCheck={mockHealthCheck}
        initialAppInfo={mockAppInfo}
        serverErrors={errorServerErrors}
      />,
    );

    expect(screen.queryByTestId("system-overview")).not.toBeInTheDocument();
    expect(screen.queryByText("Server Health")).not.toBeInTheDocument();
    expect(screen.queryByText("Application Info")).not.toBeInTheDocument();
  });

  it("applies correct CSS classes to grid layout", () => {
    render(
      <AdminDashboard
        initialSystemStats={mockSystemStats}
        initialHealthCheck={mockHealthCheck}
        initialAppInfo={mockAppInfo}
        serverErrors={mockServerErrors}
      />,
    );

    const gridContainer = screen
      .getByText("Server Health")
      .closest("[data-testid='card']")?.parentElement;
    expect(gridContainer).toHaveClass(
      "grid",
      "grid-cols-1",
      "lg:grid-cols-2",
      "gap-6",
      "mt-6",
    );
  });

  it("applies correct CSS classes to card headers", () => {
    render(
      <AdminDashboard
        initialSystemStats={mockSystemStats}
        initialHealthCheck={mockHealthCheck}
        initialAppInfo={mockAppInfo}
        serverErrors={mockServerErrors}
      />,
    );

    const cardHeaders = screen.getAllByTestId("card-header");
    cardHeaders.forEach((header) => {
      expect(header).toHaveClass(
        "flex",
        "flex-row",
        "items-center",
        "justify-between",
        "space-y-0",
        "pb-2",
      );
    });
  });

  it("applies correct CSS classes to card titles", () => {
    render(
      <AdminDashboard
        initialSystemStats={mockSystemStats}
        initialHealthCheck={mockHealthCheck}
        initialAppInfo={mockAppInfo}
        serverErrors={mockServerErrors}
      />,
    );

    const serverHealthTitle = screen.getByText("Server Health");
    const appInfoTitle = screen.getByText("Application Info");

    expect(serverHealthTitle).toHaveClass("text-lg");
    expect(appInfoTitle).toHaveClass("text-lg");
  });

  it("applies correct CSS classes to icons", () => {
    render(
      <AdminDashboard
        initialSystemStats={mockSystemStats}
        initialHealthCheck={mockHealthCheck}
        initialAppInfo={mockAppInfo}
        serverErrors={mockServerErrors}
      />,
    );

    const serverIcon = screen.getByTestId("server-icon");
    const activityIcon = screen.getByTestId("activity-icon");

    expect(serverIcon).toHaveClass("h-5", "w-5", "text-muted-foreground");
    expect(activityIcon).toHaveClass("h-5", "w-5", "text-muted-foreground");
  });

  it("handles health error display in health card", () => {
    const healthErrorServerErrors = {
      stats: null,
      health: "Connection timeout",
      app: null,
    };

    render(
      <AdminDashboard
        initialSystemStats={mockSystemStats}
        initialHealthCheck={mockHealthCheck}
        initialAppInfo={mockAppInfo}
        serverErrors={healthErrorServerErrors}
      />,
    );

    expect(screen.getByText("Connection timeout")).toBeInTheDocument();
    expect(screen.getByText("Connection timeout")).toHaveClass(
      "text-sm",
      "text-muted-foreground",
      "mt-1",
    );
  });

  it("renders status badges with correct styling", () => {
    render(
      <AdminDashboard
        initialSystemStats={mockSystemStats}
        initialHealthCheck={mockHealthCheck}
        initialAppInfo={mockAppInfo}
        serverErrors={mockServerErrors}
      />,
    );

    const statusBadge = screen.getByText("healthy");
    expect(statusBadge).toHaveClass(
      "px-2",
      "py-1",
      "rounded-full",
      "text-xs",
      "font-medium",
    );
  });

  it("maintains consistent spacing in card content", () => {
    render(
      <AdminDashboard
        initialSystemStats={mockSystemStats}
        initialHealthCheck={mockHealthCheck}
        initialAppInfo={mockAppInfo}
        serverErrors={mockServerErrors}
      />,
    );

    const cardContents = screen.getAllByTestId("card-content");
    cardContents.forEach((content) => {
      // Should have space-y-2 class for consistent spacing
      const spaceElement = content.querySelector(".space-y-2");
      expect(spaceElement).toBeInTheDocument();
    });
  });

  it("handles very long uptime values", () => {
    const longUptimeHealthCheck = { ...mockHealthCheck, uptime: 86400 }; // 24 hours

    render(
      <AdminDashboard
        initialSystemStats={mockSystemStats}
        initialHealthCheck={longUptimeHealthCheck}
        initialAppInfo={mockAppInfo}
        serverErrors={mockServerErrors}
      />,
    );

    expect(screen.getByText("1440 minutes")).toBeInTheDocument(); // 86400 seconds = 1440 minutes
  });

  it("renders proper semantic structure", () => {
    render(
      <AdminDashboard
        initialSystemStats={mockSystemStats}
        initialHealthCheck={mockHealthCheck}
        initialAppInfo={mockAppInfo}
        serverErrors={mockServerErrors}
      />,
    );

    const titles = screen.getAllByTestId("card-title");
    titles.forEach((title) => {
      expect(title.tagName.toLowerCase()).toBe("h3");
    });

    const descriptions = screen.getAllByTestId("card-description");
    descriptions.forEach((description) => {
      expect(description.tagName.toLowerCase()).toBe("p");
    });
  });
});
