import { beforeEach, describe, expect, it } from "vitest";
import { UserModel } from "../../../model/user";
import { createTestUser } from "../../../test-utils";
import { logout } from "../logout";

describe("Auth Controller - Logout", () => {
  beforeEach(async () => {
    // Clean up database before each test
    await UserModel.deleteMany({});
  });

  it("should successfully logout user and clear refresh token", async () => {
    // Arrange - Create user with refresh token
    const { user } = await createTestUser({
      email: "logout@example.com",
      refresh_token: "existing-refresh-token",
    });

    // Verify user has refresh token initially
    expect(user.refresh_token).toBe("existing-refresh-token");

    // Act
    const result = await logout(user.id);

    // Assert
    expect(result).toBeDefined();
    expect(result.message).toBe("Logged out successfully");

    // Verify refresh token was cleared from database
    const updatedUser = await UserModel.findById(user.id);
    expect(updatedUser?.refresh_token).toBeNull();
  });

  it("should handle logout for user without refresh token", async () => {
    // Arrange - Create user without refresh token
    const { user } = await createTestUser({
      email: "notoken@example.com",
      refresh_token: null,
    });

    // Act
    const result = await logout(user.id);

    // Assert
    expect(result).toBeDefined();
    expect(result.message).toBe("Logged out successfully");

    // Verify user still exists and refresh token remains null
    const updatedUser = await UserModel.findById(user.id);
    expect(updatedUser).toBeDefined();
    expect(updatedUser?.refresh_token).toBeNull();
  });

  it("should handle logout for non-existent user gracefully", async () => {
    // Arrange
    const nonExistentUserId = "507f1f77bcf86cd799439011"; // Valid ObjectId format

    // Act
    const result = await logout(nonExistentUserId);

    // Assert
    expect(result).toBeDefined();
    expect(result.message).toBe("Logged out successfully");
  });

  it("should only update refresh token field", async () => {
    // Arrange - Create user with multiple fields
    const { user } = await createTestUser({
      email: "fieldtest@example.com",
      first_name: "Original",
      last_name: "Name",
      refresh_token: "original-token",
    });

    const originalEmail = user.email;
    const originalFirstName = user.first_name;
    const originalLastName = user.last_name;

    // Act
    await logout(user.id);

    // Assert - Other fields should remain unchanged
    const updatedUser = await UserModel.findById(user.id);
    expect(updatedUser?.email).toBe(originalEmail);
    expect(updatedUser?.first_name).toBe(originalFirstName);
    expect(updatedUser?.last_name).toBe(originalLastName);
    expect(updatedUser?.refresh_token).toBeNull(); // Only this should change
  });

  it("should handle multiple logout calls for same user", async () => {
    // Arrange
    const { user } = await createTestUser({
      email: "multiple@example.com",
      refresh_token: "initial-token",
    });

    // Act - Logout multiple times
    const result1 = await logout(user.id);
    const result2 = await logout(user.id);
    const result3 = await logout(user.id);

    // Assert - All should succeed
    expect(result1.message).toBe("Logged out successfully");
    expect(result2.message).toBe("Logged out successfully");
    expect(result3.message).toBe("Logged out successfully");

    // Verify final state
    const finalUser = await UserModel.findById(user.id);
    expect(finalUser?.refresh_token).toBeNull();
  });

  it("should handle logout with different refresh token values", async () => {
    // Test with various refresh token values
    const testCases = [
      "short-token",
      "very-long-refresh-token-that-might-be-used-in-production-environment",
      "token.with.dots.in.it",
      "token_with_underscores",
      "token-with-dashes",
      "",
    ];

    for (const tokenValue of testCases) {
      // Arrange
      const { user } = await createTestUser({
        email: `test-${tokenValue.replace(/[^a-zA-Z0-9]/g, "")}@example.com`,
        refresh_token: tokenValue,
      });

      // Act
      const result = await logout(user.id);

      // Assert
      expect(result.message).toBe("Logged out successfully");

      const updatedUser = await UserModel.findById(user.id);
      expect(updatedUser?.refresh_token).toBeNull();

      // Clean up for next iteration
      await UserModel.findByIdAndDelete(user.id);
    }
  });
});
