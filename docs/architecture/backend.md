# Backend Architecture

Comprehensive guide to the backend architecture using Express.js, tRPC, and MongoDB with MVC pattern and role-based authentication.

## Table of Contents
- [Overview](#overview)
- [Architecture Pattern](#architecture-pattern)
- [Directory Structure](#directory-structure)
- [Core Components](#core-components)
- [Database Layer](#database-layer)
- [Security Implementation](#security-implementation)
- [Testing Architecture](#testing-architecture)
- [Type Generation](#type-generation)

## Overview

The backend follows a clean **Model-View-Controller (MVC)** pattern with tRPC for type-safe API endpoints. All business logic is encapsulated in controllers, routes are thin wrappers, and security is handled through JWT-based authentication with role-based access control.

### Technology Stack
- **Express.js** - Web server framework
- **tRPC 11.4** - Type-safe API layer
- **MongoDB** - NoSQL database
- **Typegoose** - Type-safe MongoDB modeling
- **JWT** - Authentication tokens
- **Zod** - Schema validation
- **BiomeJS** - Code formatting and linting

## Architecture Pattern

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│     Client      │───▶│     Routes      │───▶│   Controllers   │
│   (tRPC Call)   │    │  (Thin Layer)   │    │ (Business Logic)│
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │                        │
                                ▼                        ▼
                       ┌─────────────────┐    ┌─────────────────┐
                       │   tRPC Setup    │    │    Services     │
                       │  (Auth Context) │    │   (Utilities)   │
                       └─────────────────┘    └─────────────────┘
                                                        │
                                                        ▼
                                              ┌─────────────────┐
                                              │     Models      │
                                              │   (Database)    │
                                              └─────────────────┘
```

## Directory Structure

```
backend/src/
├── config/
│   └── index.ts              # Database configuration
├── controllers/              # Business logic (MVC)
│   ├── auth/                # Authentication logic
│   │   ├── __tests__/       # Auth controller tests
│   │   │   └── signin.test.ts # Signin controller tests
│   │   ├── signin.ts        # Login controller
│   │   ├── signup.ts        # Registration controller
│   │   ├── logout.ts        # Logout controller
│   │   ├── me.ts           # Get user profile
│   │   ├── refresh.ts      # Token refresh
│   │   └── index.ts        # Auth exports
│   ├── admin/              # Admin management
│   │   ├── __tests__/       # Admin controller tests
│   │   ├── getAllUsers.ts  # Get all users
│   │   ├── deleteUser.ts   # Delete user
│   │   ├── updateUserRole.ts # Update roles
│   │   ├── getSystemStats.ts # System statistics
│   │   └── index.ts        # Admin exports
│   ├── user/               # User management
│   │   ├── __tests__/       # User controller tests
│   │   ├── updateProfile.ts # Profile updates
│   │   ├── changePassword.ts # Password change
│   │   ├── deleteAccount.ts # Account deletion
│   │   └── index.ts        # User exports
│   ├── type/               # Utility controllers
│   │   ├── __tests__/       # Type controller tests
│   │   ├── healthCheck.ts  # Health check
│   │   ├── appInfo.ts      # App information
│   │   ├── validateEmail.ts # Email validation
│   │   └── index.ts        # Type exports
│   └── index.ts            # Main controller exports
├── model/
│   ├── __tests__/           # Model tests
│   └── user.ts             # User model with Typegoose
├── routes/                 # tRPC route definitions
│   ├── __tests__/           # Route integration tests
│   ├── auth.ts            # Auth routes
│   ├── admin.ts           # Admin routes  
│   ├── user.ts            # User routes
│   ├── type.ts            # Utility routes
│   └── index.ts           # Main router
├── services/              # Shared utilities
│   ├── __tests__/          # Service tests
│   │   └── auth.test.ts    # JWT service tests
│   ├── auth.ts           # JWT utilities
│   └── password.ts       # Password hashing
├── test-utils/            # Testing utilities
│   ├── auth-helpers.ts    # JWT & user creation helpers
│   ├── trpc-helpers.ts    # tRPC testing utilities
│   └── index.ts          # Test utility exports
├── server.ts             # Express server setup
└── trpc.ts              # tRPC configuration
```

## Core Components

### 1. Controllers (`src/controllers/`)

Controllers contain all business logic with inline Zod schemas:

```typescript
// controllers/auth/signin.ts
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { UserModel } from "../../model/user";

const signinSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(1, "Password is required"),
});

export const signin = async (input: z.infer<typeof signinSchema>) => {
  const { email, password } = input;

  const user = await UserModel.findOne({ email });
  if (!user) {
    throw new TRPCError({
      code: "UNAUTHORIZED", 
      message: "Invalid credentials",
    });
  }

  const passwordMatches = await comparePassword(password, user.password);
  if (!passwordMatches) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Invalid credentials", 
    });
  }

  const tokens = await getTokens(user.id, user.email, user.role);
  await updateRefreshToken(user.id, tokens.refresh_token);

  return {
    id: user.id,
    first_name: user.first_name,
    last_name: user.last_name, 
    email: user.email,
    role: user.role,
    ...tokens,
  };
};

export { signinSchema };
```

**Key Features:**
- **Inline Schemas**: Each controller has its own Zod validation
- **Business Logic**: All logic is contained within controllers
- **Error Handling**: Standardized tRPC error responses
- **Type Safety**: Full TypeScript integration

### 2. Routes (`src/routes/`)

Thin layer that connects tRPC to controllers:

```typescript
// routes/auth.ts
import { authController } from "../controllers";
import { publicProcedure, privateProcedure, router } from "../trpc";

export const authRouter = router({
  signup: publicProcedure
    .input(authController.signupSchema)
    .mutation(async (opts) => {
      return await authController.signup(opts.input);
    }),

  signin: publicProcedure
    .input(authController.signinSchema) 
    .mutation(async (opts) => {
      return await authController.signin(opts.input);
    }),

  logout: privateProcedure.mutation(async (opts) => {
    const user = opts.ctx.user;
    return await authController.logout(user.id);
  }),

  me: privateProcedure.query(async (opts) => {
    const user = opts.ctx.user;
    return await authController.me(user);
  }),
});
```

**Key Features:**
- **Thin Layer**: No business logic in routes
- **Procedure Selection**: Choose appropriate procedure type
- **Controller Delegation**: All logic delegated to controllers
- **Type Integration**: Schemas imported from controllers

### 3. tRPC Setup (`src/trpc.ts`)

Handles authentication context and procedure definitions:

```typescript
import { initTRPC, TRPCError } from "@trpc/server";
import * as trpcExpress from "@trpc/server/adapters/express";
import jwt from "jsonwebtoken";
import { UserModel, UserRole } from "./model/user";

const createContext = async ({ req }: trpcExpress.CreateExpressContextOptions) => {
  async function getTokenFromHeader() {
    if (req.headers.authorization) {
      const token = req.headers.authorization.split(" ")[1];
      const decodedToken = await decodeAndVerifyJwtToken(token);
      return decodedToken as { userId: string; email: string; role: string };
    }
    return null;
  }
  
  const token = await getTokenFromHeader();
  
  if (!token) return { user: null };
  
  const user = await UserModel.findById(token.userId);
  return { user };
};

type Context = Awaited<ReturnType<typeof createContext>>;
const t = initTRPC.context<Context>().create();

export const router = t.router;
export const publicProcedure = t.procedure;

export const privateProcedure = publicProcedure.use(async (opts) => {
  const { ctx } = opts;
  
  if (!ctx.user) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "You are not authorized to access this resource",
    });
  }
  
  return opts.next({ ctx: { user: ctx.user } });
});

