import { render, screen, waitFor } from "@testing-library/react";
import { vi } from "vitest";
import { RoleGuard } from "../RoleGuard";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";

// Mock Next.js router
const mockPush = vi.fn();
const mockRouter = {
  push: mockPush,
  back: vi.fn(),
  forward: vi.fn(),
  refresh: vi.fn(),
  replace: vi.fn(),
  prefetch: vi.fn(),
};

vi.mock("next/navigation", () => ({
  useRouter: vi.fn(() => mockRouter),
}));

// Mock useAuth hook with different states
vi.mock("@/hooks/useAuth", () => ({
  useAuth: vi.fn(),
}));

const mockAdminUser = {
  id: "1",
  email: "admin@example.com",
  first_name: "Admin",
  last_name: "User",
  role: "admin",
  is_email_verified: true,
};

const mockRegularUser = {
  id: "2",
  email: "user@example.com",
  first_name: "Regular",
  last_name: "User",
  role: "user",
  is_email_verified: true,
};

// Get mocked versions of imported modules
const mockUseAuth = vi.mocked(useAuth);
const mockUseRouter = vi.mocked(useRouter);

describe("RoleGuard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders loading state when authentication is loading", () => {
    mockUseAuth.mockReturnValue({
      user: null,
      isLoading: true,
      isAuthenticated: false,
    });

    render(
      <RoleGuard roles={["admin"]}>
        <div>Protected Content</div>
      </RoleGuard>,
    );

    expect(screen.getByText("Loading...")).toBeInTheDocument();
    expect(screen.queryByText("Protected Content")).not.toBeInTheDocument();
  });

  it("renders children when user has required role", () => {
    mockUseAuth.mockReturnValue({
      user: mockAdminUser,
      isLoading: false,
      isAuthenticated: true,
    });

    render(
      <RoleGuard roles={["admin"]}>
        <div>Protected Admin Content</div>
      </RoleGuard>,
    );

    expect(screen.getByText("Protected Admin Content")).toBeInTheDocument();
  });

  it("renders children when user has one of multiple required roles", () => {
    mockUseAuth.mockReturnValue({
      user: mockRegularUser,
      isLoading: false,
      isAuthenticated: true,
    });

    render(
      <RoleGuard roles={["admin", "user"]}>
        <div>Protected Content</div>
      </RoleGuard>,
    );

    expect(screen.getByText("Protected Content")).toBeInTheDocument();
  });

  it("redirects to default dashboard when user lacks required role", async () => {
    mockUseAuth.mockReturnValue({
      user: mockRegularUser,
      isLoading: false,
      isAuthenticated: true,
    });

    render(
      <RoleGuard roles={["admin"]}>
        <div>Admin Only Content</div>
      </RoleGuard>,
    );

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/dashboard");
    });
  });

  it("redirects to signin when user is not authenticated", async () => {
    mockUseAuth.mockReturnValue({
      user: null,
      isLoading: false,
      isAuthenticated: false,
    });

    render(
      <RoleGuard roles={["admin"]}>
        <div>Protected Content</div>
      </RoleGuard>,
    );

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/signin");
    });
  });

  it("renders access denied message when user lacks required role", () => {
    mockUseAuth.mockReturnValue({
      user: mockRegularUser,
      isLoading: false,
      isAuthenticated: true,
    });

    render(
      <RoleGuard roles={["admin"]}>
        <div>Admin Only Content</div>
      </RoleGuard>,
    );

    expect(screen.getByText("Access Denied")).toBeInTheDocument();
    expect(
      screen.getByText("You don't have permission to access this page."),
    ).toBeInTheDocument();
    expect(screen.queryByText("Admin Only Content")).not.toBeInTheDocument();
  });

  it("renders custom fallback when user lacks required role", () => {
    mockUseAuth.mockReturnValue({
      user: mockRegularUser,
      isLoading: false,
      isAuthenticated: true,
    });

    render(
      <RoleGuard roles={["admin"]} fallback={<div>Custom Access Denied</div>}>
        <div>Admin Only Content</div>
      </RoleGuard>,
    );

    expect(screen.getByText("Custom Access Denied")).toBeInTheDocument();
    expect(screen.queryByText("Access Denied")).not.toBeInTheDocument();
    expect(screen.queryByText("Admin Only Content")).not.toBeInTheDocument();
  });

  it("handles null user gracefully", () => {
    mockUseAuth.mockReturnValue({
      user: null,
      isLoading: false,
      isAuthenticated: true,
    });

    render(
      <RoleGuard roles={["admin"]}>
        <div>Protected Content</div>
      </RoleGuard>,
    );

    expect(screen.getByText("Access Denied")).toBeInTheDocument();
    expect(screen.queryByText("Protected Content")).not.toBeInTheDocument();
  });

  it("handles empty roles array", () => {
    mockUseAuth.mockReturnValue({
      user: mockRegularUser,
      isLoading: false,
      isAuthenticated: true,
    });

    render(
      <RoleGuard roles={[]}>
        <div>Protected Content</div>
      </RoleGuard>,
    );

    expect(screen.getByText("Access Denied")).toBeInTheDocument();
    expect(screen.queryByText("Protected Content")).not.toBeInTheDocument();
  });

  it("is case sensitive with role matching", () => {
    mockUseAuth.mockReturnValue({
      user: { ...mockAdminUser, role: "ADMIN" },
      isLoading: false,
      isAuthenticated: true,
    });

    render(
      <RoleGuard roles={["admin"]}>
        <div>Protected Content</div>
      </RoleGuard>,
    );

    expect(screen.getByText("Access Denied")).toBeInTheDocument();
    expect(screen.queryByText("Protected Content")).not.toBeInTheDocument();
  });

  it("handles multiple children correctly", () => {
    mockUseAuth.mockReturnValue({
      user: mockAdminUser,
      isLoading: false,
      isAuthenticated: true,
    });

    render(
      <RoleGuard roles={["admin"]}>
        <div>First Child</div>
        <div>Second Child</div>
        <span>Third Child</span>
      </RoleGuard>,
    );

    expect(screen.getByText("First Child")).toBeInTheDocument();
    expect(screen.getByText("Second Child")).toBeInTheDocument();
    expect(screen.getByText("Third Child")).toBeInTheDocument();
  });

  it("preserves children component structure", () => {
    mockUseAuth.mockReturnValue({
      user: mockAdminUser,
      isLoading: false,
      isAuthenticated: true,
    });

    render(
      <RoleGuard roles={["admin"]}>
        <div data-testid="parent">
          <span data-testid="child">Nested Content</span>
          <button data-testid="button">Click me</button>
        </div>
      </RoleGuard>,
    );

    expect(screen.getByTestId("parent")).toBeInTheDocument();
    expect(screen.getByTestId("child")).toBeInTheDocument();
    expect(screen.getByTestId("button")).toBeInTheDocument();
  });
});
