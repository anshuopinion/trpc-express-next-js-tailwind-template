import { describe, it, expect, beforeEach } from "vitest";
import { TRPCError } from "@trpc/server";
import { updateProfile } from "../updateProfile";
import { UserModel } from "../../../model/user";
import { createTestUser } from "../../../test-utils";

describe("User Controller - UpdateProfile", () => {
  beforeEach(async () => {
    // Clean up database before each test
    await UserModel.deleteMany({});
  });

  it("should successfully update first name", async () => {
    // Arrange
    const { user } = await createTestUser({
      email: "firstname@example.com",
      first_name: "Original",
      last_name: "User",
    });

    const updateData = {
      first_name: "Updated",
    };

    // Act
    const result = await updateProfile(updateData, { id: user.id });

    // Assert
    expect(result).toBeDefined();
    expect(result.first_name).toBe("Updated");
    expect(result.last_name).toBe("User"); // Should remain unchanged
    expect(result.email).toBe(user.email);

    // Verify in database
    const updatedUser = await UserModel.findById(user.id);
    expect(updatedUser?.first_name).toBe("Updated");
    expect(updatedUser?.last_name).toBe("User");
  });

  it("should successfully update last name", async () => {
    // Arrange
    const { user } = await createTestUser({
      email: "lastname@example.com",
      first_name: "John",
      last_name: "Original",
    });

    const updateData = {
      last_name: "Updated",
    };

    // Act
    const result = await updateProfile(updateData, { id: user.id });

    // Assert
    expect(result.last_name).toBe("Updated");
    expect(result.first_name).toBe("John"); // Should remain unchanged

    // Verify in database
    const updatedUser = await UserModel.findById(user.id);
    expect(updatedUser?.last_name).toBe("Updated");
    expect(updatedUser?.first_name).toBe("John");
  });

  it("should successfully update avatar with valid URL", async () => {
    // Arrange
    const { user } = await createTestUser({
      email: "avatar@example.com",
      avatar: null,
    });

    const updateData = {
      avatar: "https://example.com/new-avatar.jpg",
    };

    // Act
    const result = await updateProfile(updateData, { id: user.id });

    // Assert
    expect(result.avatar).toBe("https://example.com/new-avatar.jpg");

    // Verify in database
    const updatedUser = await UserModel.findById(user.id);
    expect(updatedUser?.avatar).toBe("https://example.com/new-avatar.jpg");
  });

  it("should successfully clear avatar by setting it to empty string", async () => {
    // Arrange
    const { user } = await createTestUser({
      email: "clearavatar@example.com",
      avatar: "https://example.com/old-avatar.jpg",
    });

    const updateData = {
      avatar: "",
    };

    // Act
    const result = await updateProfile(updateData, { id: user.id });

    // Assert
    expect(result.avatar).toBe("");

    // Verify in database
    const updatedUser = await UserModel.findById(user.id);
    expect(updatedUser?.avatar).toBe("");
  });

  it("should update multiple fields simultaneously", async () => {
    // Arrange
    const { user } = await createTestUser({
      email: "multiple@example.com",
      first_name: "Old",
      last_name: "Name",
      avatar: null,
    });

    const updateData = {
      first_name: "New",
      last_name: "Updated",
      avatar: "https://example.com/avatar.png",
    };

    // Act
    const result = await updateProfile(updateData, { id: user.id });

    // Assert
    expect(result.first_name).toBe("New");
    expect(result.last_name).toBe("Updated");
    expect(result.avatar).toBe("https://example.com/avatar.png");

    // Verify in database
    const updatedUser = await UserModel.findById(user.id);
    expect(updatedUser?.first_name).toBe("New");
    expect(updatedUser?.last_name).toBe("Updated");
    expect(updatedUser?.avatar).toBe("https://example.com/avatar.png");
  });

  it("should throw NOT_FOUND error for non-existent user", async () => {
    // Arrange
    const nonExistentUserId = "507f1f77bcf86cd799439011"; // Valid ObjectId format
    const updateData = {
      first_name: "Test",
    };

    // Act & Assert
    await expect(
      updateProfile(updateData, { id: nonExistentUserId }),
    ).rejects.toThrow(
      expect.objectContaining({
        code: "NOT_FOUND",
        message: "User not found",
      }),
    );
  });

  it("should throw validation error for empty first name", async () => {
    // Arrange
    const { user } = await createTestUser();
    const updateData = {
      first_name: "", // Empty string
    };

    // Act & Assert
    await expect(updateProfile(updateData, { id: user.id })).rejects.toThrow();
  });

  it("should throw validation error for empty last name", async () => {
    // Arrange
    const { user } = await createTestUser();
    const updateData = {
      last_name: "", // Empty string
    };

    // Act & Assert
    await expect(updateProfile(updateData, { id: user.id })).rejects.toThrow();
  });

  it("should throw validation error for invalid avatar URL", async () => {
    // Arrange
    const { user } = await createTestUser();
    const updateData = {
      avatar: "invalid-url", // Not a valid URL
    };

    // Act & Assert
    await expect(updateProfile(updateData, { id: user.id })).rejects.toThrow();
  });

  it("should handle empty update data gracefully", async () => {
    // Arrange
    const { user } = await createTestUser({
      email: "empty@example.com",
      first_name: "Original",
      last_name: "User",
    });

    const updateData = {}; // No updates

    // Act
    const result = await updateProfile(updateData, { id: user.id });

    // Assert - Should return user data without changes
    expect(result.first_name).toBe("Original");
    expect(result.last_name).toBe("User");
    expect(result.email).toBe(user.email);
  });

  it("should preserve unchanged fields", async () => {
    // Arrange
    const { user } = await createTestUser({
      email: "preserve@example.com",
      first_name: "John",
      last_name: "Doe",
      avatar: "https://example.com/avatar.jpg",
      is_email_verified: true,
    });

    const updateData = {
      first_name: "Jane", // Only update first name
    };

    // Act
    const result = await updateProfile(updateData, { id: user.id });

    // Assert - Other fields should remain unchanged
    expect(result.first_name).toBe("Jane");
    expect(result.last_name).toBe("Doe"); // Unchanged
    expect(result.email).toBe(user.email); // Unchanged
    expect(result.avatar).toBe("https://example.com/avatar.jpg"); // Unchanged
    expect(result.is_email_verified).toBe(true); // Unchanged
  });

  it("should handle special characters in names", async () => {
    // Arrange
    const { user } = await createTestUser({
      email: "special@example.com",
    });

    const updateData = {
      first_name: "José María",
      last_name: "O'Connor-Smith",
    };

    // Act
    const result = await updateProfile(updateData, { id: user.id });

    // Assert
    expect(result.first_name).toBe("José María");
    expect(result.last_name).toBe("O'Connor-Smith");

    // Verify in database
    const updatedUser = await UserModel.findById(user.id);
    expect(updatedUser?.first_name).toBe("José María");
    expect(updatedUser?.last_name).toBe("O'Connor-Smith");
  });

  it("should return complete user profile after update", async () => {
    // Arrange
    const { user } = await createTestUser({
      email: "complete@example.com",
      first_name: "Original",
      last_name: "User",
    });

    const updateData = {
      first_name: "Updated",
    };

    // Act
    const result = await updateProfile(updateData, { id: user.id });

    // Assert - Check all expected fields are returned
    expect(result).toHaveProperty("id");
    expect(result).toHaveProperty("email");
    expect(result).toHaveProperty("first_name");
    expect(result).toHaveProperty("last_name");
    expect(result).toHaveProperty("avatar");
    expect(result).toHaveProperty("is_email_verified");

    expect(result.id).toBe(user.id);
    expect(result.email).toBe(user.email);
    expect(result.first_name).toBe("Updated");
  });

  it("should handle different avatar URL formats", async () => {
    // Test various valid URL formats
    const validUrls = [
      "https://example.com/avatar.jpg",
      "http://example.com/avatar.png",
      "https://cdn.example.com/users/123/avatar.gif",
      "https://example.com/path/to/avatar.webp?v=1",
      "https://example.com/avatar#fragment",
    ];

    const { user } = await createTestUser({
      email: "urlformats@example.com",
    });

    for (const url of validUrls) {
      // Act
      const result = await updateProfile({ avatar: url }, { id: user.id });

      // Assert
      expect(result.avatar).toBe(url);

      // Verify in database
      const updatedUser = await UserModel.findById(user.id);
      expect(updatedUser?.avatar).toBe(url);
    }
  });

  it("should not expose sensitive fields in response", async () => {
    // Arrange
    const { user } = await createTestUser({
      email: "sensitive@example.com",
    });

    const updateData = {
      first_name: "Updated",
    };

    // Act
    const result = await updateProfile(updateData, { id: user.id });

    // Assert - Should not contain sensitive fields
    expect(result).not.toHaveProperty("password");
    expect(result).not.toHaveProperty("refresh_token");
    expect(result).not.toHaveProperty("role");
  });
});
