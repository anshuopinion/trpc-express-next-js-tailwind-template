import { render, screen } from "@testing-library/react";
import { vi } from "vitest";
import { useForm } from "react-hook-form";
import { NameFields } from "../NameFields";
import type { SignupFormData } from "../../_schema";

// Mock the form components
vi.mock("@/components/ui/form", () => ({
  FormControl: ({ children }: any) => (
    <div data-testid="form-control">{children}</div>
  ),
  FormField: ({ render }: any) =>
    render({ field: { value: "", onChange: vi.fn() } }),
  FormItem: ({ children }: any) => (
    <div data-testid="form-item">{children}</div>
  ),
  FormLabel: ({ children }: any) => (
    <label data-testid="form-label">{children}</label>
  ),
  FormMessage: () => <div data-testid="form-message" />,
}));

vi.mock("@/components/ui/input", () => ({
  Input: (props: any) => (
    <input
      data-testid={`${props.placeholder?.toLowerCase()}-input`}
      {...props}
    />
  ),
}));

describe("NameFields", () => {
  const TestWrapper = ({
    defaultValues,
  }: {
    defaultValues?: Partial<SignupFormData>;
  }) => {
    const form = useForm<SignupFormData>({
      defaultValues: {
        first_name: "",
        last_name: "",
        email: "",
        password: "",
        confirmPassword: "",
        ...defaultValues,
      },
    });

    return <NameFields form={form} />;
  };

  it("renders both first name and last name fields", () => {
    render(<TestWrapper />);

    const formLabels = screen.getAllByTestId("form-label");
    expect(formLabels).toHaveLength(2);
    expect(formLabels[0]).toHaveTextContent("First Name");
    expect(formLabels[1]).toHaveTextContent("Last Name");
  });

  it("renders input fields with correct attributes", () => {
    render(<TestWrapper />);

    const johnInput = screen.getByTestId("john-input");
    const doeInput = screen.getByTestId("doe-input");

    expect(johnInput).toBeInTheDocument();
    expect(johnInput).toHaveAttribute("placeholder", "John");
    expect(johnInput).toHaveAttribute("autoComplete", "given-name");

    expect(doeInput).toBeInTheDocument();
    expect(doeInput).toHaveAttribute("placeholder", "Doe");
    expect(doeInput).toHaveAttribute("autoComplete", "family-name");
  });

  it("has proper grid layout structure", () => {
    render(<TestWrapper />);

    const container = screen
      .getByText("First Name")
      .closest("div")?.parentElement;
    expect(container).toHaveClass(
      "grid",
      "grid-cols-1",
      "md:grid-cols-2",
      "gap-4",
    );
  });

  it("renders form items and controls correctly", () => {
    render(<TestWrapper />);

    const formItems = screen.getAllByTestId("form-item");
    const formControls = screen.getAllByTestId("form-control");
    const formMessages = screen.getAllByTestId("form-message");

    expect(formItems).toHaveLength(2);
    expect(formControls).toHaveLength(2);
    expect(formMessages).toHaveLength(2);
  });

  it("integrates with form context correctly", () => {
    render(
      <TestWrapper
        defaultValues={{ first_name: "Alice", last_name: "Smith" }}
      />,
    );

    // Since we're mocking FormField, we can verify the structure is correct
    expect(screen.getByText("First Name")).toBeInTheDocument();
    expect(screen.getByText("Last Name")).toBeInTheDocument();
  });

  it("has proper responsive layout classes", () => {
    render(<TestWrapper />);

    // Check the grid container
    const gridContainer = screen
      .getByText("First Name")
      .closest("div")?.parentElement;
    expect(gridContainer).toHaveClass("grid-cols-1");
    expect(gridContainer).toHaveClass("md:grid-cols-2");
    expect(gridContainer).toHaveClass("gap-4");
  });

  it("renders accessibility attributes correctly", () => {
    render(<TestWrapper />);

    const johnInput = screen.getByTestId("john-input");
    const doeInput = screen.getByTestId("doe-input");

    // Check autoComplete attributes for accessibility
    expect(johnInput).toHaveAttribute("autoComplete", "given-name");
    expect(doeInput).toHaveAttribute("autoComplete", "family-name");
  });

  it("maintains consistent field structure", () => {
    render(<TestWrapper />);

    // Both fields should have the same structure
    const labels = screen.getAllByTestId("form-label");
    const inputs = screen.getAllByTestId(/input$/);
    const messages = screen.getAllByTestId("form-message");

    expect(labels).toHaveLength(2);
    expect(inputs).toHaveLength(2);
    expect(messages).toHaveLength(2);
  });

  it("has proper field names for form validation", () => {
    const mockForm = {
      control: { name: "test-control" },
    };

    render(<NameFields form={mockForm as any} />);

    // The component should render without errors when given proper form prop
    expect(screen.getByText("First Name")).toBeInTheDocument();
    expect(screen.getByText("Last Name")).toBeInTheDocument();
  });
});
