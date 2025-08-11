import { describe, it, expect, beforeEach } from "vitest";
import {
  hashPassword,
  comparePassword,
  hashData,
  updateRefreshToken,
} from "../password";
import { UserModel } from "../../model/user";
import { createTestUser } from "../../test-utils";

describe("Password Service", () => {
  beforeEach(async () => {
    // Clean up database before each test
    await UserModel.deleteMany({});
  });

  describe("hashPassword", () => {
    it("should hash a password", async () => {
      // Arrange
      const plainPassword = "TestPassword123!";

      // Act
      const hashedPassword = await hashPassword(plainPassword);

      // Assert
      expect(hashedPassword).toBeDefined();
      expect(typeof hashedPassword).toBe("string");
      expect(hashedPassword).not.toBe(plainPassword);
      expect(hashedPassword.length).toBeGreaterThan(plainPassword.length);
      expect(hashedPassword).toMatch(/^\$2b\$10\$/); // bcrypt format
    });

    it("should generate different hashes for same password", async () => {
      // Arrange
      const plainPassword = "SamePassword123!";

      // Act
      const hash1 = await hashPassword(plainPassword);
      const hash2 = await hashPassword(plainPassword);

      // Assert
      expect(hash1).not.toBe(hash2); // Different salts should produce different hashes
      expect(hash1).toMatch(/^\$2b\$10\$/);
      expect(hash2).toMatch(/^\$2b\$10\$/);
    });

    it("should hash different passwords differently", async () => {
      // Arrange
      const password1 = "FirstPassword123!";
      const password2 = "SecondPassword456!";

      // Act
      const hash1 = await hashPassword(password1);
      const hash2 = await hashPassword(password2);

      // Assert
      expect(hash1).not.toBe(hash2);
    });

    it("should handle empty string", async () => {
      // Arrange
      const emptyPassword = "";

      // Act
      const hashedPassword = await hashPassword(emptyPassword);

      // Assert
      expect(hashedPassword).toBeDefined();
      expect(hashedPassword).toMatch(/^\$2b\$10\$/);
    });

    it("should handle special characters", async () => {
      // Arrange
      const specialPassword = "Pass!@#$%^&*()_+-={}[]|\\:;\"'<>?,./";

      // Act
      const hashedPassword = await hashPassword(specialPassword);

      // Assert
      expect(hashedPassword).toBeDefined();
      expect(hashedPassword).toMatch(/^\$2b\$10\$/);
      expect(hashedPassword).not.toBe(specialPassword);
    });

    it("should handle very long passwords", async () => {
      // Arrange
      const longPassword = "a".repeat(1000) + "123!";

      // Act
      const hashedPassword = await hashPassword(longPassword);

      // Assert
      expect(hashedPassword).toBeDefined();
      expect(hashedPassword).toMatch(/^\$2b\$10\$/);
    });

    it("should handle Unicode characters", async () => {
      // Arrange
      const unicodePassword = "密码123!🔐";

      // Act
      const hashedPassword = await hashPassword(unicodePassword);

      // Assert
      expect(hashedPassword).toBeDefined();
      expect(hashedPassword).toMatch(/^\$2b\$10\$/);
    });
  });

  describe("comparePassword", () => {
    it("should return true for correct password", async () => {
      // Arrange
      const plainPassword = "CorrectPassword123!";
      const hashedPassword = await hashPassword(plainPassword);

      // Act
      const isMatch = await comparePassword(plainPassword, hashedPassword);

      // Assert
      expect(isMatch).toBe(true);
    });

    it("should return false for incorrect password", async () => {
      // Arrange
      const correctPassword = "CorrectPassword123!";
      const wrongPassword = "WrongPassword456!";
      const hashedPassword = await hashPassword(correctPassword);

      // Act
      const isMatch = await comparePassword(wrongPassword, hashedPassword);

      // Assert
      expect(isMatch).toBe(false);
    });

    it("should handle empty string comparison", async () => {
      // Arrange
      const emptyPassword = "";
      const hashedEmpty = await hashPassword(emptyPassword);

      // Act
      const isMatch = await comparePassword(emptyPassword, hashedEmpty);

      // Assert
      expect(isMatch).toBe(true);
    });

    it("should return false when comparing empty string with non-empty hash", async () => {
      // Arrange
      const password = "SomePassword123!";
      const hashedPassword = await hashPassword(password);

      // Act
      const isMatch = await comparePassword("", hashedPassword);

      // Assert
      expect(isMatch).toBe(false);
    });

    it("should handle special characters correctly", async () => {
      // Arrange
      const specialPassword = "Special!@#$%^&*()123";
      const hashedPassword = await hashPassword(specialPassword);

      // Act
      const isMatch = await comparePassword(specialPassword, hashedPassword);

      // Assert
      expect(isMatch).toBe(true);
    });

    it("should handle Unicode characters correctly", async () => {
      // Arrange
      const unicodePassword = "Unicode密码🔐123!";
      const hashedPassword = await hashPassword(unicodePassword);

      // Act
      const isMatch = await comparePassword(unicodePassword, hashedPassword);

      // Assert
      expect(isMatch).toBe(true);
    });

    it("should be case sensitive", async () => {
      // Arrange
      const password = "CaseSensitive123!";
      const hashedPassword = await hashPassword(password);

      // Act
      const isMatchLower = await comparePassword(
        "casesensitive123!",
        hashedPassword,
      );
      const isMatchUpper = await comparePassword(
        "CASESENSITIVE123!",
        hashedPassword,
      );
      const isMatchCorrect = await comparePassword(
        "CaseSensitive123!",
        hashedPassword,
      );

      // Assert
      expect(isMatchLower).toBe(false);
      expect(isMatchUpper).toBe(false);
      expect(isMatchCorrect).toBe(true);
    });

    it("should handle malformed hashes gracefully", async () => {
      // Arrange
      const password = "TestPassword123!";
      const malformedHash = "not-a-valid-hash";

      // Act
      const isMatch = await comparePassword(password, malformedHash);

      // Assert
      expect(isMatch).toBe(false);
    });
  });

  describe("hashData", () => {
    it("should hash arbitrary data", async () => {
      // Arrange
      const data = "some-data-to-hash";

      // Act
      const hashedData = await hashData(data);

      // Assert
      expect(hashedData).toBeDefined();
      expect(typeof hashedData).toBe("string");
      expect(hashedData).not.toBe(data);
      expect(hashedData.length).toBeGreaterThan(data.length);
      expect(hashedData).toMatch(/^\$2b\$10\$/);
    });

    it("should generate different hashes for same data", async () => {
      // Arrange
      const data = "same-data";

      // Act
      const hash1 = await hashData(data);
      const hash2 = await hashData(data);

      // Assert
      expect(hash1).not.toBe(hash2); // Different salts
      expect(hash1).toMatch(/^\$2b\$10\$/);
      expect(hash2).toMatch(/^\$2b\$10\$/);
    });

    it("should handle JWT tokens", async () => {
      // Arrange
      const jwtToken =
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxMjMiLCJlbWFpbCI6InRlc3RAZXhhbXBsZS5jb20ifQ.hash";

      // Act
      const hashedToken = await hashData(jwtToken);

      // Assert
      expect(hashedToken).toBeDefined();
      expect(hashedToken).not.toBe(jwtToken);
      expect(hashedToken).toMatch(/^\$2b\$10\$/);
    });

    it("should handle empty string", async () => {
      // Arrange
      const emptyData = "";

      // Act
      const hashedData = await hashData(emptyData);

      // Assert
      expect(hashedData).toBeDefined();
      expect(hashedData).toMatch(/^\$2b\$10\$/);
    });
  });

  describe("updateRefreshToken", () => {
    it("should update user's refresh token in database", async () => {
      // Arrange
      const { user } = await createTestUser({
        email: "refresh@example.com",
        refresh_token: null,
      });
      const newRefreshToken = "new-refresh-token-123";

      // Act
      await updateRefreshToken(user.id, newRefreshToken);

      // Assert
      const updatedUser = await UserModel.findById(user.id);
      expect(updatedUser?.refresh_token).toBeDefined();
      expect(updatedUser?.refresh_token).not.toBe(newRefreshToken); // Should be hashed
      expect(updatedUser?.refresh_token).toMatch(/^\$2b\$10\$/);

      // Verify the hashed token can be compared correctly
      const isMatch = await comparePassword(
        newRefreshToken,
        updatedUser?.refresh_token || "",
      );
      expect(isMatch).toBe(true);
    });

    it("should replace existing refresh token", async () => {
      // Arrange
      const oldToken = "old-refresh-token";
      const { user } = await createTestUser({
        email: "replace@example.com",
        refresh_token: await hashData(oldToken),
      });
      const newRefreshToken = "new-refresh-token-456";

      // Act
      await updateRefreshToken(user.id, newRefreshToken);

      // Assert
      const updatedUser = await UserModel.findById(user.id);
      expect(updatedUser?.refresh_token).toBeDefined();

      // Old token should not match
      const oldMatches = await comparePassword(
        oldToken,
        updatedUser?.refresh_token || "",
      );
      expect(oldMatches).toBe(false);

      // New token should match
      const newMatches = await comparePassword(
        newRefreshToken,
        updatedUser?.refresh_token || "",
      );
      expect(newMatches).toBe(true);
    });

    it("should handle non-existent user gracefully", async () => {
      // Arrange
      const nonExistentUserId = "507f1f77bcf86cd799439011"; // Valid ObjectId format
      const refreshToken = "some-token";

      // Act & Assert - Should not throw an error
      await expect(
        updateRefreshToken(nonExistentUserId, refreshToken),
      ).resolves.not.toThrow();
    });

    it("should handle empty refresh token", async () => {
      // Arrange
      const { user } = await createTestUser({
        email: "empty@example.com",
      });
      const emptyToken = "";

      // Act
      await updateRefreshToken(user.id, emptyToken);

      // Assert
      const updatedUser = await UserModel.findById(user.id);
      expect(updatedUser?.refresh_token).toBeDefined();
      expect(updatedUser?.refresh_token).toMatch(/^\$2b\$10\$/);

      // Empty token should match
      const isMatch = await comparePassword(
        emptyToken,
        updatedUser?.refresh_token || "",
      );
      expect(isMatch).toBe(true);
    });

    it("should handle JWT refresh tokens", async () => {
      // Arrange
      const { user } = await createTestUser({
        email: "jwt@example.com",
      });
      const jwtRefreshToken =
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxMjMifQ.signature";

      // Act
      await updateRefreshToken(user.id, jwtRefreshToken);

      // Assert
      const updatedUser = await UserModel.findById(user.id);
      expect(updatedUser?.refresh_token).toBeDefined();
      expect(updatedUser?.refresh_token).not.toBe(jwtRefreshToken);
      expect(updatedUser?.refresh_token).toMatch(/^\$2b\$10\$/);

      // JWT token should match when compared
      const isMatch = await comparePassword(
        jwtRefreshToken,
        updatedUser?.refresh_token || "",
      );
      expect(isMatch).toBe(true);
    });

    it("should handle multiple updates for same user", async () => {
      // Arrange
      const { user } = await createTestUser({
        email: "multiple@example.com",
      });

      const tokens = ["token1", "token2", "token3"];

      // Act - Update multiple times
      for (const token of tokens) {
        await updateRefreshToken(user.id, token);

        // Assert after each update
        const updatedUser = await UserModel.findById(user.id);
        const isMatch = await comparePassword(
          token,
          updatedUser?.refresh_token || "",
        );
        expect(isMatch).toBe(true);
      }

      // Final verification - only last token should match
      const finalUser = await UserModel.findById(user.id);
      const lastTokenMatches = await comparePassword(
        "token3",
        finalUser?.refresh_token || "",
      );
      const firstTokenMatches = await comparePassword(
        "token1",
        finalUser?.refresh_token || "",
      );

      expect(lastTokenMatches).toBe(true);
      expect(firstTokenMatches).toBe(false);
    });
  });

  describe("Integration tests", () => {
    it("should work with full password flow", async () => {
      // Arrange
      const plainPassword = "IntegrationTest123!";

      // Act - Hash password
      const hashedPassword = await hashPassword(plainPassword);

      // Act - Verify correct password
      const correctComparison = await comparePassword(
        plainPassword,
        hashedPassword,
      );

      // Act - Verify incorrect password
      const incorrectComparison = await comparePassword(
        "WrongPassword!",
        hashedPassword,
      );

      // Assert
      expect(correctComparison).toBe(true);
      expect(incorrectComparison).toBe(false);
    });

    it("should work with refresh token flow", async () => {
      // Arrange
      const { user } = await createTestUser({
        email: "integration@example.com",
      });
      const refreshToken = "integration-refresh-token";

      // Act - Update refresh token
      await updateRefreshToken(user.id, refreshToken);

      // Act - Retrieve and verify
      const updatedUser = await UserModel.findById(user.id);
      const tokenMatches = await comparePassword(
        refreshToken,
        updatedUser?.refresh_token || "",
      );

      // Assert
      expect(tokenMatches).toBe(true);
    });
  });
});