export const adminProcedure = privateProcedure.use(async (opts) => {
  const { ctx } = opts;
  
  if (ctx.user.role !== UserRole.ADMIN) {
    throw new TRPCError({
      code: "FORBIDDEN", 
      message: "Admin access required",
    });
  }
  
  return opts.next({ ctx: { user: ctx.user } });
});
```

### 4. Services (`src/services/`)

Reusable utility functions:

```typescript
// services/auth.ts
import jwt from "jsonwebtoken";

export const getTokens = async (userId: string, email: string, role: string) => {
  const payload = { userId, email, role };
  
  const access_token = jwt.sign(
    payload,
    process.env.ACCESS_TOKEN_SECRET!,
    { expiresIn: "15m" }
  );
  
  const refresh_token = jwt.sign(
    payload, 
    process.env.REFRESH_TOKEN_SECRET!,
    { expiresIn: "7d" }
  );
  
  return { access_token, refresh_token };
};
```

## Database Layer

### User Model with Typegoose

```typescript
// model/user.ts
import { prop, getModelForClass, index } from "@typegoose/typegoose";
import { Types } from "mongoose";

export enum UserRole {
  USER = "user",
  ADMIN = "admin",
}

@index({ email: 1 }, { unique: true })
export class User {
  public _id!: Types.ObjectId;

