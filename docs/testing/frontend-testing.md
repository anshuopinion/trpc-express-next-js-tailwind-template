# Frontend Testing Guide

Comprehensive testing setup for the Next.js frontend using Vitest and React Testing Library.

## Overview

This project uses **Vitest** as the primary testing framework, chosen for its:
- Fast execution with native ES modules support
- Excellent TypeScript integration
- Vite-based configuration for consistency with modern tooling
- Built-in code coverage reporting
- Happy DOM environment for better performance

## Tech Stack

- **Vitest 3.x**: Main testing framework
- **React Testing Library**: Component testing utilities
- **@testing-library/jest-dom**: Extended matchers for DOM testing
- **@testing-library/user-event**: User interaction simulation
- **Happy DOM**: Fast DOM implementation (alternative to jsdom)
- **TypeScript**: Full type support for tests

## Project Structure

```
frontend/
├── vitest.config.ts           # Vitest configuration
├── vitest.setup.ts            # Global test setup
├── src/
│   ├── test-utils/            # Shared test utilities
│   │   └── trpc-mocks.ts      # tRPC mock utilities
│   ├── components/
│   │   └── ui/
│   │       └── __tests__/     # Component tests
│   │           └── button.test.tsx
│   ├── hooks/
│   │   └── __tests__/         # Hook tests
│   │       └── useAuth.test.ts
│   ├── lib/
│   │   └── __tests__/         # Utility tests
│   │       └── utils.test.ts
│   └── app/
│       └── (routes)/
│           └── _components/
│               └── __tests__/ # Page-specific component tests
```

## Configuration Files

### vitest.config.ts
```typescript
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'happy-dom',
    setupFiles: ['./vitest.setup.ts'],
    globals: true,
    css: true,
    include: [
      '**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
      '**/__tests__/**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'
    ],
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/.next/**',
      '**/coverage/**'
    ]
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  }
})
```

### vitest.setup.ts
Global test setup with Next.js mocks and extended matchers.

## Available Scripts

```bash
# Run tests once
npm run test

# Watch mode for development  
npm run test:watch

# UI mode with browser interface (requires @vitest/ui)
npm run test:ui

# Generate coverage report
npm run test:coverage
```

### Current Test Results
✅ **22 tests passing** across 3 test suites:
- **Button Component**: 8 tests (variant classes, click events, disabled state, asChild)
- **useAuth Hook**: 6 tests (state management, role helpers, login/logout functionality)  
- **Utils Functions**: 8 tests (className merging, localStorage operations)

## Testing Patterns

### 1. Component Testing

**Example: Button Component Test**
```typescript
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Button } from '../button'

describe('Button Component', () => {
  it('renders with correct text', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument()
  })

  it('handles click events', async () => {
    const user = userEvent.setup()
    const mockClick = vi.fn()
    
    render(<Button onClick={mockClick}>Clickable</Button>)
    await user.click(screen.getByRole('button'))
    
    expect(mockClick).toHaveBeenCalledOnce()
  })
})
```

### 2. Hook Testing

**Example: useAuth Hook Test**
```typescript
import { renderHook } from '@testing-library/react'
import { useAuth } from '../useAuth'

// Mock dependencies
vi.mock('@/lib/utils')
vi.mock('@/lib/auth-utils')

describe('useAuth Hook', () => {
  it('initializes with default state', () => {
    const { result } = renderHook(() => useAuth())
    
    expect(result.current.isAuthenticated).toBe(false)
    expect(result.current.isLoading).toBe(false)
  })
})
```

### 3. Utility Function Testing

**Example: Utils Test**
```typescript
import { cn, getFromLocalStorage } from '../utils'

describe('Utils Functions', () => {
  describe('cn (className utility)', () => {
    it('merges class names correctly', () => {
      const result = cn('base-class', 'additional-class')
      expect(result).toContain('base-class')
      expect(result).toContain('additional-class')
    })
  })
})
```

### 4. tRPC Integration Testing

**Mock Setup:**
```typescript
// src/test-utils/trpc-mocks.ts
import { vi } from 'vitest'

export const mockTrpcClient = {
  auth: {
    me: {
      queryOptions: vi.fn(() => ({
        queryKey: ['auth.me'],
        queryFn: vi.fn(),
      })),
    },
    signin: {
      mutationOptions: vi.fn(() => ({
        mutationFn: vi.fn(),
      })),
    },
  },
  user: {
    updateProfile: {
      mutationOptions: vi.fn(() => ({
        mutationFn: vi.fn(),
      })),
    },
  },
}

// Mock data for testing
export const mockUserData = {
  id: 'test-user-id',
  email: 'test@example.com',
  firstName: 'John',
  lastName: 'Doe',
  role: 'user' as const,
}
```

**Usage in Tests:**
```typescript
import { vi } from 'vitest'
import { mockTrpcClient } from '@/test-utils/trpc-mocks'

vi.mock('@/trpc/client', () => ({
  useTRPC: () => mockTrpcClient,
}))
```

## Testing Next.js Features

### Router Mocking
```typescript
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
  }),
  usePathname: () => '/test-path',
}))
```

### Environment Variables
```typescript
vi.mock('@/constant/env', () => ({
  BACKEND_URL: 'http://localhost:3000',
}))
```

## Page-Centric Testing

Following the project's page-centric modularization pattern:

**Page Component Structure:**
```
dashboard/
├── _components/
│   ├── __tests__/
│   │   ├── WelcomeSection.test.tsx
│   │   └── StatsCard.test.tsx
│   ├── WelcomeSection.tsx
│   └── StatsCard.tsx
├── _hooks/
│   ├── __tests__/
│   │   └── useDashboardData.test.ts
│   └── useDashboardData.ts
└── page.tsx
```

