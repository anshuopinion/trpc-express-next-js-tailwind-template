import { beforeEach, describe, expect, it } from "vitest";
import { UserModel } from "../../../model/user";
import { createTestUser } from "../../../test-utils";
import { updateUserRole } from "../updateUserRole";

describe("Admin Controller - UpdateUserRole", () => {
  beforeEach(async () => {
    // Clean up database before each test
    await UserModel.deleteMany({});
  });

  it("should successfully update user role from user to admin", async () => {
    // Arrange
    const { user: adminUser } = await createTestUser({
      email: "admin@example.com",
      role: "admin",
    });

    const { user: regularUser } = await createTestUser({
      email: "user@example.com",
      role: "user",
    });

    const input = {
      userId: regularUser.id,
      role: "admin" as const,
    };

    // Act
    const result = await updateUserRole(input, { id: adminUser.id });

    // Assert
    expect(result).toBeDefined();
    expect(result.id).toBe(regularUser.id);
    expect(result.email).toBe(regularUser.email);
    expect(result.role).toBe("admin");
    expect(result.first_name).toBe(regularUser.first_name);
    expect(result.last_name).toBe(regularUser.last_name);
    expect(result.is_email_verified).toBe(regularUser.is_email_verified);

    // Verify role was updated in database
    const updatedUser = await UserModel.findById(regularUser.id);
    expect(updatedUser?.role).toBe("admin");
  });

  it("should successfully update user role from admin to user", async () => {
    // Arrange
    const { user: adminUser } = await createTestUser({
      email: "admin@example.com",
      role: "admin",
    });

    const { user: targetAdmin } = await createTestUser({
      email: "target@example.com",
      role: "admin",
    });

    const input = {
      userId: targetAdmin.id,
      role: "user" as const,
    };

    // Act
    const result = await updateUserRole(input, { id: adminUser.id });

    // Assert
    expect(result.role).toBe("user");

    // Verify role was updated in database
    const updatedUser = await UserModel.findById(targetAdmin.id);
    expect(updatedUser?.role).toBe("user");
  });

  it("should throw BAD_REQUEST error when admin tries to change own role", async () => {
    // Arrange
    const { user: adminUser } = await createTestUser({
      email: "admin@example.com",
      role: "admin",
    });

    const input = {
      userId: adminUser.id, // Admin trying to change own role
      role: "user" as const,
    };

    // Act & Assert
    await expect(updateUserRole(input, { id: adminUser.id })).rejects.toThrow(
      expect.objectContaining({
        code: "BAD_REQUEST",
        message: "You cannot change your own role",
      })
    );

    // Verify role was not changed
    const unchangedUser = await UserModel.findById(adminUser.id);
    expect(unchangedUser?.role).toBe("admin");
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
      role: "admin" as const,
    };

    // Act & Assert
    await expect(updateUserRole(input, { id: adminUser.id })).rejects.toThrow(
      expect.objectContaining({
        code: "NOT_FOUND",
        message: "User not found",
      })
    );
  });

  it("should throw validation error for empty userId", async () => {
    // Arrange
    const { user: adminUser } = await createTestUser({
      role: "admin",
    });

    const input = {
      userId: "", // Empty userId
      role: "admin" as const,
    };

    // Act & Assert
    await expect(updateUserRole(input, { id: adminUser.id })).rejects.toThrow();
  });

  it("should throw validation error for invalid role", async () => {
    // Arrange
    const { user: adminUser } = await createTestUser({
      role: "admin",
    });

    const { user: targetUser } = await createTestUser({
      role: "user",
    });

    const input = {
      userId: targetUser.id,
      role: "invalid_role" as "user" | "admin", // Invalid role
    };

    // Act & Assert
    await expect(updateUserRole(input, { id: adminUser.id })).rejects.toThrow();
  });

  it("should not expose sensitive fields in response", async () => {
    // Arrange
    const { user: adminUser } = await createTestUser({
      email: "admin@example.com",
      role: "admin",
    });

    const { user: targetUser } = await createTestUser({
      email: "target@example.com",
      role: "user",
      password: "SensitivePassword123!",
      refresh_token: "sensitive-token",
    });

    const input = {
      userId: targetUser.id,
      role: "admin" as const,
    };

    // Act
    const result = await updateUserRole(input, { id: adminUser.id });

    // Assert - Should not contain sensitive fields
    expect(result).not.toHaveProperty("password");
    expect(result).not.toHaveProperty("refresh_token");
    expect(result).not.toHaveProperty("verify_token");

    // Should have safe fields
    expect(result).toHaveProperty("id");
    expect(result).toHaveProperty("email");
    expect(result).toHaveProperty("first_name");
    expect(result).toHaveProperty("last_name");
    expect(result).toHaveProperty("role");
    expect(result).toHaveProperty("is_email_verified");
  });

  it("should preserve other user fields when updating role", async () => {
    // Arrange
    const { user: adminUser } = await createTestUser({
      email: "admin@example.com",
      role: "admin",
    });

    const { user: targetUser } = await createTestUser({
      email: "preserve@example.com",
      role: "user",
      first_name: "Original",
      last_name: "User",
      avatar: "original-avatar.jpg",
      is_email_verified: true,
    });

    const originalValues = {
      email: targetUser.email,
      first_name: targetUser.first_name,
      last_name: targetUser.last_name,
      avatar: targetUser.avatar,
      is_email_verified: targetUser.is_email_verified,
    };

    const input = {
      userId: targetUser.id,
      role: "admin" as const,
    };

    // Act
    await updateUserRole(input, { id: adminUser.id });

    // Assert - Other fields should remain unchanged
    const updatedUser = await UserModel.findById(targetUser.id);
    expect(updatedUser?.email).toBe(originalValues.email);
    expect(updatedUser?.first_name).toBe(originalValues.first_name);
    expect(updatedUser?.last_name).toBe(originalValues.last_name);
    expect(updatedUser?.avatar).toBe(originalValues.avatar);
    expect(updatedUser?.is_email_verified).toBe(originalValues.is_email_verified);

    // Only role should change
    expect(updatedUser?.role).toBe("admin");
  });

  it("should handle updating user role to same role (idempotent)", async () => {
    // Arrange
    const { user: adminUser } = await createTestUser({
      email: "admin@example.com",
      role: "admin",
    });

    const { user: targetUser } = await createTestUser({
      email: "target@example.com",
      role: "admin", // Already admin
    });

    const input = {
      userId: targetUser.id,
      role: "admin" as const, // Same role
    };

    // Act
    const result = await updateUserRole(input, { id: adminUser.id });

    // Assert
    expect(result.role).toBe("admin");

    // Verify role remains the same
    const unchangedUser = await UserModel.findById(targetUser.id);
    expect(unchangedUser?.role).toBe("admin");
  });

  it("should work with different admin users", async () => {
    // Arrange - Multiple admins
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

    // Admin1 updates target user
    const input = {
      userId: targetUser.id,
      role: "admin" as const,
    };

    // Act
    const result = await updateUserRole(input, { id: admin1.id });

    // Assert
    expect(result.role).toBe("admin");

    // Now Admin2 can change the user back
    const revertInput = {
      userId: targetUser.id,
      role: "user" as const,
    };

    const revertResult = await updateUserRole(revertInput, { id: admin2.id });
    expect(revertResult.role).toBe("user");
  });

  it("should handle multiple role updates for same user", async () => {
    // Arrange
    const { user: adminUser } = await createTestUser({
      email: "admin@example.com",
      role: "admin",
    });

    const { user: targetUser } = await createTestUser({
      email: "target@example.com",
      role: "user",
    });

    // Act - Multiple role changes
    // user -> admin
    let result = await updateUserRole(
      { userId: targetUser.id, role: "admin" },
      { id: adminUser.id }
    );
    expect(result.role).toBe("admin");

    // admin -> user
    result = await updateUserRole({ userId: targetUser.id, role: "user" }, { id: adminUser.id });
    expect(result.role).toBe("user");

    // user -> admin again
    result = await updateUserRole({ userId: targetUser.id, role: "admin" }, { id: adminUser.id });
    expect(result.role).toBe("admin");

    // Verify final state in database
    const finalUser = await UserModel.findById(targetUser.id);
    expect(finalUser?.role).toBe("admin");
  });

  it("should return complete user information after role update", async () => {
    // Arrange
    const { user: adminUser } = await createTestUser({
      email: "admin@example.com",
      role: "admin",
    });

    const { user: targetUser } = await createTestUser({
      email: "complete@example.com",
      role: "user",
      first_name: "Complete",
      last_name: "User",
      is_email_verified: false,
    });

    const input = {
      userId: targetUser.id,
      role: "admin" as const,
    };

    // Act
    const result = await updateUserRole(input, { id: adminUser.id });

    // Assert - Check all expected fields
    expect(result).toHaveProperty("id");
    expect(result).toHaveProperty("email");
    expect(result).toHaveProperty("first_name");
    expect(result).toHaveProperty("last_name");
    expect(result).toHaveProperty("role");
    expect(result).toHaveProperty("is_email_verified");

    expect(result.id).toBe(targetUser.id);
    expect(result.email).toBe(targetUser.email);
    expect(result.first_name).toBe("Complete");
    expect(result.last_name).toBe("User");
    expect(result.role).toBe("admin");
    expect(result.is_email_verified).toBe(false);
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
      role: "admin" as const,
    };

    // Act
    const result = await updateUserRole(input, { id: adminUser.id });

    // Assert
    expect(result.role).toBe("admin");
    expect(result.id).toBe(targetUser.id);
  });

  it("should handle self-prevention with string comparison", async () => {
    // Arrange
    const { user: adminUser } = await createTestUser({
      role: "admin",
    });

    const input = {
      userId: adminUser.id.toString(), // Ensure string comparison works
      role: "user" as const,
    };

    // Act & Assert
    await expect(updateUserRole(input, { id: adminUser.id.toString() })).rejects.toThrow(
      expect.objectContaining({
        code: "BAD_REQUEST",
        message: "You cannot change your own role",
      })
    );
  });
});
