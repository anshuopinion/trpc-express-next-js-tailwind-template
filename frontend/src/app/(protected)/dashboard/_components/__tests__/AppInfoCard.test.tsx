import { render, screen } from "@testing-library/react";
import { vi } from "vitest";
import type { AppInfo } from "../../_types";
import { AppInfoCard } from "../AppInfoCard";
import { formatVersion } from "../../_utils";

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
  Activity: ({ className }: any) => (
    <div data-testid="activity-icon" className={className}>
      Activity Icon
    </div>
  ),
}));

// Mock utility functions
vi.mock("../../_utils", () => ({
  formatVersion: vi.fn((version: string) => {
    return version.startsWith("v") ? version : `v${version}`;
  }),
}));

const mockAppInfo: AppInfo = {
  name: "tRPC Template Pro",
  version: "2.1.0",
  description: "Advanced tRPC template with premium features",
};

const mockAppInfoWithVPrefix: AppInfo = {
  name: "tRPC Template",
  version: "v1.5.0",
  description: "Modern tRPC template with role-based authentication",
};

describe("AppInfoCard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders card structure correctly", () => {
    render(<AppInfoCard appInfo={mockAppInfo} />);

    expect(screen.getByTestId("card")).toBeInTheDocument();
    expect(screen.getByTestId("card-header")).toBeInTheDocument();
    expect(screen.getByTestId("card-content")).toBeInTheDocument();
  });

  it("renders title and icon correctly", () => {
    render(<AppInfoCard appInfo={mockAppInfo} />);

    expect(screen.getByTestId("card-title")).toHaveTextContent("Application");
    expect(screen.getByTestId("activity-icon")).toBeInTheDocument();
  });

  it("applies correct CSS classes to header", () => {
    render(<AppInfoCard appInfo={mockAppInfo} />);

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
    render(<AppInfoCard appInfo={mockAppInfo} />);

    const title = screen.getByTestId("card-title");
    expect(title).toHaveClass("text-sm", "font-medium");
  });

  it("applies correct CSS classes to activity icon", () => {
    render(<AppInfoCard appInfo={mockAppInfo} />);

    const icon = screen.getByTestId("activity-icon");
    expect(icon).toHaveClass("h-4", "w-4", "text-muted-foreground");
  });

  it("displays app name with correct styling", () => {
    render(<AppInfoCard appInfo={mockAppInfo} />);

    const appName = screen.getByText("tRPC Template Pro");
    expect(appName).toBeInTheDocument();
    expect(appName).toHaveClass("text-2xl", "font-bold");
  });

  it("displays formatted version with correct styling", () => {
    render(<AppInfoCard appInfo={mockAppInfo} />);

    const version = screen.getByText("Version v2.1.0");
    expect(version).toBeInTheDocument();
    expect(version).toHaveClass("text-xs", "text-muted-foreground");
  });

  it("displays app description with correct styling", () => {
    render(<AppInfoCard appInfo={mockAppInfo} />);

    const description = screen.getByText(
      "Advanced tRPC template with premium features",
    );
    expect(description).toBeInTheDocument();
    expect(description).toHaveClass("text-sm", "text-muted-foreground");
  });

  it("renders fallback app name when appInfo is null", () => {
    render(<AppInfoCard appInfo={null} />);

    const fallbackName = screen.getByText("tRPC Template");
    expect(fallbackName).toBeInTheDocument();
    expect(fallbackName).toHaveClass("text-2xl", "font-bold");
  });

  it("renders fallback version when appInfo is null", () => {
    render(<AppInfoCard appInfo={null} />);

    const fallbackVersion = screen.getByText("Version v1.0.0");
    expect(fallbackVersion).toBeInTheDocument();
    expect(fallbackVersion).toHaveClass("text-xs", "text-muted-foreground");
  });

  it("renders fallback description when appInfo is null", () => {
    render(<AppInfoCard appInfo={null} />);

    const fallbackDescription = screen.getByText(
      "Modern tRPC template with role-based authentication",
    );
    expect(fallbackDescription).toBeInTheDocument();
    expect(fallbackDescription).toHaveClass("text-sm", "text-muted-foreground");
  });

  it("handles app info with existing v prefix in version", () => {
    render(<AppInfoCard appInfo={mockAppInfoWithVPrefix} />);

    const version = screen.getByText("Version v1.5.0");
    expect(version).toBeInTheDocument();
  });

  it("handles empty app name gracefully", () => {
    const emptyNameAppInfo: AppInfo = {
      name: "",
      version: "1.0.0",
      description: "Test description",
    };

    render(<AppInfoCard appInfo={emptyNameAppInfo} />);

    const fallbackName = screen.getByText("tRPC Template");
    expect(fallbackName).toBeInTheDocument();
  });

  it("handles empty version gracefully", () => {
    const emptyVersionAppInfo: AppInfo = {
      name: "Test App",
      version: "",
      description: "Test description",
    };

    render(<AppInfoCard appInfo={emptyVersionAppInfo} />);

    const fallbackVersion = screen.getByText("Version v1.0.0");
    expect(fallbackVersion).toBeInTheDocument();
  });

  it("handles empty description gracefully", () => {
    const emptyDescriptionAppInfo: AppInfo = {
      name: "Test App",
      version: "1.0.0",
      description: "",
    };

    render(<AppInfoCard appInfo={emptyDescriptionAppInfo} />);

    const fallbackDescription = screen.getByText(
      "Modern tRPC template with role-based authentication",
    );
    expect(fallbackDescription).toBeInTheDocument();
  });

  it("applies correct CSS classes to description container", () => {
    render(<AppInfoCard appInfo={mockAppInfo} />);

    const descriptionContainer = screen
      .getByText("Advanced tRPC template with premium features")
      .closest("div");
    expect(descriptionContainer).toHaveClass("mt-4");
  });

  it("maintains consistent layout structure", () => {
    render(<AppInfoCard appInfo={mockAppInfo} />);

    const cardContent = screen.getByTestId("card-content");
    const children = Array.from(cardContent.children);

    // Should have app name, version paragraph, and description container
    expect(children).toHaveLength(3);
    expect(children[0]).toHaveTextContent("tRPC Template Pro"); // App name
    expect(children[1]).toHaveTextContent("Version v2.1.0"); // Version
    expect(children[2]).toHaveClass("mt-4"); // Description container
  });

  it("renders semantic HTML structure", () => {
    render(<AppInfoCard appInfo={mockAppInfo} />);

    const title = screen.getByTestId("card-title");
    expect(title.tagName.toLowerCase()).toBe("h3");

    const version = screen.getByText("Version v2.1.0");
    expect(version.tagName.toLowerCase()).toBe("p");
  });

  it("calls formatVersion utility function correctly", () => {
    const mockFormatVersion = vi.mocked(formatVersion);

    render(<AppInfoCard appInfo={mockAppInfo} />);

    expect(mockFormatVersion).toHaveBeenCalledWith("2.1.0");
  });

  it("calls formatVersion utility function with fallback value", () => {
    const mockFormatVersion = vi.mocked(formatVersion);

    render(<AppInfoCard appInfo={null} />);

    expect(mockFormatVersion).toHaveBeenCalledWith("1.0.0");
  });

  it("handles long app names gracefully", () => {
    const longNameAppInfo: AppInfo = {
      name: "Very Long Application Name That Might Cause Layout Issues",
      version: "1.0.0",
      description: "Test description",
    };

    render(<AppInfoCard appInfo={longNameAppInfo} />);

    expect(
      screen.getByText(
        "Very Long Application Name That Might Cause Layout Issues",
      ),
    ).toBeInTheDocument();
  });

  it("handles long descriptions gracefully", () => {
    const longDescriptionAppInfo: AppInfo = {
      name: "Test App",
      version: "1.0.0",
      description:
        "This is a very long description that spans multiple lines and should be handled gracefully in the UI without breaking the layout or causing overflow issues",
    };

    render(<AppInfoCard appInfo={longDescriptionAppInfo} />);

    expect(
      screen.getByText(
        "This is a very long description that spans multiple lines and should be handled gracefully in the UI without breaking the layout or causing overflow issues",
      ),
    ).toBeInTheDocument();
  });

  it("handles special characters in app name", () => {
    const specialCharsAppInfo: AppInfo = {
      name: "tRPC™ Template® (v2.0)",
      version: "2.0.0",
      description: "Template with special chars",
    };

    render(<AppInfoCard appInfo={specialCharsAppInfo} />);

    expect(screen.getByText("tRPC™ Template® (v2.0)")).toBeInTheDocument();
  });

  it("handles special characters in description", () => {
    const specialDescriptionAppInfo: AppInfo = {
      name: "Test App",
      version: "1.0.0",
      description:
        "Description with special chars: @#$%^&*()_+{}[]|;':\"<>?,./",
    };

    render(<AppInfoCard appInfo={specialDescriptionAppInfo} />);

    expect(
      screen.getByText(
        "Description with special chars: @#$%^&*()_+{}[]|;':\"<>?,./",
      ),
    ).toBeInTheDocument();
  });

  it("handles version with beta/alpha suffixes", () => {
    const betaVersionAppInfo: AppInfo = {
      name: "Test App",
      version: "2.0.0-beta.1",
      description: "Beta version",
    };

    render(<AppInfoCard appInfo={betaVersionAppInfo} />);

    expect(screen.getByText("Version v2.0.0-beta.1")).toBeInTheDocument();
  });

  it("maintains proper text hierarchy", () => {
    render(<AppInfoCard appInfo={mockAppInfo} />);

    // App name should be largest
    const appName = screen.getByText("tRPC Template Pro");
    expect(appName).toHaveClass("text-2xl", "font-bold");

    // Version should be smallest
    const version = screen.getByText("Version v2.1.0");
    expect(version).toHaveClass("text-xs");

    // Description should be medium
    const description = screen.getByText(
      "Advanced tRPC template with premium features",
    );
    expect(description).toHaveClass("text-sm");
  });

  it("applies consistent muted text coloring", () => {
    render(<AppInfoCard appInfo={mockAppInfo} />);

    const version = screen.getByText("Version v2.1.0");
    expect(version).toHaveClass("text-muted-foreground");

    const description = screen.getByText(
      "Advanced tRPC template with premium features",
    );
    expect(description).toHaveClass("text-muted-foreground");

    const icon = screen.getByTestId("activity-icon");
    expect(icon).toHaveClass("text-muted-foreground");
  });

  it("handles numeric strings in version correctly", () => {
    const numericVersionAppInfo: AppInfo = {
      name: "Test App",
      version: "123",
      description: "Numeric version",
    };

    render(<AppInfoCard appInfo={numericVersionAppInfo} />);

    expect(screen.getByText("Version v123")).toBeInTheDocument();
  });

  it("handles version with build numbers", () => {
    const buildVersionAppInfo: AppInfo = {
      name: "Test App",
      version: "1.0.0+build.123",
      description: "Build version",
    };

    render(<AppInfoCard appInfo={buildVersionAppInfo} />);

    expect(screen.getByText("Version v1.0.0+build.123")).toBeInTheDocument();
  });

  it("maintains consistent spacing between elements", () => {
    render(<AppInfoCard appInfo={mockAppInfo} />);

    // Check that description container has proper margin top
    const descriptionContainer = screen
      .getByText("Advanced tRPC template with premium features")
      .closest("div");
    expect(descriptionContainer).toHaveClass("mt-4");
  });

  it("handles null values in partial appInfo object", () => {
    const partialAppInfo = {
      name: "Test App",
      version: null as any,
      description: null as any,
    };

    render(<AppInfoCard appInfo={partialAppInfo} />);

    expect(screen.getByText("Test App")).toBeInTheDocument();
    expect(screen.getByText("Version v1.0.0")).toBeInTheDocument(); // Fallback
    expect(
      screen.getByText("Modern tRPC template with role-based authentication"),
    ).toBeInTheDocument(); // Fallback
  });

  it("renders consistently with different app info combinations", () => {
    const minimalAppInfo: AppInfo = {
      name: "Min App",
      version: "1.0",
      description: "Minimal",
    };

    render(<AppInfoCard appInfo={minimalAppInfo} />);

    expect(screen.getByText("Min App")).toBeInTheDocument();
    expect(screen.getByText("Version v1.0")).toBeInTheDocument();
    expect(screen.getByText("Minimal")).toBeInTheDocument();
  });
});
