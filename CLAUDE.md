# Modern tRPC Full-Stack Template - Claude Memory

## Project Overview
A comprehensive, production-ready full-stack TypeScript template built with the latest tRPC patterns, Next.js 15, and modern authentication. This template serves as a robust foundation for building type-safe, scalable web applications with seamless full-stack integration.

## Architecture

### Project Structure
```
template-folder/
├── backend/                    # Express.js + tRPC server
│   ├── src/
│   │   ├── config/            # Database configuration
│   │   │   └── index.ts       # MongoDB connection setup
│   │   ├── controllers/       # Business logic controllers (MVC pattern)
│   │   │   ├── auth/          # Authentication controllers
│   │   │   │   ├── index.ts   # Auth controller exports
│   │   │   │   ├── signup.ts  # User registration logic
│   │   │   │   ├── signin.ts  # User login logic
│   │   │   │   ├── logout.ts  # Logout logic
│   │   │   │   ├── me.ts      # Get user profile logic
│   │   │   │   └── refresh.ts # Token refresh logic
│   │   │   ├── user/          # User management controllers
│   │   │   │   ├── index.ts   # User controller exports
│   │   │   │   ├── updateProfile.ts  # Profile update logic
│   │   │   │   ├── changePassword.ts # Password change logic
│   │   │   │   └── deleteAccount.ts  # Account deletion logic
│   │   │   ├── type/          # Utility controllers
│   │   │   │   ├── index.ts   # Type controller exports
│   │   │   │   ├── appInfo.ts # App information logic
│   │   │   │   ├── environment.ts # Environment info logic
│   │   │   │   ├── validateEmail.ts # Email validation logic
│   │   │   │   └── healthCheck.ts # Health check logic
│   │   │   └── index.ts       # Main controller exports
│   │   ├── model/             # Data models
│   │   │   └── user.ts        # User model with Typegoose
│   │   ├── routes/            # Clean tRPC route definitions
│   │   │   ├── index.ts       # Main router combining all routes
│   │   │   ├── auth.ts        # Authentication routes (use controllers)
│   │   │   ├── user.ts        # User management routes (use controllers)
│   │   │   └── type.ts        # Type utility routes (use controllers)
│   │   ├── services/          # Shared business services
│   │   │   ├── auth.ts        # JWT token utilities
│   │   │   └── password.ts    # Password hashing utilities
│   │   ├── server.ts          # Express server configuration
│   │   └── trpc.ts            # tRPC setup with context and procedures
│   ├── types/                 # Auto-generated TypeScript declarations
│   └── package.json
└── frontend/                  # Next.js 15 application with Page-Centric Modularization
    ├── src/
    │   ├── app/              # Next.js App Router with Modular Page Structure
    │   │   ├── (protected)/  # Protected routes requiring authentication
    │   │   │   ├── dashboard/      # Dashboard page with modular structure
    │   │   │   │   ├── _components/    # Dashboard-specific components
    │   │   │   │   │   ├── StatsCard.tsx         # Reusable stats card
    │   │   │   │   │   ├── UserProfileCard.tsx   # User profile display
    │   │   │   │   │   ├── ServerStatusCard.tsx  # Server status display
    │   │   │   │   │   ├── AppInfoCard.tsx       # App info display
    │   │   │   │   │   ├── WelcomeSection.tsx    # Welcome message
    │   │   │   │   │   └── index.ts              # Export all components
    │   │   │   │   ├── _hooks/         # Dashboard-specific hooks
    │   │   │   │   │   ├── useDashboardData.ts   # Dashboard data fetching
    │   │   │   │   │   ├── useHealthCheck.ts     # Health check hook
    │   │   │   │   │   └── index.ts              # Export all hooks
    │   │   │   │   ├── _utils/         # Dashboard utilities
    │   │   │   │   │   ├── formatters.ts         # Data formatting
    │   │   │   │   │   ├── calculations.ts       # Dashboard calculations
    │   │   │   │   │   └── index.ts              # Export utilities
    │   │   │   │   ├── _types/         # Dashboard-specific types
    │   │   │   │   │   ├── dashboard.types.ts    # TypeScript interfaces
    │   │   │   │   │   └── index.ts              # Export types
    │   │   │   │   └── page.tsx        # Clean dashboard page using components
    │   │   │   └── layout.tsx          # Protected layout with sidebar
    │   │   ├── (public)/              # Public routes with modular structure
    │   │   │   ├── signin/            # Sign in page with modular structure
    │   │   │   │   ├── _components/        # Signin-specific components
    │   │   │   │   │   ├── SigninForm.tsx      # Main signin form wrapper
    │   │   │   │   │   ├── LoginButton.tsx     # Submit button with loading
    │   │   │   │   │   └── index.ts            # Export components
    │   │   │   │   ├── _hooks/             # Signin-specific hooks
    │   │   │   │   │   ├── useSigninForm.ts    # Form state management
    │   │   │   │   │   ├── useSigninMutation.ts # API mutation logic
    │   │   │   │   │   └── index.ts            # Export hooks
    │   │   │   │   ├── _schema/            # Signin validation
    │   │   │   │   │   ├── signinSchema.ts     # Zod validation schema
    │   │   │   │   │   └── index.ts            # Export schema
    │   │   │   │   ├── _utils/             # Signin utilities
    │   │   │   │   │   ├── validation.ts       # Form validation helpers
    │   │   │   │   │   ├── storage.ts          # Token storage utilities
    │   │   │   │   │   └── index.ts            # Export utilities
    │   │   │   │   └── page.tsx            # Clean signin page
    │   │   │   ├── signup/            # Sign up page with modular structure
    │   │   │   │   ├── _components/        # Signup-specific components
    │   │   │   │   │   ├── SignupForm.tsx      # Main signup form wrapper
    │   │   │   │   │   ├── NameFields.tsx      # First/last name inputs
    │   │   │   │   │   ├── SignupButton.tsx    # Submit button
    │   │   │   │   │   ├── ConfirmPasswordField.tsx # Password confirmation
    │   │   │   │   │   └── index.ts            # Export components
    │   │   │   │   ├── _hooks/             # Signup-specific hooks
    │   │   │   │   │   ├── useSignupForm.ts    # Form state management
    │   │   │   │   │   ├── useSignupMutation.ts # API mutation logic
    │   │   │   │   │   └── index.ts            # Export hooks (+ shared)
    │   │   │   │   ├── _schema/            # Signup validation
    │   │   │   │   │   ├── signupSchema.ts     # Zod validation schema
    │   │   │   │   │   └── index.ts            # Export schema
    │   │   │   │   ├── _utils/             # Signup utilities
    │   │   │   │   │   ├── validation.ts       # Form validation helpers
    │   │   │   │   │   ├── passwordUtils.ts    # Password strength utils
    │   │   │   │   │   └── index.ts            # Export utilities
    │   │   │   │   └── page.tsx            # Clean signup page
    │   │   │   └── layout.tsx         # Public layout
    │   │   ├── globals.css            # Global styles with Tailwind
    │   │   ├── layout.tsx             # Root layout with providers
    │   │   └── page.tsx               # Home page
    │   ├── components/                # Shared React components
    │   │   ├── ui/                   # shadcn/ui components
    │   │   ├── forms/                # Shared form components
    │   │   │   ├── PasswordField.tsx      # Reusable password input
    │   │   │   └── index.ts               # Export form components
    │   │   ├── app-sidebar.tsx       # Application sidebar
    │   │   └── mobile-top-bar.tsx    # Mobile navigation
    │   ├── hooks/                    # Shared custom React hooks
    │   │   ├── useAuth.ts           # Authentication hook
    │   │   ├── usePasswordToggle.ts # Password visibility hook (shared)
    │   │   └── use-mobile.ts        # Mobile detection hook
    │   ├── layout/                   # Layout components
    │   │   ├── auth-layout/         # Authentication layout
    │   │   ├── dashboard-layout/    # Dashboard layout components
    │   │   └── main-layout/         # Main layout components
    │   ├── lib/                     # Utility functions
    │   │   └── utils.ts            # Common utilities and localStorage helpers
    │   ├── trpc/                    # Modern tRPC client setup
    │   │   ├── client.ts           # tRPC client configuration
    │   │   ├── provider.tsx        # React Query provider
    │   │   └── server.ts           # Server-side tRPC client
    │   └── constant/                # Application constants
    │       └── env.tsx             # Environment variables
    └── package.json
```