  @prop({ required: true, trim: true })
  public first_name!: string;

  @prop({ required: true, trim: true })
  public last_name!: string;

  @prop({ required: true, unique: true, lowercase: true, trim: true })
  public email!: string;

  @prop({ required: true })
  public password!: string;

  @prop({ required: true, enum: UserRole, default: UserRole.USER })
  public role!: UserRole;

  @prop()
  public refresh_token?: string;

  public get id(): string {
    return this._id.toHexString();
  }
}

export type IUser = User;
export const UserModel = getModelForClass(User);
```

### Database Configuration

```typescript
// config/index.ts
import mongoose from "mongoose";

export const connectToDatabase = async () => {
  try {
    const DATABASE_URL = process.env.DATABASE_URL;
    
    if (!DATABASE_URL) {
      throw new Error("DATABASE_URL environment variable is not defined");
    }

    await mongoose.connect(DATABASE_URL);
    console.log("✅ Connected to MongoDB");
  } catch (error) {
    console.error("❌ Database connection error:", error);
    process.exit(1);
  }
};
```

## Security Implementation

### 1. Authentication Flow

```typescript
// 1. User login → JWT tokens generated
const tokens = await getTokens(user.id, user.email, user.role);

// 2. Access token (15 minutes) for API calls
// 3. Refresh token (7 days) for token renewal
// 4. Role information embedded in JWT payload
```

### 2. Authorization Levels

| Level | Access | Context Available |
|-------|--------|-------------------|
| Public | All users | `{ user: null }` |
| Private | Authenticated users | `{ user: IUser }` |
| Admin | Admin role only | `{ user: IUser }` (with admin role) |

### 3. Middleware Chain

```typescript
Request → JWT Verification → User Lookup → Role Check → Controller
```

### 4. Error Handling

Standardized tRPC error responses:

```typescript
// Authentication errors
throw new TRPCError({
  code: "UNAUTHORIZED",
  message: "Invalid credentials",
});

// Authorization errors  
throw new TRPCError({
  code: "FORBIDDEN",
  message: "Admin access required", 
});

// Validation errors
throw new TRPCError({
  code: "BAD_REQUEST",
  message: "Invalid input data",
});
```

## Testing Architecture

The backend uses **Vitest 3.x** with comprehensive testing patterns including unit tests, integration tests, and database testing with MongoDB Memory Server.

### Testing Stack
- **Vitest 3.x** - Modern testing framework with TypeScript support
- **MongoDB Memory Server** - In-memory database for isolated testing
- **Supertest** - HTTP assertion library for API testing
- **JWT Testing** - Real token generation and validation
- **Coverage Reporting** - v8 provider with 80% thresholds

### Testing Structure

```
backend/
├── src/
│   ├── controllers/
│   │   └── auth/
│   │       └── __tests__/
│   │           └── signin.test.ts    # Controller tests
│   ├── services/
│   │   └── __tests__/
│   │       └── auth.test.ts         # Service tests
│   └── test-utils/
│       ├── auth-helpers.ts          # JWT & user helpers
│       ├── trpc-helpers.ts          # tRPC mock utilities
│       └── index.ts                 # Test exports
├── vitest.config.ts                 # Vitest configuration
└── vitest.setup.ts                  # Global test setup
```

### Test Configuration

#### vitest.config.ts
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
    testTimeout: 30000,
    coverage: {
      provider: "v8",
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

#### vitest.setup.ts
```typescript
import { beforeAll, afterAll, afterEach } from "vitest";
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";

