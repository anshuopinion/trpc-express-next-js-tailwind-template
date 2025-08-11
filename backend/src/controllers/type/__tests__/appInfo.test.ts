import { describe, expect, it } from "vitest";
import { getAppInfo } from "../appInfo";

describe("Type Controller - GetAppInfo", () => {
  it("should return application information", () => {
    // Act
    const result = getAppInfo();

    // Assert
    expect(result).toBeDefined();
    expect(result).toHaveProperty("name");
    expect(result).toHaveProperty("version");
    expect(result).toHaveProperty("description");

    expect(result.name).toBe("tRPC Template");
    expect(result.version).toBe("1.0.0");
    expect(result.description).toBe("A clean tRPC template with authentication");
  });

  it("should return consistent data types", () => {
    // Act
    const result = getAppInfo();

    // Assert
    expect(typeof result.name).toBe("string");
    expect(typeof result.version).toBe("string");
    expect(typeof result.description).toBe("string");
  });

  it("should return the same data on multiple calls", () => {
    // Act
    const result1 = getAppInfo();
    const result2 = getAppInfo();
    const result3 = getAppInfo();

    // Assert
    expect(result1).toEqual(result2);
    expect(result2).toEqual(result3);
    expect(result1).toEqual(result3);
  });

  it("should have non-empty strings", () => {
    // Act
    const result = getAppInfo();

    // Assert
    expect(result.name.length).toBeGreaterThan(0);
    expect(result.version.length).toBeGreaterThan(0);
    expect(result.description.length).toBeGreaterThan(0);
  });

  it("should have valid version format", () => {
    // Act
    const result = getAppInfo();

    // Assert - Basic semver format check
    expect(result.version).toMatch(/^\d+\.\d+\.\d+$/);
  });

  it("should be synchronous function", () => {
    // Act
    const result = getAppInfo();

    // Assert - Should not be a Promise
    expect(result).not.toBeInstanceOf(Promise);
    expect(typeof result).toBe("object");
  });

  it("should not expose sensitive information", () => {
    // Act
    const result = getAppInfo();

    // Assert - Should only have the expected fields
    const keys = Object.keys(result);
    expect(keys).toHaveLength(3);
    expect(keys).toContain("name");
    expect(keys).toContain("version");
    expect(keys).toContain("description");

    // Should not contain sensitive fields
    expect(result).not.toHaveProperty("secretKey");
    expect(result).not.toHaveProperty("database");
    expect(result).not.toHaveProperty("password");
    expect(result).not.toHaveProperty("token");
  });
});
