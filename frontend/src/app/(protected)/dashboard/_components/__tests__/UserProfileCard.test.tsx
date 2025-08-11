import { render, screen } from "@testing-library/react";
import { vi } from "vitest";
import { UserProfileCard } from "../UserProfileCard";

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

// Mock lucide-react
vi.mock("lucide-react", () => ({
  User: ({ className }: any) => (
    <div data-testid="user-icon" className={className}>
      User Icon
    </div>
  ),
}));

// Mock utility functions
vi.mock("../_utils", () => ({
  formatFullName: vi.fn((first, last) => {
    if (!first && !last) return "Unknown User";
    return `${first || ""} ${last || ""}`.trim();
  }),
  formatUserInitials: vi.fn((first, last) => {
    const firstInitial = first?.charAt(0)?.toUpperCase() || "";
    const lastInitial = last?.charAt(0)?.toUpperCase() || "";
    return `${firstInitial}${lastInitial}` || "??";
  }),
  getVerificationStatus: vi.fn((isVerified) =>
    isVerified
      ? {
          status: "verified",
          label: "Verified Account",
          color: "text-green-600",
        }
      : {
          status: "unverified",
          label: "Unverified Account",
          color: "text-yellow-600",
        }
  ),
}));

const mockUser = {
  id: "1",
  first_name: "John",
  last_name: "Doe",
  email: "john@example.com",
  role: "USER" as const,
  is_email_verified: true,
};