## Technology Stack

### Backend Stack
- **Express.js** - Fast, unopinionated web framework
- **tRPC 11.4** - Type-safe API layer with full TypeScript inference
- **MongoDB** - NoSQL database for flexibility
- **Typegoose** - Type-safe MongoDB modeling with TypeScript
- **JWT** - Secure authentication with access/refresh tokens
- **bcryptjs** - Password hashing for security
- **Zod** - Schema validation and type inference
- **CORS** - Cross-origin resource sharing configuration

### Frontend Stack
- **Next.js 15** - React framework with App Router
- **React 19** - Latest React with modern features
- **TanStack React Query** - Server state management
- **tRPC Client** - Type-safe API consumption
- **shadcn/ui** - Modern, accessible UI components
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Beautiful icon library
- **Framer Motion** - Animation library
- **React Hook Form** - Form management
- **TypeScript** - Full type safety

## Modern tRPC Implementation

### Key Features
1. **Latest tRPC Patterns** - Uses tRPC 11.4 with modern React Query integration
2. **Type Safety** - Full-stack type inference from backend to frontend
3. **Modern Client Setup** - Uses `createTRPCOptionsProxy` for cleaner API calls
4. **Automatic Type Generation** - Backend generates TypeScript declarations
5. **Optimized Queries** - React Query for efficient data fetching and caching

