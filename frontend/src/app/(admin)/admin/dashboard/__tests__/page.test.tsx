import { render, screen } from "@testing-library/react";
import { vi } from "vitest";
import AdminDashboardPage from "../page";

// Mock server auth function
const mockServerAdminData = {
  systemStats: {
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
  },
  healthCheck: {
    status: "healthy",
    uptime: 3600,
    timestamp: "2023-01-01T00:00:00Z",
  },
  appInfo: {
    name: "tRPC Template",
    version: "1.0.0",
    description: "Modern tRPC template",
  },
  errors: {
    stats: null,
    health: null,
    app: null,
  },
};

vi.mock("@/lib/server-auth", () => ({
  getServerAdminData: vi.fn(() => Promise.resolve(mockServerAdminData)),
}));

// Mock AdminDashboard component
vi.mock("../_components/AdminDashboard", () => ({
  AdminDashboard: ({
    initialSystemStats,
    initialHealthCheck,
    initialAppInfo,
    serverErrors,
  }: any) => (
    <div data-testid="admin-dashboard">
      <div data-testid="system-stats">
        Total Users: {initialSystemStats?.totalUsers || "N/A"}
      </div>
      <div data-testid="health-check">
        Status: {initialHealthCheck?.status || "N/A"}
      </div>
      <div data-testid="app-info">App: {initialAppInfo?.name || "N/A"}</div>
      <div data-testid="server-errors">
        Errors: {JSON.stringify(serverErrors)}
      </div>
    </div>
  ),
}));

