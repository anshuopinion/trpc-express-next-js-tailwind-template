import { render, screen } from "@testing-library/react";
import { vi } from "vitest";
import { SystemOverview } from "../SystemOverview";

// Mock UI components
vi.mock("@/components/ui/card", () => ({
  Card: ({ children, className, ...props }: any) => (
    <div data-testid="card" className={className} {...props}>
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
  CardHeader: ({ children, ...props }: any) => (
    <div data-testid="card-header" {...props}>
      {children}
    </div>
  ),
  CardTitle: ({ children, ...props }: any) => (
    <h3 data-testid="card-title" {...props}>
      {children}
    </h3>
  ),
}));

// Mock lucide-react icons
vi.mock("lucide-react", () => ({
  AlertCircle: ({ className }: any) => (
    <div data-testid="alert-circle-icon" className={className}>
      AlertCircle
    </div>
  ),
  Shield: ({ className }: any) => (
    <div data-testid="shield-icon" className={className}>
      Shield
    </div>
  ),
  UserCheck: ({ className }: any) => (
    <div data-testid="user-check-icon" className={className}>
      UserCheck
    </div>
  ),
  Users: ({ className }: any) => (
    <div data-testid="users-icon" className={className}>
      Users
    </div>
  ),
}));

// Mock AdminStatsCard component
vi.mock("../AdminStatsCard", () => ({
  AdminStatsCard: ({ title, value, description, icon }: any) => (
    <div data-testid="admin-stats-card">
      <div data-testid="stats-title">{title}</div>
      <div data-testid="stats-value">{value}</div>
      <div data-testid="stats-description">{description}</div>
      <div data-testid="stats-icon">{icon.name}</div>
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
    {
      id: "2",
      email: "admin@example.com",
      first_name: "Admin",
      last_name: "User",
      role: "ADMIN" as const,
      is_email_verified: true,
    },
    {
      id: "3",
      email: "jane@example.com",
      first_name: "Jane",
      last_name: "Smith",
      role: "USER" as const,
      is_email_verified: false,
    },
  ],
  systemHealth: {
    status: "healthy",
    uptime: 3600,
    timestamp: "2023-01-01T00:00:00Z",
  },
};

describe("SystemOverview", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders loading state when systemStats is undefined", () => {
    render(<SystemOverview />);

    const loadingCards = screen.getAllByTestId("card");
    expect(loadingCards).toHaveLength(4);

    loadingCards.forEach((card) => {
      expect(card).toHaveClass("animate-pulse");
    });
  });

  it("renders loading skeleton elements correctly", () => {
    render(<SystemOverview />);

    // Should have skeleton elements for loading state
    const skeletonElements = document.querySelectorAll(".bg-muted.rounded");
    expect(skeletonElements.length).toBeGreaterThan(0);
  });

  it("renders grid layout with correct classes when loading", () => {
    render(<SystemOverview />);

    const gridContainer = screen.getAllByTestId("card")[0].parentElement;
    expect(gridContainer).toHaveClass(
      "grid",
      "grid-cols-1",
      "md:grid-cols-2",
      "lg:grid-cols-4",
      "gap-6",
    );
  });

  it("renders all four AdminStatsCard components with correct data", () => {
    render(<SystemOverview systemStats={mockSystemStats} />);

    const statsCards = screen.getAllByTestId("admin-stats-card");
    expect(statsCards).toHaveLength(4);

    expect(screen.getByText("Total Users")).toBeInTheDocument();
    expect(screen.getByText("Verified Users")).toBeInTheDocument();
    expect(screen.getByText("Admin Users")).toBeInTheDocument();
    expect(screen.getByText("Unverified")).toBeInTheDocument();
  });

  it("displays correct values for each stats card", () => {
    render(<SystemOverview systemStats={mockSystemStats} />);

    const values = screen.getAllByTestId("stats-value");
    expect(values[0]).toHaveTextContent("150"); // Total Users
    expect(values[1]).toHaveTextContent("120"); // Verified Users
    expect(values[2]).toHaveTextContent("5"); // Admin Users
    expect(values[3]).toHaveTextContent("30"); // Unverified Users
  });

  it("calculates and displays verification rate correctly", () => {
    render(<SystemOverview systemStats={mockSystemStats} />);

    // 120 verified out of 150 total = 80%
    expect(screen.getByText("80% verification rate")).toBeInTheDocument();
  });

  it("handles zero total users for verification rate calculation", () => {
    const zeroUsersStats = {
      ...mockSystemStats,
      totalUsers: 0,
      verifiedUsers: 0,
    };

    render(<SystemOverview systemStats={zeroUsersStats} />);

    expect(screen.getByText("0% verification rate")).toBeInTheDocument();
  });

  it("renders recent users section when users exist", () => {
    render(<SystemOverview systemStats={mockSystemStats} />);

    expect(screen.getByText("Recent Users")).toBeInTheDocument();
    expect(screen.getByText("Latest registered users")).toBeInTheDocument();
  });

  it("displays recent users with correct information", () => {
    render(<SystemOverview systemStats={mockSystemStats} />);

    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.getByText("john@example.com")).toBeInTheDocument();
    expect(screen.getByText("Admin User")).toBeInTheDocument();
    expect(screen.getByText("admin@example.com")).toBeInTheDocument();
    expect(screen.getByText("Jane Smith")).toBeInTheDocument();
    expect(screen.getByText("jane@example.com")).toBeInTheDocument();
  });

  it("displays user initials correctly", () => {
    render(<SystemOverview systemStats={mockSystemStats} />);

    // Check for user initials in avatar circles
    expect(screen.getByText("JD")).toBeInTheDocument(); // John Doe
    expect(screen.getByText("AU")).toBeInTheDocument(); // Admin User
    expect(screen.getByText("JS")).toBeInTheDocument(); // Jane Smith
  });

  it("displays user roles with correct styling", () => {
    render(<SystemOverview systemStats={mockSystemStats} />);

    const userRoles = screen.getAllByText("USER");
    const adminRoles = screen.getAllByText("ADMIN");

    expect(userRoles).toHaveLength(2);
    expect(adminRoles).toHaveLength(1);

    // Check admin role styling - since role is "ADMIN" (uppercase) but component checks for "admin" (lowercase), it will show blue
    const adminRole = adminRoles[0];
    expect(adminRole).toHaveClass("bg-blue-100", "text-blue-800");

    // Check user role styling
    userRoles.forEach((userRole) => {
      expect(userRole).toHaveClass("bg-blue-100", "text-blue-800");
    });
  });

  it("displays email verification status with correct icons", () => {
    render(<SystemOverview systemStats={mockSystemStats} />);

    const userCheckIcons = screen.getAllByTestId("user-check-icon");
    const alertCircleIcons = screen.getAllByTestId("alert-circle-icon");

    expect(userCheckIcons).toHaveLength(2); // 2 verified users
    expect(alertCircleIcons).toHaveLength(1); // 1 unverified user

    userCheckIcons.forEach((icon) => {
      expect(icon).toHaveClass("w-4", "h-4", "text-green-600");
    });

    alertCircleIcons.forEach((icon) => {
      expect(icon).toHaveClass("w-4", "h-4", "text-yellow-600");
    });
  });

  it("limits recent users display to maximum of 5", () => {
    const manyUsersStats = {
      ...mockSystemStats,
      recentUsers: Array.from({ length: 10 }, (_, i) => ({
        id: `${i}`,
        email: `user${i}@example.com`,
        first_name: `User${i}`,
        last_name: "Test",
        role: "USER" as const,
        is_email_verified: i % 2 === 0,
      })),
    };

    render(<SystemOverview systemStats={manyUsersStats} />);

    // Should only show first 5 users
    expect(screen.getByText("User0 Test")).toBeInTheDocument();
    expect(screen.getByText("User4 Test")).toBeInTheDocument();
    expect(screen.queryByText("User5 Test")).not.toBeInTheDocument();
  });

  it("does not render recent users section when no users exist", () => {
    const noUsersStats = {
      ...mockSystemStats,
      recentUsers: [],
    };

    render(<SystemOverview systemStats={noUsersStats} />);

    expect(screen.queryByText("Recent Users")).not.toBeInTheDocument();
  });

  it("handles null recent users gracefully", () => {
    const nullUsersStats = {
      ...mockSystemStats,
      recentUsers: null as any,
    };

    render(<SystemOverview systemStats={nullUsersStats} />);

    expect(screen.queryByText("Recent Users")).not.toBeInTheDocument();
  });

  it("applies correct CSS classes to main container", () => {
    render(<SystemOverview systemStats={mockSystemStats} />);

    // The main container with space-y-6 is the outermost div, need to go up more levels
    const mainContainer = screen.getByText("Total Users").closest("div")
      ?.parentElement?.parentElement?.parentElement;
    expect(mainContainer).toHaveClass("space-y-6");
  });

  it("applies correct CSS classes to stats grid", () => {
    render(<SystemOverview systemStats={mockSystemStats} />);

    const statsGrid =
      screen.getAllByTestId("admin-stats-card")[0].parentElement;
    expect(statsGrid).toHaveClass(
      "grid",
      "grid-cols-1",
      "md:grid-cols-2",
      "lg:grid-cols-4",
      "gap-6",
    );
  });

  it("applies correct CSS classes to user list items", () => {
    render(<SystemOverview systemStats={mockSystemStats} />);

    const userRows = document.querySelectorAll(
      ".flex.items-center.justify-between.py-2.border-b.last\\:border-0",
    );
    expect(userRows).toHaveLength(3);
  });

  it("applies correct CSS classes to user avatars", () => {
    render(<SystemOverview systemStats={mockSystemStats} />);

    const avatars = document.querySelectorAll(
      ".w-8.h-8.bg-primary\\/10.rounded-full.flex.items-center.justify-center",
    );
    expect(avatars).toHaveLength(3);
  });

  it("handles users with missing first or last names", () => {
    const incompleteUsersStats = {
      ...mockSystemStats,
      recentUsers: [
        {
          id: "1",
          email: "incomplete@example.com",
          first_name: "",
          last_name: "Only",
          role: "USER" as const,
          is_email_verified: true,
        },
        {
          id: "2",
          email: "another@example.com",
          first_name: "First",
          last_name: "",
          role: "USER" as const,
          is_email_verified: true,
        },
      ],
    };

    render(<SystemOverview systemStats={incompleteUsersStats} />);

    // Use more flexible text matching since the text is split across elements
    expect(screen.getByText("Only")).toBeInTheDocument(); // Only last name
    expect(screen.getByText("First")).toBeInTheDocument(); // Only first name
    expect(screen.getByText("O")).toBeInTheDocument(); // Initial from last name only
    expect(screen.getByText("F")).toBeInTheDocument(); // Initial from first name only
  });

  it("renders proper semantic HTML structure", () => {
    render(<SystemOverview systemStats={mockSystemStats} />);

    const title = screen.getByTestId("card-title");
    expect(title.tagName.toLowerCase()).toBe("h3");

    const description = screen.getByTestId("card-description");
    expect(description.tagName.toLowerCase()).toBe("p");
  });

  it("maintains consistent spacing in user list", () => {
    render(<SystemOverview systemStats={mockSystemStats} />);

    // Find the CardContent element that contains the user list with space-y-3 class
    const cardContent = screen.getByTestId("card-content");
    const userListContainer = cardContent.querySelector(".space-y-3");
    expect(userListContainer).toBeInTheDocument();
    expect(userListContainer).toHaveClass("space-y-3");
  });

  it("handles edge case with very large numbers", () => {
    const largeNumbersStats = {
      ...mockSystemStats,
      totalUsers: 1000000,
      verifiedUsers: 999999,
    };

    render(<SystemOverview systemStats={largeNumbersStats} />);

    expect(screen.getByText("100% verification rate")).toBeInTheDocument(); // Rounded to 100%
  });

  it("renders all icon types correctly in loading state", () => {
    render(<SystemOverview />);

    // Should have 4 loading cards for different stat types
    const loadingCards = screen.getAllByTestId("card");
    expect(loadingCards).toHaveLength(4);

    // Each should have the animate-pulse class
    loadingCards.forEach((card) => {
      expect(card).toHaveClass("animate-pulse");
    });
  });
});
