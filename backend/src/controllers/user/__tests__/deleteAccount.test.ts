import { describe, it, expect, beforeEach } from "vitest";
import { TRPCError } from "@trpc/server";
import { deleteAccount } from "../deleteAccount";
import { UserModel } from "../../../model/user";
import { createTestUser } from "../../../test-utils";

describe("User Controller - DeleteAccount", () => {
  beforeEach(async () => {
    // Clean up database before each test
    await UserModel.deleteMany({});
  });

  it("should successfully delete account with correct password", async () => {
    // Arrange
    const password = "DeletePassword123!";
    const { user } = await createTestUser({
      email: "delete@example.com",
      password,
      first_name: "Delete",
      last_name: "Me",
    });

    // Verify user exists initially
    const initialUser = await UserModel.findById(user.id);
    expect(initialUser).toBeDefined();

    const deleteData = {
      password,
    };

    // Act
    const result = await deleteAccount(deleteData, { id: user.id });

    // Assert
    expect(result).toBeDefined();
    expect(result.message).toBe("Account deleted successfully");

    // Verify user was deleted from database
    const deletedUser = await UserModel.findById(user.id);
    expect(deletedUser).toBeNull();
  });

  it("should throw UNAUTHORIZED error for incorrect password", async () => {
    // Arrange
    const correctPassword = "CorrectPassword123!";
    const { user } = await createTestUser({
      email: "wrongpass@example.com",
      password: correctPassword,
    });

    const deleteData = {
      password: "WrongPassword123!", // Incorrect password
    };

    // Act & Assert
    await expect(deleteAccount(deleteData, { id: user.id })).rejects.toThrow(
      expect.objectContaining({
        code: "UNAUTHORIZED",
        message: "Password is incorrect",
      }),
    );

    // Verify user still exists
    const stillExistingUser = await UserModel.findById(user.id);
    expect(stillExistingUser).toBeDefined();
  });

  it("should throw NOT_FOUND error for non-existent user", async () => {
    // Arrange
    const nonExistentUserId = "507f1f77bcf86cd799439011"; // Valid ObjectId format
    const deleteData = {
      password: "AnyPassword123!",
    };

    // Act & Assert
    await expect(
      deleteAccount(deleteData, { id: nonExistentUserId }),
    ).rejects.toThrow(
      expect.objectContaining({
        code: "NOT_FOUND",
        message: "User not found",
      }),
    );
  });

  it("should throw validation error for empty password", async () => {
    // Arrange
    const { user } = await createTestUser();
    const deleteData = {
      password: "", // Empty password
    };

    // Act & Assert
    await expect(deleteAccount(deleteData, { id: user.id })).rejects.toThrow();

    // Verify user still exists
    const stillExistingUser = await UserModel.findById(user.id);
    expect(stillExistingUser).toBeDefined();
  });

  it("should handle special characters in password", async () => {
    // Arrange
    const specialPassword = "Delete!@#$%^&*()_+{}|:<>?[];',./Password123";
    const { user } = await createTestUser({
      email: "special@example.com",
      password: specialPassword,
    });

    const deleteData = {
      password: specialPassword,
    };

    // Act
    const result = await deleteAccount(deleteData, { id: user.id });

    // Assert
    expect(result.message).toBe("Account deleted successfully");

    // Verify user was deleted
    const deletedUser = await UserModel.findById(user.id);
    expect(deletedUser).toBeNull();
  });

  it("should handle Unicode characters in password", async () => {
    // Arrange
    const unicodePassword = "删除密码Password123!🔐"; // Unicode characters
    const { user } = await createTestUser({
      email: "unicode@example.com",
      password: unicodePassword,
    });

    const deleteData = {
      password: unicodePassword,
    };

    // Act
    const result = await deleteAccount(deleteData, { id: user.id });

    // Assert
    expect(result.message).toBe("Account deleted successfully");

    // Verify user was deleted
    const deletedUser = await UserModel.findById(user.id);
    expect(deletedUser).toBeNull();
  });

  it("should delete user with all associated data", async () => {
    // Arrange
    const password = "CompleteDelete123!";
    const { user } = await createTestUser({
      email: "complete@example.com",
      password,
      first_name: "Complete",
      last_name: "User",
      avatar: "https://example.com/avatar.jpg",
      refresh_token: "some-refresh-token",
      is_email_verified: true,
    });

    const deleteData = {
      password,
    };

    // Verify user exists with all data
    const initialUser = await UserModel.findById(user.id);
    expect(initialUser?.first_name).toBe("Complete");
    expect(initialUser?.avatar).toBe("https://example.com/avatar.jpg");
    expect(initialUser?.refresh_token).toBe("some-refresh-token");

    // Act
    const result = await deleteAccount(deleteData, { id: user.id });

    // Assert
    expect(result.message).toBe("Account deleted successfully");

    // Verify complete deletion
    const deletedUser = await UserModel.findById(user.id);
    expect(deletedUser).toBeNull();
  });

  it("should work with different user roles", async () => {
    // Test with admin user
    const adminPassword = "AdminDelete123!";
    const { user: adminUser } = await createTestUser({
      email: "admin@example.com",
      password: adminPassword,
      role: "admin",
    });

    const deleteData = {
      password: adminPassword,
    };

    // Act
    const result = await deleteAccount(deleteData, { id: adminUser.id });

    // Assert
    expect(result.message).toBe("Account deleted successfully");

    // Verify admin user was deleted
    const deletedAdmin = await UserModel.findById(adminUser.id);
    expect(deletedAdmin).toBeNull();
  });

  it("should handle long passwords", async () => {
    // Arrange
    const longPassword = "a".repeat(200) + "Delete123!"; // Very long password
    const { user } = await createTestUser({
      email: "long@example.com",
      password: longPassword,
    });

    const deleteData = {
      password: longPassword,
    };

    // Act
    const result = await deleteAccount(deleteData, { id: user.id });

    // Assert
    expect(result.message).toBe("Account deleted successfully");

    // Verify user was deleted
    const deletedUser = await UserModel.findById(user.id);
    expect(deletedUser).toBeNull();
  });

  it("should handle minimum password length", async () => {
    // Arrange
    const minPassword = "D123!6"; // Assuming minimum length of 6
    const { user } = await createTestUser({
      email: "min@example.com",
      password: minPassword,
    });

    const deleteData = {
      password: minPassword,
    };

    // Act
    const result = await deleteAccount(deleteData, { id: user.id });

    // Assert
    expect(result.message).toBe("Account deleted successfully");

    // Verify user was deleted
    const deletedUser = await UserModel.findById(user.id);
    expect(deletedUser).toBeNull();
  });

  it("should be irreversible deletion", async () => {
    // Arrange
    const password = "IrreversibleDelete123!";
    const { user } = await createTestUser({
      email: "irreversible@example.com",
      password,
      first_name: "Gone",
      last_name: "Forever",
    });

    const userId = user.id;
    const userEmail = user.email;

    const deleteData = {
      password,
    };

    // Act
    await deleteAccount(deleteData, { id: user.id });

    // Assert - Multiple verification attempts should all return null
    const deletedUser1 = await UserModel.findById(userId);
    const deletedUser2 = await UserModel.findOne({ email: userEmail });
    const deletedUser3 = await UserModel.findOne({ _id: userId });

    expect(deletedUser1).toBeNull();
    expect(deletedUser2).toBeNull();
    expect(deletedUser3).toBeNull();
  });

  it("should handle concurrent deletion attempts gracefully", async () => {
    // Arrange
    const password = "ConcurrentDelete123!";
    const { user } = await createTestUser({
      email: "concurrent@example.com",
      password,
    });

    const deleteData = {
      password,
    };

    // Act - First deletion should succeed
    const result1 = await deleteAccount(deleteData, { id: user.id });
    expect(result1.message).toBe("Account deleted successfully");

    // Act & Assert - Second deletion should fail with NOT_FOUND
    await expect(deleteAccount(deleteData, { id: user.id })).rejects.toThrow(
      expect.objectContaining({
        code: "NOT_FOUND",
        message: "User not found",
      }),
    );
  });

  it("should validate password against current user's password", async () => {
    // Arrange - Create two users with different passwords
    const password1 = "User1Password123!";
    const password2 = "User2Password123!";

    const { user: user1 } = await createTestUser({
      email: "user1@example.com",
      password: password1,
    });

    const { user: user2 } = await createTestUser({
      email: "user2@example.com",
      password: password2,
    });

    // Try to delete user1 with user2's password
    const deleteData = {
      password: password2, // Wrong user's password
    };

    // Act & Assert
    await expect(deleteAccount(deleteData, { id: user1.id })).rejects.toThrow(
      expect.objectContaining({
        code: "UNAUTHORIZED",
        message: "Password is incorrect",
      }),
    );

    // Verify both users still exist
    const stillUser1 = await UserModel.findById(user1.id);
    const stillUser2 = await UserModel.findById(user2.id);
    expect(stillUser1).toBeDefined();
    expect(stillUser2).toBeDefined();
  });
});
