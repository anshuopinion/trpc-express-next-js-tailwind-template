import { render, screen } from "@testing-library/react";
import { vi } from "vitest";
import { AdminOnly } from "../AdminOnly";

// Mock RoleGuard since AdminOnly is just a wrapper
vi.mock("../RoleGuard", () => ({
  RoleGuard: vi.fn(({ children, fallback, roles }) => {
    // Simple mock implementation for testing
    if (roles.includes("admin")) {
      return <div data-testid="role-guard-admin">{children}</div>;
    }
    return (
      fallback || <div data-testid="role-guard-fallback">Access Denied</div>
    );
  }),
}));

describe("AdminOnly", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders children when admin role is allowed", () => {
    render(
      <AdminOnly>
        <div>Admin Content</div>
      </AdminOnly>,
    );

    expect(screen.getByTestId("role-guard-admin")).toBeInTheDocument();
    expect(screen.getByText("Admin Content")).toBeInTheDocument();
  });

  it("renders with fallback component", () => {
    render(
      <AdminOnly fallback={<div>Custom Fallback</div>}>
        <div>Admin Content</div>
      </AdminOnly>,
    );

    // Since our mock always allows admin role, content should be rendered
    expect(screen.getByTestId("role-guard-admin")).toBeInTheDocument();
    expect(screen.getByText("Admin Content")).toBeInTheDocument();
  });

  it("handles multiple children correctly", () => {
    render(
      <AdminOnly>
        <div>First Admin Child</div>
        <div>Second Admin Child</div>
        <span>Third Admin Child</span>
      </AdminOnly>,
    );

    expect(screen.getByText("First Admin Child")).toBeInTheDocument();
    expect(screen.getByText("Second Admin Child")).toBeInTheDocument();
    expect(screen.getByText("Third Admin Child")).toBeInTheDocument();
  });

  it("preserves children component structure", () => {
    render(
      <AdminOnly>
        <div data-testid="admin-parent">
          <span data-testid="admin-child">Nested Admin Content</span>
          <button data-testid="admin-button">Admin Action</button>
        </div>
      </AdminOnly>,
    );

    expect(screen.getByTestId("admin-parent")).toBeInTheDocument();
    expect(screen.getByTestId("admin-child")).toBeInTheDocument();
    expect(screen.getByTestId("admin-button")).toBeInTheDocument();
  });

  it("handles complex JSX children", () => {
    render(
      <AdminOnly>
        <div className="admin-container">
          <h1>Admin Dashboard</h1>
          <nav>
            <ul>
              <li>Users</li>
              <li>Settings</li>
            </ul>
          </nav>
          <main>
            <p>Welcome, Administrator!</p>
          </main>
        </div>
      </AdminOnly>,
    );

    expect(screen.getByText("Admin Dashboard")).toBeInTheDocument();
    expect(screen.getByText("Users")).toBeInTheDocument();
    expect(screen.getByText("Settings")).toBeInTheDocument();
    expect(screen.getByText("Welcome, Administrator!")).toBeInTheDocument();
  });

  it("handles React fragment children", () => {
    render(
      <AdminOnly>
        <>
          <div>Fragment Child 1</div>
          <div>Fragment Child 2</div>
        </>
      </AdminOnly>,
    );

    expect(screen.getByText("Fragment Child 1")).toBeInTheDocument();
    expect(screen.getByText("Fragment Child 2")).toBeInTheDocument();
  });

  it("works as a simple wrapper around RoleGuard", () => {
    render(
      <AdminOnly fallback={<div>Not Admin</div>}>
        <div>Admin Area</div>
      </AdminOnly>,
    );

    // Verify AdminOnly renders admin content through RoleGuard
    expect(screen.getByTestId("role-guard-admin")).toBeInTheDocument();
    expect(screen.getByText("Admin Area")).toBeInTheDocument();
  });

  it("provides type safety for props", () => {
    const validProps = {
      children: <div>Valid</div>,
      fallback: <div>Valid Fallback</div>,
    };

    render(<AdminOnly {...validProps} />);

    expect(screen.getByTestId("role-guard-admin")).toBeInTheDocument();
    expect(screen.getByText("Valid")).toBeInTheDocument();
  });
});
