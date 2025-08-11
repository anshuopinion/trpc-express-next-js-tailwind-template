# Modern tRPC Full-Stack Template - Claude Memory

## Project Overview
A comprehensive, production-ready full-stack TypeScript template built with the latest tRPC patterns, Next.js 15, and modern role-based authentication. This template serves as a robust foundation for building type-safe, scalable web applications with seamless full-stack integration, featuring complete user management and admin functionality.

## 📚 Complete Documentation
For detailed implementation guides, see the [docs/ folder](./docs/README.md):

- **[tRPC Usage Guide](./docs/api/trpc-usage.md)** - Complete tRPC patterns and examples
- **[Backend Architecture](./docs/architecture/backend.md)** - MVC pattern, controllers, security
- **[Frontend Architecture](./docs/architecture/frontend.md)** - Next.js 15, route groups, authentication
- **[Page Modularization](./docs/architecture/page-modularization.md)** - Page-centric organization patterns
- **[Frontend Testing Guide](./docs/testing/frontend-testing.md)** - Vitest setup, patterns, and examples
- **[Linting & Code Quality](./docs/development/linting.md)** - BiomeJS setup and rules

*This file provides a quick reference overview. For comprehensive implementation details, consult the specific documentation files.*

## Architecture

### Project Structure
```
template-folder/
├── backend/                    # Express.js + tRPC server
│   ├── src/
│   │   ├── config/            # Database configuration
│   │   ├── controllers/       # Business logic (MVC pattern)
│   │   │   ├── auth/          # Authentication (signup, signin, logout, me, refresh) + index
│   │   │   ├── admin/         # Admin management (users, roles, stats) + index
│   │   │   ├── user/          # User management (profile, password, delete) + index
│   │   │   ├── type/          # Utilities (health, app info, validation) + index
│   │   │   └── index.ts       # Main controller exports
│   │   ├── model/             # Data models (user with roles)
│   │   ├── routes/            # tRPC route definitions
│   │   ├── services/          # JWT & password utilities
│   │   ├── server.ts          # Express server
│   │   └── trpc.ts            # tRPC context & procedures
│   └── types/                 # Auto-generated TypeScript declarations
└── frontend/                  # Next.js 15 with Page-Centric Modularization
    ├── src/
    │   ├── app/              # Next.js App Router
    │   │   ├── (admin)/      # Admin-only routes with role protection
    │   │   ├── (protected)/  # Auth-required routes
    │   │   └── (public)/     # Public routes (signin/signup)
    │   ├── components/       # Shared UI components & role guards
    │   ├── hooks/           # Shared React hooks
    │   ├── lib/             # Utilities & auth helpers
    │   └── trpc/            # Modern tRPC client setup
    └── package.json
```

## Technology Stack
**Backend**: Express.js, tRPC 11.4, MongoDB, Typegoose, JWT (role-based auth), bcryptjs, Zod, BiomeJS
**Frontend**: Next.js 15, React 19, TanStack React Query, shadcn/ui, Tailwind CSS v4, TypeScript, BiomeJS
**Testing**: Vitest, React Testing Library, Happy DOM, @testing-library/jest-dom

## Modern tRPC Implementation
- **tRPC 11.4** with React Query integration
- **Full-stack type safety** from backend to frontend  
- **Role-based procedures**: public, protected, admin
- **Modern client pattern**: `useQuery(trpc.auth.me.queryOptions())`

## tRPC Quick Reference

**See [docs/api/trpc-usage.md](./docs/api/trpc-usage.md) for complete implementation guide.**

### Client Usage
```typescript
const trpc = useTRPC();

// Query
const { data } = useQuery(trpc.auth.me.queryOptions());

// Mutation  
const mutation = useMutation(trpc.auth.signin.mutationOptions());
```

### Procedures
- `publicProcedure` - No auth required
- `privateProcedure` - JWT required  
- `adminProcedure` - JWT + admin role required

## Backend Architecture

### MVC Pattern
- **Controllers**: Business logic with inline Zod schemas, organized by feature (auth, user, admin, type)
- **Routes**: Thin tRPC layer that delegates to controllers
- **Services**: JWT & password utilities, shared database operations

### tRPC Procedures
- `publicProcedure`: No authentication
- `privateProcedure`: JWT required  
- `adminProcedure`: JWT + admin role required

### API Endpoints
**Auth**: signup, signin, logout, me, refreshToken
**User**: updateProfile, changePassword, deleteAccount  
**Admin**: getAllUsers, updateUserRole, deleteUser, getSystemStats
**Utils**: healthCheck, getAppInfo

### Security
- JWT (15min access + 7 day refresh tokens)
- Role-based access control (USER/ADMIN)
- Password hashing, CORS, Zod validation

## Frontend Architecture

### Route Groups
- `(admin)`: Admin-only routes with role protection
- `(protected)`: Authenticated user routes  
- `(public)`: Public access (signin/signup)

