import { beforeEach, describe, expect, it } from "vitest";
import { UserModel, UserRole } from "../../../model/user";
import { createTestUser } from "../../../test-utils";
import { getAllUsers } from "../getAllUsers";

describe("Admin Controller - GetAllUsers", () => {
  beforeEach(async () => {
    // Clean up database before each test
    await UserModel.deleteMany({});
  });

  it("should return paginated list of users with default parameters", async () => {
    // Arrange - Create test users
    const users = [];
    for (let i = 1; i <= 5; i++) {
      const { user } = await createTestUser({
        email: `user${i}@example.com`,
        first_name: `User${i}`,
        last_name: `Test`,
      });
      users.push(user);
    }

    const input = {}; // Use defaults: page=1, limit=10

    // Act
    const result = await getAllUsers(input);

    // Assert
    expect(result).toBeDefined();
    expect(result.users).toHaveLength(5);
    expect(result.total).toBe(5);
    expect(result.page).toBe(1);
    expect(result.limit).toBe(10);
    expect(result.totalPages).toBe(1);

    // Verify users are sorted by createdAt descending (newest first)
    expect(result.users[0].first_name).toBe("User5"); // Last created should be first
    expect(result.users[4].first_name).toBe("User1"); // First created should be last
  });

  it("should return users with pagination", async () => {
    // Arrange - Create 15 test users
    const users = [];
    for (let i = 1; i <= 15; i++) {
      const { user } = await createTestUser({
        email: `paginate${i}@example.com`,
        first_name: `User${i}`,
      });
      users.push(user);
    }

    const input = {
      page: 2,
      limit: 5,
    };

    // Act
    const result = await getAllUsers(input);

    // Assert
    expect(result.users).toHaveLength(5);
    expect(result.total).toBe(15);
    expect(result.page).toBe(2);
    expect(result.limit).toBe(5);
    expect(result.totalPages).toBe(3);

    // Verify we got the correct page of users (users 11-15 would be on page 2)
    expect(result.users[0].first_name).toBe("User10"); // Newest in this page
    expect(result.users[4].first_name).toBe("User6"); // Oldest in this page
  });

  it("should filter users by role", async () => {
    // Arrange - Create users with different roles
    await createTestUser({
      email: "user1@example.com",
      role: UserRole.USER,
    });

    await createTestUser({
      email: "user2@example.com",
      role: UserRole.USER,
    });

    await createTestUser({
      email: "admin1@example.com",
      role: UserRole.ADMIN,
    });

    const input = {
      role: UserRole.USER,
    };

    // Act
    const result = await getAllUsers(input);

    // Assert
    expect(result.users).toHaveLength(2);
    expect(result.total).toBe(2);
    expect(result.users.every((user) => user.role === "user")).toBe(true);

    // Test filtering by admin role
    const adminInput = {
      role: UserRole.ADMIN,
    };

    const adminResult = await getAllUsers(adminInput);
    expect(adminResult.users).toHaveLength(1);
    expect(adminResult.total).toBe(1);
    expect(adminResult.users[0].role).toBe("admin");
  });

  it("should not expose sensitive fields", async () => {
    // Arrange - Directly create user in database to test MongoDB .select()
    await UserModel.create({
      email: "sensitive@example.com",
      first_name: "Sensitive",
      last_name: "User",
      password: "hashedpassword123",
      refresh_token: "sensitive-refresh-token",
      verify_token: "sensitive-verify-token",
      role: UserRole.USER,
      is_email_verified: false,
    });

    const input = {};

    // Act
    const result = await getAllUsers(input);

    // Assert
    expect(result.users).toHaveLength(1);
    const returnedUser = result.users[0];

    // Verify sensitive fields are NOT present in the controller response
    expect(returnedUser).not.toHaveProperty("password");
    expect(returnedUser).not.toHaveProperty("refresh_token");
    expect(returnedUser).not.toHaveProperty("verify_token");

    // Should have safe fields
    expect(returnedUser).toHaveProperty("_id");
    expect(returnedUser).toHaveProperty("email");
    expect(returnedUser).toHaveProperty("first_name");
    expect(returnedUser).toHaveProperty("last_name");
    expect(returnedUser).toHaveProperty("role");
    expect(returnedUser).toHaveProperty("is_email_verified");
  });

  it("should handle empty result set", async () => {
    // Arrange - No users in database
    const input = {};

    // Act
    const result = await getAllUsers(input);

    // Assert
    expect(result.users).toHaveLength(0);
    expect(result.total).toBe(0);
    expect(result.page).toBe(1);
    expect(result.limit).toBe(10);
    expect(result.totalPages).toBe(0);
  });

  it("should handle page beyond available pages", async () => {
    // Arrange - Create 5 users
    for (let i = 1; i <= 5; i++) {
      await createTestUser({
        email: `beyond${i}@example.com`,
      });
    }

    const input = {
      page: 10, // Way beyond available pages
      limit: 5,
    };

    // Act
    const result = await getAllUsers(input);

    // Assert
    expect(result.users).toHaveLength(0); // No users on page 10
    expect(result.total).toBe(5);
    expect(result.page).toBe(10);
    expect(result.limit).toBe(5);
    expect(result.totalPages).toBe(1);
  });

  it("should respect limit parameter", async () => {
    // Arrange - Create 20 users
    for (let i = 1; i <= 20; i++) {
      await createTestUser({
        email: `limit${i}@example.com`,
      });
    }

    const input = {
      limit: 3,
    };

    // Act
    const result = await getAllUsers(input);

    // Assert
    expect(result.users).toHaveLength(3);
    expect(result.total).toBe(20);
    expect(result.limit).toBe(3);
    expect(result.totalPages).toBe(Math.ceil(20 / 3)); // 7 pages
  });

  it("should handle minimum page and limit values", async () => {
    // Arrange
    await createTestUser({
      email: "min@example.com",
    });

    const input = {
      page: 1,
      limit: 1,
    };

    // Act
    const result = await getAllUsers(input);

    // Assert
    expect(result.users).toHaveLength(1);
    expect(result.page).toBe(1);
    expect(result.limit).toBe(1);
    expect(result.total).toBe(1);
    expect(result.totalPages).toBe(1);
  });

  it("should handle maximum limit value", async () => {
    // Arrange - Create users up to limit
    for (let i = 1; i <= 105; i++) {
      await createTestUser({
        email: `max${i}@example.com`,
      });
    }

    const input = {
      limit: 100, // Maximum allowed limit
    };

    // Act
    const result = await getAllUsers(input);

    // Assert
    expect(result.users).toHaveLength(100);
    expect(result.total).toBe(105);
    expect(result.limit).toBe(100);
    expect(result.totalPages).toBe(2);
  });

  it("should throw validation error for invalid page number", async () => {
    // Arrange
    const input = {
      page: 0, // Invalid page (less than 1)
    };

    // Act & Assert
    await expect(getAllUsers(input)).rejects.toThrow();
  });

  it("should throw validation error for invalid limit", async () => {
    // Test limit less than 1
    const inputLow = {
      limit: 0,
    };

    await expect(getAllUsers(inputLow)).rejects.toThrow();

    // Test limit greater than 100
    const inputHigh = {
      limit: 101,
    };

    await expect(getAllUsers(inputHigh)).rejects.toThrow();
  });

  it("should throw validation error for invalid role", async () => {
    // Arrange
    const input = {
      role: "invalid_role" as UserRole, // Invalid role
    };

    // Act & Assert
    await expect(getAllUsers(input)).rejects.toThrow();
  });

  it("should sort users by creation date (newest first)", async () => {
    // Arrange - Create users with slight delays to ensure different timestamps
    await createTestUser({
      email: "first@example.com",
      first_name: "First",
    });

    // Small delay to ensure different timestamps
    await new Promise((resolve) => setTimeout(resolve, 10));

    await createTestUser({
      email: "second@example.com",
      first_name: "Second",
    });

    await new Promise((resolve) => setTimeout(resolve, 10));

    await createTestUser({
      email: "third@example.com",
      first_name: "Third",
    });

    const input = {};

    // Act
    const result = await getAllUsers(input);

    // Assert - Should be sorted by creation time, newest first
    expect(result.users).toHaveLength(3);
    expect(result.users[0].first_name).toBe("Third"); // Most recent
    expect(result.users[1].first_name).toBe("Second");
    expect(result.users[2].first_name).toBe("First"); // Oldest
  });

  it("should calculate totalPages correctly", async () => {
    // Test various scenarios
    const testCases = [
      { totalUsers: 0, limit: 10, expectedPages: 0 },
      { totalUsers: 1, limit: 10, expectedPages: 1 },
      { totalUsers: 10, limit: 10, expectedPages: 1 },
      { totalUsers: 11, limit: 10, expectedPages: 2 },
      { totalUsers: 25, limit: 7, expectedPages: 4 },
    ];

    for (const testCase of testCases) {
      // Clean up
      await UserModel.deleteMany({});

      // Create users
      for (let i = 1; i <= testCase.totalUsers; i++) {
        await createTestUser({
          email: `calc${i}@example.com`,
        });
      }

      const input = {
        limit: testCase.limit,
      };

      // Act
      const result = await getAllUsers(input);

      // Assert
      expect(result.totalPages).toBe(testCase.expectedPages);
      expect(result.total).toBe(testCase.totalUsers);
    }
  });

  it("should handle mixed role filtering with pagination", async () => {
    // Arrange - Create mix of users and admins
    for (let i = 1; i <= 10; i++) {
      await createTestUser({
        email: `user${i}@example.com`,
        role: UserRole.USER,
      });
    }

    for (let i = 1; i <= 3; i++) {
      await createTestUser({
        email: `admin${i}@example.com`,
        role: UserRole.ADMIN,
      });
    }

    // Test user filtering with pagination
    const userInput = {
      role: UserRole.USER,
      page: 2,
      limit: 3,
    };

    const userResult = await getAllUsers(userInput);

    expect(userResult.users).toHaveLength(3);
    expect(userResult.total).toBe(10); // Total users only
    expect(userResult.totalPages).toBe(4); // 10 users / 3 per page = 4 pages
    expect(userResult.users.every((user) => user.role === "user")).toBe(true);
  });
});