let mongod: MongoMemoryServer;

beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();
  await mongoose.connect(uri);
  
  // Set test environment variables
  process.env.NODE_ENV = "test";
  process.env.ACCESS_TOKEN_SECRET = "test-access-secret";
  process.env.REFRESH_TOKEN_SECRET = "test-refresh-secret";
}, 60000);

afterEach(async () => {
  // Clean database between tests
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongod.stop();
});
```

### Testing Patterns

#### 1. Controller Testing
```typescript
// controllers/auth/__tests__/signin.test.ts
import { describe, it, expect } from "vitest";
import { signin } from "../signin";
import { createTestUser } from "../../../test-utils";

describe("Auth Controller - Signin", () => {
  it("should successfully sign in with valid credentials", async () => {
    // Arrange
    const { user, rawPassword } = await createTestUser();
    const signinData = { email: user.email, password: rawPassword };

    // Act
    const result = await signin(signinData);

    // Assert
    expect(result.email).toBe(user.email);
    expect(result.access_token).toBeDefined();
    expect(result.refresh_token).toBeDefined();
  });

  it("should throw UNAUTHORIZED for invalid credentials", async () => {
    // Arrange
    const invalidData = {
      email: "nonexistent@example.com",
      password: "WrongPassword"
    };

    // Act & Assert
    await expect(signin(invalidData)).rejects.toThrow(
      expect.objectContaining({
        code: "UNAUTHORIZED",
        message: "Invalid credentials"
      })
    );
  });
});
```

#### 2. Service Testing
```typescript
// services/__tests__/auth.test.ts
import { describe, it, expect } from "vitest";
import jwt from "jsonwebtoken";
import { generateAccessToken, generateRefreshToken } from "../auth";

describe("Auth Service", () => {
  it("should generate valid JWT tokens", () => {
    // Act
    const accessToken = generateAccessToken("user-id", "test@example.com", "user");
    const refreshToken = generateRefreshToken("user-id", "test@example.com", "user");

    // Assert
    expect(accessToken).toBeDefined();
    expect(refreshToken).toBeDefined();
    
    const accessDecoded = jwt.decode(accessToken) as any;
    const refreshDecoded = jwt.decode(refreshToken) as any;
    
    expect(accessDecoded.userId).toBe("user-id");
    expect(refreshDecoded.exp).toBeGreaterThan(accessDecoded.exp);
  });
});
```

### Test Utilities

#### Authentication Helpers
```typescript
// test-utils/auth-helpers.ts
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { User } from "../model/user";

export const generateTestAccessToken = (
  userId: string, 
  email: string, 
  role: UserRole = "user"
) => {
  return jwt.sign(
    { userId, email, role },
    process.env.ACCESS_TOKEN_SECRET!,
    { expiresIn: "15m" }
  );
};

export const createTestUser = async (userData?: Partial<any>) => {
  const rawPassword = userData?.password || "TestPassword123!";
  const hashedPassword = await bcrypt.hash(rawPassword, 12);
  
  const user = new User({
    email: "test@example.com",
    password: hashedPassword,
    first_name: "Test",
    last_name: "User",
    role: "user",
    is_email_verified: true,
    ...userData,
    password: hashedPassword,
  });
  
  await user.save();
  return { user, rawPassword };
};
```

#### tRPC Testing Helpers
```typescript
// test-utils/trpc-helpers.ts
export const createMockTRPCContext = (overrides: any = {}) => ({
  user: null,
  isAuthenticated: false,
  ...overrides,
});

