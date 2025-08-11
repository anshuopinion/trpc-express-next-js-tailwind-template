import { describe, it, expect } from "vitest";
import { validateEmail } from "../validateEmail";

describe("Type Controller - ValidateEmail", () => {
  it("should validate correct email addresses", () => {
    const validEmails = [
      "user@example.com",
      "test.email@domain.org",
      "user123@test-domain.co.uk",
      "firstname.lastname@company.info",
      "user+tag@domain.net",
      "a@b.co",
      "very.long.email.address@very.long.domain.name.com",
    ];

    for (const email of validEmails) {
      // Act
      const result = validateEmail({ email });

      // Assert
      expect(result.email).toBe(email);
      expect(result.isValid).toBe(true);
    }
  });

  it("should invalidate incorrect email addresses", () => {
    const invalidEmails = [
      "invalid-email",
      "@domain.com",
      "user@",
      "user@domain", // no dot in domain
      "user @domain.com", // space
      "user@domain .com", // space
      "",
      "user.domain.com", // missing @
    ];

    for (const email of invalidEmails) {
      // Act
      const result = validateEmail({ email });

      // Assert
      expect(result.email).toBe(email);
      expect(result.isValid).toBe(false);
    }
  });

  it("should return the original email in response", () => {
    // Arrange
    const testEmail = "test@example.com";

    // Act
    const result = validateEmail({ email: testEmail });

    // Assert
    expect(result.email).toBe(testEmail);
  });

  it("should have consistent response structure", () => {
    // Act
    const result = validateEmail({ email: "test@example.com" });

    // Assert
    expect(result).toHaveProperty("email");
    expect(result).toHaveProperty("isValid");
    expect(typeof result.email).toBe("string");
    expect(typeof result.isValid).toBe("boolean");
  });

  it("should handle edge cases", () => {
    const edgeCases = [
      { email: "user@domain-with-dash.com", expected: true },
      { email: "user123@123domain.com", expected: true },
      { email: "user@domain123.com", expected: true },
      { email: "123@domain.com", expected: true },
      { email: "user@sub.domain.com", expected: true },
      { email: "u@d.c", expected: true }, // Minimal valid email
    ];

    for (const testCase of edgeCases) {
      // Act
      const result = validateEmail({ email: testCase.email });

      // Assert
      expect(result.isValid).toBe(testCase.expected);
    }
  });

  it("should handle special characters correctly", () => {
    const specialCharacterTests = [
      { email: "user+tag@domain.com", expected: true },
      { email: "user-name@domain.com", expected: true },
      { email: "user_name@domain.com", expected: true },
      { email: "user.name@domain.com", expected: true },
      { email: "user#name@domain.com", expected: true }, // Simple regex allows this
      { email: "user$name@domain.com", expected: true }, // Simple regex allows this
      { email: "user&name@domain.com", expected: true }, // Simple regex allows this
    ];

    for (const testCase of specialCharacterTests) {
      // Act
      const result = validateEmail({ email: testCase.email });

      // Assert
      expect(result.isValid).toBe(testCase.expected);
    }
  });

  it("should handle case sensitivity", () => {
    const testCases = [
      "User@Example.Com",
      "USER@DOMAIN.COM",
      "user@domain.com",
      "User.Name@Domain.Org",
    ];

    for (const email of testCases) {
      // Act
      const result = validateEmail({ email });

      // Assert
      expect(result.isValid).toBe(true);
      expect(result.email).toBe(email); // Should preserve original case
    }
  });

  it("should handle international characters", () => {
    const internationalTests = [
      { email: "user@domäin.com", expected: true }, // Umlauts
      { email: "usér@domain.com", expected: true }, // Accented characters
      { email: "user@domain.cø", expected: true }, // International TLD
      { email: "用户@domain.com", expected: true }, // Chinese characters - simple regex allows non-whitespace/@ chars
    ];

    for (const testCase of internationalTests) {
      // Act
      const result = validateEmail({ email: testCase.email });

      // Assert
      expect(result.isValid).toBe(testCase.expected);
    }
  });

  it("should handle whitespace", () => {
    const whitespaceTests = [
      { email: " user@domain.com", expected: false }, // Leading space
      { email: "user@domain.com ", expected: false }, // Trailing space
      { email: " user@domain.com ", expected: false }, // Both spaces
      { email: "user @domain.com", expected: false }, // Space before @
      { email: "user@ domain.com", expected: false }, // Space after @
      { email: "user@domain .com", expected: false }, // Space before .
      { email: "user@domain. com", expected: false }, // Space after .
    ];

    for (const testCase of whitespaceTests) {
      // Act
      const result = validateEmail({ email: testCase.email });

      // Assert
      expect(result.isValid).toBe(testCase.expected);
    }
  });

  it("should handle long email addresses", () => {
    // Create a very long but valid email
    const longLocalPart = "a".repeat(50);
    const longDomainPart = "b".repeat(50);
    const longEmail = `${longLocalPart}@${longDomainPart}.com`;

    // Act
    const result = validateEmail({ email: longEmail });

    // Assert
    expect(result.isValid).toBe(true);
    expect(result.email).toBe(longEmail);
  });

  it("should be a synchronous function", () => {
    // Act
    const result = validateEmail({ email: "test@example.com" });

    // Assert
    expect(result).not.toBeInstanceOf(Promise);
    expect(typeof result).toBe("object");
  });

  it("should handle empty string", () => {
    // Act
    const result = validateEmail({ email: "" });

    // Assert
    expect(result.email).toBe("");
    expect(result.isValid).toBe(false);
  });

  it("should handle multiple @ symbols", () => {
    const multipleAtTests = [
      "user@@domain.com",
      "user@domain@.com",
      "@user@domain.com",
      "user@domain@com",
    ];

    for (const email of multipleAtTests) {
      // Act
      const result = validateEmail({ email });

      // Assert
      expect(result.isValid).toBe(false);
    }
  });

  it("should handle multiple dots correctly", () => {
    const multipleDotTests = [
      { email: "user@domain..com", expected: true }, // Double dot - simple regex allows
      { email: "user..name@domain.com", expected: true }, // Double dot in local part - simple regex allows
      { email: "user@sub.domain.co.uk", expected: true }, // Valid multiple dots
      { email: "user@domain.com.", expected: true }, // Trailing dot - simple regex allows
      { email: ".user@domain.com", expected: true }, // Leading dot - simple regex allows
    ];

    for (const testCase of multipleDotTests) {
      // Act
      const result = validateEmail({ email: testCase.email });

      // Assert
      expect(result.isValid).toBe(testCase.expected);
    }
  });
});
