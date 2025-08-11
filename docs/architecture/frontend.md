# Frontend Architecture

Comprehensive guide to the frontend architecture using Next.js 15, React 19, and modern page-centric modularization with role-based authentication.

## Table of Contents
- [Overview](#overview)
- [Architecture Pattern](#architecture-pattern)
- [Directory Structure](#directory-structure)
- [Route Groups](#route-groups)
- [Authentication System](#authentication-system)
- [Data Fetching](#data-fetching)
- [UI Components](#ui-components)
- [State Management](#state-management)

## Overview

The frontend uses **Next.js 15** with **App Router** and implements a **page-centric modularization** pattern. Each page contains its own components, hooks, schemas, and utilities, with shared code properly abstracted to common directories.

### Technology Stack
- **Next.js 15** - React framework with App Router
- **React 19** - Latest React with modern features
- **TanStack React Query** - Server state management
- **tRPC Client** - Type-safe API consumption
- **shadcn/ui** - Modern UI component library
- **Tailwind CSS v4** - Utility-first CSS framework
- **TypeScript** - Full type safety
- **BiomeJS** - Code formatting and linting

## Architecture Pattern

```
┌─────────────────────────────────────────────────────────────┐
│                    Next.js App Router                        │
├─────────────────────────────────────────────────────────────┤
│  (admin)     │  (protected)   │     (public)               │
│  Admin Only  │  Auth Required │  Public Access             │
├─────────────────────────────────────────────────────────────┤
│              Page-Centric Modularization                    │
│  _components/ _hooks/ _schema/ _utils/ _types/              │
├─────────────────────────────────────────────────────────────┤
│                 Shared Infrastructure                        │
│  components/ hooks/ lib/ trpc/ layout/                     │
├─────────────────────────────────────────────────────────────┤
│              tRPC + React Query Layer                       │
├─────────────────────────────────────────────────────────────┤
│                    Backend API                              │
└─────────────────────────────────────────────────────────────┘
```

## Directory Structure

```
frontend/src/
├── app/                      # Next.js App Router
│   ├── (admin)/             # Admin-only routes
│   │   ├── _components/     # Shared admin components
│   │   ├── _constants/      # Admin navigation config
│   │   ├── admin/dashboard/ # Admin pages with modular structure
│   │   └── layout.tsx       # Admin layout
│   ├── (protected)/        # Auth-required routes
│   │   ├── _components/     # Shared protected components
│   │   ├── _constants/      # User navigation config
│   │   ├── dashboard/       # User pages with modular structure
│   │   └── layout.tsx       # Protected layout
│   ├── (public)/           # Public routes
│   │   ├── signin/         # Login page (modular)
│   │   ├── signup/         # Register page (modular)
│   │   └── layout.tsx      # Public layout
│   ├── globals.css         # Global styles
│   ├── layout.tsx          # Root layout with providers
│   └── page.tsx            # Home page
├── components/             # Shared components
│   ├── ui/                # shadcn/ui components
│   ├── forms/             # Shared form components
│   ├── guards/            # Role-based access guards
│   └── [other shared components]
├── hooks/                 # Shared React hooks
├── lib/                   # Utility functions
├── trpc/                  # tRPC client setup
├── layout/                # Layout components
└── constant/              # Application constants
```

## Route Groups

### 1. Public Routes `(public)/`

Accessible to all users without authentication:

```typescript
// app/(public)/layout.tsx
export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
}
```

**Pages:**
- `/signin` - User login
- `/signup` - User registration
- `/` - Landing page

### 2. Protected Routes `(protected)/`

Require authentication, accessible to all authenticated users:

```typescript
// app/(protected)/layout.tsx
import { ProtectedRoute } from "@/components/guards";
import { UserSidebar } from "./_components";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <div className="flex min-h-screen">
        <UserSidebar />
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </ProtectedRoute>
  );
}
```

**Pages:**
- `/dashboard` - User dashboard
- `/profile` - User profile
- `/settings` - User settings

### 3. Admin Routes `(admin)/`

Require authentication AND admin role:

```typescript
// app/(admin)/layout.tsx
import { AdminOnly } from "@/components/guards";
import { AdminSidebar } from "./_components";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminOnly>
      <div className="flex min-h-screen">
        <AdminSidebar />
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </AdminOnly>
  );
}
```

**Pages:**
- `/admin/dashboard` - Admin dashboard
- `/admin/users` - User management
- `/admin/settings` - System settings

## Authentication System

### 1. Auth Context & Hook

```typescript
// hooks/useAuth.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";

export function useAuth() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  // Get current user
  const { data: user, isLoading, error } = useQuery(
    trpc.auth.me.queryOptions(void 0, {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: (failureCount, error) => {
        if (error.data?.code === 'UNAUTHORIZED') return false;
        return failureCount < 2;
      },
    })
  );

  // Login mutation
  const login = (userData: any) => {
    localStorage.setItem('accessToken', userData.access_token);
    localStorage.setItem('refreshToken', userData.refresh_token);
    queryClient.setQueryData(['auth.me'], userData);
  };

  // Logout mutation
  const logoutMutation = useMutation(
    trpc.auth.logout.mutationOptions({
      onSuccess: () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        queryClient.clear();
        window.location.href = '/signin';
      },
    })
  );

  const logout = () => logoutMutation.mutate();

  return {
    user,
    isLoading,
    error,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    login,
    logout,
    isLoggingOut: logoutMutation.isPending,
  };
}
```

### 2. Role Guards

```typescript
// components/guards/AdminOnly.tsx
import { useAuth } from "@/hooks/useAuth";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

interface AdminOnlyProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function AdminOnly({ children, fallback }: AdminOnlyProps) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!user || user.role !== 'admin') {
    return fallback || <div>Access denied. Admin privileges required.</div>;
  }

  return <>{children}</>;
}
```

```typescript
// components/guards/RoleGuard.tsx
import { useAuth } from "@/hooks/useAuth";

interface RoleGuardProps {
  roles: string[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function RoleGuard({ roles, children, fallback }: RoleGuardProps) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!user || !roles.includes(user.role)) {
    return fallback || <div>Access denied</div>;
  }

  return <>{children}</>;
}
```

### 3. Protected Route Component

```typescript
// components/guards/ProtectedRoute.tsx
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/signin');
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return null; // Will redirect to signin
  }

  return <>{children}</>;
}
```

## Data Fetching

### 1. tRPC Integration

```typescript
// trpc/client.ts
import { createTRPCOptionsProxy } from "@trpc/tanstack-react-query";
import { createTRPCClient, httpBatchLink } from "@trpc/client";

export const trpcClient = createTRPCClient<AppRouter>({
  links: [
    httpBatchLink({
      url: `${process.env.NEXT_PUBLIC_BACKEND_URL}/trpc`,
      headers: () => {
        const token = localStorage.getItem("accessToken");
        return token ? { authorization: `Bearer ${token}` } : {};
      },
    }),
  ],
});

export const trpc = createTRPCOptionsProxy<AppRouter>({
  client: trpcClient,
  queryClient,
});

export function useTRPC() {
  return useMemo(() => trpc, []);
}
```

### 2. Query Patterns

```typescript
// Example: Dashboard data fetching
// app/(protected)/dashboard/_hooks/useDashboardData.ts
import { useQuery } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";

export function useDashboardData() {
  const trpc = useTRPC();

  const { data: user, isLoading: userLoading } = useQuery(
    trpc.auth.me.queryOptions()
  );

  const { data: health, isLoading: healthLoading } = useQuery(
    trpc.type.healthCheck.queryOptions(void 0, {
      refetchInterval: 30000,
    })
  );

  const { data: appInfo } = useQuery(
    trpc.type.getAppInfo.queryOptions()
  );

  return {
    user,
    health,
    appInfo,
    isLoading: userLoading || healthLoading,
  };
}
```

### 3. Server-Side Data Fetching

```typescript
// Server component with prefetching
import { serverTrpc } from "@/trpc/server";
import { HydrationBoundary, dehydrate } from "@tanstack/react-query";

export default async function DashboardPage() {
  const queryClient = getQueryClient();

  // Prefetch data on server
  await queryClient.prefetchQuery(
    serverTrpc.auth.me.queryOptions()
  );

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <DashboardContent />
    </HydrationBoundary>
  );
}
```

## UI Components

### 1. Component Hierarchy

```
shared components (src/components/)
├── ui/              # shadcn/ui primitives
├── forms/           # Reusable form components
├── guards/          # Access control components
└── layout/          # Layout-specific components

page-specific components (app/[route]/_components/)
├── SigninForm.tsx   # Page-specific components
├── LoginButton.tsx  # Used only within this page
└── index.ts         # Clean exports
```

### 2. Shared Form Components

```typescript
// components/forms/PasswordField.tsx
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff } from "lucide-react";

interface PasswordFieldProps {
  control: any;
  name: string;
  showPassword: boolean;
  onToggle: () => void;
  label?: string;
  placeholder?: string;
  forgotPasswordLink?: React.ReactNode;
}

export function PasswordField({
  control,
  name,
  showPassword,
  onToggle,
  label = "Password",
  placeholder = "Enter your password",
  forgotPasswordLink,
}: PasswordFieldProps) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <div className="flex items-center justify-between">
            <FormLabel>{label}</FormLabel>
            {forgotPasswordLink}
          </div>
          <FormControl>
            <div className="relative">
              <Input
                {...field}
                type={showPassword ? "text" : "password"}
                placeholder={placeholder}
                autoComplete="current-password"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2"
                onClick={onToggle}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
```

### 3. Layout Components

```typescript
// components/ContextSidebar.tsx - Context-aware sidebar
import { useAuth } from "@/hooks/useAuth";
import { AdminSidebar } from "@/app/(admin)/_components";
import { UserSidebar } from "@/app/(protected)/_components";

export function ContextSidebar() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return null;
  }

  // Show admin sidebar for admin users
  if (user.role === 'admin') {
    return <AdminSidebar />;
  }

  // Show user sidebar for regular users
  return <UserSidebar />;
}
```

## State Management

### 1. React Query for Server State

```typescript
// Global query client configuration
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000,   // 10 minutes
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 1,
    },
  },
});
```

### 2. Local State with React Hooks

```typescript
// Page-specific state management
// app/(protected)/dashboard/_hooks/useHealthCheck.ts
import { useState, useEffect } from "react";

export function useHealthCheck() {
  const [status, setStatus] = useState<'healthy' | 'unhealthy' | 'unknown'>('unknown');
  
  const { data: health } = useQuery(
    trpc.type.healthCheck.queryOptions(void 0, {
      refetchInterval: 30000,
      onSuccess: (data) => {
        setStatus(data.status === 'OK' ? 'healthy' : 'unhealthy');
      },
      onError: () => {
        setStatus('unhealthy');
      },
    })
  );

  return { status, health };
}
```

### 3. Form State with React Hook Form

```typescript
// app/(public)/signin/_hooks/useSigninForm.ts
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signinSchema, type SigninFormData } from "../_schema";

export function useSigninForm() {
  return useForm<SigninFormData>({
    resolver: zodResolver(signinSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });
}
```

## Styling System

### 1. Tailwind CSS v4

Global styles with Tailwind utilities:

```css
/* app/globals.css */
@tailwind base;
@tailwind components;  
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 240 10% 3.9%;
    /* ... other CSS variables */
  }
  
  .dark {
    --background: 240 10% 3.9%;
    --foreground: 0 0% 98%;
    /* ... dark mode variables */
  }
}

@layer components {
  .btn-primary {
    @apply bg-primary text-primary-foreground hover:bg-primary/90;
  }
}
```

### 2. Component Variants with cva

```typescript
// Example: Button variants
import { cva, type VariantProps } from "class-variance-authority";

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-input bg-background hover:bg-accent",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8", 
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);
```

## Performance Optimizations

### 1. Code Splitting

Next.js automatically splits code at the page level, and we enhance this with:

```typescript
// Dynamic imports for heavy components
import dynamic from 'next/dynamic';

const HeavyChart = dynamic(() => import('./HeavyChart'), {
  loading: () => <div>Loading chart...</div>,
  ssr: false, // Client-side only if needed
});
```

### 2. React Query Optimizations

```typescript
// Strategic caching
const { data } = useQuery(
  trpc.admin.getAllUsers.queryOptions({ page: 1 }, {
    staleTime: 60000,      // 1 minute
    gcTime: 300000,        // 5 minutes  
    keepPreviousData: true, // Keep previous data while loading
  })
);
```

### 3. Image Optimization

```typescript
// Next.js Image component
import Image from 'next/image';

<Image
  src="/hero.jpg"
  alt="Hero image"
  width={800}
  height={600}
  priority // LCP optimization
  placeholder="blur"
  blurDataURL="data:image/jpeg;base64,..."
/>
```

## Best Practices

### 1. Component Organization

- **Page-specific components** in `_components/` directories
- **Shared components** in `src/components/`
- **Clean exports** via `index.ts` files
- **Single responsibility** principle

### 2. Data Fetching

- **React Query** for all server state
- **Optimistic updates** for better UX
- **Error boundaries** for graceful failures
- **Loading states** for better perceived performance

### 3. Type Safety

- **Full TypeScript** integration
- **tRPC type inference** from backend
- **Zod schemas** for validation
- **Type-safe routing** with Next.js

### 4. Security

- **Role-based guards** for access control
- **JWT token management** with automatic refresh
- **Secure storage** of sensitive data
- **XSS protection** via React's built-in escaping

### 5. Performance

- **Code splitting** at page boundaries
- **Image optimization** with Next.js Image
- **Efficient caching** with React Query
- **Bundle analysis** for optimization

This frontend architecture provides a scalable, maintainable, and type-safe foundation for building modern React applications with excellent developer experience and user performance.