### tRPC Client Architecture
```typescript
// Modern tRPC pattern - no more trpc.auth.me.useQuery()
import { trpc } from '@/trpc/client';
import { useQuery, useMutation } from '@tanstack/react-query';

// Client-side usage
const userQuery = useQuery(trpc.auth.me.queryOptions());
const logoutMutation = useMutation(trpc.auth.logout.mutationOptions());
```

### Server-Side Integration
```typescript
// Server component data fetching
import { serverTrpc } from '@/trpc/server';
import { QueryClient, HydrationBoundary } from '@tanstack/react-query';

// Prefetch data on server for better performance
await queryClient.prefetchQuery(serverTrpc.auth.me.queryOptions());
```

## Backend Architecture

### MVC Controller Pattern
The backend now follows a clean Model-View-Controller (MVC) pattern with clear separation of concerns:

### Controllers (`src/controllers/`)
- **Business Logic Layer**: All business logic is encapsulated in controllers
- **Inline Schemas**: Each controller includes its own Zod validation schema
- **Feature-Based Organization**: Controllers are organized by feature (auth, user, type)
- **Reusable Functions**: Controllers can be used across different route types
- **Easy Testing**: Isolated business logic for unit testing

#### Controller Structure:
```typescript
// Example: auth/signup.ts
const signupSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  // ... other fields
});

export const signup = async (input: z.infer<typeof signupSchema>) => {
  // Business logic here
  return result;
};

export { signupSchema };
```

### Services (`src/services/`)
- **Shared Utilities**: Common business services used across controllers
- **JWT Token Management**: Token generation, validation, and refresh logic
- **Password Utilities**: Hashing, comparison, and token management
- **Database Operations**: Shared database interaction patterns

### Routes (`src/routes/`)
- **Thin Route Layer**: Routes only handle tRPC setup and delegate to controllers
- **Clean Separation**: No business logic in routes, only tRPC configuration
- **Type Safety**: Full TypeScript integration with controller schemas

