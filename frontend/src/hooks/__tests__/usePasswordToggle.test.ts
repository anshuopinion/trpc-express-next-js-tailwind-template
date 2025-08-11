import { act, renderHook } from "@testing-library/react";
import { useMultiplePasswordToggle, usePasswordToggle } from "../usePasswordToggle";

describe("usePasswordToggle", () => {
  it("initializes with showPassword as false", () => {
    const { result } = renderHook(() => usePasswordToggle());

    expect(result.current.showPassword).toBe(false);
  });

  it("provides togglePassword function", () => {
    const { result } = renderHook(() => usePasswordToggle());

    expect(typeof result.current.togglePassword).toBe("function");
  });

  it("toggles showPassword when togglePassword is called", () => {
    const { result } = renderHook(() => usePasswordToggle());

    expect(result.current.showPassword).toBe(false);

    act(() => {
      result.current.togglePassword();
    });

    expect(result.current.showPassword).toBe(true);
  });

  it("toggles back to false when called again", () => {
    const { result } = renderHook(() => usePasswordToggle());

    // Toggle to true
    act(() => {
      result.current.togglePassword();
    });
    expect(result.current.showPassword).toBe(true);

    // Toggle back to false
    act(() => {
      result.current.togglePassword();
    });
    expect(result.current.showPassword).toBe(false);
  });

  it("supports multiple rapid toggles", () => {
    const { result } = renderHook(() => usePasswordToggle());

    // Initial state
    expect(result.current.showPassword).toBe(false);

    // Multiple rapid toggles
    act(() => {
      result.current.togglePassword();
      result.current.togglePassword();
      result.current.togglePassword();
    });

    expect(result.current.showPassword).toBe(true);
  });

  it("maintains consistent toggle behavior across rerenders", () => {
    const { result, rerender } = renderHook(() => usePasswordToggle());

    act(() => {
      result.current.togglePassword();
    });
    expect(result.current.showPassword).toBe(true);

    rerender();
    expect(result.current.showPassword).toBe(true);

    act(() => {
      result.current.togglePassword();
    });
    expect(result.current.showPassword).toBe(false);
  });

  it("returns consistent toggle function behavior across rerenders", () => {
    const { result, rerender } = renderHook(() => usePasswordToggle());

    const firstToggleRef = result.current.togglePassword;
    expect(typeof firstToggleRef).toBe("function");

    rerender();

    const secondToggleRef = result.current.togglePassword;
    expect(typeof secondToggleRef).toBe("function");

    // Functions have different references (expected behavior without useCallback)
    // but both should work correctly
    act(() => {
      firstToggleRef();
    });
    expect(result.current.showPassword).toBe(true);

    act(() => {
      secondToggleRef();
    });
    expect(result.current.showPassword).toBe(false);
  });

  it("works with multiple hook instances independently", () => {
    const { result: result1 } = renderHook(() => usePasswordToggle());
    const { result: result2 } = renderHook(() => usePasswordToggle());

    expect(result1.current.showPassword).toBe(false);
    expect(result2.current.showPassword).toBe(false);

    act(() => {
      result1.current.togglePassword();
    });

    expect(result1.current.showPassword).toBe(true);
    expect(result2.current.showPassword).toBe(false);

    act(() => {
      result2.current.togglePassword();
    });

    expect(result1.current.showPassword).toBe(true);
    expect(result2.current.showPassword).toBe(true);
  });

  it("handles concurrent state updates correctly", () => {
    const { result } = renderHook(() => usePasswordToggle());

    act(() => {
      // Simulate concurrent toggles
      result.current.togglePassword();
      result.current.togglePassword();
    });

    expect(result.current.showPassword).toBe(false);
  });
});

