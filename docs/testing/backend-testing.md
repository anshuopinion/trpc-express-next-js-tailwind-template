# Backend Testing Guide

This guide covers testing the Express.js + tRPC backend using Vitest, including controllers, services, authentication flows, and database operations.

## Overview

Our backend testing setup uses:
- **Vitest 3.x** - Modern testing framework with TypeScript support
- **MongoDB Memory Server** - In-memory database for isolated testing
- **Supertest** - HTTP assertion library for API testing
- **JWT Testing** - Authentication flow testing with real tokens
- **Coverage Reporting** - v8 provider with 80% thresholds

## Test Structure

```
backend/
├── src/
│   ├── controllers/
│   │   └── auth/
│   │       └── __tests__/
│   │           └── signin.test.ts
│   ├── services/
│   │   └── __tests__/
│   │       └── auth.test.ts
│   └── test-utils/
│       ├── auth-helpers.ts
│       ├── trpc-helpers.ts
│       └── index.ts
├── vitest.config.ts
└── vitest.setup.ts
```

## Configuration Files

### vitest.config.ts
```typescript
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    setupFiles: ["./vitest.setup.ts"],
    globals: true,
    include: [
      "src/**/*.{test,spec}.{js,ts}",
      "src/**/__tests__/**/*.{js,ts}"
    ],
    testTimeout: 30000, // 30 seconds for integration tests
    coverage: {
      provider: "v8",
      include: ["src/**/*.ts"],
      exclude: [
        "src/**/*.test.ts",
        "src/**/__tests__/**",
        "src/test-utils/**",
        "src/types/**",
        "src/**/*.d.ts"
      ],
      thresholds: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80
        }
      }
    }
  }
});
```

### vitest.setup.ts
```typescript
import { beforeAll, afterAll, afterEach } from "vitest";
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";

let mongod: MongoMemoryServer;

beforeAll(async () => {
  // Start MongoDB Memory Server
  mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();
  
  await mongoose.connect(uri);
  
  // Set test environment variables
  process.env.NODE_ENV = "test";
  process.env.ACCESS_TOKEN_SECRET = "test-access-secret";
  process.env.REFRESH_TOKEN_SECRET = "test-refresh-secret";
}, 60000);

afterAll(async () => {
  await mongoose.disconnect();
  await mongod.stop();
});

afterEach(async () => {
  // Clean up database between tests
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});
```

## Test Utilities

### Authentication Helpers (auth-helpers.ts)
```typescript
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { User } from "../model/user";
import type { UserRole } from "../model/user";

// Generate test JWT tokens
export const generateTestAccessToken = (
  userId: string, 
  email: string, 
  role: UserRole = "user"
) => {
  const secret = process.env.ACCESS_TOKEN_SECRET!;
  return jwt.sign({ userId, email, role }, secret, { expiresIn: "15m" });
};

// Create test users with hashed passwords
export const createTestUser = async (userData?: Partial<any>) => {
  const rawPassword = userData?.password || "TestPassword123!";
  const hashedPassword = await bcrypt.hash(rawPassword, 12);
  
  const defaultData = {
    email: "test@example.com",
    password: hashedPassword,
    first_name: "Test",
    last_name: "User",
    role: "user" as UserRole,
    is_email_verified: true,
  };
  
  const user = new User({
    ...defaultData,
    ...userData,
    password: hashedPassword,
  });
  
  await user.save();
  return { user, rawPassword };
};

// Generate auth headers for API requests
export const generateAuthHeader = (token: string) => ({
  Authorization: `Bearer ${token}`,
});
```

### tRPC Helpers (trpc-helpers.ts)
```typescript
import { vi } from "vitest";

// Mock tRPC contexts
export const createMockTRPCContext = (overrides: any = {}) => ({
  user: null,
  isAuthenticated: false,
  ...overrides,
});

export const createMockAuthenticatedContext = (user: any) => ({
  user,
  isAuthenticated: true,
});

// Mock test data
export const mockTRPCData = {
  user: {
    id: "test-user-id",
    email: "test@example.com",
    first_name: "Test",
    last_name: "User",
    role: "user" as const,
  },
  tokens: {
    access_token: "mock-access-token",
    refresh_token: "mock-refresh-token",
    expires_at: Math.floor(Date.now() / 1000) + 60 * 15,
  },
};
```

## Testing Patterns

### Controller Testing
```typescript
import { describe, it, expect, beforeEach } from "vitest";
import { signin } from "../signin";
import { createTestUser } from "../../../test-utils";

describe("Auth Controller - Signin", () => {
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
    expect(result.access_token).toBeDefined();
    expect(result.refresh_token).toBeDefined();
  });

  it("should throw UNAUTHORIZED error for invalid credentials", async () => {
    // Arrange
    const signinData = {
      email: "nonexistent@example.com",
      password: "WrongPassword",
    };

    // Act & Assert
    await expect(signin(signinData)).rejects.toThrow(
      expect.objectContaining({
        code: "UNAUTHORIZED",
        message: "Invalid credentials",
      })
    );
  });
});
```

