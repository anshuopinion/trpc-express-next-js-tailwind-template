import { beforeAll, afterAll, afterEach, vi } from "vitest";
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";

// Global test variables
let mongod: MongoMemoryServer;

// Global setup - runs once before all tests
beforeAll(async () => {
  // Set test environment variables
  process.env.NODE_ENV = "test";
  process.env.ACCESS_TOKEN_SECRET = "test-access-secret-key-for-jwt-tokens";
  process.env.REFRESH_TOKEN_SECRET = "test-refresh-secret-key-for-jwt-tokens";
  process.env.PORT = "0"; // Use random port for tests

  // Start in-memory MongoDB instance
  mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();

  // Connect to the in-memory database
  await mongoose.connect(uri);
  console.log("✅ Connected to test database");
}, 60000); // 60 second timeout for MongoDB setup

// Global teardown - runs once after all tests
afterAll(async () => {
  // Close database connection
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.close();
  }

  // Stop the in-memory MongoDB instance
  if (mongod) {
    await mongod.stop();
  }

  console.log("✅ Test database cleaned up");
}, 30000);

// Clean up after each test
afterEach(async () => {
  // Clear all collections after each test
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany({});
  }

  // Clear all mocks
  vi.clearAllMocks();
});

// Mock external services that might be called during tests
vi.mock("nodemailer", () => ({
  createTransport: vi.fn(() => ({
    sendMail: vi.fn().mockResolvedValue({ messageId: "test-message-id" }),
  })),
}));

// Mock file system operations if needed
vi.mock("fs", async () => {
  const actual = await vi.importActual("fs");
  return {
    ...actual,
    writeFileSync: vi.fn(),
    readFileSync: vi.fn(),
    existsSync: vi.fn().mockReturnValue(true),
    mkdirSync: vi.fn(),
  };
});

// Mock console.log to reduce test output noise (optional)
vi.spyOn(console, "log").mockImplementation(() => {});

// Export test utilities for use in tests
export const testUtils = {
  // Generate test user data
  generateTestUser: (overrides: any = {}) => ({
    first_name: "Test",
    last_name: "User",
    email: `test${Date.now()}@example.com`,
    password: "Test123!",
    role: "user" as const,
    ...overrides,
  }),

  // Generate admin user data
  generateTestAdmin: (overrides: any = {}) => ({
    first_name: "Test",
    last_name: "Admin",
    email: `admin${Date.now()}@example.com`,
    password: "Admin123!",
    role: "admin" as const,
    ...overrides,
  }),

  // Wait for async operations
  delay: (ms: number) => new Promise((resolve) => setTimeout(resolve, ms)),
};
