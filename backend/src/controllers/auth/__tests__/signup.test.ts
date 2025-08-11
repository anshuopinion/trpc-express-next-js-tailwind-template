import { beforeEach, describe, expect, it } from "vitest";
import { UserModel } from "../../../model/user";
import { createTestUser } from "../../../test-utils";
import { signup } from "../signup";

describe("Auth Controller - Signup", () => {
  beforeEach(async () => {
    // Clean up database before each test
    await UserModel.deleteMany({});
  });

  it("should successfully create a new user with valid data", async () => {
    // Arrange
    const signupData = {
      email: "newuser@example.com",
      password: "TestPassword123!",
      first_name: "John",
      last_name: "Doe",
    };

    // Act
    const result = await signup(signupData);

    // Assert
    expect(result).toBeDefined();
    expect(result.email).toBe(signupData.email);
    expect(result.first_name).toBe(signupData.first_name);
    expect(result.last_name).toBe(signupData.last_name);
    expect(result.id).toBeDefined();
    expect(result.role).toBe("user");
    expect(result.access_token).toBeDefined();
    expect(result.refresh_token).toBeDefined();
    expect(result.expires_at).toBeDefined();

    // Verify user was created in database
    const savedUser = await UserModel.findOne({ email: signupData.email });
    expect(savedUser).toBeDefined();
    expect(savedUser?.email).toBe(signupData.email);
    expect(savedUser?.first_name).toBe(signupData.first_name);
    expect(savedUser?.last_name).toBe(signupData.last_name);
  });

  it("should throw CONFLICT error when user already exists", async () => {
    // Arrange - Create existing user
    const existingUserData = {
      email: "existing@example.com",
      password: "ExistingPassword123!",
      first_name: "Existing",
      last_name: "User",
    };

    await createTestUser(existingUserData);

    const signupData = {
      email: "existing@example.com", // Same email
      password: "NewPassword123!",
      first_name: "New",
      last_name: "User",
    };

    // Act & Assert
    await expect(signup(signupData)).rejects.toThrow(
      expect.objectContaining({
        code: "CONFLICT",
        message: "User already exists",
      })
    );
  });

  it("should throw validation error for invalid email format", async () => {
    // Arrange
    const signupData = {
      email: "invalid-email", // Invalid email format
      password: "TestPassword123!",
      first_name: "John",
      last_name: "Doe",
    };

    // Act & Assert
    await expect(signup(signupData)).rejects.toThrow();
  });

  it("should throw validation error for short password", async () => {
    // Arrange
    const signupData = {
      email: "user@example.com",
      password: "12345", // Too short
      first_name: "John",
      last_name: "Doe",
    };

    // Act & Assert
    await expect(signup(signupData)).rejects.toThrow();
  });

  it("should throw validation error for empty first name", async () => {
    // Arrange
    const signupData = {
      email: "user@example.com",
      password: "TestPassword123!",
      first_name: "", // Empty first name
      last_name: "Doe",
    };

    // Act & Assert
    await expect(signup(signupData)).rejects.toThrow();
  });

  it("should throw validation error for empty last name", async () => {
    // Arrange
    const signupData = {
      email: "user@example.com",
      password: "TestPassword123!",
      first_name: "John",
      last_name: "", // Empty last name
    };

    // Act & Assert
    await expect(signup(signupData)).rejects.toThrow();
  });

  it("should hash the password before storing", async () => {
    // Arrange
    const signupData = {
      email: "passwordtest@example.com",
      password: "TestPassword123!",
      first_name: "Password",
      last_name: "Test",
    };

    // Act
    await signup(signupData);

    // Assert
    const savedUser = await UserModel.findOne({ email: signupData.email });
    expect(savedUser?.password).toBeDefined();
    expect(savedUser?.password).not.toBe(signupData.password); // Should be hashed
    expect(savedUser?.password.length).toBeGreaterThan(signupData.password.length);
  });

  it("should set user role to 'user' by default", async () => {
    // Arrange
    const signupData = {
      email: "roletest@example.com",
      password: "TestPassword123!",
      first_name: "Role",
      last_name: "Test",
    };

    // Act
    const result = await signup(signupData);

    // Assert
    expect(result.role).toBe("user");

    const savedUser = await UserModel.findOne({ email: signupData.email });
    expect(savedUser?.role).toBe("user");
  });

  it("should generate valid JWT tokens", async () => {
    // Arrange
    const signupData = {
      email: "tokentest@example.com",
      password: "TestPassword123!",
      first_name: "Token",
      last_name: "Test",
    };

    // Act
    const result = await signup(signupData);

    // Assert
    expect(result.access_token).toBeDefined();
    expect(result.refresh_token).toBeDefined();
    expect(result.expires_at).toBeDefined();
    expect(typeof result.access_token).toBe("string");
    expect(typeof result.refresh_token).toBe("string");
    expect(typeof result.expires_at).toBe("number");
    expect(result.expires_at).toBeGreaterThan(Math.floor(Date.now() / 1000));
  });

  it("should store refresh token in user record", async () => {
    // Arrange
    const signupData = {
      email: "refreshtest@example.com",
      password: "TestPassword123!",
      first_name: "Refresh",
      last_name: "Test",
    };

    // Act
    const result = await signup(signupData);

    // Assert
    const savedUser = await UserModel.findOne({ email: signupData.email });
    expect(savedUser?.refresh_token).toBeDefined();
    expect(savedUser?.refresh_token).not.toBe(result.refresh_token); // Should be hashed, not raw JWT
  });
});