describe("useMultiplePasswordToggle", () => {
  it("initializes with both passwords hidden", () => {
    const { result } = renderHook(() => useMultiplePasswordToggle());

    expect(result.current.showPassword).toBe(false);
    expect(result.current.showConfirmPassword).toBe(false);
  });

  it("provides both toggle functions", () => {
    const { result } = renderHook(() => useMultiplePasswordToggle());

    expect(typeof result.current.togglePassword).toBe("function");
    expect(typeof result.current.toggleConfirmPassword).toBe("function");
  });

  it("toggles password independently", () => {
    const { result } = renderHook(() => useMultiplePasswordToggle());

    act(() => {
      result.current.togglePassword();
    });

    expect(result.current.showPassword).toBe(true);
    expect(result.current.showConfirmPassword).toBe(false);
  });

  it("toggles confirm password independently", () => {
    const { result } = renderHook(() => useMultiplePasswordToggle());

    act(() => {
      result.current.toggleConfirmPassword();
    });

    expect(result.current.showPassword).toBe(false);
    expect(result.current.showConfirmPassword).toBe(true);
  });

  it("can toggle both passwords simultaneously", () => {
    const { result } = renderHook(() => useMultiplePasswordToggle());

    act(() => {
      result.current.togglePassword();
      result.current.toggleConfirmPassword();
    });

    expect(result.current.showPassword).toBe(true);
    expect(result.current.showConfirmPassword).toBe(true);
  });

  it("toggles passwords back to false independently", () => {
    const { result } = renderHook(() => useMultiplePasswordToggle());

    // Show both passwords
    act(() => {
      result.current.togglePassword();
      result.current.toggleConfirmPassword();
    });
    expect(result.current.showPassword).toBe(true);
    expect(result.current.showConfirmPassword).toBe(true);

    // Hide password only
    act(() => {
      result.current.togglePassword();
    });
    expect(result.current.showPassword).toBe(false);
    expect(result.current.showConfirmPassword).toBe(true);

    // Hide confirm password
    act(() => {
      result.current.toggleConfirmPassword();
    });
    expect(result.current.showPassword).toBe(false);
    expect(result.current.showConfirmPassword).toBe(false);
  });

  it("supports multiple rapid toggles on password", () => {
    const { result } = renderHook(() => useMultiplePasswordToggle());

    act(() => {
      result.current.togglePassword();
      result.current.togglePassword();
      result.current.togglePassword();
    });

    expect(result.current.showPassword).toBe(true);
    expect(result.current.showConfirmPassword).toBe(false);
  });

  it("supports multiple rapid toggles on confirm password", () => {
    const { result } = renderHook(() => useMultiplePasswordToggle());

    act(() => {
      result.current.toggleConfirmPassword();
      result.current.toggleConfirmPassword();
      result.current.toggleConfirmPassword();
    });

    expect(result.current.showPassword).toBe(false);
    expect(result.current.showConfirmPassword).toBe(true);
  });

  it("maintains state across rerenders", () => {
    const { result, rerender } = renderHook(() => useMultiplePasswordToggle());

    act(() => {
      result.current.togglePassword();
    });
    expect(result.current.showPassword).toBe(true);

    rerender();
    expect(result.current.showPassword).toBe(true);
    expect(result.current.showConfirmPassword).toBe(false);
  });

  it("returns consistent function behavior across rerenders", () => {
    const { result, rerender } = renderHook(() => useMultiplePasswordToggle());

    const firstPasswordToggleRef = result.current.togglePassword;
    const firstConfirmPasswordToggleRef = result.current.toggleConfirmPassword;

    expect(typeof firstPasswordToggleRef).toBe("function");
    expect(typeof firstConfirmPasswordToggleRef).toBe("function");

    rerender();

    const secondPasswordToggleRef = result.current.togglePassword;
    const secondConfirmPasswordToggleRef = result.current.toggleConfirmPassword;

    // Functions have different references (expected behavior without useCallback)
    // but both should work correctly
    act(() => {
      firstPasswordToggleRef();
    });
    expect(result.current.showPassword).toBe(true);

    act(() => {
      secondConfirmPasswordToggleRef();
    });
    expect(result.current.showConfirmPassword).toBe(true);
  });

  it("works with multiple hook instances independently", () => {
    const { result: result1 } = renderHook(() => useMultiplePasswordToggle());
    const { result: result2 } = renderHook(() => useMultiplePasswordToggle());

    act(() => {
      result1.current.togglePassword();
      result2.current.toggleConfirmPassword();
    });

    expect(result1.current.showPassword).toBe(true);
    expect(result1.current.showConfirmPassword).toBe(false);
    expect(result2.current.showPassword).toBe(false);
    expect(result2.current.showConfirmPassword).toBe(true);
  });

  it("handles complex toggle sequences", () => {
    const { result } = renderHook(() => useMultiplePasswordToggle());

    // Complex sequence
    act(() => {
      result.current.togglePassword(); // true, false
      result.current.toggleConfirmPassword(); // true, true
      result.current.togglePassword(); // false, true
      result.current.togglePassword(); // true, true
      result.current.toggleConfirmPassword(); // true, false
    });

    expect(result.current.showPassword).toBe(true);
    expect(result.current.showConfirmPassword).toBe(false);
  });

  it("returns correct object structure", () => {
    const { result } = renderHook(() => useMultiplePasswordToggle());

    expect(result.current).toHaveProperty("showPassword");
    expect(result.current).toHaveProperty("showConfirmPassword");
    expect(result.current).toHaveProperty("togglePassword");
    expect(result.current).toHaveProperty("toggleConfirmPassword");

    expect(Object.keys(result.current)).toHaveLength(4);
  });

  it("handles concurrent state updates for both passwords", () => {
    const { result } = renderHook(() => useMultiplePasswordToggle());

    act(() => {
      // Simulate concurrent updates
      result.current.togglePassword();
      result.current.toggleConfirmPassword();
      result.current.togglePassword();
    });

    expect(result.current.showPassword).toBe(false);
    expect(result.current.showConfirmPassword).toBe(true);
  });

  it("maintains type safety for boolean values", () => {
    const { result } = renderHook(() => useMultiplePasswordToggle());

    expect(typeof result.current.showPassword).toBe("boolean");
    expect(typeof result.current.showConfirmPassword).toBe("boolean");

    act(() => {
      result.current.togglePassword();
    });

    expect(typeof result.current.showPassword).toBe("boolean");
    expect(typeof result.current.showConfirmPassword).toBe("boolean");
  });

  it("handles stress test with many toggles", () => {
    const { result } = renderHook(() => useMultiplePasswordToggle());

    act(() => {
      // Stress test with 100 toggles each
      for (let i = 0; i < 100; i++) {
        result.current.togglePassword();
        result.current.toggleConfirmPassword();
      }
    });

    // After even number of toggles, both should be false
    expect(result.current.showPassword).toBe(false);
    expect(result.current.showConfirmPassword).toBe(false);
  });
});
