import { describe, it, expect, beforeEach } from "vitest";
import { TRPCError } from "@trpc/server";
import { deleteUser } from "../deleteUser";
import { UserModel } from "../../../model/user";
import { createTestUser } from "../../../test-utils";

describe("Admin Controller - DeleteUser", () => {
  beforeEach(async () => {
    // Clean up database before each test
    await UserModel.deleteMany({});
  });

  it("should successfully delete a user", async () => {
    // Arrange
    const { user: adminUser } = await createTestUser({
      email: "admin@example.com",
      role: "admin",
    });

    const { user: targetUser } = await createTestUser({
      email: "target@example.com",
      role: "user",
      first_name: "Target",
      last_name: "User",
    });

    // Verify user exists initially
    const initialUser = await UserModel.findById(targetUser.id);
    expect(initialUser).toBeDefined();

    const input = {
      userId: targetUser.id,
    };

    // Act
    const result = await deleteUser(input, { id: adminUser.id });

    // Assert
    expect(result).toBeDefined();
    expect(result.success).toBe(true);
    expect(result.message).toBe("User deleted successfully");
    expect(result.deletedUser).toBeDefined();
    expect(result.deletedUser.id).toBe(targetUser.id);
    expect(result.deletedUser.email).toBe(targetUser.email);
    expect(result.deletedUser.first_name).toBe("Target");
    expect(result.deletedUser.last_name).toBe("User");

    // Verify user was actually deleted from database
    const deletedUser = await UserModel.findById(targetUser.id);
    expect(deletedUser).toBeNull();
  });

  it("should successfully delete an admin user", async () => {
    // Arrange
    const { user: adminUser } = await createTestUser({
      email: "admin@example.com",
      role: "admin",
    });

    const { user: targetAdmin } = await createTestUser({
      email: "target-admin@example.com",
      role: "admin",
      first_name: "Target",
      last_name: "Admin",
    });

    const input = {
      userId: targetAdmin.id,
    };

    // Act
    const result = await deleteUser(input, { id: adminUser.id });

    // Assert
    expect(result.success).toBe(true);
    expect(result.deletedUser.id).toBe(targetAdmin.id);

    // Verify admin was deleted
    const deletedAdmin = await UserModel.findById(targetAdmin.id);
    expect(deletedAdmin).toBeNull();
  });

  it("should throw BAD_REQUEST error when admin tries to delete own account", async () => {
    // Arrange
    const { user: adminUser } = await createTestUser({
      email: "admin@example.com",
      role: "admin",
    });

    const input = {
      userId: adminUser.id, // Admin trying to delete own account
    };

    // Act & Assert
    await expect(deleteUser(input, { id: adminUser.id })).rejects.toThrow(
      expect.objectContaining({
        code: "BAD_REQUEST",
        message: "You cannot delete your own account",
      }),
    );

    // Verify admin account still exists
    const stillExistingAdmin = await UserModel.findById(adminUser.id);
    expect(stillExistingAdmin).toBeDefined();
  });

  it("should throw NOT_FOUND error for non-existent user", async () => {
    // Arrange
    const { user: adminUser } = await createTestUser({
      email: "admin@example.com",
      role: "admin",
    });

    const nonExistentUserId = "507f1f77bcf86cd799439011"; // Valid ObjectId format

    const input = {
      userId: nonExistentUserId,
    };

    // Act & Assert
    await expect(deleteUser(input, { id: adminUser.id })).rejects.toThrow(
      expect.objectContaining({
        code: "NOT_FOUND",
        message: "User not found",
      }),
    );
  });

  it("should throw validation error for empty userId", async () => {
    // Arrange
    const { user: adminUser } = await createTestUser({
      role: "admin",
    });

    const input = {
      userId: "", // Empty userId
    };

    // Act & Assert
    await expect(deleteUser(input, { id: adminUser.id })).rejects.toThrow();
  });

  it("should return user information before deletion", async () => {
    // Arrange
    const { user: adminUser } = await createTestUser({
      email: "admin@example.com",
      role: "admin",
    });

    const { user: targetUser } = await createTestUser({
      email: "detailed@example.com",
      role: "user",
      first_name: "Detailed",
      last_name: "User",
      avatar: "https://example.com/avatar.jpg",
    });

    const input = {
      userId: targetUser.id,
    };

    // Act
    const result = await deleteUser(input, { id: adminUser.id });

    // Assert - Should return user info as it was before deletion
    expect(result.deletedUser).toEqual({
      id: targetUser.id,
      email: "detailed@example.com",
      first_name: "Detailed",
      last_name: "User",
    });

    // Should not expose sensitive fields
    expect(result.deletedUser).not.toHaveProperty("password");
    expect(result.deletedUser).not.toHaveProperty("refresh_token");
    expect(result.deletedUser).not.toHaveProperty("avatar"); // Not included in response
    expect(result.deletedUser).not.toHaveProperty("role");
  });

  it("should handle deletion with various user data", async () => {
    // Arrange
    const { user: adminUser } = await createTestUser({
      role: "admin",
    });

    const { user: targetUser } = await createTestUser({
      email: "complete@example.com",
      first_name: "Complete",
      last_name: "User",
      avatar: "https://example.com/avatar.jpg",
      refresh_token: "some-token",
      is_email_verified: true,
    });

    const input = {
      userId: targetUser.id,
    };

    // Act
    const result = await deleteUser(input, { id: adminUser.id });

    // Assert
    expect(result.success).toBe(true);

    // Verify all user data was deleted
    const deletedUser = await UserModel.findById(targetUser.id);
    expect(deletedUser).toBeNull();
  });

  it("should work with different admin users", async () => {
    // Arrange
    const { user: admin1 } = await createTestUser({
      email: "admin1@example.com",
      role: "admin",
    });

    const { user: admin2 } = await createTestUser({
      email: "admin2@example.com",
      role: "admin",
    });

    const { user: targetUser } = await createTestUser({
      email: "target@example.com",
      role: "user",
    });

    // Admin1 deletes target user
    const input = {
      userId: targetUser.id,
    };

    // Act
    const result = await deleteUser(input, { id: admin1.id });

    // Assert
    expect(result.success).toBe(true);

    // Verify deletion worked
    const deletedUser = await UserModel.findById(targetUser.id);
    expect(deletedUser).toBeNull();

    // Admin2 should still exist
    const stillExistingAdmin2 = await UserModel.findById(admin2.id);
    expect(stillExistingAdmin2).toBeDefined();
  });

  it("should handle concurrent deletion attempts gracefully", async () => {
    // Arrange
    const { user: adminUser } = await createTestUser({
      role: "admin",
    });

    const { user: targetUser } = await createTestUser({
      email: "concurrent@example.com",
      role: "user",
    });

    const input = {
      userId: targetUser.id,
    };

    // Act - First deletion should succeed
    const result1 = await deleteUser(input, { id: adminUser.id });
    expect(result1.success).toBe(true);

    // Act & Assert - Second deletion should fail with NOT_FOUND
    await expect(deleteUser(input, { id: adminUser.id })).rejects.toThrow(
      expect.objectContaining({
        code: "NOT_FOUND",
        message: "User not found",
      }),
    );
  });

  it("should handle self-prevention with string comparison", async () => {
    // Arrange
    const { user: adminUser } = await createTestUser({
      role: "admin",
    });

    const input = {
      userId: adminUser.id.toString(), // Ensure string comparison works
    };

    // Act & Assert
    await expect(
      deleteUser(input, { id: adminUser.id.toString() }),
    ).rejects.toThrow(
      expect.objectContaining({
        code: "BAD_REQUEST",
        message: "You cannot delete your own account",
      }),
    );
  });

  it("should delete user with special characters in name", async () => {
    // Arrange
    const { user: adminUser } = await createTestUser({
      role: "admin",
    });

    const { user: targetUser } = await createTestUser({
      email: "special@example.com",
      first_name: "José María",
      last_name: "O'Connor-Smith",
    });

    const input = {
      userId: targetUser.id,
    };

    // Act
    const result = await deleteUser(input, { id: adminUser.id });

    // Assert
    expect(result.success).toBe(true);
    expect(result.deletedUser.first_name).toBe("José María");
    expect(result.deletedUser.last_name).toBe("O'Connor-Smith");

    // Verify deletion
    const deletedUser = await UserModel.findById(targetUser.id);
    expect(deletedUser).toBeNull();
  });

  it("should handle edge case with ObjectId string formats", async () => {
    // Arrange
    const { user: adminUser } = await createTestUser({
      role: "admin",
    });

    const { user: targetUser } = await createTestUser({
      role: "user",
    });

    // Use string representation of ObjectId
    const input = {
      userId: targetUser.id.toString(),
    };

    // Act
    const result = await deleteUser(input, { id: adminUser.id });

    // Assert
    expect(result.success).toBe(true);
    expect(result.deletedUser.id).toBe(targetUser.id);

    // Verify deletion
    const deletedUser = await UserModel.findById(targetUser.id);
    expect(deletedUser).toBeNull();
  });

  it("should be irreversible deletion", async () => {
    // Arrange
    const { user: adminUser } = await createTestUser({
      role: "admin",
    });

    const { user: targetUser } = await createTestUser({
      email: "irreversible@example.com",
      first_name: "Gone",
      last_name: "Forever",
    });

    const userId = targetUser.id;
    const userEmail = targetUser.email;

    const input = {
      userId,
    };

    // Act
    await deleteUser(input, { id: adminUser.id });

    // Assert - Multiple verification attempts should all return null
    const deletedUser1 = await UserModel.findById(userId);
    const deletedUser2 = await UserModel.findOne({ email: userEmail });
    const deletedUser3 = await UserModel.findOne({ _id: userId });

    expect(deletedUser1).toBeNull();
    expect(deletedUser2).toBeNull();
    expect(deletedUser3).toBeNull();
  });

  it("should include all required response fields", async () => {
    // Arrange
    const { user: adminUser } = await createTestUser({
      role: "admin",
    });

    const { user: targetUser } = await createTestUser({
      email: "response@example.com",
      first_name: "Response",
      last_name: "Test",
    });

    const input = {
      userId: targetUser.id,
    };

    // Act
    const result = await deleteUser(input, { id: adminUser.id });

    // Assert - Check response structure
    expect(result).toHaveProperty("success");
    expect(result).toHaveProperty("message");
    expect(result).toHaveProperty("deletedUser");

    expect(result.deletedUser).toHaveProperty("id");
    expect(result.deletedUser).toHaveProperty("email");
    expect(result.deletedUser).toHaveProperty("first_name");
    expect(result.deletedUser).toHaveProperty("last_name");

    expect(typeof result.success).toBe("boolean");
    expect(typeof result.message).toBe("string");
    expect(typeof result.deletedUser.id).toBe("string");
    expect(typeof result.deletedUser.email).toBe("string");
  });
});
