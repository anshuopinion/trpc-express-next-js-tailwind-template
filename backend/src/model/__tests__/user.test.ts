import { describe, it, expect, beforeEach } from "vitest";
import { UserModel, UserRole, UserClass } from "../user";
import mongoose from "mongoose";

describe("User Model", () => {
  beforeEach(async () => {
    // Clean up database before each test
    await UserModel.deleteMany({});
  });

  describe("Model Creation", () => {
    it("should create a user with required fields", async () => {
      // Arrange
      const userData = {
        first_name: "John",
        last_name: "Doe",
        email: "john@example.com",
        password: "hashedpassword123",
      };

      // Act
      const user = await UserModel.create(userData);

      // Assert
      expect(user).toBeDefined();
      expect(user.first_name).toBe("John");
      expect(user.last_name).toBe("Doe");
      expect(user.email).toBe("john@example.com");
      expect(user.password).toBe("hashedpassword123");
      expect(user.role).toBe(UserRole.USER); // Default role
      expect(user.is_email_verified).toBe(false); // Default value
      expect(user.id).toBeDefined();
      expect(user.createdAt).toBeDefined();
      expect(user.updatedAt).toBeDefined();
    });

    it("should create a user with all optional fields", async () => {
      // Arrange
      const userData = {
        first_name: "Jane",
        last_name: "Smith",
        email: "jane@example.com",
        password: "hashedpassword456",
        avatar: "https://example.com/avatar.jpg",
        refresh_token: "refresh_token_hash",
        is_email_verified: true,
        verify_token: "verify_token_123",
        role: UserRole.ADMIN,
      };

      // Act
      const user = await UserModel.create(userData);

      // Assert
      expect(user.first_name).toBe("Jane");
      expect(user.last_name).toBe("Smith");
      expect(user.email).toBe("jane@example.com");
      expect(user.password).toBe("hashedpassword456");
      expect(user.avatar).toBe("https://example.com/avatar.jpg");
      expect(user.refresh_token).toBe("refresh_token_hash");
      expect(user.is_email_verified).toBe(true);
      expect(user.verify_token).toBe("verify_token_123");
      expect(user.role).toBe(UserRole.ADMIN);
    });

    it("should set default values correctly", async () => {
      // Arrange
      const userData = {
        first_name: "Default",
        last_name: "User",
        email: "default@example.com",
        password: "hashedpassword",
      };

      // Act
      const user = await UserModel.create(userData);

      // Assert
      expect(user.role).toBe(UserRole.USER);
      expect(user.is_email_verified).toBe(false);
      expect(user.avatar).toBeUndefined();
      expect(user.refresh_token).toBeUndefined();
      expect(user.verify_token).toBeUndefined();
    });

    it("should generate timestamps automatically", async () => {
      // Arrange
      const beforeCreation = new Date();
      const userData = {
        first_name: "Timestamp",
        last_name: "Test",
        email: "timestamp@example.com",
        password: "hashedpassword",
      };

      // Act
      const user = await UserModel.create(userData);

      // Assert
      const afterCreation = new Date();
      expect(user.createdAt).toBeDefined();
      expect(user.updatedAt).toBeDefined();
      expect(user.createdAt!.getTime()).toBeGreaterThanOrEqual(
        beforeCreation.getTime(),
      );
      expect(user.createdAt!.getTime()).toBeLessThanOrEqual(
        afterCreation.getTime(),
      );
      expect(user.updatedAt!.getTime()).toBeGreaterThanOrEqual(
        beforeCreation.getTime(),
      );
      expect(user.updatedAt!.getTime()).toBeLessThanOrEqual(
        afterCreation.getTime(),
      );
    });
  });

  describe("Model Validation", () => {
    it("should throw validation error for missing required fields", async () => {
      // Arrange - Missing required fields
      const incompleteUserData = {
        first_name: "John",
        // Missing last_name, email, password
      };

      // Act & Assert
      await expect(UserModel.create(incompleteUserData)).rejects.toThrow();
    });

    it("should throw validation error for missing first_name", async () => {
      // Arrange
      const userData = {
        last_name: "Doe",
        email: "test@example.com",
        password: "hashedpassword",
      };

      // Act & Assert
      await expect(UserModel.create(userData)).rejects.toThrow();
    });

    it("should throw validation error for missing last_name", async () => {
      // Arrange
      const userData = {
        first_name: "John",
        email: "test@example.com",
        password: "hashedpassword",
      };

      // Act & Assert
      await expect(UserModel.create(userData)).rejects.toThrow();
    });

    it("should throw validation error for missing email", async () => {
      // Arrange
      const userData = {
        first_name: "John",
        last_name: "Doe",
        password: "hashedpassword",
      };

      // Act & Assert
      await expect(UserModel.create(userData)).rejects.toThrow();
    });

    it("should throw validation error for missing password", async () => {
      // Arrange
      const userData = {
        first_name: "John",
        last_name: "Doe",
        email: "test@example.com",
      };

      // Act & Assert
      await expect(UserModel.create(userData)).rejects.toThrow();
    });

    it("should throw validation error for invalid role", async () => {
      // Arrange
      const userData = {
        first_name: "John",
        last_name: "Doe",
        email: "test@example.com",
        password: "hashedpassword",
        role: "invalid_role" as any,
      };

      // Act & Assert
      await expect(UserModel.create(userData)).rejects.toThrow();
    });
  });

  describe("Email Uniqueness", () => {
    it("should enforce unique email constraint", async () => {
      // Arrange
      const uniqueEmail = `unique${Date.now()}@example.com`;
      const userData1 = {
        first_name: "John",
        last_name: "Doe",
        email: uniqueEmail,
        password: "hashedpassword1",
      };

      const userData2 = {
        first_name: "Jane",
        last_name: "Smith",
        email: uniqueEmail, // Same email
        password: "hashedpassword2",
      };

      // Act - Create first user
      await UserModel.create(userData1);

      // Act & Assert - Second user with same email should fail
      await expect(UserModel.create(userData2)).rejects.toThrow();
    });

    it("should allow different emails", async () => {
      // Arrange
      const userData1 = {
        first_name: "John",
        last_name: "Doe",
        email: "john@example.com",
        password: "hashedpassword1",
      };

      const userData2 = {
        first_name: "Jane",
        last_name: "Smith",
        email: "jane@example.com", // Different email
        password: "hashedpassword2",
      };

      // Act
      const user1 = await UserModel.create(userData1);
      const user2 = await UserModel.create(userData2);

      // Assert
      expect(user1).toBeDefined();
      expect(user2).toBeDefined();
      expect(user1.email).toBe("john@example.com");
      expect(user2.email).toBe("jane@example.com");
    });
  });

  describe("UserRole Enum", () => {
    it("should accept USER role", async () => {
      // Arrange
      const userData = {
        first_name: "User",
        last_name: "Role",
        email: "user@example.com",
        password: "hashedpassword",
        role: UserRole.USER,
      };

      // Act
      const user = await UserModel.create(userData);

      // Assert
      expect(user.role).toBe(UserRole.USER);
      expect(user.role).toBe("user");
    });

    it("should accept ADMIN role", async () => {
      // Arrange
      const userData = {
        first_name: "Admin",
        last_name: "Role",
        email: "admin@example.com",
        password: "hashedpassword",
        role: UserRole.ADMIN,
      };

      // Act
      const user = await UserModel.create(userData);

      // Assert
      expect(user.role).toBe(UserRole.ADMIN);
      expect(user.role).toBe("admin");
    });

    it("should default to USER role when not specified", async () => {
      // Arrange
      const userData = {
        first_name: "Default",
        last_name: "Role",
        email: "default@example.com",
        password: "hashedpassword",
        // role not specified
      };

      // Act
      const user = await UserModel.create(userData);

      // Assert
      expect(user.role).toBe(UserRole.USER);
    });
  });

  describe("CRUD Operations", () => {
    it("should find user by id", async () => {
      // Arrange
      const userData = {
        first_name: "Find",
        last_name: "Test",
        email: "find@example.com",
        password: "hashedpassword",
      };

      const createdUser = await UserModel.create(userData);

      // Act
      const foundUser = await UserModel.findById(createdUser.id);

      // Assert
      expect(foundUser).toBeDefined();
      expect(foundUser?.first_name).toBe("Find");
      expect(foundUser?.email).toBe("find@example.com");
      expect(foundUser?.id).toBe(createdUser.id);
    });

    it("should find user by email", async () => {
      // Arrange
      const userData = {
        first_name: "Email",
        last_name: "Search",
        email: "search@example.com",
        password: "hashedpassword",
      };

      await UserModel.create(userData);

      // Act
      const foundUser = await UserModel.findOne({
        email: "search@example.com",
      });

      // Assert
      expect(foundUser).toBeDefined();
      expect(foundUser?.first_name).toBe("Email");
      expect(foundUser?.last_name).toBe("Search");
    });

    it("should update user information", async () => {
      // Arrange
      const userData = {
        first_name: "Original",
        last_name: "Name",
        email: "update@example.com",
        password: "hashedpassword",
      };

      const user = await UserModel.create(userData);

      // Act
      const updatedUser = await UserModel.findByIdAndUpdate(
        user.id,
        { first_name: "Updated", is_email_verified: true },
        { new: true },
      );

      // Assert
      expect(updatedUser).toBeDefined();
      expect(updatedUser?.first_name).toBe("Updated");
      expect(updatedUser?.last_name).toBe("Name"); // Unchanged
      expect(updatedUser?.is_email_verified).toBe(true);
    });

    it("should delete user", async () => {
      // Arrange
      const userData = {
        first_name: "Delete",
        last_name: "Test",
        email: "delete@example.com",
        password: "hashedpassword",
      };

      const user = await UserModel.create(userData);

      // Act
      await UserModel.findByIdAndDelete(user.id);

      // Assert
      const deletedUser = await UserModel.findById(user.id);
      expect(deletedUser).toBeNull();
    });

    it("should count documents", async () => {
      // Arrange
      const users = [
        {
          first_name: "User1",
          last_name: "Test",
          email: "user1@example.com",
          password: "pass1",
        },
        {
          first_name: "User2",
          last_name: "Test",
          email: "user2@example.com",
          password: "pass2",
        },
        {
          first_name: "User3",
          last_name: "Test",
          email: "user3@example.com",
          password: "pass3",
        },
      ];

      for (const userData of users) {
        await UserModel.create(userData);
      }

      // Act
      const totalUsers = await UserModel.countDocuments({});
      const userRoleCount = await UserModel.countDocuments({
        role: UserRole.USER,
      });

      // Assert
      expect(totalUsers).toBe(3);
      expect(userRoleCount).toBe(3); // All default to USER role
    });
  });

  describe("Indexing", () => {
    it("should have role field indexed", async () => {
      // Arrange & Act
      const indexes = await UserModel.collection.getIndexes();

      // Assert
      const roleIndexExists = Object.keys(indexes).some((key) =>
        indexes[key].some((field: any) => field[0] === "role"),
      );
      expect(roleIndexExists).toBe(true);
    });

    it("should query efficiently by role using index", async () => {
      // Arrange
      const adminUser = {
        first_name: "Admin",
        last_name: "User",
        email: "admin@example.com",
        password: "adminpass",
        role: UserRole.ADMIN,
      };

      const regularUsers = Array.from({ length: 5 }, (_, i) => ({
        first_name: `User${i}`,
        last_name: "Regular",
        email: `user${i}@example.com`,
        password: "userpass",
        role: UserRole.USER,
      }));

      await UserModel.create(adminUser);
      for (const userData of regularUsers) {
        await UserModel.create(userData);
      }

      // Act
      const adminUsers = await UserModel.find({ role: UserRole.ADMIN });
      const userUsers = await UserModel.find({ role: UserRole.USER });

      // Assert
      expect(adminUsers).toHaveLength(1);
      expect(userUsers).toHaveLength(5);
      expect(adminUsers[0].email).toBe("admin@example.com");
    });
  });

  describe("Optional Fields", () => {
    it("should handle null avatar", async () => {
      // Arrange
      const userData = {
        first_name: "No",
        last_name: "Avatar",
        email: "noavatar@example.com",
        password: "hashedpassword",
        avatar: null,
      };

      // Act
      const user = await UserModel.create(userData);

      // Assert
      expect(user.avatar).toBeNull();
    });

    it("should handle undefined optional fields", async () => {
      // Arrange
      const userData = {
        first_name: "Minimal",
        last_name: "User",
        email: "minimal@example.com",
        password: "hashedpassword",
        // Optional fields not provided
      };

      // Act
      const user = await UserModel.create(userData);

      // Assert
      expect(user.avatar).toBeUndefined();
      expect(user.refresh_token).toBeUndefined();
      expect(user.verify_token).toBeUndefined();
    });

    it("should update optional fields", async () => {
      // Arrange
      const userData = {
        first_name: "Update",
        last_name: "Optional",
        email: "optional@example.com",
        password: "hashedpassword",
      };

      const user = await UserModel.create(userData);

      // Act
      const updatedUser = await UserModel.findByIdAndUpdate(
        user.id,
        {
          avatar: "https://example.com/new-avatar.jpg",
          refresh_token: "new_refresh_token",
          verify_token: "new_verify_token",
        },
        { new: true },
      );

      // Assert
      expect(updatedUser?.avatar).toBe("https://example.com/new-avatar.jpg");
      expect(updatedUser?.refresh_token).toBe("new_refresh_token");
      expect(updatedUser?.verify_token).toBe("new_verify_token");
    });
  });

  describe("Timestamp Updates", () => {
    it("should update updatedAt on document modification", async () => {
      // Arrange
      const userData = {
        first_name: "Timestamp",
        last_name: "Update",
        email: "timestamp@example.com",
        password: "hashedpassword",
      };

      const user = await UserModel.create(userData);
      const originalUpdatedAt = user.updatedAt;

      // Wait a small amount to ensure timestamp difference
      await new Promise((resolve) => setTimeout(resolve, 10));

      // Act
      const updatedUser = await UserModel.findByIdAndUpdate(
        user.id,
        { first_name: "Updated" },
        { new: true },
      );

      // Assert
      expect(updatedUser?.updatedAt).toBeDefined();
      expect(updatedUser?.updatedAt!.getTime()).toBeGreaterThan(
        originalUpdatedAt!.getTime(),
      );
      expect(updatedUser?.createdAt).toEqual(user.createdAt); // createdAt should not change
    });
  });

  describe("Collection Configuration", () => {
    it("should use correct collection name", async () => {
      // Act
      const collectionName = UserModel.collection.name;

      // Assert
      expect(collectionName).toBe("users");
    });

    it("should have timestamps enabled", async () => {
      // Arrange
      const userData = {
        first_name: "Collection",
        last_name: "Test",
        email: "collection@example.com",
        password: "hashedpassword",
      };

      // Act
      const user = await UserModel.create(userData);

      // Assert
      expect(user.createdAt).toBeDefined();
      expect(user.updatedAt).toBeDefined();
      expect(user.createdAt).toBeInstanceOf(Date);
      expect(user.updatedAt).toBeInstanceOf(Date);
    });
  });

  describe("Model Type Safety", () => {
    it("should maintain type safety with UserClass interface", () => {
      // This is a compile-time test - if it compiles, types are correct
      const userInstance = new UserClass();
      userInstance.first_name = "Type";
      userInstance.last_name = "Safety";
      userInstance.email = "type@example.com";
      userInstance.password = "password";
      userInstance.role = UserRole.USER;
      userInstance.is_email_verified = false;

      // Assert
      expect(userInstance.first_name).toBe("Type");
      expect(userInstance.role).toBe(UserRole.USER);
    });

    it("should support UserRole enum values", () => {
      // Act & Assert
      expect(UserRole.USER).toBe("user");
      expect(UserRole.ADMIN).toBe("admin");
      expect(Object.values(UserRole)).toHaveLength(2);
      expect(Object.values(UserRole)).toContain("user");
      expect(Object.values(UserRole)).toContain("admin");
    });
  });
});