#### Route Structure:
```typescript
// Example: routes/auth.ts
export const authRouter = router({
  signup: publicProcedure
    .input(authController.signupSchema)
    .mutation(async (opts) => {
      return await authController.signup(opts.input);
    }),
});
```

### tRPC Setup (`src/trpc.ts`)
- **Context Creation**: JWT token verification and user authentication
- **Procedures**: 
  - `publicProcedure`: No authentication required
  - `privateProcedure`: Requires valid JWT token
- **Error Handling**: Standardized tRPC error responses
- **Type Safety**: Full TypeScript integration

### API Endpoints
- **Authentication Routes**: Complete auth system with JWT tokens
  - `signup` - User registration with validation
  - `signin` - User login with credential verification
  - `logout` - Secure logout with token invalidation
  - `me` - Get current user profile
  - `refreshToken` - Automatic token refresh
- **User Management Routes**: User profile management
- **Type Utility Routes**: Health checks and utility endpoints

### Database Configuration (`src/config/`)
- **MongoDB Connection**: Mongoose with connection pooling
- **Error Handling**: Graceful connection error management
- **Environment Variables**: Flexible configuration

### Security Features
- **JWT Authentication**: Access tokens (15min) + refresh tokens (7 days)
- **Password Hashing**: bcryptjs with salt rounds
- **CORS Configuration**: Secure cross-origin requests
- **Input Validation**: Zod schema validation
- **Token Management**: Secure token storage and rotation

## Frontend Architecture

### Next.js 15 App Router
- **Route Groups**: Organized by access level (protected/public)
- **Server Components**: Optimized performance with SSR
- **Client Components**: Interactive UI with state management
- **Layout System**: Nested layouts for different sections

### Authentication System
- **useAuth Hook**: Centralized authentication state
- **Protected Routes**: Automatic redirect for unauthenticated users
- **Token Management**: Automatic token refresh and storage
- **User Context**: Global user state management

### UI Components
- **shadcn/ui**: Modern, accessible component library
- **Responsive Design**: Mobile-first approach
- **App Sidebar**: Professional navigation with user menu
- **Mobile Support**: Responsive design with mobile navigation

### Data Fetching
- **React Query**: Efficient caching and background updates
- **tRPC Integration**: Type-safe API calls
- **Optimistic Updates**: Better UX with immediate feedback
- **Error Boundaries**: Graceful error handling

## Page-Centric Modularization Architecture

The frontend implements a **page-centric modularization pattern** that organizes components, hooks, schemas, and utilities directly within each page directory. This approach provides excellent organization while keeping related code co-located and maintains clear boundaries between different features.

### Modularization Pattern

Each page follows a consistent directory structure:

```
page-name/
├── _components/     # Page-specific UI components
├── _hooks/         # Page-specific custom hooks  
├── _schema/        # Page-specific validation schemas (Zod)
├── _utils/         # Page-specific utility functions
├── _types/         # Page-specific TypeScript types (when needed)
└── page.tsx        # Clean page component using modules
```

The underscore prefix (`_`) indicates private/internal modules that shouldn't be imported by other pages, following Next.js conventions for route organization.

### Smart Reusability Strategy

The architecture distinguishes between **page-specific** and **truly reusable** components using a smart reusability approach:

#### Shared Components (`src/components/`)
Components that are genuinely reusable across multiple pages:
```typescript
// src/components/forms/PasswordField.tsx - Used in signin, signup, change password
<PasswordField
  control={form.control}
  name="password"
  showPassword={showPassword}
  onToggle={togglePassword}
  forgotPasswordLink={<Link href="/forgot-password">Forgot?</Link>}
/>
```

#### Shared Hooks (`src/hooks/`)
Hooks with generic functionality used across multiple pages:
```typescript
// src/hooks/usePasswordToggle.ts - Used in signin, signup, profile
export function usePasswordToggle() {
  const [showPassword, setShowPassword] = useState(false);
  const togglePassword = () => setShowPassword(prev => !prev);
  return { showPassword, togglePassword };
}

// For pages needing multiple password fields
export function useMultiplePasswordToggle() {
  // Handles password + confirm password visibility
}
```