describe("UserProfileCard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders card structure correctly", () => {
    render(<UserProfileCard user={mockUser} />);

    expect(screen.getByTestId("card")).toBeInTheDocument();
    expect(screen.getByTestId("card-header")).toBeInTheDocument();
    expect(screen.getByTestId("card-content")).toBeInTheDocument();
  });

  it("renders card title with correct text and classes", () => {
    render(<UserProfileCard user={mockUser} />);

    const title = screen.getByTestId("card-title");
    expect(title).toHaveTextContent("User Profile");
    expect(title).toHaveClass("text-sm", "font-medium");
  });

  it("renders user icon with correct classes", () => {
    render(<UserProfileCard user={mockUser} />);

    const userIcon = screen.getByTestId("user-icon");
    expect(userIcon).toBeInTheDocument();
    expect(userIcon).toHaveClass("h-4", "w-4", "text-muted-foreground");
  });

  it("applies correct CSS classes to card header", () => {
    render(<UserProfileCard user={mockUser} />);

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

  it("renders full name with correct formatting", () => {
    render(<UserProfileCard user={mockUser} />);

    const fullName = screen.getByText("John Doe");
    expect(fullName).toHaveClass("text-2xl", "font-bold");
  });

  it("renders user email correctly", () => {
    render(<UserProfileCard user={mockUser} />);

    const email = screen.getByText("john@example.com");
    expect(email).toHaveClass("text-xs", "text-muted-foreground");
  });

  it("renders user initials in avatar circle", () => {
    render(<UserProfileCard user={mockUser} />);

    const initials = screen.getByText("JD");
    expect(initials).toHaveClass("text-primary", "font-semibold", "text-sm");

    const avatarCircle = initials.parentElement;
    expect(avatarCircle).toHaveClass(
      "w-8",
      "h-8",
      "bg-primary/10",
      "rounded-full",
      "flex",
      "items-center",
      "justify-center",
      "mr-2"
    );
  });

  it("renders verification status with correct styling", () => {
    render(<UserProfileCard user={mockUser} />);

    const verificationStatus = screen.getByText("Verified Account");
    expect(verificationStatus).toHaveClass("text-sm", "text-green-600");
  });

  it("handles null user gracefully", () => {
    render(<UserProfileCard user={null} />);

    expect(screen.getByText("Unknown User")).toBeInTheDocument();
    expect(screen.getByText("??")).toBeInTheDocument();
    expect(screen.getByText("Unverified Account")).toBeInTheDocument();
    expect(screen.queryByText("@")).not.toBeInTheDocument();
  });

  it("handles user without names", () => {
    const userWithoutNames = {
      ...mockUser,
      first_name: "",
      last_name: "",
    };

    render(<UserProfileCard user={userWithoutNames} />);

    expect(screen.getByText("Unknown User")).toBeInTheDocument();
    expect(screen.getByText("??")).toBeInTheDocument();
  });

  it("handles user with only first name", () => {
    const userWithFirstName = {
      ...mockUser,
      first_name: "John",
      last_name: "",
    };

    render(<UserProfileCard user={userWithFirstName} />);

    expect(screen.getByText("John")).toBeInTheDocument();
    expect(screen.getByText("J")).toBeInTheDocument(); // Only first initial
  });

  it("handles user with only last name", () => {
    const userWithLastName = {
      ...mockUser,
      first_name: "",
      last_name: "Doe",
    };

    render(<UserProfileCard user={userWithLastName} />);

    expect(screen.getByText("Doe")).toBeInTheDocument();
    expect(screen.getByText("D")).toBeInTheDocument(); // Only last initial
  });

  it("handles unverified user correctly", () => {
    const unverifiedUser = {
      ...mockUser,
      is_email_verified: false,
    };

    render(<UserProfileCard user={unverifiedUser} />);

    const verificationStatus = screen.getByText("Unverified Account");
    expect(verificationStatus).toHaveClass("text-sm", "text-yellow-600");
  });

  it("renders profile section with correct flex layout", () => {
    render(<UserProfileCard user={mockUser} />);

    const profileSection = screen.getByText("JD").closest("div")?.parentElement;
    expect(profileSection).toHaveClass("mt-4", "flex", "items-center");
  });

  it("integrates with utility functions correctly", () => {
    render(<UserProfileCard user={mockUser} />);

    // The component should render the formatted outputs from our mocked utilities
    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.getByText("JD")).toBeInTheDocument();
    expect(screen.getByText("Verified Account")).toBeInTheDocument();
  });

  it("integrates with utility functions for null user", () => {
    render(<UserProfileCard user={null} />);

    // Should use the fallback values from our mocked utilities
    expect(screen.getByText("Unknown User")).toBeInTheDocument();
    expect(screen.getByText("??")).toBeInTheDocument();
    expect(screen.getByText("Unverified Account")).toBeInTheDocument();
  });

  it("handles special characters in names", () => {
    const userWithSpecialChars = {
      ...mockUser,
      first_name: "José-María",
      last_name: "Pérez-González",
      email: "jose@example.com",
    };

    render(<UserProfileCard user={userWithSpecialChars} />);

    expect(screen.getByText("José-María Pérez-González")).toBeInTheDocument();
    expect(screen.getByText("jose@example.com")).toBeInTheDocument();
  });

  it("handles long names gracefully", () => {
    const userWithLongNames = {
      ...mockUser,
      first_name: "VeryLongFirstNameThatMightCauseLayoutIssues",
      last_name: "VeryLongLastNameThatMightAlsoCauseLayoutIssues",
      email: "verylongemailaddress@verylongdomainname.com",
    };

    render(<UserProfileCard user={userWithLongNames} />);

    expect(screen.getByText(/VeryLongFirstNameThatMightCauseLayoutIssues/)).toBeInTheDocument();
    expect(screen.getByText("verylongemailaddress@verylongdomainname.com")).toBeInTheDocument();
  });

  it("maintains consistent component structure", () => {
    render(<UserProfileCard user={mockUser} />);

    const cardContent = screen.getByTestId("card-content");
    const children = Array.from(cardContent.children);

    // Should have full name, email, and profile section
    expect(children).toHaveLength(3);

    // Full name should be first
    expect(children[0]).toHaveTextContent("John Doe");

    // Email should be second
    expect(children[1]).toHaveTextContent("john@example.com");

    // Profile section should be third
    expect(children[2]).toContainElement(screen.getByText("JD"));
  });

  it("uses semantic HTML elements correctly", () => {
    render(<UserProfileCard user={mockUser} />);

    const title = screen.getByTestId("card-title");
    expect(title.tagName.toLowerCase()).toBe("h3");

    const email = screen.getByText("john@example.com");
    expect(email.tagName.toLowerCase()).toBe("p");
  });

  it("handles undefined email gracefully", () => {
    const userWithoutEmail = {
      ...mockUser,
      email: undefined as any,
    };

    render(<UserProfileCard user={userWithoutEmail} />);

    // Email paragraph should still render but be empty or show fallback
    const emailElement = screen.getByTestId("card-content").children[1];
    expect(emailElement).toBeInTheDocument();
  });

  it("renders consistent avatar styling", () => {
    render(<UserProfileCard user={mockUser} />);

    const initialsSpan = screen.getByText("JD");
    expect(initialsSpan.parentElement).toHaveClass("w-8", "h-8", "bg-primary/10", "rounded-full");
  });
});