### Service Testing
```typescript
import { describe, it, expect } from "vitest";
import jwt from "jsonwebtoken";
import { generateAccessToken, generateRefreshToken } from "../auth";

describe("Auth Service", () => {
  it("should generate a valid access token", () => {
    // Act
    const token = generateAccessToken("user-id", "test@example.com", "user");

    // Assert
    expect(token).toBeDefined();
    const decoded = jwt.decode(token) as any;
    expect(decoded.userId).toBe("user-id");
    expect(decoded.email).toBe("test@example.com");
    expect(decoded.role).toBe("user");
  });

  it("should generate tokens with correct expiration times", () => {
    // Act
    const accessToken = generateAccessToken("user-id", "test@example.com", "user");
    const refreshToken = generateRefreshToken("user-id", "test@example.com", "user");

    // Assert
    const accessDecoded = jwt.decode(accessToken) as any;
    const refreshDecoded = jwt.decode(refreshToken) as any;
    
    // Refresh token should expire later than access token
    expect(refreshDecoded.exp).toBeGreaterThan(accessDecoded.exp);
  });
});
```

### Database Testing
```typescript
import { describe, it, expect, beforeEach } from "vitest";
import { User } from "../../model/user";
import { createTestUser } from "../../test-utils";

describe("User Model", () => {
  it("should create a user with valid data", async () => {
    // Arrange & Act
    const { user } = await createTestUser({
      email: "newuser@example.com",
      first_name: "New",
      last_name: "User",
    });

    // Assert
    expect(user).toBeDefined();
    expect(user.email).toBe("newuser@example.com");
    expect(user.first_name).toBe("New");
    expect(user.last_name).toBe("User");
    
    // Verify user was saved to database
    const savedUser = await User.findById(user.id);
    expect(savedUser).toBeDefined();
    expect(savedUser?.email).toBe("newuser@example.com");
  });
});
```

### Error Handling Testing
```typescript
it("should handle missing environment variables", () => {
  // Arrange
  const originalSecret = process.env.ACCESS_TOKEN_SECRET;
  delete process.env.ACCESS_TOKEN_SECRET;

  // Act & Assert
  expect(() => {
    generateAccessToken("user-id", "test@example.com", "user");
  }).toThrow("ACCESS_TOKEN_SECRET is not defined");

  // Cleanup
  process.env.ACCESS_TOKEN_SECRET = originalSecret;
});
```

## Running Tests

### Basic Commands
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage
```

### Environment Variables
Required environment variables for testing (set automatically by vitest.setup.ts):
- `NODE_ENV=test`
- `ACCESS_TOKEN_SECRET=test-access-secret`
- `REFRESH_TOKEN_SECRET=test-refresh-secret`

### Test Organization
- **Unit Tests**: Test individual functions/methods in isolation
- **Integration Tests**: Test complete flows with database operations
- **Controller Tests**: Test business logic and error handling
- **Service Tests**: Test utility functions and JWT operations

## Best Practices

### 1. Test Structure
```typescript
describe("Feature Name", () => {
  beforeEach(async () => {
    // Setup for each test
  });

  it("should do something specific", async () => {
    // Arrange - Set up test data
    const testData = createTestData();

    // Act - Execute the function
    const result = await functionUnderTest(testData);

    // Assert - Verify the result
    expect(result).toBe(expectedValue);
  });
});
```

### 2. Database Testing
- Use MongoDB Memory Server for isolation
- Clean up database between tests in `afterEach`
- Create helper functions for common test data setup
- Test both success and error scenarios

### 3. Authentication Testing
- Test with different user roles (user, admin)
- Test JWT token generation and validation
- Test protected routes with valid/invalid tokens
- Test token expiration scenarios

### 4. Error Testing
- Test all error paths and edge cases
- Verify proper error codes and messages
- Test schema validation errors
- Test missing/invalid environment variables

### 5. Mocking
- Mock external services and APIs
- Use Vitest's `vi.fn()` for function mocks
- Mock environment variables when needed
- Keep mocks simple and focused

## Coverage and Quality

### Coverage Thresholds
- **Branches**: 80%
- **Functions**: 80%
- **Lines**: 80%
- **Statements**: 80%

### Coverage Reports
```bash
# Generate coverage report
npm run test:coverage

# View coverage in browser
open coverage/index.html
```

### Quality Checks
- All tests should pass consistently
- No flaky tests or race conditions
- Fast execution (< 30 seconds total)
- Clear test names and descriptions
- Proper cleanup and isolation

## Common Testing Patterns

### Testing Controllers
```typescript
// Test successful operations
it("should return user data on successful operation", async () => {
  const result = await controller.method(validInput);
  expect(result).toMatchObject(expectedOutput);
});

// Test validation errors
it("should throw validation error for invalid input", async () => {
  await expect(controller.method(invalidInput)).rejects.toThrow();
});

// Test authorization
it("should require authentication", async () => {
  await expect(controller.method(input, unauthenticatedContext))
    .rejects.toThrow(expect.objectContaining({ code: "UNAUTHORIZED" }));
});
```

### Testing Services
```typescript
// Test pure functions
it("should transform data correctly", () => {
  const result = service.transform(inputData);
  expect(result).toEqual(expectedOutput);
});

// Test async operations
it("should handle async operations", async () => {
  const result = await service.asyncMethod(input);
  expect(result).toBeDefined();
});
```

### Testing Database Operations
```typescript
// Test CRUD operations
it("should create and retrieve user", async () => {
  const userData = { email: "test@example.com" };
  const user = await User.create(userData);
  
  const found = await User.findById(user.id);
  expect(found?.email).toBe(userData.email);
});
```

This testing setup provides comprehensive coverage for the Express.js + tRPC backend, ensuring reliability and maintainability of the codebase.