### Implementation Examples

#### Modular Signup Page Structure
```typescript
// signup/page.tsx - Clean composition using modular components
import { SignupForm, NameFields, SignupButton, ConfirmPasswordField } from './_components';
import { useSignupForm, useSignupMutation } from './_hooks';
import { PasswordField } from '@/components/forms'; // Shared component
import { useMultiplePasswordToggle } from '@/hooks/usePasswordToggle'; // Shared hook

function SignupPage() {
  const form = useSignupForm();
  const { handleSignup, isPending } = useSignupMutation();
  const { showPassword, showConfirmPassword, togglePassword, toggleConfirmPassword } = useMultiplePasswordToggle();

  return (
    <AuthLayout>
      <SignupForm form={form} onSubmit={handleSignup}>
        <NameFields form={form} />
        <PasswordField 
          control={form.control} 
          name="password" 
          showPassword={showPassword}
          onToggle={togglePassword}
        />
        <ConfirmPasswordField 
          form={form} 
          showPassword={showConfirmPassword} 
          onToggle={toggleConfirmPassword} 
        />
        <SignupButton isPending={isPending} />
      </SignupForm>
    </AuthLayout>
  );
}
```

#### Page-Specific Hook Example
```typescript
// signup/_hooks/useSignupMutation.ts
export function useSignupMutation() {
  const router = useRouter();
  const trpc = useTRPC();

  const signupMutation = useMutation(
    trpc.auth.signup.mutationOptions({
      onSuccess: () => {
        toast.success("Account created successfully");
        router.push("/signin");
      },
      onError: (err) => {
        toast.error("Registration failed", { description: err.message });
      },
    })
  );

  const handleSignup = (values: SignupFormData) => {
    signupMutation.mutate({
      email: values.email,
      password: values.password,
      first_name: values.first_name,
      last_name: values.last_name,
    });
  };

  return { signupMutation, handleSignup, isPending: signupMutation.isPending };
}
```

#### Page-Specific Component Example
```typescript
// signup/_components/NameFields.tsx
export function NameFields({ form }: { form: UseFormReturn<SignupFormData> }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <FormField
        control={form.control}
        name="first_name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>First Name</FormLabel>
            <FormControl>
              <Input {...field} placeholder="John" autoComplete="given-name" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="last_name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Last Name</FormLabel>
            <FormControl>
              <Input {...field} placeholder="Doe" autoComplete="family-name" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
```

### Benefits of Page-Centric Approach

#### 1. **Localized Organization**
- All page-related code stays within the page directory
- Easy to find components specific to each page
- Clear boundaries between different page features
- Reduced cognitive load when working on specific pages

#### 2. **Independent Development**
- Teams can work on different pages without conflicts
- Page-specific changes don't affect other pages
- Easier to maintain and update individual pages
- Faster development cycles for feature teams

#### 3. **Performance Optimization**
- Next.js automatically optimizes bundles per page
- Components are loaded only when the page is accessed
- Better code splitting and lazy loading
- Reduced initial bundle size

#### 4. **Maintainability**
- Easy to locate page-specific logic and components
- Components are purpose-built for their specific page
- Reduced complexity compared to large shared component libraries
- Clear separation of concerns

#### 5. **Testing Benefits**
- Page modules can be tested in isolation
- Mock dependencies are clearer and more focused
- Unit tests are more targeted and maintainable
- Easier to achieve high test coverage

### Migration Path from Monolithic Pages

When refactoring existing monolithic pages to the modular pattern:

1. **Analyze the page** - Identify reusable vs page-specific code
2. **Extract schemas** - Move validation schemas to `_schema/`
3. **Create hooks** - Extract business logic to `_hooks/`
4. **Build components** - Break down UI into logical `_components/`
5. **Add utilities** - Move helper functions to `_utils/`
6. **Add types** - Create page-specific types in `_types/` if needed
7. **Refactor page** - Create clean composition using modules
8. **Test thoroughly** - Ensure all functionality works correctly

