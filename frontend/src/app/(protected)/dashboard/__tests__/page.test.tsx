import { render, screen } from "@testing-library/react";
import { vi } from "vitest";
import DashboardPage from "../page";

// Mock all dependencies
const mockUser = {
  id: "1",
  first_name: "John",
  last_name: "Doe",
  email: "john@example.com",
  role: "USER",
  is_email_verified: true,
};

const mockDashboardData = {
  user: mockUser,
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
};

const mockUseAuth = vi.fn();
const mockUseDashboardData = vi.fn();

// Mock hooks
vi.mock("@/hooks/useAuth", () => ({
  useAuth: () => mockUseAuth(),
}));

vi.mock("../_hooks", () => ({
  useDashboardData: () => mockUseDashboardData(),
}));

// Mock components
vi.mock("../_components", () => ({
  WelcomeSection: ({ firstName }: any) => (
    <div data-testid="welcome-section">Welcome Section - {firstName}</div>
  ),
  UserProfileCard: ({ user }: any) => (
    <div data-testid="user-profile-card">
      User Profile - {user?.first_name} {user?.last_name}
    </div>
  ),
  ServerStatusCard: ({ healthCheck }: any) => (
    <div data-testid="server-status-card">Server Status - {healthCheck?.status}</div>
  ),
  AppInfoCard: ({ appInfo }: any) => (
    <div data-testid="app-info-card">App Info - {appInfo?.name}</div>
  ),
}));

