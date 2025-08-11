import { describe, it, expect, beforeEach } from "vitest";
import { TRPCError } from "@trpc/server";
import { refreshToken } from "../refresh";
import { UserModel } from "../../../model/user";
import { createTestUser } from "../../../test-utils";
import { hashPassword } from "../../../services/password";

describe("Auth Controller - RefreshToken", () => {
  beforeEach(async () => {
    // Clean up database before each test
    await UserModel.deleteMany({});
  });

  it("should successfully refresh tokens with valid refresh token", async () => {
    // Arrange
    const rawRefreshToken = "valid-refresh-token-123";
    const hashedRefreshToken = await hashPassword(rawRefreshToken);

    const { user } = await createTestUser({
      email: "refresh@example.com",
      refresh_token: hashedRefreshToken,
    });

    const refreshData = {
      userId: user.id,
      refreshToken: rawRefreshToken,
    };

    // Act
    const result = await refreshToken(refreshData);

    // Assert
    expect(result).toBeDefined();
    expect(result.id).toBe(user.id);
    expect(result.email).toBe(user.email);
    expect(result.first_name).toBe(user.first_name);
    expect(result.last_name).toBe(user.last_name);
    expect(result.role).toBe(user.role);
    expect(result.access_token).toBeDefined();
    expect(result.refresh_token).toBeDefined();
    expect(result.expires_at).toBeDefined();

    // Verify new refresh token was stored in database (hashed)
    const updatedUser = await UserModel.findById(user.id);
    expect(updatedUser?.refresh_token).toBeDefined();
    expect(updatedUser?.refresh_token).not.toBe(hashedRefreshToken); // Should be new hashed token
    expect(updatedUser?.refresh_token).not.toBe(result.refresh_token); // Should be hashed, not raw JWT
  });

  it("should throw UNAUTHORIZED error for non-existent user", async () => {
    // Arrange
    const nonExistentUserId = "507f1f77bcf86cd799439011"; // Valid ObjectId format
    const refreshData = {
      userId: nonExistentUserId,
      refreshToken: "any-token",
    };

    // Act & Assert
    await expect(refreshToken(refreshData)).rejects.toThrow(
      expect.objectContaining({
        code: "UNAUTHORIZED",
        message: "Invalid refresh token",
      }),
    );
  });

  it("should throw UNAUTHORIZED error for invalid refresh token", async () => {
    // Arrange
    const validRefreshToken = "valid-token-123";
    const hashedValidToken = await hashPassword(validRefreshToken);

    const { user } = await createTestUser({
      email: "invalid@example.com",
      refresh_token: hashedValidToken,
    });

    const refreshData = {
      userId: user.id,
      refreshToken: "wrong-refresh-token", // Different token
    };

    // Act & Assert
    await expect(refreshToken(refreshData)).rejects.toThrow(
      expect.objectContaining({
        code: "UNAUTHORIZED",
        message: "Invalid refresh token",
      }),
    );
  });

  it("should throw UNAUTHORIZED error when user has null refresh token", async () => {
    // Arrange
    const { user } = await createTestUser({
      email: "nulltoken@example.com",
      refresh_token: null,
    });

    const refreshData = {
      userId: user.id,
      refreshToken: "any-token",
    };

    // Act & Assert
    await expect(refreshToken(refreshData)).rejects.toThrow(
      expect.objectContaining({
        code: "UNAUTHORIZED",
        message: "Invalid refresh token",
      }),
    );
  });

  it("should throw validation error for empty userId", async () => {
    // Arrange
    const refreshData = {
      userId: "", // Empty userId
      refreshToken: "some-token",
    };

    // Act & Assert
    await expect(refreshToken(refreshData)).rejects.toThrow();
  });

  it("should throw validation error for empty refreshToken", async () => {
    // Arrange
    const refreshData = {
      userId: "507f1f77bcf86cd799439011",
      refreshToken: "", // Empty refresh token
    };

    // Act & Assert
    await expect(refreshToken(refreshData)).rejects.toThrow();
  });

  it("should generate new tokens with different values", async () => {
    // Arrange
    const rawRefreshToken = "original-token-456";
    const hashedRefreshToken = await hashPassword(rawRefreshToken);

    const { user } = await createTestUser({
      email: "newtoken@example.com",
      refresh_token: hashedRefreshToken,
    });

    const refreshData = {
      userId: user.id,
      refreshToken: rawRefreshToken,
    };

    // Act
    const result = await refreshToken(refreshData);

    // Assert
    expect(result.access_token).toBeDefined();
    expect(result.refresh_token).toBeDefined();
    expect(result.refresh_token).not.toBe(rawRefreshToken); // Should be new token
    expect(result.expires_at).toBeDefined();
    expect(typeof result.expires_at).toBe("number");
    expect(result.expires_at).toBeGreaterThan(Math.floor(Date.now() / 1000));
  });

  it("should work with different user roles", async () => {
    // Test with admin user
    const adminRefreshToken = "admin-refresh-token";
    const hashedAdminToken = await hashPassword(adminRefreshToken);

    const { user: adminUser } = await createTestUser({
      email: "admin@example.com",
      role: "admin",
      refresh_token: hashedAdminToken,
    });

    const adminRefreshData = {
      userId: adminUser.id,
      refreshToken: adminRefreshToken,
    };

    // Act
    const adminResult = await refreshToken(adminRefreshData);

    // Assert
    expect(adminResult.role).toBe("admin");
    expect(adminResult.access_token).toBeDefined();
    expect(adminResult.refresh_token).toBeDefined();
  });

  it("should handle special characters in refresh token", async () => {
    // Arrange
    const specialRefreshToken = "token!@#$%^&*()_+-={}[]|\\:;\"'<>?,./";
    const hashedSpecialToken = await hashPassword(specialRefreshToken);

    const { user } = await createTestUser({
      email: "special@example.com",
      refresh_token: hashedSpecialToken,
    });

    const refreshData = {
      userId: user.id,
      refreshToken: specialRefreshToken,
    };

    // Act
    const result = await refreshToken(refreshData);

    // Assert
    expect(result).toBeDefined();
    expect(result.access_token).toBeDefined();
    expect(result.refresh_token).toBeDefined();
  });

  it("should update database with new refresh token", async () => {
    // Arrange
    const originalRefreshToken = "original-token-789";
    const hashedOriginalToken = await hashPassword(originalRefreshToken);

    const { user } = await createTestUser({
      email: "update@example.com",
      refresh_token: hashedOriginalToken,
    });

    const refreshData = {
      userId: user.id,
      refreshToken: originalRefreshToken,
    };

    // Get original refresh token hash
    const userBeforeRefresh = await UserModel.findById(user.id);
    const originalHash = userBeforeRefresh?.refresh_token;

    // Act
    const result = await refreshToken(refreshData);

    // Assert
    const userAfterRefresh = await UserModel.findById(user.id);
    expect(userAfterRefresh?.refresh_token).toBeDefined();
    expect(userAfterRefresh?.refresh_token).not.toBe(originalHash);
    expect(userAfterRefresh?.refresh_token).not.toBe(result.refresh_token); // Should be hashed, not raw JWT
  });

  it("should return complete user information", async () => {
    // Arrange
    const refreshTokenValue = "complete-info-token";
    const hashedToken = await hashPassword(refreshTokenValue);

    const { user } = await createTestUser({
      email: "complete@example.com",
      first_name: "Complete",
      last_name: "User",
      refresh_token: hashedToken,
    });

    const refreshData = {
      userId: user.id,
      refreshToken: refreshTokenValue,
    };

    // Act
    const result = await refreshToken(refreshData);

    // Assert - Check all expected fields
    expect(result).toHaveProperty("id");
    expect(result).toHaveProperty("email");
    expect(result).toHaveProperty("first_name");
    expect(result).toHaveProperty("last_name");
    expect(result).toHaveProperty("role");
    expect(result).toHaveProperty("access_token");
    expect(result).toHaveProperty("refresh_token");
    expect(result).toHaveProperty("expires_at");

    // Verify values
    expect(result.id).toBe(user.id);
    expect(result.email).toBe(user.email);
    expect(result.first_name).toBe(user.first_name);
    expect(result.last_name).toBe(user.last_name);
    expect(result.role).toBe(user.role);
  });
});