**Page-Specific Test Example:**
```typescript
// dashboard/_components/__tests__/WelcomeSection.test.tsx
import { render, screen } from '@testing-library/react'
import { WelcomeSection } from '../WelcomeSection'

describe('Dashboard WelcomeSection', () => {
  it('displays user welcome message', () => {
    const mockUser = { firstName: 'John', lastName: 'Doe' }
    render(<WelcomeSection user={mockUser} />)
    
    expect(screen.getByText(/welcome.*john/i)).toBeInTheDocument()
  })
})
```

## Best Practices

### 1. Test Organization
- Place tests close to the code they test
- Use descriptive test names that explain behavior
- Group related tests with `describe` blocks
- Follow the Arrange-Act-Assert pattern

### 2. Mocking Strategy
- Mock external dependencies (APIs, localStorage, etc.)
- Use shared mocks in `src/__tests__/mocks/`
- Mock Next.js features that don't work in test environment
- Keep mocks simple and focused

### 3. Component Testing
- Test user interactions, not implementation details
- Use semantic queries (`getByRole`, `getByLabelText`)
- Test accessibility features
- Focus on component behavior and output

### 4. Async Testing
```typescript
// Use waitFor for async operations
await waitFor(() => {
  expect(screen.getByText('Loaded data')).toBeInTheDocument()
})

// Use user-event for realistic user interactions
const user = userEvent.setup()
await user.click(screen.getByRole('button'))
```

### 5. Coverage Goals
- Maintain >80% code coverage
- Focus on critical business logic
- Test error states and edge cases
- Don't test third-party library internals

## Common Testing Utilities

### Using Test Utilities
```typescript
// Import shared mocks and utilities
import { vi } from 'vitest'
import { mockTrpcClient, mockUserData } from '@/test-utils/trpc-mocks'

describe('Component with tRPC', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('uses mocked tRPC data', () => {
    // Use the pre-configured mocks
    mockTrpcClient.auth.me.queryOptions.mockReturnValue({
      queryKey: ['auth.me'],
      queryFn: vi.fn().mockResolvedValue(mockUserData),
    })
    
    // Your test here...
  })
})
```

### Test Data Available
All mock data is centralized in `src/test-utils/trpc-mocks.ts`:
- `mockUserData` - Standard user object
- `mockAdminData` - Admin user object  
- `mockAuthTokens` - Authentication tokens
- `mockHealthCheckData` - Health check response

## Debugging Tests

### VS Code Integration
Add to `.vscode/settings.json`:
```json
{
  "vitest.enable": true,
  "vitest.commandLine": "npm run test"
}
```

### Browser Debugging
```bash
# Open tests in browser UI
npm run test:ui

# Debug specific test
npm run test:watch -- --reporter=verbose specific-test.test.ts
```

## CI/CD Integration

### GitHub Actions Example
```yaml
- name: Run Frontend Tests
  run: |
    cd frontend
    npm run test:coverage
    
- name: Upload Coverage
  uses: codecov/codecov-action@v3
  with:
    file: ./frontend/coverage/lcov.info
```

## Troubleshooting

### Common Issues

**1. Module Resolution Errors**
- Ensure path aliases match `tsconfig.json`
- Check `vitest.config.ts` resolve configuration

**2. DOM/Window Errors**
- Add missing mocks to `vitest.setup.ts`
- Use `happy-dom` environment in config

**3. Next.js Import Errors**
- Mock Next.js modules that don't work in test environment
- Use dynamic imports for client-only code

**4. tRPC Query Errors**
- Mock the tRPC client properly
- Disable queries in tests with `enabled: false`

### Performance Tips
- Use `happy-dom` instead of `jsdom` for faster tests
- Mock heavy dependencies
- Use `vi.hoisted()` for module mocks
- Run tests in parallel (default in Vitest)

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro)
- [Testing Library Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
- [Next.js Testing Documentation](https://nextjs.org/docs/app/building-your-application/testing)

## Setup Status ✅

The testing framework is **fully configured and operational**:

### ✅ What's Working
- **22 tests passing** across all test suites
- **Vitest 3.2.4** with Happy DOM environment
- **TypeScript integration** with proper type checking
- **Next.js mocking** for router, navigation, and browser APIs
- **tRPC mock utilities** ready for API testing
- **All npm scripts** functional (`test`, `test:watch`, `test:ui`, `test:coverage`)

### 🚀 Ready to Use
```bash
# All these commands work out of the box
npm run test           # ✅ 22 tests passing
npm run test:watch     # ✅ Watch mode active  
npm run test:ui        # ✅ Browser UI available
npm run test:coverage  # ✅ Coverage reporting ready
```

### 📁 Files Created
- `vitest.config.ts` - Main configuration
- `vitest.setup.ts` - Global test setup with mocks
- `src/test-utils/trpc-mocks.ts` - Centralized tRPC mocks
- Example tests in `components/`, `hooks/`, and `lib/` directories
- Updated `package.json` with test dependencies and scripts
- Updated `tsconfig.json` with Vitest types

The testing setup follows modern best practices and integrates seamlessly with your existing Next.js 15 + tRPC + TypeScript stack.

## Related Documentation

- [tRPC Usage Guide](../api/trpc-usage.md)
- [Frontend Architecture](../architecture/frontend.md)
- [Page Modularization](../architecture/page-modularization.md)