### Naming Conventions and File Organization

- **`_components/`** - UI components specific to the page
- **`_hooks/`** - Custom React hooks for page business logic  
- **`_schema/`** - Zod validation schemas for forms and data
- **`_utils/`** - Utility functions and helpers
- **`_types/`** - TypeScript interfaces and types
- **`index.ts`** - Export files for clean imports and re-exports

Each directory should include an `index.ts` file that exports all modules, enabling clean imports:

```typescript
// _components/index.ts
export { SignupForm } from './SignupForm';
export { NameFields } from './NameFields';
export { SignupButton } from './SignupButton';
export { ConfirmPasswordField } from './ConfirmPasswordField';

// _hooks/index.ts
export { useSignupForm } from './useSignupForm';
export { useSignupMutation } from './useSignupMutation';
// Re-export shared hooks for convenience
export { useMultiplePasswordToggle } from '@/hooks/usePasswordToggle';
```

### Extension Points

#### Adding New Pages with Modular Structure
```bash
# 1. Create page directory structure
mkdir -p src/app/(protected)/settings/{_components,_hooks,_schema,_utils,_types}

# 2. Create modular files
touch src/app/(protected)/settings/_components/{SettingsForm,ProfileSection,SecuritySection,index}.tsx
touch src/app/(protected)/settings/_hooks/{useSettingsForm,useUpdateProfile,index}.ts
touch src/app/(protected)/settings/_schema/{settingsSchema,index}.ts
touch src/app/(protected)/settings/_utils/{validation,index}.ts
touch src/app/(protected)/settings/_types/{settings.types,index}.ts
touch src/app/(protected)/settings/page.tsx
```

#### Adding Shared Components
When a component is needed across multiple pages:
```bash
# 1. Create in shared components
mkdir -p src/components/forms
touch src/components/forms/{EmailField,PhoneField,index}.tsx

# 2. Export from shared index
# src/components/forms/index.ts
export { EmailField } from "./EmailField";
export { PhoneField } from "./PhoneField";
export { PasswordField } from "./PasswordField"; // existing

# 3. Use across pages
import { EmailField, PasswordField } from "@/components/forms";
```

This page-centric modularization pattern transforms large, monolithic page files into clean, maintainable, and well-organized component systems while preserving the benefits of co-location and clear feature boundaries.

## Development Workflow

### Quick Start
1. **Clone and Setup**:
   ```bash
   cd template-folder
   
   # Backend setup
   cd backend && npm install
   
   # Frontend setup
   cd ../frontend && npm install
   ```

2. **Environment Configuration**:
   ```bash
   # Backend .env
   DATABASE_URL=mongodb://localhost:27017/trpc-template
   ACCESS_TOKEN_SECRET=your-access-token-secret
   REFRESH_TOKEN_SECRET=your-refresh-token-secret
   PORT=4000
   FRONTEND_URL=http://localhost:3005
   
   # Frontend .env.local
   NEXT_PUBLIC_BACKEND_URL=http://localhost:4000
   ```

3. **Start Development**:
   ```bash
   # Terminal 1 - Backend
   cd backend && npm run dev
   
   # Terminal 2 - Frontend
   cd frontend && npm run dev
   ```

### Development Commands

#### Backend
```bash
npm run dev           # Development server with auto-reload
npm run build         # Production build
npm run build:types   # Generate TypeScript declarations
npm run start         # Start production server
npm run typecheck     # TypeScript type checking
npm run lint          # ESLint code linting
```

#### Frontend
```bash
npm run dev           # Development server (port 3005)
npm run build         # Production build
npm run start         # Start production server
npm run lint          # Next.js linting
npm run type-check    # TypeScript type checking
```

## API Documentation

