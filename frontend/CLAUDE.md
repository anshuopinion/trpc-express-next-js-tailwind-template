# tRPC Template Frontend - Claude Memory

## Project Overview
A modern Next.js 15 frontend application that serves as a template for tRPC-based full-stack applications. This frontend demonstrates best practices for building type-safe, authenticated applications with modern React patterns and a polished UI.

## Tech Stack
- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4 with shadcn/ui components
- **State Management**: TanStack React Query (v5) with tRPC
- **Authentication**: JWT-based with localStorage
- **Icons**: Lucide React
- **Animations**: Framer Motion
- **Form Handling**: React Hook Form with Zod validation
- **Notifications**: Sonner toast library

## Architecture

### Directory Structure
```
frontend/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (protected)/       # Protected routes requiring authentication
│   │   │   ├── dashboard/      # Dashboard page
│   │   │   └── layout.tsx      # Protected layout with sidebar
│   │   ├── (public)/          # Public routes
│   │   │   ├── signin/        # Sign in page
│   │   │   ├── signup/        # Sign up page
│   │   │   └── layout.tsx     # Public layout
│   │   ├── globals.css        # Global styles with Tailwind
│   │   ├── layout.tsx         # Root layout with providers
│   │   └── page.tsx           # Home page
│   ├── components/            # React components
│   │   ├── ui/               # shadcn/ui components
│   │   ├── app-sidebar.tsx   # Application sidebar
│   │   └── mobile-top-bar.tsx # Mobile navigation
│   ├── hooks/                # Custom React hooks
│   │   ├── useAuth.ts        # Authentication hook
│   │   └── use-mobile.ts     # Mobile detection hook
│   ├── layout/               # Layout components
│   │   ├── auth-layout/      # Authentication layout
│   │   ├── dashboard-layout/ # Dashboard layout components
│   │   └── main-layout/      # Main layout components
│   ├── lib/                  # Utility functions
│   │   └── utils.ts          # Common utilities and localStorage helpers
│   ├── trpc/                 # tRPC client configuration
│   │   ├── client.ts         # Client-side tRPC setup
│   │   ├── provider.tsx      # tRPC Provider component
│   │   └── server.ts         # Server-side tRPC setup
│   └── constant/             # Constants
│       └── env.tsx           # Environment constants
├── components.json           # shadcn/ui configuration
├── next.config.ts           # Next.js configuration
├── package.json             # Dependencies and scripts
├── tailwind.config.ts       # Tailwind CSS configuration
└── tsconfig.json            # TypeScript configuration
```

## tRPC Integration

### Client Setup (`src/trpc/client.ts`)
The frontend uses the modern tRPC v11 pattern with TanStack React Query:

```typescript
// Create query client with optimized defaults
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      refetchOnWindowFocus: false,
    },
  },
});

// Create vanilla tRPC client
export const trpcClient = createTRPCClient<AppRouter>({
  links: [
    httpBatchLink({
      url: `${process.env.NEXT_PUBLIC_BACKEND_URL}/trpc`,
      headers: () => {
        const token = localStorage.getItem('accessToken');
        return token ? { authorization: `Bearer ${token}` } : {};
      },
    }),
  ],
});

// Modern tRPC options proxy
export const trpc = createTRPCOptionsProxy<AppRouter>({
  client: trpcClient,
  queryClient,
});
```

### Provider Setup (`src/trpc/provider.tsx`)
Simple provider wrapping the application with React Query:

```typescript
export function TRPCProvider({ children }: TRPCProviderProps) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
```

### Usage Pattern
Components use the modern tRPC pattern with React Query:

```typescript
const trpc = useTRPC();

// Query usage
const { data: user, isLoading } = useQuery(
  trpc.auth.me.queryOptions(void 0, {
    enabled: !!getFromLocalStorage('accessToken'),
  })
);

// Mutation usage
const loginMutation = useMutation(
  trpc.auth.signin.mutationOptions({
    onSuccess: (data) => {
      // Handle success
    },
  })
);
```

## Authentication System

### JWT Authentication (`src/hooks/useAuth.ts`)
The authentication system uses JWT tokens stored in localStorage:

```typescript
export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Auto-fetch user data if token exists
  const { data: user, isLoading: userLoading, error } = useQuery(
    trpc.auth.me.queryOptions(void 0, {
      enabled: !!getFromLocalStorage('accessToken'),
      retry: false,
    })
  );

  const login = (tokens: AuthTokens) => {
    setToLocalStorage('accessToken', tokens.access_token);
    setToLocalStorage('refreshToken', tokens.refresh_token);
    setToLocalStorage('userId', tokens.id);
    setIsAuthenticated(true);
  };

  const logout = () => {
    removeFromLocalStorage('accessToken');
    removeFromLocalStorage('refreshToken');
    removeFromLocalStorage('userId');
    setIsAuthenticated(false);
    router.push('/signin');
  };

  return { user, isAuthenticated, isLoading, login, logout };
}
```

### Protected Routes (`src/app/(protected)/layout.tsx`)
Protected routes automatically redirect unauthenticated users:

```typescript
export default function ProtectedLayout({ children }) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/signin");
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <AppSidebar />
      <div className="md:ml-[200px] min-h-screen">
        {children}
      </div>
    </div>
  );
}
```

## UI Components & Styling

### shadcn/ui Integration
The project uses shadcn/ui components with the "new-york" style:

```json
{
  "style": "new-york",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "baseColor": "stone",
    "cssVariables": true
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils"
  }
}
```

### Tailwind CSS v4 Configuration
Uses the latest Tailwind CSS v4 with custom theme variables:

```css
@import "tailwindcss";
@import "tw-animate-css";

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-primary: var(--primary);
  /* ... more custom properties */
}
```

### Responsive Design
The layout adapts to different screen sizes:
- **Desktop**: Fixed sidebar with main content area
- **Mobile**: Collapsible sidebar with mobile top bar
- **Tablet**: Responsive breakpoints for optimal experience

## Form Handling

### React Hook Form with Zod
Forms use React Hook Form with Zod validation:

```typescript
const formSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const form = useForm<z.infer<typeof formSchema>>({
  resolver: zodResolver(formSchema),
  defaultValues: {
    email: "",
    password: "",
  },
});

function onSubmit(values: z.infer<typeof formSchema>) {
  signinUserMutation.mutate(values);
}
```

### Form Components
Uses shadcn/ui form components for consistent styling:

```typescript
<Form {...form}>
  <form onSubmit={form.handleSubmit(onSubmit)}>
    <FormField
      control={form.control}
      name="email"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Email</FormLabel>
          <FormControl>
            <Input {...field} placeholder="name@example.com" />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  </form>
</Form>
```

## State Management

### React Query Integration
Uses TanStack React Query for server state management:

```typescript
// Query with custom options
const { data: healthCheck } = useQuery(
  trpc.type.healthCheck.queryOptions()
);

// Mutation with callbacks
const signinMutation = useMutation(
  trpc.auth.signin.mutationOptions({
    onSuccess: (data) => {
      login(data);
      toast.success("Login successful");
      router.replace("/dashboard");
    },
    onError: (err) => {
      toast.error("Authentication failed", {
        description: err.message,
      });
    },
  })
);
```

### Local Storage Utilities
Safe localStorage operations with SSR support:

```typescript
export function getFromLocalStorage(key: string): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(key);
}

export function setToLocalStorage(key: string, value: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, value);
}
```

## Development Setup

### Environment Variables
Create `.env.local` file:

```env
NEXT_PUBLIC_BACKEND_URL=http://localhost:4005
```

### Installation & Development
```bash
# Install dependencies
npm install

# Start development server (runs on port 3005)
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run type checking
npm run type-check

# Run linting
npm run lint
```

### Package Scripts
```json
{
  "scripts": {
    "dev": "next dev -p 3005",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "type-check": "tsc --noEmit"
  }
}
```

## Key Features

### 1. Type Safety
- Full TypeScript coverage
- tRPC provides end-to-end type safety
- Type inference from backend to frontend
- Zod schemas for runtime validation

### 2. Modern React Patterns
- React 19 with Next.js 15
- App Router for optimal performance
- Server and client components
- Suspense boundaries for loading states

