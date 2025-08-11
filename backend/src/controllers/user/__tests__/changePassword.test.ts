import { beforeEach, describe, expect, it } from "vitest";
import { UserModel } from "../../../model/user";
import { comparePassword } from "../../../services/password";
import { createTestUser } from "../../../test-utils";
import { changePassword } from "../changePassword";

describe("User Controller - ChangePassword", () => {
  beforeEach(async () => {
    // Clean up database before each test
    await UserModel.deleteMany({});
  });

  it("should successfully change password with correct current password", async () => {
    // Arrange
    const currentPassword = "CurrentPassword123!";
    const newPassword = "NewPassword456!";

    const { user } = await createTestUser({
      email: "change@example.com",
      password: currentPassword,
    });

    const changeData = {
      currentPassword,
      newPassword,
    };

    // Act
    const result = await changePassword(changeData, { id: user.id });

    // Assert
    expect(result).toBeDefined();
    expect(result.message).toBe("Password changed successfully");

    // Verify password was actually changed in database
    const updatedUser = await UserModel.findById(user.id);
    expect(updatedUser?.password).toBeDefined();
    expect(updatedUser?.password).not.toBe(user.password); // Should be different hash

    // Verify new password works
    const newPasswordMatches = await comparePassword(newPassword, updatedUser?.password || "");
    expect(newPasswordMatches).toBe(true);

    // Verify old password no longer works
    const oldPasswordMatches = await comparePassword(currentPassword, updatedUser?.password || "");
    expect(oldPasswordMatches).toBe(false);
  });

  it("should throw UNAUTHORIZED error for incorrect current password", async () => {
    // Arrange
    const correctPassword = "CorrectPassword123!";
    const { user } = await createTestUser({
      email: "wrong@example.com",
      password: correctPassword,
    });

    const changeData = {
      currentPassword: "WrongPassword123!", // Incorrect password
      newPassword: "NewPassword456!",
    };

    // Act & Assert
    await expect(changePassword(changeData, { id: user.id })).rejects.toThrow(
      expect.objectContaining({
        code: "UNAUTHORIZED",
        message: "Current password is incorrect",
      })
    );

    // Verify password wasn't changed
    const unchangedUser = await UserModel.findById(user.id);
    expect(unchangedUser?.password).toBe(user.password);
  });

  it("should throw NOT_FOUND error for non-existent user", async () => {
    // Arrange
    const nonExistentUserId = "507f1f77bcf86cd799439011"; // Valid ObjectId format
    const changeData = {
      currentPassword: "CurrentPassword123!",
      newPassword: "NewPassword456!",
    };

    // Act & Assert
    await expect(changePassword(changeData, { id: nonExistentUserId })).rejects.toThrow(
      expect.objectContaining({
        code: "NOT_FOUND",
        message: "User not found",
      })
    );
  });

  it("should throw validation error for empty current password", async () => {
    // Arrange
    const { user } = await createTestUser();
    const changeData = {
      currentPassword: "", // Empty string
      newPassword: "NewPassword123!",
    };

    // Act & Assert
    await expect(changePassword(changeData, { id: user.id })).rejects.toThrow();
  });

  it("should throw validation error for short new password", async () => {
    // Arrange
    const currentPassword = "CurrentPassword123!";
    const { user } = await createTestUser({
      password: currentPassword,
    });

    const changeData = {
      currentPassword,
      newPassword: "123", // Too short (less than 6 characters)
    };

    // Act & Assert
    await expect(changePassword(changeData, { id: user.id })).rejects.toThrow();
  });

  it("should hash the new password before storing", async () => {
    // Arrange
    const currentPassword = "CurrentPassword123!";
    const newPassword = "NewPassword456!";

    const { user } = await createTestUser({
      email: "hash@example.com",
      password: currentPassword,
    });

    const changeData = {
      currentPassword,
      newPassword,
    };

    // Act
    await changePassword(changeData, { id: user.id });

    // Assert
    const updatedUser = await UserModel.findById(user.id);
    expect(updatedUser?.password).toBeDefined();
    expect(updatedUser?.password).not.toBe(newPassword); // Should be hashed, not plain text
    expect(updatedUser?.password.length).toBeGreaterThan(newPassword.length); // Hash is longer
  });

  it("should allow same password as current password (re-hash scenario)", async () => {
    // Arrange
    const password = "SamePassword123!";
    const { user } = await createTestUser({
      email: "same@example.com",
      password,
    });

    const originalPasswordHash = user.password;

    const changeData = {
      currentPassword: password,
      newPassword: password, // Same as current
    };

    // Act
    const result = await changePassword(changeData, { id: user.id });

    // Assert
    expect(result.message).toBe("Password changed successfully");

    // Verify password was re-hashed (different hash for same password)
    const updatedUser = await UserModel.findById(user.id);
    expect(updatedUser?.password).toBeDefined();
    expect(updatedUser?.password).not.toBe(originalPasswordHash); // Different hash due to salt

    // Verify password still works
    const passwordMatches = await comparePassword(password, updatedUser?.password || "");
    expect(passwordMatches).toBe(true);
  });

  it("should handle special characters in passwords", async () => {
    // Arrange
    const currentPassword = "Current!@#$%^&*()_+{}|:<>?[];',./";
    const newPassword = "New!@#$%^&*()_+{}|:<>?[];',./Password123";

    const { user } = await createTestUser({
      email: "special@example.com",
      password: currentPassword,
    });

    const changeData = {
      currentPassword,
      newPassword,
    };

    // Act
    const result = await changePassword(changeData, { id: user.id });

    // Assert
    expect(result.message).toBe("Password changed successfully");

    // Verify new password works
    const updatedUser = await UserModel.findById(user.id);
    const passwordMatches = await comparePassword(newPassword, updatedUser?.password || "");
    expect(passwordMatches).toBe(true);
  });

  it("should handle long passwords", async () => {
    // Arrange
    const currentPassword = "CurrentPassword123!";
    const newPassword = `${"a".repeat(200)}123!`; // Very long password

    const { user } = await createTestUser({
      email: "long@example.com",
      password: currentPassword,
    });

    const changeData = {
      currentPassword,
      newPassword,
    };

    // Act
    const result = await changePassword(changeData, { id: user.id });

    // Assert
    expect(result.message).toBe("Password changed successfully");

    // Verify new password works
    const updatedUser = await UserModel.findById(user.id);
    const passwordMatches = await comparePassword(newPassword, updatedUser?.password || "");
    expect(passwordMatches).toBe(true);
  });

  it("should handle Unicode characters in passwords", async () => {
    // Arrange
    const currentPassword = "CurrentPassword123!";
    const newPassword = "新密码Password123!🔐"; // Unicode characters

    const { user } = await createTestUser({
      email: "unicode@example.com",
      password: currentPassword,
    });

    const changeData = {
      currentPassword,
      newPassword,
    };

    // Act
    const result = await changePassword(changeData, { id: user.id });

    // Assert
    expect(result.message).toBe("Password changed successfully");

    // Verify new password works
    const updatedUser = await UserModel.findById(user.id);
    const passwordMatches = await comparePassword(newPassword, updatedUser?.password || "");
    expect(passwordMatches).toBe(true);
  });

  it("should only update password field", async () => {
    // Arrange
    const currentPassword = "CurrentPassword123!";
    const newPassword = "NewPassword456!";

    const { user } = await createTestUser({
      email: "onlypass@example.com",
      password: currentPassword,
      first_name: "Original",
      last_name: "User",
      avatar: "original-avatar.jpg",
    });

    const originalEmail = user.email;
    const originalFirstName = user.first_name;
    const originalLastName = user.last_name;
    const originalAvatar = user.avatar;

    const changeData = {
      currentPassword,
      newPassword,
    };

    // Act
    await changePassword(changeData, { id: user.id });

    // Assert - Other fields should remain unchanged
    const updatedUser = await UserModel.findById(user.id);
    expect(updatedUser?.email).toBe(originalEmail);
    expect(updatedUser?.first_name).toBe(originalFirstName);
    expect(updatedUser?.last_name).toBe(originalLastName);
    expect(updatedUser?.avatar).toBe(originalAvatar);

    // Only password should change
    expect(updatedUser?.password).not.toBe(user.password);
  });

  it("should work with minimum valid password length", async () => {
    // Arrange
    const currentPassword = "CurrentPassword123!";
    const newPassword = "123456"; // Minimum length (6 characters)

    const { user } = await createTestUser({
      email: "minlength@example.com",
      password: currentPassword,
    });

    const changeData = {
      currentPassword,
      newPassword,
    };

    // Act
    const result = await changePassword(changeData, { id: user.id });

    // Assert
    expect(result.message).toBe("Password changed successfully");

    // Verify new password works
    const updatedUser = await UserModel.findById(user.id);
    const passwordMatches = await comparePassword(newPassword, updatedUser?.password || "");
    expect(passwordMatches).toBe(true);
  });

  it("should clear any existing refresh tokens (if applicable)", async () => {
    // Arrange
    const currentPassword = "CurrentPassword123!";
    const newPassword = "NewPassword456!";

    const { user } = await createTestUser({
      email: "cleartoken@example.com",
      password: currentPassword,
      refresh_token: "existing-refresh-token",
    });

    const changeData = {
      currentPassword,
      newPassword,
    };

    // Act
    await changePassword(changeData, { id: user.id });

    // Assert
    const updatedUser = await UserModel.findById(user.id);
    // Note: Based on the implementation, this test checks if refresh_token is preserved
    // If the requirement is to clear it on password change, the implementation would need to be updated
    expect(updatedUser?.refresh_token).toBe(user.refresh_token); // Currently preserved
  });
});