### Authentication Endpoints
- `POST /trpc/auth.signup` - User registration
- `POST /trpc/auth.signin` - User login
- `POST /trpc/auth.logout` - User logout
- `GET /trpc/auth.me` - Get current user
- `POST /trpc/auth.refreshToken` - Refresh JWT tokens

### User Management
- `PUT /trpc/user.updateProfile` - Update user profile
- `PUT /trpc/user.changePassword` - Change password
- `DELETE /trpc/user.deleteAccount` - Delete account

### System Endpoints
- `GET /health` - Server health check
- `GET /trpc/type.healthCheck` - tRPC health check
- `GET /trpc/type.getAppInfo` - Application information

## Deployment Guide

### Backend Deployment
1. **Environment Setup**:
   - Configure production MongoDB URI
   - Set secure JWT secrets
   - Configure CORS for production frontend URL

2. **Build and Deploy**:
   ```bash
   npm run build
   npm run start
   ```

3. **Platform Options**:
   - **Railway**: Easy deployment with database
   - **Heroku**: Traditional PaaS deployment
   - **DigitalOcean**: VPS deployment
   - **AWS/GCP**: Cloud platform deployment

### Frontend Deployment
1. **Build Configuration**:
   ```bash
   # Update environment variables
   NEXT_PUBLIC_BACKEND_URL=https://your-backend-domain.com
   
   # Build for production
   npm run build
   ```

2. **Platform Options**:
   - **Vercel**: Optimal for Next.js (recommended)
   - **Netlify**: Static site deployment
   - **AWS Amplify**: Full-stack deployment
   - **Custom VPS**: Self-hosted deployment

## Security Considerations

### Authentication Security
- **JWT Best Practices**: Short-lived access tokens with refresh mechanism
- **Password Security**: bcryptjs with proper salt rounds
- **Token Storage**: Secure client-side storage with automatic cleanup
- **Session Management**: Proper logout and token invalidation

### API Security
- **Input Validation**: Zod schema validation on all endpoints
- **CORS Configuration**: Restricted origins for production
- **Rate Limiting**: Consider implementing for production
- **Error Handling**: Secure error messages without information leakage

## Customization Guide

### Adding New API Routes
1. Create new controller in `backend/src/controllers/[feature]/`
2. Define schema and business logic in the controller
3. Export controller from `backend/src/controllers/[feature]/index.ts`
4. Create new router in `backend/src/routes/` that uses the controller
5. Add route to main router in `backend/src/routes/index.ts`
6. Generate types with `npm run build:types`
7. Use in frontend with full type safety

#### Example: Adding a new "posts" feature
```typescript
// 1. Create controller: controllers/posts/create.ts
const createPostSchema = z.object({
  title: z.string().min(1, "Title is required"),
  content: z.string().min(1, "Content is required"),
});

export const createPost = async (input: z.infer<typeof createPostSchema>, user: User) => {
  // Business logic here
  return createdPost;
};

export { createPostSchema };

// 2. Create route: routes/posts.ts
export const postsRouter = router({
  create: privateProcedure
    .input(postsController.createPostSchema)
    .mutation(async (opts) => {
      return await postsController.createPost(opts.input, opts.ctx.user);
    }),
});

// 3. Add to main router: routes/index.ts
export const appRouter = router({
  auth: authRouter,
  user: userRouter,
  type: typeRouter,
  posts: postsRouter, // Add new router
});
```

### Adding New Pages with Modular Structure
Follow the page-centric modularization pattern:

1. **Create modular page structure**:
   ```bash
   mkdir -p src/app/(protected)/new-feature/{_components,_hooks,_schema,_utils,_types}
   touch src/app/(protected)/new-feature/page.tsx
   ```

2. **Implement page modules**:
   ```typescript
   // _schema/newFeatureSchema.ts
   export const newFeatureSchema = z.object({
     // validation schema
   });

   // _hooks/useNewFeatureMutation.ts
   export function useNewFeatureMutation() {
     // business logic
   }

   // _components/NewFeatureForm.tsx
   export function NewFeatureForm() {
     // UI component
   }

   // page.tsx - Clean composition
   export default function NewFeaturePage() {
     const form = useNewFeatureForm();
     const { handleSubmit } = useNewFeatureMutation();
     
     return <NewFeatureForm form={form} onSubmit={handleSubmit} />;
   }
   ```