### 3. Authentication Flow
- JWT-based authentication
- Automatic token management
- Protected route system
- Persistent login state

### 4. Responsive UI
- Mobile-first design
- Adaptive sidebar layout
- Touch-friendly interactions
- Accessibility considerations

### 5. Developer Experience
- Hot module replacement
- TypeScript strict mode
- ESLint configuration
- React Query DevTools

## Best Practices

### 1. Component Organization
```typescript
// Component structure
export function ComponentName({ prop1, prop2 }: ComponentProps) {
  // 1. Hooks at the top
  const { user } = useAuth();
  const trpc = useTRPC();
  
  // 2. Queries and mutations
  const { data } = useQuery(trpc.endpoint.queryOptions());
  
  // 3. Event handlers
  const handleClick = () => {
    // Handle click
  };
  
  // 4. Render
  return <div>...</div>;
}
```

### 2. Error Handling
```typescript
// Query error handling
const { data, error, isLoading } = useQuery(
  trpc.endpoint.queryOptions(void 0, {
    retry: 1,
    onError: (error) => {
      toast.error("Failed to fetch data", {
        description: error.message,
      });
    },
  })
);
```

### 3. Loading States
```typescript
// Loading UI patterns
if (isLoading) {
  return <div>Loading...</div>;
}

if (error) {
  return <div>Error: {error.message}</div>;
}

return <div>{data}</div>;
```

## API Routes Integration

### Backend Communication
The frontend communicates with these backend routes:

- **Auth Routes**: `/trpc/auth.signin`, `/trpc/auth.signup`, `/trpc/auth.logout`, `/trpc/auth.me`
- **User Routes**: `/trpc/user.*` (user profile operations)
- **Type Routes**: `/trpc/type.healthCheck`, `/trpc/type.getAppInfo`

### Request/Response Flow
1. Frontend calls `trpc.auth.signin.mutate(credentials)`
2. tRPC client sends HTTP POST to `/trpc/auth.signin`
3. Backend validates credentials and returns JWT tokens
4. Frontend stores tokens in localStorage
5. Subsequent requests include `Authorization: Bearer <token>` header

## Deployment Considerations

### Environment Setup
- Set `NEXT_PUBLIC_BACKEND_URL` to production backend URL
- Ensure CORS is configured on backend for frontend domain
- Use secure localStorage practices for production

### Performance Optimization
- Built-in Next.js optimizations (code splitting, image optimization)
- React Query caching reduces API calls
- Lazy loading for non-critical components
- Optimized bundle size with tree shaking

### Security
- XSS protection through React's built-in sanitization
- CSRF protection via SameSite cookies (when implemented)
- Secure token storage considerations
- Input validation with Zod schemas

## Troubleshooting

### Common Issues

1. **tRPC Type Errors**
   - Ensure backend is running and types are generated
   - Check import paths for `AppRouter` type
   - Verify tRPC client configuration

2. **Authentication Issues**
   - Check localStorage for valid tokens
   - Verify backend CORS configuration
   - Ensure proper token format in headers

3. **Styling Issues**
   - Check Tailwind CSS configuration
   - Verify shadcn/ui component imports
   - Ensure CSS variables are properly defined

4. **Build Errors**
   - Run `npm run type-check` to identify TypeScript errors
   - Check for missing dependencies
   - Verify environment variables are set

### Development Tips
- Use React Query DevTools to debug API calls
- Enable TypeScript strict mode for better type safety
- Use browser DevTools to inspect network requests
- Test authentication flow in incognito mode

## Extension Points

### Adding New Features
1. **New Routes**: Add route files in `src/app/` directory
2. **New Components**: Create in `src/components/` with proper TypeScript types
3. **New Hooks**: Add custom hooks in `src/hooks/` directory
4. **New API Calls**: Use tRPC pattern with React Query

### Customization
- Modify theme in `src/app/globals.css`
- Update shadcn/ui configuration in `components.json`
- Add new form schemas in component files
- Extend authentication system in `src/hooks/useAuth.ts`

This template provides a solid foundation for building modern, type-safe React applications with tRPC and Next.js 15.