import { describe, it, expect } from "vitest";
import { me } from "../me";
import type { UserRole } from "../../../model/user";

describe("Auth Controller - Me", () => {
  it("should return complete user profile for user role", async () => {
    // Arrange
    const mockUser = {
      id: "user123",
      email: "user@example.com",
      first_name: "John",
      last_name: "Doe",
      avatar: "https://example.com/avatar.jpg",
      is_email_verified: true,
      role: "user" as UserRole,
    };

    // Act
    const result = await me(mockUser);

    // Assert
    expect(result).toBeDefined();
    expect(result.id).toBe(mockUser.id);
    expect(result.email).toBe(mockUser.email);
    expect(result.first_name).toBe(mockUser.first_name);
    expect(result.last_name).toBe(mockUser.last_name);
    expect(result.avatar).toBe(mockUser.avatar);
    expect(result.is_email_verified).toBe(mockUser.is_email_verified);
    expect(result.role).toBe(mockUser.role);
  });

  it("should return complete user profile for admin role", async () => {
    // Arrange
    const mockAdmin = {
      id: "admin123",
      email: "admin@example.com",
      first_name: "Jane",
      last_name: "Admin",
      avatar: null,
      is_email_verified: true,
      role: "admin" as UserRole,
    };

    // Act
    const result = await me(mockAdmin);

    // Assert
    expect(result).toBeDefined();
    expect(result.id).toBe(mockAdmin.id);
    expect(result.email).toBe(mockAdmin.email);
    expect(result.first_name).toBe(mockAdmin.first_name);
    expect(result.last_name).toBe(mockAdmin.last_name);
    expect(result.avatar).toBeNull();
    expect(result.is_email_verified).toBe(mockAdmin.is_email_verified);
    expect(result.role).toBe("admin");
  });

  it("should handle user with null avatar", async () => {
    // Arrange
    const mockUser = {
      id: "user456",
      email: "noavatar@example.com",
      first_name: "No",
      last_name: "Avatar",
      avatar: null,
      is_email_verified: false,
      role: "user" as UserRole,
    };

    // Act
    const result = await me(mockUser);

    // Assert
    expect(result.avatar).toBeNull();
    expect(result.is_email_verified).toBe(false);
    expect(result.role).toBe("user");
  });

  it("should handle user with undefined avatar", async () => {
    // Arrange
    const mockUser = {
      id: "user789",
      email: "undefined@example.com",
      first_name: "Undefined",
      last_name: "Avatar",
      avatar: undefined,
      is_email_verified: true,
      role: "user" as UserRole,
    };

    // Act
    const result = await me(mockUser);

    // Assert
    expect(result.avatar).toBeUndefined();
    expect(result).toHaveProperty("avatar"); // Property should exist
  });

  it("should preserve all user data without modification", async () => {
    // Arrange
    const mockUser = {
      id: "preserve123",
      email: "preserve@example.com",
      first_name: "Original",
      last_name: "Data",
      avatar: "original-avatar-url",
      is_email_verified: false,
      role: "user" as UserRole,
    };

    // Act
    const result = await me(mockUser);

    // Assert - Ensure deep equality
    expect(result).toEqual({
      id: mockUser.id,
      email: mockUser.email,
      first_name: mockUser.first_name,
      last_name: mockUser.last_name,
      avatar: mockUser.avatar,
      is_email_verified: mockUser.is_email_verified,
      role: mockUser.role,
    });
  });

  it("should handle empty string values", async () => {
    // Arrange
    const mockUser = {
      id: "empty123",
      email: "empty@example.com",
      first_name: "",
      last_name: "",
      avatar: "",
      is_email_verified: true,
      role: "user" as UserRole,
    };

    // Act
    const result = await me(mockUser);

    // Assert
    expect(result.first_name).toBe("");
    expect(result.last_name).toBe("");
    expect(result.avatar).toBe("");
  });

  it("should handle special characters in names", async () => {
    // Arrange
    const mockUser = {
      id: "special123",
      email: "special@example.com",
      first_name: "José María",
      last_name: "O'Connor-Smith",
      avatar: "https://example.com/josé-avatar.jpg",
      is_email_verified: true,
      role: "user" as UserRole,
    };

    // Act
    const result = await me(mockUser);

    // Assert
    expect(result.first_name).toBe("José María");
    expect(result.last_name).toBe("O'Connor-Smith");
    expect(result.avatar).toBe("https://example.com/josé-avatar.jpg");
  });

  it("should return consistent data structure", async () => {
    // Arrange
    const mockUser = {
      id: "structure123",
      email: "structure@example.com",
      first_name: "Structure",
      last_name: "Test",
      avatar: null,
      is_email_verified: true,
      role: "user" as UserRole,
    };

    // Act
    const result = await me(mockUser);

    // Assert - Check all expected properties exist
    expect(result).toHaveProperty("id");
    expect(result).toHaveProperty("email");
    expect(result).toHaveProperty("first_name");
    expect(result).toHaveProperty("last_name");
    expect(result).toHaveProperty("avatar");
    expect(result).toHaveProperty("is_email_verified");
    expect(result).toHaveProperty("role");

    // Check data types
    expect(typeof result.id).toBe("string");
    expect(typeof result.email).toBe("string");
    expect(typeof result.first_name).toBe("string");
    expect(typeof result.last_name).toBe("string");
    expect(typeof result.is_email_verified).toBe("boolean");
    expect(typeof result.role).toBe("string");
  });

  it("should not expose sensitive information", async () => {
    // Arrange - Mock user with potentially sensitive data (though not in this interface)
    const mockUser = {
      id: "sensitive123",
      email: "sensitive@example.com",
      first_name: "Sensitive",
      last_name: "User",
      avatar: null,
      is_email_verified: true,
      role: "user" as UserRole,
    };

    // Act
    const result = await me(mockUser);

    // Assert - Should not contain password or refresh_token fields
    expect(result).not.toHaveProperty("password");
    expect(result).not.toHaveProperty("refresh_token");
    expect(Object.keys(result)).toHaveLength(7); // Exactly 7 fields
  });

  it("should be an async function that resolves", async () => {
    // Arrange
    const mockUser = {
      id: "async123",
      email: "async@example.com",
      first_name: "Async",
      last_name: "Test",
      avatar: null,
      is_email_verified: true,
      role: "user" as UserRole,
    };

    // Act & Assert
    const resultPromise = me(mockUser);
    expect(resultPromise).toBeInstanceOf(Promise);

    const result = await resultPromise;
    expect(result).toBeDefined();
  });
});
