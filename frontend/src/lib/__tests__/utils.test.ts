import { vi } from "vitest";
import { cn, getFromLocalStorage, removeFromLocalStorage, setToLocalStorage } from "../utils";

// Mock localStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

Object.defineProperty(window, "localStorage", {
  value: mockLocalStorage,
  writable: true,
});

describe("Utils Functions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("cn (className utility)", () => {
    it("merges class names correctly", () => {
      const result = cn("base-class", "additional-class");
      expect(result).toContain("base-class");
      expect(result).toContain("additional-class");
    });

    it("handles conditional classes", () => {
      const result = cn("base-class", {
        "conditional-class": true,
        "false-class": false,
      });
      expect(result).toContain("base-class");
      expect(result).toContain("conditional-class");
      expect(result).not.toContain("false-class");
    });

    it("handles undefined and null values", () => {
      const result = cn("base-class", undefined, null, "valid-class");
      expect(result).toContain("base-class");
      expect(result).toContain("valid-class");
    });
  });

  describe("localStorage utilities", () => {
    describe("getFromLocalStorage", () => {
      it("returns string when item exists", () => {
        const testData = "test-value";
        mockLocalStorage.getItem.mockReturnValue(testData);

        const result = getFromLocalStorage("test-key");

        expect(mockLocalStorage.getItem).toHaveBeenCalledWith("test-key");
        expect(result).toEqual(testData);
      });

      it("returns null when item does not exist", () => {
        mockLocalStorage.getItem.mockReturnValue(null);

        const result = getFromLocalStorage("nonexistent-key");

        expect(result).toBeNull();
      });

      it("returns string value as-is", () => {
        mockLocalStorage.getItem.mockReturnValue("some-string");

        const result = getFromLocalStorage("test-key");

        expect(result).toBe("some-string");
      });
    });

    describe("setToLocalStorage", () => {
      it("stores string in localStorage", () => {
        const testString = "test-value";

        setToLocalStorage("test-key", testString);

        expect(mockLocalStorage.setItem).toHaveBeenCalledWith("test-key", testString);
      });
    });

    describe("removeFromLocalStorage", () => {
      it("removes item from localStorage", () => {
        removeFromLocalStorage("test-key");

        expect(mockLocalStorage.removeItem).toHaveBeenCalledWith("test-key");
      });
    });
  });
});