describe("DashboardPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAuth.mockReturnValue({ user: mockUser });
    mockUseDashboardData.mockReturnValue({
      dashboardData: mockDashboardData,
      hasError: false,
    });
  });

  it("renders dashboard title and description", () => {
    render(<DashboardPage />);

    expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent("Dashboard");
    expect(screen.getByText(/Welcome back, John!/)).toBeInTheDocument();
    expect(screen.getByText(/Here's your tRPC template dashboard/)).toBeInTheDocument();
  });

  it("applies correct CSS classes to main container", () => {
    render(<DashboardPage />);

    const mainContainer = screen.getByTestId("user-profile-card").closest("div")
      ?.parentElement?.parentElement;
    expect(mainContainer).toHaveClass("flex", "flex-1", "flex-col", "gap-4");
  });

  it("applies correct CSS classes to title section", () => {
    render(<DashboardPage />);

    const titleSection = screen.getByRole("heading", {
      level: 2,
    }).parentElement;
    expect(titleSection).toHaveClass("mb-6");
  });

  it("applies correct CSS classes to title", () => {
    render(<DashboardPage />);

    const title = screen.getByRole("heading", { level: 2 });
    expect(title).toHaveClass("text-3xl", "font-bold", "text-foreground");
  });

  it("applies correct CSS classes to description", () => {
    render(<DashboardPage />);

    const description = screen.getByText(/Here's your tRPC template dashboard/);
    expect(description).toHaveClass("text-muted-foreground", "mt-1");
  });

  it("renders grid layout with correct classes", () => {
    render(<DashboardPage />);

    const gridContainer = screen.getByTestId("user-profile-card").parentElement;
    expect(gridContainer).toHaveClass(
      "grid",
      "grid-cols-1",
      "md:grid-cols-2",
      "lg:grid-cols-3",
      "gap-6",
      "mb-8"
    );
  });

  it("renders UserProfileCard with user data", () => {
    render(<DashboardPage />);

    const userProfileCard = screen.getByTestId("user-profile-card");
    expect(userProfileCard).toBeInTheDocument();
    expect(userProfileCard).toHaveTextContent("User Profile - John Doe");
  });

  it("renders ServerStatusCard with health check data", () => {
    render(<DashboardPage />);

    const serverStatusCard = screen.getByTestId("server-status-card");
    expect(serverStatusCard).toBeInTheDocument();
    expect(serverStatusCard).toHaveTextContent("Server Status - healthy");
  });

  it("renders AppInfoCard with app info data", () => {
    render(<DashboardPage />);

    const appInfoCard = screen.getByTestId("app-info-card");
    expect(appInfoCard).toBeInTheDocument();
    expect(appInfoCard).toHaveTextContent("App Info - tRPC Template");
  });

  it("renders WelcomeSection with user first name", () => {
    render(<DashboardPage />);

    const welcomeSection = screen.getByTestId("welcome-section");
    expect(welcomeSection).toBeInTheDocument();
    expect(welcomeSection).toHaveTextContent("Welcome Section - John");
  });

  it("handles user without first name gracefully", () => {
    mockUseAuth.mockReturnValue({
      user: { ...mockUser, first_name: undefined },
    });

    render(<DashboardPage />);

    expect(
      screen.getByText(/Welcome back,.*! Here's your tRPC template dashboard/)
    ).toBeInTheDocument();
    expect(screen.getByTestId("welcome-section")).toHaveTextContent("Welcome Section -");
  });

  it("handles null user gracefully", () => {
    mockUseAuth.mockReturnValue({ user: null });

    render(<DashboardPage />);

    expect(
      screen.getByText(/Welcome back,.*! Here's your tRPC template dashboard/)
    ).toBeInTheDocument();
    const welcomeSection = screen.getByTestId("welcome-section");
    expect(welcomeSection).toHaveTextContent("Welcome Section -");
  });

  it("displays error state when hasError is true", () => {
    mockUseDashboardData.mockReturnValue({
      dashboardData: mockDashboardData,
      hasError: true,
    });

    render(<DashboardPage />);

    expect(screen.getByText("Error loading dashboard")).toBeInTheDocument();
    expect(screen.getByText(/Failed to load dashboard data/)).toBeInTheDocument();
    expect(screen.getByText(/Please try refreshing the page/)).toBeInTheDocument();
  });

  it("applies correct CSS classes to error state", () => {
    mockUseDashboardData.mockReturnValue({
      dashboardData: mockDashboardData,
      hasError: true,
    });

    render(<DashboardPage />);

    const errorContainer = screen.getByText("Error loading dashboard").closest("div");
    expect(errorContainer?.parentElement).toHaveClass("flex", "flex-1", "flex-col", "gap-4");

    const errorContent = screen.getByText("Error loading dashboard").parentElement;
    expect(errorContent).toHaveClass("text-center", "py-8");

    const errorTitle = screen.getByText("Error loading dashboard");
    expect(errorTitle).toHaveClass("text-lg", "font-semibold", "text-destructive");

    const errorDescription = screen.getByText(/Failed to load dashboard data/);
    expect(errorDescription).toHaveClass("text-sm", "text-muted-foreground", "mt-1");
  });

  it("does not render dashboard components when in error state", () => {
    mockUseDashboardData.mockReturnValue({
      dashboardData: mockDashboardData,
      hasError: true,
    });

    render(<DashboardPage />);

    expect(screen.queryByTestId("user-profile-card")).not.toBeInTheDocument();
    expect(screen.queryByTestId("server-status-card")).not.toBeInTheDocument();
    expect(screen.queryByTestId("app-info-card")).not.toBeInTheDocument();
    expect(screen.queryByTestId("welcome-section")).not.toBeInTheDocument();
    expect(screen.queryByRole("heading", { level: 2 })).not.toBeInTheDocument();
  });

  it("passes correct props to UserProfileCard", () => {
    render(<DashboardPage />);

    // Component should receive the user from dashboardData, not from useAuth directly
    const userProfileCard = screen.getByTestId("user-profile-card");
    expect(userProfileCard).toHaveTextContent("John Doe");
  });

  it("passes correct props to ServerStatusCard", () => {
    render(<DashboardPage />);

    const serverStatusCard = screen.getByTestId("server-status-card");
    expect(serverStatusCard).toHaveTextContent("healthy");
  });

  it("passes correct props to AppInfoCard", () => {
    render(<DashboardPage />);

    const appInfoCard = screen.getByTestId("app-info-card");
    expect(appInfoCard).toHaveTextContent("tRPC Template");
  });

  it("integrates hooks correctly", () => {
    render(<DashboardPage />);

    expect(mockUseAuth).toHaveBeenCalled();
    expect(mockUseDashboardData).toHaveBeenCalled();
  });

  it("handles dashboard data loading states", () => {
    mockUseDashboardData.mockReturnValue({
      dashboardData: {
        user: null,
        healthCheck: null,
        appInfo: null,
      },
      hasError: false,
    });

    render(<DashboardPage />);

    // Should still render components even with null data
    expect(screen.getByTestId("user-profile-card")).toBeInTheDocument();
    expect(screen.getByTestId("server-status-card")).toBeInTheDocument();
    expect(screen.getByTestId("app-info-card")).toBeInTheDocument();
  });

  it("maintains responsive design classes", () => {
    render(<DashboardPage />);

    const gridContainer = screen.getByTestId("user-profile-card").parentElement;
    expect(gridContainer).toHaveClass("grid-cols-1", "md:grid-cols-2", "lg:grid-cols-3");
  });

  it("renders all dashboard sections in correct order", () => {
    render(<DashboardPage />);

    const mainContainer = screen.getByTestId("user-profile-card").closest("div")
      ?.parentElement?.parentElement;
    const children = Array.from(mainContainer?.children || []);

    // Should have title section, grid section, and welcome section
    expect(children).toHaveLength(3);
    expect(children[0]).toContainElement(screen.getByRole("heading", { level: 2 }));
    expect(children[1]).toContainElement(screen.getByTestId("user-profile-card"));
    expect(children[2]).toContainElement(screen.getByTestId("welcome-section"));
  });

  it("uses semantic HTML structure", () => {
    render(<DashboardPage />);

    const heading = screen.getByRole("heading", { level: 2 });
    expect(heading).toHaveTextContent("Dashboard");
  });
});
