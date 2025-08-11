# tRPC Usage Guide

Complete guide for using tRPC 11.4 in this template with React Query integration and full-stack type safety.

## Table of Contents
- [Overview](#overview)
- [Backend Implementation](#backend-implementation)
- [Frontend Implementation](#frontend-implementation)
- [Common Patterns](#common-patterns)
- [Advanced Usage](#advanced-usage)
- [Type Safety](#type-safety)
- [Best Practices](#best-practices)

## Overview

This template uses tRPC 11.4 with the modern `createTRPCOptionsProxy` pattern for seamless integration with React Query. All API calls are fully type-safe from backend to frontend.

### Architecture
```
Backend (Express + tRPC) ←→ Frontend (Next.js + React Query)
     ↓ Generates types ↓
   Auto-generated types ensure full-stack type safety
```

## Backend Implementation

### 1. tRPC Setup (`src/trpc.ts`)

```typescript
import { initTRPC, TRPCError } from "@trpc/server";
import * as trpcExpress from "@trpc/server/adapters/express";

// Context creation with JWT authentication
const createContext = async ({ req }: trpcExpress.CreateExpressContextOptions) => {
  // JWT token extraction and user authentication
  const user = await getUserFromToken(req.headers.authorization);
  return { user };
};

type Context = Awaited<ReturnType<typeof createContext>>;
const t = initTRPC.context<Context>().create();

// Export procedures
export const router = t.router;
export const publicProcedure = t.procedure;
export const privateProcedure = t.procedure.use(/* auth middleware */);
export const adminProcedure = privateProcedure.use(/* admin middleware */);
```

### 2. Controller Pattern

Create controllers with inline Zod schemas:

```typescript
// controllers/auth/signin.ts
import { z } from "zod";

const signinSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(1, "Password is required"),
});

export const signin = async (input: z.infer<typeof signinSchema>) => {
  const { email, password } = input;
  
  // Business logic here
  const user = await UserModel.findOne({ email });
  if (!user || !await comparePassword(password, user.password)) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Invalid credentials",
    });
  }

  const tokens = await getTokens(user.id, user.email, user.role);
  return {
    id: user.id,
    email: user.email,
    role: user.role,
    ...tokens,
  };
};

export { signinSchema };
```

### 3. Router Definition

Connect controllers to routes:

```typescript
// routes/auth.ts
import { authController } from "../controllers";
import { publicProcedure, privateProcedure, router } from "../trpc";

export const authRouter = router({
  // Public mutation
  signin: publicProcedure
    .input(authController.signinSchema)
    .mutation(async (opts) => {
      return await authController.signin(opts.input);
    }),

  // Private query  
  me: privateProcedure.query(async (opts) => {
    const user = opts.ctx.user; // User available in context
    return await authController.me(user);
  }),

  // Admin-only query
  getAllUsers: adminProcedure
    .input(z.object({ page: z.number(), limit: z.number() }))
    .query(async (opts) => {
      return await adminController.getAllUsers(opts.input);
    }),
});
```

### 4. Procedure Types

| Procedure | Authentication | Context | Use Case |
|-----------|----------------|---------|----------|
| `publicProcedure` | None | `{ user: null }` | Registration, login |
| `privateProcedure` | JWT required | `{ user: IUser }` | User operations |
| `adminProcedure` | JWT + admin role | `{ user: IUser }` | Admin operations |

## Frontend Implementation

### 1. Client Setup (Already Configured)

The tRPC client is pre-configured in `src/trpc/client.ts`:

```typescript
import { createTRPCOptionsProxy } from "@trpc/tanstack-react-query";

// Modern tRPC client with React Query integration
export const trpc = createTRPCOptionsProxy<AppRouter>({
  client: trpcClient,
  queryClient,
});

// Hook for accessing tRPC in components
export function useTRPC() {
  return useMemo(() => trpc, []);
}
```

### 2. Query Usage

Use queries for data fetching:

```typescript
import { useQuery } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";

function UserProfile() {
  const trpc = useTRPC();
  
  // Simple query
  const { data: user, isLoading, error } = useQuery(
    trpc.auth.me.queryOptions()
  );

  // Query with parameters
  const { data: users } = useQuery(
    trpc.admin.getAllUsers.queryOptions({ page: 1, limit: 10 })
  );

  // Query with custom options
  const { data: health } = useQuery(
    trpc.type.healthCheck.queryOptions(void 0, {
      staleTime: 30000,
      refetchInterval: 30000,
      retry: (failureCount, error) => {
        if (error.data?.code === 'UNAUTHORIZED') return false;
        return failureCount < 2;
      },
    })
  );

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  
  return <div>Welcome, {user?.email}</div>;
}
```

### 3. Mutation Usage

Use mutations for data modification:

```typescript
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";

function useSigninMutation() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const router = useRouter();

  const signinMutation = useMutation(
    trpc.auth.signin.mutationOptions({
      onSuccess: (data) => {
        // Store tokens
        localStorage.setItem('accessToken', data.access_token);
        
        // Invalidate and refetch user data
        queryClient.invalidateQueries({ queryKey: ['auth.me'] });
        
        toast.success("Login successful");
        router.push("/dashboard");
      },
      onError: (error) => {
        if (error.data?.code === 'UNAUTHORIZED') {
          toast.error("Invalid credentials");
        } else {
          toast.error("Login failed: " + error.message);
        }
      },
    })
  );

  const handleSignin = (values: { email: string; password: string }) => {
    signinMutation.mutate(values);
  };

  return {
    signinMutation,
    handleSignin,
    isPending: signinMutation.isPending,
  };
}
```

### 4. Server-Side Usage

For server components and SSR:

```typescript
import { serverTrpc, serverTrpcCall } from "@/trpc/server";
import { getQueryClient } from "@/trpc/server";

// Server component
async function ServerComponent() {
  // Direct server call
  const user = await serverTrpc.auth.me.query();
  
  // With error handling
  const { data, error } = await serverTrpcCall(() => 
    serverTrpc.auth.me.query()
  );

  return <div>Server-rendered user: {user?.email}</div>;
}

// Prefetching for hydration
async function prefetchData() {
  const queryClient = getQueryClient();
  
  await queryClient.prefetchQuery(
    serverTrpc.auth.me.queryOptions()
  );
  
  return queryClient;
}
```

## Common Patterns

### 1. Authentication-Aware Queries

Handle authentication states gracefully:

```typescript
const { data: user, isLoading, error } = useQuery(
  trpc.auth.me.queryOptions(void 0, {
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    retry: (failureCount, error) => {
      // Don't retry on auth errors
      if (error.data?.code === 'UNAUTHORIZED') return false;
      return failureCount < 2;
    },
    onError: (error) => {
      if (error.data?.code === 'UNAUTHORIZED') {
        // Redirect to login
        router.push('/signin');
      }
    },
  })
);
```

### 2. Optimistic Updates

Update UI immediately, rollback on error:

```typescript
const updateProfileMutation = useMutation(
  trpc.user.updateProfile.mutationOptions({
    onMutate: async (newData) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['auth.me'] });
      
      // Snapshot current value
      const previousUser = queryClient.getQueryData(['auth.me']);
      
      // Optimistically update
      queryClient.setQueryData(['auth.me'], (old: any) => ({
        ...old,
        ...newData,
      }));
      
      return { previousUser };
    },
    onError: (err, newData, context) => {
      // Rollback on error
      if (context?.previousUser) {
        queryClient.setQueryData(['auth.me'], context.previousUser);
      }
    },
    onSettled: () => {
      // Refetch after settle
      queryClient.invalidateQueries({ queryKey: ['auth.me'] });
    },
  })
);
```

### 3. Dependent Queries

Chain queries based on previous results:

```typescript
// First query
const { data: user } = useQuery(
  trpc.auth.me.queryOptions()
);

// Dependent query
const { data: profile, isLoading: profileLoading } = useQuery(
  trpc.user.getProfile.queryOptions(
    { userId: user?.id },
    {
      enabled: !!user?.id, // Only run if user ID exists
    }
  )
);
```

### 4. Background Refetching

Keep data fresh automatically:

```typescript
const { data: notifications } = useQuery(
  trpc.user.getNotifications.queryOptions(void 0, {
    refetchInterval: 30000, // Refetch every 30 seconds
    refetchIntervalInBackground: true,
    staleTime: 0, // Always consider stale
  })
);
```

## Advanced Usage

### 1. Custom Error Handling

Handle different error types:

```typescript
const { data, error, isError } = useQuery(
  trpc.admin.getAllUsers.queryOptions({ page: 1 })
);

if (isError && error) {
  switch (error.data?.code) {
    case 'FORBIDDEN':
      return <div>Admin access required</div>;
    case 'UNAUTHORIZED':
      return <div>Please log in</div>;
    case 'BAD_REQUEST':
      return <div>Invalid request: {error.message}</div>;
    default:
      return <div>Something went wrong</div>;
  }
}
```

### 2. Batch Queries

Execute multiple queries efficiently:

```typescript
const queries = useQueries({
  queries: [
    {
      queryKey: ['auth.me'],
      queryFn: () => trpc.auth.me.query(),
    },
    {
      queryKey: ['user.notifications'],
      queryFn: () => trpc.user.getNotifications.query(),
      enabled: !!user, // Conditional execution
    },
  ],
});

const [userQuery, notificationsQuery] = queries;
```

### 3. Infinite Queries

Handle paginated data:

```typescript
const {
  data,
  fetchNextPage,
  hasNextPage,
  isFetchingNextPage,
} = useInfiniteQuery(
  trpc.admin.getAllUsers.infiniteOptions({
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    initialPageParam: { page: 1, limit: 10 },
  })
);
```

## Type Safety

### 1. Input/Output Types

Extract types for use in components:

```typescript
import type { RouterInputs, RouterOutputs } from "@/trpc/client";

// Input types
type SigninInput = RouterInputs['auth']['signin'];
type UpdateProfileInput = RouterInputs['user']['updateProfile'];

// Output types  
type UserData = RouterOutputs['auth']['me'];
type SystemStats = RouterOutputs['admin']['getSystemStats'];

// Use in components
interface ProfileFormProps {
  user: UserData;
  onSubmit: (data: UpdateProfileInput) => void;
}
```

### 2. Procedure Types

Type-safe procedure definitions:

```typescript
import type { TRPCRouterRecord } from '@trpc/server';

// Ensure all routes are properly typed
const authRouter: TRPCRouterRecord = {
  signin: publicProcedure
    .input(signinSchema)
    .mutation(async ({ input }) => {
      // input is automatically typed
      return await authController.signin(input);
    }),
};
```

## Best Practices

### 1. Error Boundaries

Wrap queries in error boundaries:

```typescript
function QueryErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary
      fallback={<div>Something went wrong</div>}
      onError={(error) => {
        console.error('Query error:', error);
      }}
    >
      {children}
    </ErrorBoundary>
  );
}
```

### 2. Loading States

Provide good loading experiences:

```typescript
function UserDashboard() {
  const { data: user, isLoading } = useQuery(
    trpc.auth.me.queryOptions()
  );

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    );
  }

  return <div>Dashboard content</div>;
}
```

### 3. Cache Management

Invalidate cache strategically:

```typescript
const updateUserMutation = useMutation(
  trpc.user.updateProfile.mutationOptions({
    onSuccess: () => {
      // Invalidate specific queries
      queryClient.invalidateQueries({ 
        queryKey: ['auth.me'] 
      });
      
      // Invalidate all user-related queries
      queryClient.invalidateQueries({ 
        queryKey: ['user'] 
      });
    },
  })
);
```

### 4. Environment-Specific Behavior

Handle different environments:

```typescript
const { data } = useQuery(
  trpc.type.healthCheck.queryOptions(void 0, {
    refetchInterval: process.env.NODE_ENV === 'development' ? 5000 : 30000,
    staleTime: process.env.NODE_ENV === 'development' ? 0 : 60000,
  })
);
```

## Troubleshooting

### Common Issues

1. **Type Errors**: Run `npm run build:types` in backend to regenerate types
2. **Auth Errors**: Check token storage and JWT configuration
3. **CORS Issues**: Verify CORS settings in backend server
4. **Network Errors**: Check API URL and network connectivity

### Debug Mode

Enable debug logging:

```typescript
// Add to client setup
const trpcClient = createTRPCClient<AppRouter>({
  links: [
    httpBatchLink({
      url: process.env.NEXT_PUBLIC_BACKEND_URL + '/trpc',
      fetch: (url, options) => {
        console.log('tRPC Request:', url, options);
        return fetch(url, options);
      },
    }),
  ],
});
```

## Migration from Legacy Patterns

If migrating from older tRPC patterns:

```typescript
// OLD (v10 pattern)
const user = trpc.auth.me.useQuery();
const signin = trpc.auth.signin.useMutation();

// NEW (v11+ pattern)
const { data: user } = useQuery(trpc.auth.me.queryOptions());
const signin = useMutation(trpc.auth.signin.mutationOptions());
```

This modern pattern provides better React Query integration and more flexible query management.