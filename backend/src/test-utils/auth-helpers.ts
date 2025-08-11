import jwt from "jsonwebtoken";
import type { UserRole } from "../model/user";
import { UserModel } from "../model/user";
import { hashPassword } from "../services/password";

/**
 * Generate a test JWT access token
 */
export const generateTestAccessToken = (
  userId: string,
  email: string,
  role: UserRole = "user",
) => {
  const secret = process.env.ACCESS_TOKEN_SECRET;
  if (!secret) throw new Error("ACCESS_TOKEN_SECRET is not defined");

  return jwt.sign({ userId, email, role }, secret, {
    expiresIn: "15m",
  });
};

/**
 * Generate a test JWT refresh token
 */
export const generateTestRefreshToken = (
  userId: string,
  email: string,
  role: UserRole = "user",
) => {
  const secret = process.env.REFRESH_TOKEN_SECRET;
  if (!secret) throw new Error("REFRESH_TOKEN_SECRET is not defined");

  return jwt.sign({ userId, email, role }, secret, {
    expiresIn: "7d",
  });
};

/**
 * Generate both access and refresh tokens for testing
 */
export const generateTestTokens = (
  userId: string,
  email: string,
  role: UserRole = "user",
) => {
  return {
    access_token: generateTestAccessToken(userId, email, role),
    refresh_token: generateTestRefreshToken(userId, email, role),
    expires_at: Math.floor(Date.now() / 1000) + 60 * 15,
  };
};

/**
 * Create a test user in the database
 */
export const createTestUser = async (overrides: any = {}) => {
  const userData = {
    first_name: "Test",
    last_name: "User",
    email: `test${Date.now()}@example.com`,
    password: "Test123!",
    role: "user" as const,
    ...overrides,
  };

  // Hash the password
  const hashedPassword = await hashPassword(userData.password);

  // Create user in database
  const user = await UserModel.create({
    ...userData,
    password: hashedPassword,
  });

  return {
    user,
    rawPassword: userData.password, // Return raw password for test assertions
    tokens: generateTestTokens(user.id, user.email, user.role),
  };
};

/**
 * Create a test admin user in the database
 */
export const createTestAdmin = async (overrides: any = {}) => {
  const adminData = {
    first_name: "Test",
    last_name: "Admin",
    email: `admin${Date.now()}@example.com`,
    password: "Admin123!",
    role: "admin" as const,
    ...overrides,
  };

  return createTestUser(adminData);
};

/**
 * Create multiple test users
 */
export const createTestUsers = async (count: number, overrides: any = {}) => {
  const users = [];

  for (let i = 0; i < count; i++) {
    const user = await createTestUser({
      email: `testuser${i}_${Date.now()}@example.com`,
      first_name: `TestUser${i}`,
      ...overrides,
    });
    users.push(user);
  }

  return users;
};

/**
 * Extract user ID from JWT token (for testing)
 */
export const extractUserIdFromToken = (token: string): string => {
  const decoded = jwt.decode(token) as any;
  return decoded?.userId;
};

/**
 * Create authorization header for tests
 */
export const createAuthHeader = (token: string) => ({
  authorization: `Bearer ${token}`,
});

/**
 * Generate test user data without creating in DB
 */
export const generateUserData = (overrides: any = {}) => ({
  first_name: "Test",
  last_name: "User",
  email: `test${Date.now()}@example.com`,
  password: "Test123!",
  role: "user" as const,
  ...overrides,
});

/**
 * Generate admin user data without creating in DB
 */
export const generateAdminData = (overrides: any = {}) => ({
  first_name: "Test",
  last_name: "Admin",
  email: `admin${Date.now()}@example.com`,
  password: "Admin123!",
  role: "admin" as const,
  ...overrides,
});