export const createMockAuthenticatedContext = (user: any) => ({
  user,
  isAuthenticated: true,
});

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

### Testing Commands

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

### Testing Best Practices

1. **Isolation**: Each test runs with clean database state
2. **Real Dependencies**: Use MongoDB Memory Server, not mocks
3. **JWT Testing**: Generate real tokens for authentication tests
4. **Error Testing**: Test all error paths and edge cases
5. **Coverage**: Maintain 80% coverage across all metrics
6. **Fast Execution**: Tests complete in < 30 seconds
7. **Descriptive Names**: Clear test descriptions and expectations

### Integration with CI/CD

The testing setup is designed to work seamlessly with CI/CD pipelines:

- **Environment Variables**: Set automatically by vitest.setup.ts
- **Database Isolation**: No external dependencies required
- **Coverage Reports**: Generate coverage reports for CI
- **Fast Execution**: Parallel test execution supported

**See**: [Backend Testing Guide](../../testing/backend-testing.md) for comprehensive testing patterns and examples.

## Type Generation

### Automatic Type Generation

Types are automatically generated for the frontend:

```bash
# Generate types
npm run build:types

# Generated files
backend/types/
├── controllers/    # Controller types
├── routes/        # Router types  
└── ...           # Other type definitions
```

### Usage in Frontend

```typescript
// Automatically available in frontend
import type { AppRouter } from "../../../backend/types/routes";
import type { RouterInputs, RouterOutputs } from "@/trpc/client";

type UserData = RouterOutputs['auth']['me'];
type SigninInput = RouterInputs['auth']['signin'];
```

## Server Setup

### Express Server (`src/server.ts`)

```typescript
import express from "express";
import cors from "cors";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { appRouter } from "./routes";
import { createContext } from "./trpc";

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3005",
  credentials: true,
}));

app.use(express.json({ limit: "50mb" }));

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

// tRPC middleware
app.use(
  "/trpc",
  createExpressMiddleware({
    router: appRouter,
    createContext,
  })
);

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
```

## Best Practices

### 1. Controller Organization

- **One file per controller function**
- **Inline Zod schemas** with controller functions  
- **Consistent error handling** using tRPC errors
- **Pure functions** with no side effects in validation

### 2. Route Definitions

- **Thin routes** with no business logic
- **Proper procedure selection** based on auth requirements
- **Consistent input/output patterns**
- **Clear delegation** to controllers

### 3. Security Guidelines

- **JWT best practices** with short-lived access tokens
- **Role-based authorization** at procedure level
- **Input validation** on all endpoints
- **Secure password hashing** with bcryptjs

### 4. Database Patterns

- **Typegoose models** for type safety
- **Proper indexing** for performance
- **Connection pooling** via Mongoose
- **Error handling** for database operations

### 5. Code Quality

- **BiomeJS** for consistent formatting
- **TypeScript strict mode** for type safety
- **ESLint rules** for code quality
- **Proper error boundaries** and logging

## Environment Variables

Required environment variables:

```env
# Database
DATABASE_URL=mongodb://localhost:27017/trpc-template

# JWT Secrets  
ACCESS_TOKEN_SECRET=your-access-token-secret
REFRESH_TOKEN_SECRET=your-refresh-token-secret

# Server Configuration
PORT=4000
FRONTEND_URL=http://localhost:3005
```

## Extending the Backend

### Adding New Controllers

1. **Create controller file** with business logic and schema
2. **Export from controller index** 
3. **Create route** that uses the controller
4. **Add to main router**
5. **Run type generation**

### Adding New Models

1. **Create Typegoose class** with proper decorators
2. **Export model and interface**
3. **Update controllers** to use the new model
4. **Add database migrations** if needed

### Adding New Procedures

1. **Identify auth requirements** (public/private/admin)
2. **Create controller** with validation schema
3. **Add route** with appropriate procedure
4. **Test authorization** and error handling

This backend architecture provides a solid foundation for building scalable, type-safe APIs with proper separation of concerns and security best practices.