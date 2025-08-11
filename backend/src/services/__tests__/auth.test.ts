import { describe, it, expect, beforeEach, vi } from "vitest";
import jwt from "jsonwebtoken";
import { generateAccessToken, generateRefreshToken, getTokens } from "../auth";
import type { UserRole } from "../../model/user";

describe("Auth Service", () => {
  const mockUserId = "test-user-id";
  const mockEmail = "test@example.com";
  const mockRole: UserRole = "user";

  beforeEach(() => {
    // Ensure environment variables are set (done by vitest.setup.ts)
    expect(process.env.ACCESS_TOKEN_SECRET).toBeDefined();
    expect(process.env.REFRESH_TOKEN_SECRET).toBeDefined();
  });

  describe("generateAccessToken", () => {
    it("should generate a valid access token", () => {
      // Act
      const token = generateAccessToken(mockUserId, mockEmail, mockRole);

      // Assert
      expect(token).toBeDefined();
      expect(typeof token).toBe("string");
      expect(token.length).toBeGreaterThan(0);

      // Verify token can be decoded
      const decoded = jwt.decode(token) as any;
      expect(decoded).toBeDefined();
      expect(decoded.userId).toBe(mockUserId);
      expect(decoded.email).toBe(mockEmail);
      expect(decoded.role).toBe(mockRole);
      expect(decoded.exp).toBeDefined();
    });

    it("should generate token with correct expiration (15 minutes)", () => {
      // Act
      const token = generateAccessToken(mockUserId, mockEmail, mockRole);

      // Assert
      const decoded = jwt.decode(token) as any;
      const now = Math.floor(Date.now() / 1000);
      const expectedExpiration = now + 15 * 60; // 15 minutes

      // Allow for small time differences (within 10 seconds)
      expect(decoded.exp).toBeGreaterThan(now);
      expect(decoded.exp).toBeLessThanOrEqual(expectedExpiration + 10);
    });

    it("should throw error if ACCESS_TOKEN_SECRET is not defined", () => {
      // Arrange
      const originalSecret = process.env.ACCESS_TOKEN_SECRET;
      delete process.env.ACCESS_TOKEN_SECRET;

      // Act & Assert
      expect(() => {
        generateAccessToken(mockUserId, mockEmail, mockRole);
      }).toThrow("ACCESS_TOKEN_SECRET is not defined");

      // Cleanup
      process.env.ACCESS_TOKEN_SECRET = originalSecret;
    });

    it("should work with admin role", () => {
      // Act
      const token = generateAccessToken(mockUserId, mockEmail, "admin");

      // Assert
      const decoded = jwt.decode(token) as any;
      expect(decoded.role).toBe("admin");
    });
  });

  describe("generateRefreshToken", () => {
    it("should generate a valid refresh token", () => {
      // Act
      const token = generateRefreshToken(mockUserId, mockEmail, mockRole);

      // Assert
      expect(token).toBeDefined();
      expect(typeof token).toBe("string");
      expect(token.length).toBeGreaterThan(0);

      // Verify token can be decoded
      const decoded = jwt.decode(token) as any;
      expect(decoded).toBeDefined();
      expect(decoded.userId).toBe(mockUserId);
      expect(decoded.email).toBe(mockEmail);
      expect(decoded.role).toBe(mockRole);
    });

    it("should generate token with correct expiration (7 days)", () => {
      // Act
      const token = generateRefreshToken(mockUserId, mockEmail, mockRole);

      // Assert
      const decoded = jwt.decode(token) as any;
      const now = Math.floor(Date.now() / 1000);
      const expectedExpiration = now + 7 * 24 * 60 * 60; // 7 days

      // Allow for small time differences (within 10 seconds)
      expect(decoded.exp).toBeGreaterThan(now);
      expect(decoded.exp).toBeLessThanOrEqual(expectedExpiration + 10);
    });

    it("should throw error if REFRESH_TOKEN_SECRET is not defined", () => {
      // Arrange
      const originalSecret = process.env.REFRESH_TOKEN_SECRET;
      delete process.env.REFRESH_TOKEN_SECRET;

      // Act & Assert
      expect(() => {
        generateRefreshToken(mockUserId, mockEmail, mockRole);
      }).toThrow("REFRESH_TOKEN_SECRET is not defined");

      // Cleanup
      process.env.REFRESH_TOKEN_SECRET = originalSecret;
    });
  });

  describe("getTokens", () => {
    it("should return both access and refresh tokens", async () => {
      // Act
      const tokens = await getTokens(mockUserId, mockEmail, mockRole);

      // Assert
      expect(tokens).toBeDefined();
      expect(tokens.access_token).toBeDefined();
      expect(tokens.refresh_token).toBeDefined();
      expect(tokens.expires_at).toBeDefined();

      expect(typeof tokens.access_token).toBe("string");
      expect(typeof tokens.refresh_token).toBe("string");
      expect(typeof tokens.expires_at).toBe("number");
    });

    it("should return correct expires_at timestamp", async () => {
      // Arrange
      const beforeCall = Math.floor(Date.now() / 1000);

      // Act
      const tokens = await getTokens(mockUserId, mockEmail, mockRole);

      // Assert
      const afterCall = Math.floor(Date.now() / 1000);
      const expectedExpiration = beforeCall + 15 * 60; // 15 minutes

      expect(tokens.expires_at).toBeGreaterThanOrEqual(expectedExpiration);
      expect(tokens.expires_at).toBeLessThanOrEqual(afterCall + 15 * 60 + 1);
    });

    it("should generate tokens with same payload but different signatures", async () => {
      // Act
      const tokens = await getTokens(mockUserId, mockEmail, mockRole);

      // Assert
      const accessDecoded = jwt.decode(tokens.access_token) as any;
      const refreshDecoded = jwt.decode(tokens.refresh_token) as any;

      // Same payload
      expect(accessDecoded.userId).toBe(refreshDecoded.userId);
      expect(accessDecoded.email).toBe(refreshDecoded.email);
      expect(accessDecoded.role).toBe(refreshDecoded.role);

      // Different expiration times
      expect(accessDecoded.exp).not.toBe(refreshDecoded.exp);
      expect(refreshDecoded.exp).toBeGreaterThan(accessDecoded.exp);
    });

    it("should work with different user roles", async () => {
      // Act
      const userTokens = await getTokens(mockUserId, mockEmail, "user");
      const adminTokens = await getTokens(mockUserId, mockEmail, "admin");

      // Assert
      const userDecoded = jwt.decode(userTokens.access_token) as any;
      const adminDecoded = jwt.decode(adminTokens.access_token) as any;

      expect(userDecoded.role).toBe("user");
      expect(adminDecoded.role).toBe("admin");
    });
  });

  describe("Token verification", () => {
    it("should generate verifiable tokens", () => {
      // Act
      const accessToken = generateAccessToken(mockUserId, mockEmail, mockRole);
      const refreshToken = generateRefreshToken(
        mockUserId,
        mockEmail,
        mockRole,
      );

      // Assert - tokens should be verifiable with the same secret
      expect(() => {
        jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET!);
      }).not.toThrow();

      expect(() => {
        jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET!);
      }).not.toThrow();
    });

    it("should fail verification with wrong secret", () => {
      // Arrange
      const token = generateAccessToken(mockUserId, mockEmail, mockRole);

      // Act & Assert
      expect(() => {
        jwt.verify(token, "wrong-secret");
      }).toThrow();
    });
  });
});