3. **Add to sidebar navigation** if needed
4. **Implement proper authentication guards** via route groups
5. **Add responsive design considerations** in components

### Extending User Model
1. Update `backend/src/model/user.ts`
2. Add validation to auth routes
3. Update frontend types and forms
4. Handle database migrations

## Performance Optimizations

### Backend Optimizations
- **Database Indexing**: Optimize MongoDB queries
- **Connection Pooling**: Mongoose connection management
- **Response Caching**: Consider Redis for frequently accessed data
- **Compression**: Enable gzip compression
- **Health Monitoring**: Implement comprehensive logging

### Frontend Optimizations
- **Code Splitting**: Next.js automatic code splitting
- **Image Optimization**: Next.js Image component
- **Bundle Analysis**: Analyze and optimize bundle size
- **Caching Strategy**: React Query caching configuration
- **Lazy Loading**: Component-level lazy loading

## Troubleshooting

### Common Issues

#### Backend Issues
- **MongoDB Connection**: Check connection string and network access
- **JWT Errors**: Verify token secrets and expiration times
- **CORS Issues**: Ensure frontend URL is in allowed origins
- **Port Conflicts**: Change PORT environment variable

#### Frontend Issues
- **tRPC Connection**: Verify NEXT_PUBLIC_BACKEND_URL
- **Authentication**: Check token storage and expiration
- **Hydration Issues**: Ensure client/server rendering consistency
- **Build Errors**: Check TypeScript errors and dependencies

#### Full-Stack Issues
- **Type Mismatches**: Regenerate types with `npm run build:types`
- **API Errors**: Check network tab and backend logs
- **Environment Variables**: Verify all required variables are set
- **Development vs Production**: Different configurations for each environment

## Best Practices

### Code Organization
- **Feature-Based Structure**: Organize by feature, not by file type
- **Consistent Naming**: Use clear, descriptive names
- **Type Safety**: Leverage TypeScript throughout
- **Error Handling**: Implement consistent error boundaries

### Development Practices
- **Git Workflow**: Use feature branches and pull requests
- **Code Review**: Review all changes before merging
- **Testing**: Add unit and integration tests
- **Documentation**: Keep documentation updated

### Production Readiness
- **Environment Variables**: Never commit secrets
- **Logging**: Implement comprehensive logging
- **Monitoring**: Set up application monitoring
- **Backup Strategy**: Regular database backups

## Template Value Proposition

This template provides:
- **Zero Configuration**: Works out of the box with no setup required
- **Modern Standards**: Latest patterns and best practices for 2024/2025
- **Page-Centric Architecture**: Innovative modular organization that scales with your team
- **Type Safety**: Full-stack TypeScript integration with tRPC 11.4
- **Production Ready**: Scalable architecture with proper separation of concerns
- **Developer Experience**: Excellent tooling, documentation, and development workflow
- **Team Collaboration**: Clear boundaries that enable independent parallel development
- **Extensibility**: Easy to customize and extend with consistent patterns

Perfect for developers and teams who want to build modern, type-safe web applications without spending time on boilerplate setup, while maintaining excellent code organization and team productivity.

## Future Enhancements

### Planned Features
- **Testing Setup**: Jest and React Testing Library
- **CI/CD Pipeline**: GitHub Actions workflows
- **Docker Support**: Containerized deployment
- **API Documentation**: OpenAPI/Swagger integration
- **Real-time Features**: WebSocket integration
- **File Upload**: Image and file handling
- **Email Service**: Email verification and notifications
- **Role-Based Access**: Advanced permission system

This template serves as a solid foundation for building modern, scalable web applications with the latest technologies and best practices.