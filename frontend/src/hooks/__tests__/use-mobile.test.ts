import { act, renderHook, waitFor } from "@testing-library/react";
import { vi } from "vitest";
import { useIsMobile } from "../use-mobile";

// Mock window.matchMedia
const createMatchMedia = (width: number) => {
  return vi.fn().mockImplementation((query) => ({
    matches: width < 768, // MOBILE_BREAKPOINT - 1
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));
};

// Mock window.innerWidth
const mockWindowWidth = (width: number) => {
  Object.defineProperty(window, "innerWidth", {
    writable: true,
    configurable: true,
    value: width,
  });
};

describe("useIsMobile", () => {
  let mockMatchMedia: any;

  beforeEach(() => {
    vi.clearAllMocks();
    mockMatchMedia = createMatchMedia(1024);
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      configurable: true,
      value: mockMatchMedia,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("initializes as undefined before effect runs", () => {
    mockWindowWidth(1024);
    const { result } = renderHook(() => useIsMobile());

    // Before useEffect runs, isMobile should be undefined, but !!undefined is false
    expect(result.current).toBe(false);
  });

  it("detects desktop screen size correctly", async () => {
    mockWindowWidth(1024); // Desktop width
    const { result } = renderHook(() => useIsMobile());

    await waitFor(() => {
      expect(result.current).toBe(false);
    });
  });

  it("detects mobile screen size correctly", async () => {
    mockWindowWidth(480); // Mobile width
    const { result } = renderHook(() => useIsMobile());

    await waitFor(() => {
      expect(result.current).toBe(true);
    });
  });

  it("detects exactly at breakpoint (768px) as desktop", async () => {
    mockWindowWidth(768); // Exactly at breakpoint
    const { result } = renderHook(() => useIsMobile());

    await waitFor(() => {
      expect(result.current).toBe(false);
    });
  });

  it("detects one pixel below breakpoint (767px) as mobile", async () => {
    mockWindowWidth(767); // One pixel below breakpoint
    const { result } = renderHook(() => useIsMobile());

    await waitFor(() => {
      expect(result.current).toBe(true);
    });
  });

  it("sets up media query listener with correct breakpoint", () => {
    mockWindowWidth(1024);
    renderHook(() => useIsMobile());

    expect(mockMatchMedia).toHaveBeenCalledWith("(max-width: 767px)");
  });

  it("adds event listener to media query", () => {
    const mockMQL = {
      matches: false,
      media: "(max-width: 767px)",
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    };
    mockMatchMedia.mockReturnValue(mockMQL);
    mockWindowWidth(1024);

    renderHook(() => useIsMobile());

    expect(mockMQL.addEventListener).toHaveBeenCalledWith("change", expect.any(Function));
  });

  it("removes event listener on cleanup", () => {
    const mockMQL = {
      matches: false,
      media: "(max-width: 767px)",
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    };
    mockMatchMedia.mockReturnValue(mockMQL);
    mockWindowWidth(1024);

    const { unmount } = renderHook(() => useIsMobile());
    unmount();

    expect(mockMQL.removeEventListener).toHaveBeenCalledWith("change", expect.any(Function));
  });

  it("responds to window resize events via media query", () => {
    const mockMQL = {
      matches: false,
      media: "(max-width: 767px)",
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    };
    mockMatchMedia.mockReturnValue(mockMQL);
    mockWindowWidth(1024);

    const { result } = renderHook(() => useIsMobile());

    // Get the change handler that was added
    const changeHandler = mockMQL.addEventListener.mock.calls[0][1];

    // Simulate window resize to mobile
    mockWindowWidth(480);
    act(() => {
      changeHandler();
    });

    expect(result.current).toBe(true);
  });

  it("handles multiple resize events correctly", () => {
    const mockMQL = {
      matches: false,
      media: "(max-width: 767px)",
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    };
    mockMatchMedia.mockReturnValue(mockMQL);
    mockWindowWidth(1024);

    const { result } = renderHook(() => useIsMobile());
    const changeHandler = mockMQL.addEventListener.mock.calls[0][1];

    // Desktop -> Mobile -> Desktop -> Mobile
    mockWindowWidth(480);
    act(() => changeHandler());
    expect(result.current).toBe(true);

    mockWindowWidth(1024);
    act(() => changeHandler());
    expect(result.current).toBe(false);

    mockWindowWidth(320);
    act(() => changeHandler());
    expect(result.current).toBe(true);
  });

  it("returns consistent boolean values", async () => {
    mockWindowWidth(1024);
    const { result } = renderHook(() => useIsMobile());

    await waitFor(() => {
      expect(typeof result.current).toBe("boolean");
    });

    const mockMQL = {
      matches: false,
      media: "(max-width: 767px)",
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    };
    mockMatchMedia.mockReturnValue(mockMQL);

    const changeHandler = mockMQL.addEventListener.mock.calls[0]?.[1];
    if (changeHandler) {
      mockWindowWidth(480);
      act(() => changeHandler());
      expect(typeof result.current).toBe("boolean");
    }
  });

  it("handles edge cases with very small widths", async () => {
    mockWindowWidth(1); // Very small width
    const { result } = renderHook(() => useIsMobile());

    await waitFor(() => {
      expect(result.current).toBe(true);
    });
  });

  it("handles edge cases with very large widths", async () => {
    mockWindowWidth(4000); // Very large width
    const { result } = renderHook(() => useIsMobile());

    await waitFor(() => {
      expect(result.current).toBe(false);
    });
  });

  it("handles zero width", async () => {
    mockWindowWidth(0);
    const { result } = renderHook(() => useIsMobile());

    await waitFor(() => {
      expect(result.current).toBe(true);
    });
  });

  it("works correctly with multiple hook instances", () => {
    mockWindowWidth(1024);
    const { result: result1 } = renderHook(() => useIsMobile());
    const { result: result2 } = renderHook(() => useIsMobile());

    expect(result1.current).toBe(result2.current);
  });

  it("maintains state consistency across rerenders", async () => {
    mockWindowWidth(480);
    const { result, rerender } = renderHook(() => useIsMobile());

    await waitFor(() => {
      expect(result.current).toBe(true);
    });

    rerender();
    expect(result.current).toBe(true);
  });

  it("handles rapid resize events without issues", () => {
    const mockMQL = {
      matches: false,
      media: "(max-width: 767px)",
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    };
    mockMatchMedia.mockReturnValue(mockMQL);
    mockWindowWidth(1024);

    const { result } = renderHook(() => useIsMobile());
    const changeHandler = mockMQL.addEventListener.mock.calls[0][1];

    // Rapid resize events
    act(() => {
      mockWindowWidth(480);
      changeHandler();
      mockWindowWidth(1024);
      changeHandler();
      mockWindowWidth(320);
      changeHandler();
      mockWindowWidth(800);
      changeHandler();
    });

    expect(result.current).toBe(false); // Final state should be desktop (800px)
  });

  it("uses exact breakpoint constant (768)", () => {
    mockWindowWidth(1024);
    renderHook(() => useIsMobile());

    // Verify the exact breakpoint calculation: 768 - 1 = 767
    expect(mockMatchMedia).toHaveBeenCalledWith("(max-width: 767px)");
  });

  it("handles matchMedia not being available gracefully", () => {
    // Remove matchMedia to simulate unsupported environment
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      configurable: true,
      value: undefined,
    });

    expect(() => {
      renderHook(() => useIsMobile());
    }).toThrow(); // This should throw since we rely on matchMedia
  });

  it("handles initial state correctly when matchMedia matches is true", () => {
    const mockMQL = {
      matches: true, // Initial mobile match
      media: "(max-width: 767px)",
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    };
    mockMatchMedia.mockReturnValue(mockMQL);
    mockWindowWidth(480);

    const { result } = renderHook(() => useIsMobile());

    expect(result.current).toBe(true);
  });

  it("handles initial state correctly when matchMedia matches is false", () => {
    const mockMQL = {
      matches: false, // Initial desktop match
      media: "(max-width: 767px)",
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    };
    mockMatchMedia.mockReturnValue(mockMQL);
    mockWindowWidth(1024);

    const { result } = renderHook(() => useIsMobile());

    expect(result.current).toBe(false);
  });

  it("cleanup function removes exactly the same handler that was added", () => {
    const mockMQL = {
      matches: false,
      media: "(max-width: 767px)",
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    };
    mockMatchMedia.mockReturnValue(mockMQL);
    mockWindowWidth(1024);

    const { unmount } = renderHook(() => useIsMobile());

    const addedHandler = mockMQL.addEventListener.mock.calls[0][1];
    unmount();
    const removedHandler = mockMQL.removeEventListener.mock.calls[0][1];

    expect(addedHandler).toBe(removedHandler);
  });

  it("handles component unmounting during resize", () => {
    const mockMQL = {
      matches: false,
      media: "(max-width: 767px)",
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    };
    mockMatchMedia.mockReturnValue(mockMQL);
    mockWindowWidth(1024);

    const { unmount } = renderHook(() => useIsMobile());
    const changeHandler = mockMQL.addEventListener.mock.calls[0][1];

    unmount();

    // Simulate resize after unmount - should not cause errors
    expect(() => {
      mockWindowWidth(480);
      changeHandler();
    }).not.toThrow();
  });

  it("maintains correct boolean coercion for undefined state", () => {
    // Before useEffect runs, isMobile is undefined
    // !!undefined should be false
    const undefinedValue = undefined;
    expect(!!undefinedValue).toBe(false);

    // This matches the hook's behavior: return !!isMobile
    mockWindowWidth(1024);
    const { result } = renderHook(() => useIsMobile());
    expect(typeof result.current).toBe("boolean");
  });

  it("handles fractional window widths correctly", async () => {
    mockWindowWidth(767.5); // Fractional width
    const { result } = renderHook(() => useIsMobile());

    await waitFor(() => {
      expect(result.current).toBe(true); // Should round down and be < 768
    });
  });

  it("effect dependency array is empty, runs only on mount", () => {
    const mockMQL = {
      matches: false,
      media: "(max-width: 767px)",
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    };
    mockMatchMedia.mockReturnValue(mockMQL);
    mockWindowWidth(1024);

    const { rerender } = renderHook(() => useIsMobile());

    const initialCallCount = mockMQL.addEventListener.mock.calls.length;

    rerender();
    rerender();

    // Should not call addEventListener multiple times due to empty dependency array
    expect(mockMQL.addEventListener.mock.calls.length).toBe(initialCallCount);
  });
});
