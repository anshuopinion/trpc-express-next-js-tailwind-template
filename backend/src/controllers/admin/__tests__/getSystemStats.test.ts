import { beforeEach, describe, expect, it } from "vitest";
import { UserModel, UserRole } from "../../../model/user";
import { createTestUser } from "../../../test-utils";
import { getSystemStats } from "../getSystemStats";

describe("Admin Controller - GetSystemStats", () => {
  beforeEach(async () => {
    // Clean up database before each test
    await UserModel.deleteMany({});
  });

  it("should return system stats with no users", async () => {
    // Arrange - No users in database

    // Act
    const result = await getSystemStats();

    // Assert
    expect(result).toBeDefined();
    expect(result.totalUsers).toBe(0);
    expect(result.adminUsers).toBe(0);
    expect(result.regularUsers).toBe(0);
    expect(result.verifiedUsers).toBe(0);
    expect(result.unverifiedUsers).toBe(0);
    expect(result.recentUsers).toHaveLength(0);
    expect(result.systemHealth).toBeDefined();
    expect(result.systemHealth.status).toBe("healthy");
    expect(typeof result.systemHealth.uptime).toBe("number");
    expect(typeof result.systemHealth.timestamp).toBe("string");
  });

  it("should return correct user counts with mixed users", async () => {
    // Arrange - Create users with different roles and verification status
    await createTestUser({
      email: "user1@example.com",
      role: UserRole.USER,
      is_email_verified: true,
    });

    await createTestUser({
      email: "user2@example.com",
      role: UserRole.USER,
      is_email_verified: false,
    });

    await createTestUser({
      email: "admin1@example.com",
      role: UserRole.ADMIN,
      is_email_verified: true,
    });

    await createTestUser({
      email: "admin2@example.com",
      role: UserRole.ADMIN,
      is_email_verified: false,
    });

    // Act
    const result = await getSystemStats();

    // Assert
    expect(result.totalUsers).toBe(4);
    expect(result.adminUsers).toBe(2);
    expect(result.regularUsers).toBe(2);
    expect(result.verifiedUsers).toBe(2);
    expect(result.unverifiedUsers).toBe(2);
  });

  it("should return recent users sorted by creation date", async () => {
    // Arrange - Create users with slight delays to ensure different timestamps
    await createTestUser({
      email: "first@example.com",
      first_name: "First",
      last_name: "User",
    });

    // Small delay to ensure different timestamps
    await new Promise((resolve) => setTimeout(resolve, 10));

    await createTestUser({
      email: "second@example.com",
      first_name: "Second",
      last_name: "User",
    });

    await new Promise((resolve) => setTimeout(resolve, 10));

    await createTestUser({
      email: "third@example.com",
      first_name: "Third",
      last_name: "User",
    });

    // Act
    const result = await getSystemStats();

    // Assert
    expect(result.recentUsers).toHaveLength(3);
    expect(result.recentUsers[0].first_name).toBe("Third"); // Most recent
    expect(result.recentUsers[1].first_name).toBe("Second");
    expect(result.recentUsers[2].first_name).toBe("First"); // Oldest
  });

  it("should limit recent users to 5", async () => {
    // Arrange - Create 8 users
    for (let i = 1; i <= 8; i++) {
      await createTestUser({
        email: `user${i}@example.com`,
        first_name: `User${i}`,
      });
    }

    // Act
    const result = await getSystemStats();

    // Assert
    expect(result.totalUsers).toBe(8);
    expect(result.recentUsers).toHaveLength(5); // Should be limited to 5

    // Should be the 5 most recent users (User8 to User4)
    expect(result.recentUsers[0].first_name).toBe("User8");
    expect(result.recentUsers[4].first_name).toBe("User4");
  });

  it("should not expose sensitive fields in recent users", async () => {
    // Arrange
    await createTestUser({
      email: "sensitive@example.com",
      password: "SensitivePassword123!",
      refresh_token: "sensitive-token",
      first_name: "Sensitive",
    });

    // Act
    const result = await getSystemStats();

    // Assert
    expect(result.recentUsers).toHaveLength(1);
    const recentUser = result.recentUsers[0];

    expect(recentUser).not.toHaveProperty("password");
    expect(recentUser).not.toHaveProperty("refresh_token");
    expect(recentUser).not.toHaveProperty("verify_token");

    // Should have safe fields
    expect(recentUser).toHaveProperty("id");
    expect(recentUser).toHaveProperty("email");
    expect(recentUser).toHaveProperty("first_name");
    expect(recentUser).toHaveProperty("last_name");
    expect(recentUser).toHaveProperty("role");
    expect(recentUser).toHaveProperty("is_email_verified");
    expect(recentUser).toHaveProperty("createdAt");
  });

  it("should include system health information", async () => {
    // Arrange
    await createTestUser({
      email: "health@example.com",
    });

    // Act
    const result = await getSystemStats();

    // Assert
    expect(result.systemHealth).toBeDefined();
    expect(result.systemHealth.status).toBe("healthy");
    expect(result.systemHealth.uptime).toBeGreaterThan(0);
    expect(typeof result.systemHealth.uptime).toBe("number");
    expect(result.systemHealth.timestamp).toBeDefined();

    // Verify timestamp is a valid ISO string
    expect(() => new Date(result.systemHealth.timestamp)).not.toThrow();
    expect(new Date(result.systemHealth.timestamp).toISOString()).toBe(
      result.systemHealth.timestamp,
    );
  });

  it("should calculate unverified users correctly", async () => {
    // Arrange - Create mix of verified and unverified users
    await createTestUser({
      email: "verified1@example.com",
      is_email_verified: true,
    });

    await createTestUser({
      email: "verified2@example.com",
      is_email_verified: true,
    });

    await createTestUser({
      email: "unverified1@example.com",
      is_email_verified: false,
    });

    await createTestUser({
      email: "unverified2@example.com",
      is_email_verified: false,
    });

    await createTestUser({
      email: "unverified3@example.com",
      is_email_verified: false,
    });

    // Act
    const result = await getSystemStats();

    // Assert
    expect(result.totalUsers).toBe(5);
    expect(result.verifiedUsers).toBe(2);
    expect(result.unverifiedUsers).toBe(3);
    expect(result.verifiedUsers + result.unverifiedUsers).toBe(
      result.totalUsers,
    );
  });

  it("should handle all users being admins", async () => {
    // Arrange
    await createTestUser({
      email: "admin1@example.com",
      role: UserRole.ADMIN,
    });

    await createTestUser({
      email: "admin2@example.com",
      role: UserRole.ADMIN,
    });

    await createTestUser({
      email: "admin3@example.com",
      role: UserRole.ADMIN,
    });

    // Act
    const result = await getSystemStats();

    // Assert
    expect(result.totalUsers).toBe(3);
    expect(result.adminUsers).toBe(3);
    expect(result.regularUsers).toBe(0);
    expect(result.adminUsers + result.regularUsers).toBe(result.totalUsers);
  });

  it("should handle all users being regular users", async () => {
    // Arrange
    await createTestUser({
      email: "user1@example.com",
      role: UserRole.USER,
    });

    await createTestUser({
      email: "user2@example.com",
      role: UserRole.USER,
    });

    // Act
    const result = await getSystemStats();

    // Assert
    expect(result.totalUsers).toBe(2);
    expect(result.adminUsers).toBe(0);
    expect(result.regularUsers).toBe(2);
  });

  it("should include complete recent user information", async () => {
    // Arrange
    const { user } = await createTestUser({
      email: "complete@example.com",
      first_name: "Complete",
      last_name: "User",
      role: UserRole.ADMIN,
      is_email_verified: true,
    });

    // Act
    const result = await getSystemStats();

    // Assert
    expect(result.recentUsers).toHaveLength(1);
    const recentUser = result.recentUsers[0];

    expect(recentUser.id).toBe(user.id);
    expect(recentUser.email).toBe("complete@example.com");
    expect(recentUser.first_name).toBe("Complete");
    expect(recentUser.last_name).toBe("User");
    expect(recentUser.role).toBe("admin");
    expect(recentUser.is_email_verified).toBe(true);
    expect(recentUser.createdAt).toBeDefined();
    expect(typeof recentUser.createdAt).toBe("string");
  });

  it("should have consistent data types in response", async () => {
    // Arrange
    await createTestUser({
      email: "types@example.com",
    });

    // Act
    const result = await getSystemStats();

    // Assert - Check data types
    expect(typeof result.totalUsers).toBe("number");
    expect(typeof result.adminUsers).toBe("number");
    expect(typeof result.regularUsers).toBe("number");
    expect(typeof result.verifiedUsers).toBe("number");
    expect(typeof result.unverifiedUsers).toBe("number");
    expect(Array.isArray(result.recentUsers)).toBe(true);
    expect(typeof result.systemHealth).toBe("object");

    // Check recent user data types
    if (result.recentUsers.length > 0) {
      const user = result.recentUsers[0];
      expect(typeof user.id).toBe("string");
      expect(typeof user.email).toBe("string");
      expect(typeof user.first_name).toBe("string");
      expect(typeof user.last_name).toBe("string");
      expect(typeof user.role).toBe("string");
      expect(typeof user.is_email_verified).toBe("boolean");
      expect(typeof user.createdAt).toBe("string");
    }
  });

  it("should handle users with special characters", async () => {
    // Arrange
    await createTestUser({
      email: "special@example.com",
      first_name: "José María",
      last_name: "O'Connor-Smith",
    });

    // Act
    const result = await getSystemStats();

    // Assert
    expect(result.recentUsers).toHaveLength(1);
    expect(result.recentUsers[0].first_name).toBe("José María");
    expect(result.recentUsers[0].last_name).toBe("O'Connor-Smith");
  });

  it("should return valid ISO timestamp", async () => {
    // Arrange
    const beforeCall = new Date();

    // Act
    const result = await getSystemStats();

    // Assert
    const afterCall = new Date();
    const timestamp = new Date(result.systemHealth.timestamp);

    expect(timestamp.getTime()).toBeGreaterThanOrEqual(beforeCall.getTime());
    expect(timestamp.getTime()).toBeLessThanOrEqual(afterCall.getTime());
  });

  it("should handle large number of users efficiently", async () => {
    // Arrange - Create users one by one to ensure predictable creation order
    for (let i = 1; i <= 50; i++) {
      await createTestUser({
        email: `bulk${i}@example.com`,
        role: i % 3 === 0 ? UserRole.ADMIN : UserRole.USER, // Every 3rd user is admin
        is_email_verified: i % 2 === 0, // Every 2nd user is verified
      });
      // Small delay to ensure different timestamps
      await new Promise((resolve) => setTimeout(resolve, 2));
    }

    // Act
    const result = await getSystemStats();

    // Assert
    expect(result.totalUsers).toBe(50);
    expect(result.adminUsers).toBe(16); // Every 3rd user is admin: 3,6,9,...,48 = 16 admins
    expect(result.regularUsers).toBe(34); // 50 - 16 = 34
    expect(result.verifiedUsers).toBe(25); // Half are verified
    expect(result.unverifiedUsers).toBe(25); // Half are unverified
    expect(result.recentUsers).toHaveLength(5); // Limited to 5

    // Verify recent users contain the most recent bulk numbers
    const recentEmails = result.recentUsers.map((user) => user.email);
    expect(recentEmails.some((email) => email.includes("bulk50"))).toBe(true); // Most recent should be present
    expect(recentEmails.some((email) => email.includes("bulk49"))).toBe(true); // 2nd most recent should be present
    expect(recentEmails.some((email) => email.includes("bulk48"))).toBe(true); // 3rd most recent should be present
  });
});
