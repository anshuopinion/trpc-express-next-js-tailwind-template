import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // Use Node.js environment for backend testing
    environment: "node",

    // Global setup and teardown
    setupFiles: ["./vitest.setup.ts"],

    // Enable global APIs (describe, it, expect, etc.)
    globals: true,

    // Test file patterns
    include: ["src/**/*.{test,spec}.{js,ts}", "src/**/__tests__/**/*.{js,ts}"],

    // Exclude patterns
    exclude: [
      "**/node_modules/**",
      "**/dist/**",
      "**/.git/**",
      "**/coverage/**",
    ],

    // Test timeout (30 seconds for integration tests)
    testTimeout: 30000,

    // Coverage configuration
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      exclude: [
        "coverage/**",
        "dist/**",
        "**/node_modules/**",
        "**/.git/**",
        "**/__tests__/**",
        "**/*.test.{js,ts}",
        "**/*.spec.{js,ts}",
        "vitest.config.ts",
        "vitest.setup.ts",
      ],
      include: ["src/**/*.{js,ts}"],
      // Thresholds for coverage
      thresholds: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80,
        },
      },
    },

    // Pool configuration for better performance
    pool: "threads",

    // Reporter configuration
    reporter: ["verbose"],

    // Retry failed tests once
    retry: 1,
  },
});
