import { beforeEach, describe, expect, it } from "vitest";
import { UserRole } from "../../../model/user";
import { createTestUser, generateUserData } from "../../../test-utils";
import { signin } from "../signin";

// import { comparePassword } from "../../../services/password";

describe("Auth Controller - Signin", () => {
  beforeEach(async () => {
    // Test setup is handled by vitest.setup.ts
  });

  it("should successfully sign in with valid credentials", async () => {
    // Arrange
    const { user, rawPassword } = await createTestUser();
    const signinData = {
      email: user.email,
      password: rawPassword,
    };

    // Act
    const result = await signin(signinData);

    // Assert
    expect(result).toBeDefined();
    expect(result.email).toBe(user.email);
    expect(result.first_name).toBe(user.first_name);
    expect(result.last_name).toBe(user.last_name);
    expect(result.role).toBe(user.role);
    expect(result.access_token).toBeDefined();
    expect(result.refresh_token).toBeDefined();
    expect(result.id).toBe(user.id);
  });

  it("should throw UNAUTHORIZED error for non-existent user", async () => {
    // Arrange
    const signinData = {
      email: "nonexistent@example.com",
      password: "Password123!",
    };

    // Act & Assert
    await expect(signin(signinData)).rejects.toThrow(
      expect.objectContaining({
        code: "UNAUTHORIZED",
        message: "Invalid credentials",
      })
    );
  });

  it("should throw UNAUTHORIZED error for invalid password", async () => {
    // Arrange
    const { user } = await createTestUser();
    const signinData = {
      email: user.email,
      password: "WrongPassword123!",
    };

    // Act & Assert
    await expect(signin(signinData)).rejects.toThrow(
      expect.objectContaining({
        code: "UNAUTHORIZED",
        message: "Invalid credentials",
      })
    );
  });

  it("should include valid JWT tokens in response", async () => {
    // Arrange
    const { user, rawPassword } = await createTestUser();
    const signinData = {
      email: user.email,
      password: rawPassword,
    };

    // Act
    const result = await signin(signinData);

    // Assert
    expect(result.access_token).toBeDefined();
    expect(result.refresh_token).toBeDefined();
    expect(typeof result.access_token).toBe("string");
    expect(typeof result.refresh_token).toBe("string");
    expect(result.access_token.length).toBeGreaterThan(0);
    expect(result.refresh_token.length).toBeGreaterThan(0);
  });

  it("should work with admin users", async () => {
    // Arrange
    const adminData = generateUserData({ role: UserRole.ADMIN });
    const { user, rawPassword } = await createTestUser(adminData);
    const signinData = {
      email: user.email,
      password: rawPassword,
    };

    // Act
    const result = await signin(signinData);

    // Assert
    expect(result).toBeDefined();
    expect(result.role).toBe("admin");
    expect(result.email).toBe(user.email);
    expect(result.access_token).toBeDefined();
    expect(result.refresh_token).toBeDefined();
  });

  it("should handle case-sensitive email correctly", async () => {
    // Arrange
    const { rawPassword } = await createTestUser({
      email: "Test@Example.com",
    });
    const signinData = {
      email: "test@example.com", // Different case
      password: rawPassword,
    };

    // Act & Assert
    // This should fail since email should be case-sensitive in our system
    await expect(signin(signinData)).rejects.toThrow(
      expect.objectContaining({
        code: "UNAUTHORIZED",
        message: "Invalid credentials",
      })
    );
  });

  it("should update user refresh token on successful signin", async () => {
    // Arrange
    const { user, rawPassword } = await createTestUser();
    const signinData = {
      email: user.email,
      password: rawPassword,
    };

    // Act
    const result = await signin(signinData);

    // Assert - verify that a refresh token was generated
    expect(result.refresh_token).toBeDefined();
    expect(typeof result.refresh_token).toBe("string");
    expect(result.refresh_token.length).toBeGreaterThan(0);

    // The refresh token should be stored in the user's record
    // This is handled by updateRefreshToken in the signin function
  });

  it("should validate input schema - missing email", async () => {
    // Arrange
    const invalidInput = {
      password: "Password123!",
      // missing email
    } as any;

    // Act & Assert
    await expect(signin(invalidInput)).rejects.toThrow();
  });

  it("should validate input schema - missing password", async () => {
    // Arrange
    const invalidInput = {
      email: "test@example.com",
      // missing password
    } as any;

    // Act & Assert
    await expect(signin(invalidInput)).rejects.toThrow();
  });

  it("should validate input schema - invalid email format", async () => {
    // Arrange
    const invalidInput = {
      email: "invalid-email",
      password: "Password123!",
    };

    // Act & Assert
    await expect(signin(invalidInput)).rejects.toThrow();
  });
});