### Authentication & Security
- `useAuth` hook with role information
- Automatic redirect for unauthorized access
- Component-level role guards (`AdminOnly`, `RoleGuard`)
- Automatic token refresh & storage

### UI & Data
- **shadcn/ui** components with responsive design
- **React Query** for caching & optimistic updates
- **tRPC** for type-safe API calls

## Page-Centric Modularization

Each page uses a modular structure with clear separation:

```
page-name/
├── _components/     # Components used ONLY by this page
│   └── __tests__/   # Component tests for this page
├── _hooks/         # Hooks used ONLY by this page  
│   └── __tests__/   # Hook tests for this page
├── _schema/        # Page-specific validation schemas
├── _utils/         # Page-specific utility functions
├── _types/         # Page-specific TypeScript types
└── page.tsx        # Clean composition using modules
```

**Rule**: If a component/hook is used by multiple pages → use `src/components/` or `src/hooks/`  
If only used by one page → use page's `_components/` or `_hooks/` directory

### Benefits
- **Localized Organization**: All page code stays within page directory
- **Independent Development**: Teams can work on different pages without conflicts  
- **Performance**: Better code splitting and lazy loading
- **Maintainability**: Easy to locate page-specific logic and components
- **Testing**: Page modules can be tested in isolation

### Pattern Usage
- **Page-specific**: Components used only within one page (in `_components/`)
- **Shared**: Components used across multiple pages (in `src/components/`)
- Clean imports via `index.ts` files in each directory

## Development Workflow

### Quick Start
```bash
# Setup
cd backend && npm install
cd ../frontend && npm install

# Environment Variables
# Backend .env: DATABASE_URL, ACCESS_TOKEN_SECRET, REFRESH_TOKEN_SECRET, PORT, FRONTEND_URL
# Frontend .env.local: NEXT_PUBLIC_BACKEND_URL

# Start Development  
cd backend && npm run dev    # Terminal 1
cd frontend && npm run dev   # Terminal 2
```

### Commands
**Backend**: `dev`, `build`, `build:types`, `typecheck`, `lint`  
**Frontend**: `dev`, `build`, `lint`, `type-check`, `test`, `test:watch`, `test:ui`, `test:coverage`

## API Reference
**Auth**: `auth.signup`, `auth.signin`, `auth.logout`, `auth.me`, `auth.refreshToken`  
**User**: `user.updateProfile`, `user.changePassword`, `user.deleteAccount`  
**Admin**: `admin.getAllUsers`, `admin.updateUserRole`, `admin.deleteUser`, `admin.getSystemStats`  
**System**: `type.healthCheck`, `type.getAppInfo`

## Deployment & Security

### Deployment
**Backend**: Railway, Heroku, DigitalOcean, AWS/GCP  
**Frontend**: Vercel (recommended), Netlify, AWS Amplify

### Security Features
- JWT with short-lived access tokens + refresh tokens
- Role-based access control (USER/ADMIN separation)  
- Password hashing with bcryptjs
- Input validation with Zod schemas
- CORS configuration for production
- Secure token storage and session management

## Customization

### Adding API Routes
1. Create controller in `controllers/[feature]/` with Zod schema
2. Create router in `routes/` using controller
3. Add to main router, run `npm run build:types`

### Adding Pages  
1. Create modular structure: `page/{_components,_hooks,_schema,_utils}`
2. Use appropriate route group: `(admin)`, `(protected)`, or `(public)`
3. Follow page-centric modularization pattern

## Performance & Best Practices

### Optimizations
**Backend**: Database indexing, connection pooling, response caching  
**Frontend**: Code splitting, React Query caching, lazy loading

### Troubleshooting
- **Connection Issues**: Check MongoDB URI, CORS settings, environment variables
- **Type Errors**: Regenerate types with `npm run build:types`
- **Auth Issues**: Verify token storage and JWT secrets

### Best Practices
- Feature-based organization, consistent naming, full TypeScript usage
- Git workflow with feature branches and code review
- Never commit secrets, implement logging and monitoring

## Template Value Proposition

**Zero configuration** modern full-stack template with **tRPC 11.4**, **Next.js 15**, and **role-based authentication**. Features page-centric modularization, full TypeScript safety, and production-ready architecture. Perfect for teams building type-safe web applications with admin functionality.

## Role-Based Access Control

### Roles
- **USER** (default): Access to protected routes
- **ADMIN**: Full system access including user management

### Implementation
- **Route Groups**: `(admin)`, `(protected)`, `(public)`
- **Frontend Guards**: `<AdminOnly>`, `<RoleGuard>`  
- **Backend Procedures**: `publicProcedure`, `privateProcedure`, `adminProcedure`

### Admin Features
- User management (CRUD operations)
- Role management and system statistics
- Admin dashboard with comprehensive interface
- Audit logging and session management

## Future Enhancements
- Testing setup (Jest, React Testing Library)
- CI/CD pipeline with GitHub Actions  
- Docker support and API documentation
- Real-time features and file upload
- Enhanced RBAC and audit system