describe("AdminDashboardPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders admin dashboard title and description", async () => {
    render(await AdminDashboardPage());

    expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent(
      "Admin Dashboard",
    );
    expect(
      screen.getByText("System overview and management controls"),
    ).toBeInTheDocument();
  });

  it("applies correct CSS classes to main container", async () => {
    render(await AdminDashboardPage());

    // Get the outer main container, not the immediate parent of heading
    const mainContainer = screen
      .getByRole("heading", { level: 2 })
      .closest("div")?.parentElement;
    expect(mainContainer).toHaveClass(
      "flex",
      "flex-1",
      "flex-col",
      "gap-4",
      "p-4",
    );
  });

  it("applies correct CSS classes to title section", async () => {
    render(await AdminDashboardPage());

    const titleSection = screen.getByRole("heading", {
      level: 2,
    }).parentElement;
    expect(titleSection).toHaveClass("mb-6");
  });

  it("applies correct CSS classes to title", async () => {
    render(await AdminDashboardPage());

    const title = screen.getByRole("heading", { level: 2 });
    expect(title).toHaveClass("text-3xl", "font-bold", "text-foreground");
  });

  it("applies correct CSS classes to description", async () => {
    render(await AdminDashboardPage());

    const description = screen.getByText(
      "System overview and management controls",
    );
    expect(description).toHaveClass("text-muted-foreground", "mt-1");
  });

  it("renders AdminDashboard component with correct props", async () => {
    render(await AdminDashboardPage());

    const adminDashboard = screen.getByTestId("admin-dashboard");
    expect(adminDashboard).toBeInTheDocument();

    expect(screen.getByTestId("system-stats")).toHaveTextContent(
      "Total Users: 150",
    );
    expect(screen.getByTestId("health-check")).toHaveTextContent(
      "Status: healthy",
    );
    expect(screen.getByTestId("app-info")).toHaveTextContent(
      "App: tRPC Template",
    );
  });

  it("passes server errors correctly to AdminDashboard", async () => {
    render(await AdminDashboardPage());

    const serverErrorsElement = screen.getByTestId("server-errors");
    expect(serverErrorsElement).toHaveTextContent(
      '"stats":null,"health":null,"app":null',
    );
  });

  it("handles server data fetching correctly", async () => {
    const { getServerAdminData } = await import("@/lib/server-auth");

    render(await AdminDashboardPage());

    expect(getServerAdminData).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId("admin-dashboard")).toBeInTheDocument();
  });

  it("passes all required props to AdminDashboard", async () => {
    render(await AdminDashboardPage());

    // Verify all data is passed through correctly
    expect(screen.getByTestId("system-stats")).toBeInTheDocument();
    expect(screen.getByTestId("health-check")).toBeInTheDocument();
    expect(screen.getByTestId("app-info")).toBeInTheDocument();
    expect(screen.getByTestId("server-errors")).toBeInTheDocument();
  });

  it("handles server error responses", async () => {
    const errorResponse = {
      ...mockServerAdminData,
      errors: {
        stats: "Failed to fetch stats",
        health: null,
        app: null,
      },
    };

    const { getServerAdminData } = await import("@/lib/server-auth");
    vi.mocked(getServerAdminData).mockResolvedValueOnce(errorResponse);

    render(await AdminDashboardPage());

    const serverErrorsElement = screen.getByTestId("server-errors");
    expect(serverErrorsElement).toHaveTextContent("Failed to fetch stats");
  });

  it("handles null server data gracefully", async () => {
    const nullDataResponse = {
      systemStats: null,
      healthCheck: null,
      appInfo: null,
      errors: {
        stats: null,
        health: null,
        app: null,
      },
    };

    const { getServerAdminData } = await import("@/lib/server-auth");
    vi.mocked(getServerAdminData).mockResolvedValueOnce(nullDataResponse);

    render(await AdminDashboardPage());

    expect(screen.getByTestId("system-stats")).toHaveTextContent(
      "Total Users: N/A",
    );
    expect(screen.getByTestId("health-check")).toHaveTextContent("Status: N/A");
    expect(screen.getByTestId("app-info")).toHaveTextContent("App: N/A");
  });

  it("uses semantic HTML structure", async () => {
    render(await AdminDashboardPage());

    const heading = screen.getByRole("heading", { level: 2 });
    expect(heading).toHaveTextContent("Admin Dashboard");
    expect(heading.tagName.toLowerCase()).toBe("h2");
  });

  it("maintains consistent page structure", async () => {
    render(await AdminDashboardPage());

    // Get the main container (parent of the title section)
    const mainContainer = screen
      .getByRole("heading", { level: 2 })
      .closest("div")?.parentElement;
    const children = Array.from(mainContainer?.children || []);

    // Should have title section and AdminDashboard component
    expect(children).toHaveLength(2);
    expect(children[0]).toContainElement(
      screen.getByRole("heading", { level: 2 }),
    );
    expect(children[1]).toContainElement(screen.getByTestId("admin-dashboard"));
  });

  it("handles complex system stats data", async () => {
    const complexSystemStats = {
      ...mockServerAdminData.systemStats,
      totalUsers: 1000,
      adminUsers: 25,
      verifiedUsers: 800,
      recentUsers: Array.from({ length: 10 }, (_, i) => ({
        id: `${i}`,
        email: `user${i}@example.com`,
        first_name: `User${i}`,
        last_name: "Test",
        role: i % 5 === 0 ? ("ADMIN" as const) : ("USER" as const),
        is_email_verified: i % 2 === 0,
      })),
    };

    const { getServerAdminData } = await import("@/lib/server-auth");
    vi.mocked(getServerAdminData).mockResolvedValueOnce({
      ...mockServerAdminData,
      systemStats: complexSystemStats,
    });

    render(await AdminDashboardPage());

    expect(screen.getByTestId("system-stats")).toHaveTextContent(
      "Total Users: 1000",
    );
  });

  it("handles partial server errors", async () => {
    const partialErrorResponse = {
      ...mockServerAdminData,
      systemStats: null,
      errors: {
        stats: "Database connection failed",
        health: null,
        app: null,
      },
    };

    const { getServerAdminData } = await import("@/lib/server-auth");
    vi.mocked(getServerAdminData).mockResolvedValueOnce(partialErrorResponse);

    render(await AdminDashboardPage());

    const serverErrorsElement = screen.getByTestId("server-errors");
    expect(serverErrorsElement).toHaveTextContent("Database connection failed");
  });

  it("handles all server errors", async () => {
    const allErrorsResponse = {
      systemStats: null,
      healthCheck: null,
      appInfo: null,
      errors: {
        stats: "Stats service down",
        health: "Health check failed",
        app: "App service unavailable",
      },
    };

    const { getServerAdminData } = await import("@/lib/server-auth");
    vi.mocked(getServerAdminData).mockResolvedValueOnce(allErrorsResponse);

    render(await AdminDashboardPage());

    const serverErrorsElement = screen.getByTestId("server-errors");
    expect(serverErrorsElement).toHaveTextContent("Stats service down");
    expect(serverErrorsElement).toHaveTextContent("Health check failed");
    expect(serverErrorsElement).toHaveTextContent("App service unavailable");
  });

  it("renders with proper server-side rendering structure", async () => {
    render(await AdminDashboardPage());

    // Should render immediately without loading states since it's SSR
    expect(screen.getByTestId("admin-dashboard")).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 2 })).toBeInTheDocument();
  });

  it("maintains admin-specific styling and layout", async () => {
    render(await AdminDashboardPage());

    // Verify admin-specific container classes
    const container = screen.getByTestId("admin-dashboard").parentElement;
    expect(container).toHaveClass("flex", "flex-1", "flex-col", "gap-4", "p-4");
  });
});
