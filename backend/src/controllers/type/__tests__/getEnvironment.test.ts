import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { getEnvironment } from "../environment";

describe("Type Controller - GetEnvironment", () => {
  let originalNodeEnv: string | undefined;

  beforeEach(() => {
    originalNodeEnv = process.env.NODE_ENV;
  });

  afterEach(() => {
    process.env.NODE_ENV = originalNodeEnv;
  });

  it("should return environment information", () => {
    // Act
    const result = getEnvironment();

    // Assert
    expect(result).toBeDefined();
    expect(result).toHaveProperty("environment");
    expect(result).toHaveProperty("timestamp");
  });

  it("should return test environment when NODE_ENV is test", () => {
    // Arrange
    process.env.NODE_ENV = "test";

    // Act
    const result = getEnvironment();

    // Assert
    expect(result.environment).toBe("test");
    expect(typeof result.environment).toBe("string");
  });

  it("should return development as default when NODE_ENV is undefined", () => {
    // Arrange
    delete process.env.NODE_ENV;

    // Act
    const result = getEnvironment();

    // Assert
    expect(result.environment).toBe("development");
  });

  it("should return production environment when NODE_ENV is production", () => {
    // Arrange
    process.env.NODE_ENV = "production";

    // Act
    const result = getEnvironment();

    // Assert
    expect(result.environment).toBe("production");
  });

  it("should return current timestamp in ISO format", () => {
    // Arrange
    const beforeCall = new Date();

    // Act
    const result = getEnvironment();

    // Assert
    const afterCall = new Date();
    const timestamp = new Date(result.timestamp);

    expect(result.timestamp).toBeDefined();
    expect(typeof result.timestamp).toBe("string");

    // Verify it's a valid ISO string
    expect(() => new Date(result.timestamp)).not.toThrow();
    expect(new Date(result.timestamp).toISOString()).toBe(result.timestamp);

    // Verify timestamp is within reasonable range (called between before and after)
    expect(timestamp.getTime()).toBeGreaterThanOrEqual(beforeCall.getTime());
    expect(timestamp.getTime()).toBeLessThanOrEqual(afterCall.getTime());
  });

  it("should return different timestamps on multiple calls", async () => {
    // Act
    const result1 = getEnvironment();

    // Small delay to ensure different timestamps
    await new Promise((resolve) => setTimeout(resolve, 10));

    const result2 = getEnvironment();

    // Assert
    expect(result1.timestamp).not.toBe(result2.timestamp);

    const timestamp1 = new Date(result1.timestamp);
    const timestamp2 = new Date(result2.timestamp);
    expect(timestamp2.getTime()).toBeGreaterThan(timestamp1.getTime());
  });

  it("should handle custom environment values", () => {
    // Test various environment values
    const envValues = ["staging", "local", "ci", "demo", "custom"];

    for (const envValue of envValues) {
      // Arrange
      process.env.NODE_ENV = envValue;

      // Act
      const result = getEnvironment();

      // Assert
      expect(result.environment).toBe(envValue);
    }
  });

  it("should have consistent data types", () => {
    // Act
    const result = getEnvironment();

    // Assert
    expect(typeof result.environment).toBe("string");
    expect(typeof result.timestamp).toBe("string");
    expect(typeof result).toBe("object");
  });

  it("should not expose sensitive information", () => {
    // Act
    const result = getEnvironment();

    // Assert
    const keys = Object.keys(result);
    expect(keys).toHaveLength(2);
    expect(keys).toContain("environment");
    expect(keys).toContain("timestamp");

    // Should not contain sensitive fields
    expect(result).not.toHaveProperty("secretKey");
    expect(result).not.toHaveProperty("database");
    expect(result).not.toHaveProperty("password");
    expect(result).not.toHaveProperty("token");
    expect(result).not.toHaveProperty("process");
    expect(result).not.toHaveProperty("env");
  });

  it("should handle empty string NODE_ENV", () => {
    // Arrange
    process.env.NODE_ENV = "";

    // Act
    const result = getEnvironment();

    // Assert
    expect(result.environment).toBe("development"); // Should fallback to development
  });

  it("should be synchronous function", () => {
    // Act
    const result = getEnvironment();

    // Assert
    expect(result).not.toBeInstanceOf(Promise);
    expect(typeof result).toBe("object");
  });

  it("should generate valid ISO 8601 timestamp", () => {
    // Act
    const result = getEnvironment();

    // Assert
    // ISO 8601 format check (basic)
    expect(result.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
  });

  it("should handle whitespace in NODE_ENV", () => {
    // Arrange
    process.env.NODE_ENV = "  production  ";

    // Act
    const result = getEnvironment();

    // Assert
    expect(result.environment).toBe("  production  "); // Should preserve as-is
  });

  it("should handle case sensitivity in NODE_ENV", () => {
    // Arrange
    process.env.NODE_ENV = "PRODUCTION";

    // Act
    const result = getEnvironment();

    // Assert
    expect(result.environment).toBe("PRODUCTION"); // Should preserve case
  });
});
