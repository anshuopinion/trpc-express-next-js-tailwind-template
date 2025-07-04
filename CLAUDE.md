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
│   │   ├── model/             # Data models
│   │   │   └── user.ts        # User model with Typegoose
│   │   ├── routes/            # tRPC API routes
│   │   │   ├── index.ts       # Main router combining all routes
│   │   │   ├── auth.ts        # Authentication endpoints
│   │   │   ├── user.ts        # User management
│   │   │   └── type.ts        # Type utilities and health checks
│   │   ├── server.ts          # Express server configuration
│   │   └── trpc.ts            # tRPC setup with context and procedures
│   ├── types/                 # Auto-generated TypeScript declarations
│   └── package.json
└── frontend/                  # Next.js 15 application
    ├── src/
    │   ├── app/              # Next.js App Router
    │   │   ├── (protected)/  # Protected routes (dashboard)
    │   │   ├── (public)/     # Public routes (signin, signup)
    │   │   ├── layout.tsx    # Root layout with tRPC provider
    │   │   └── page.tsx      # Landing page
    │   ├── components/       # React components
    │   │   ├── ui/          # shadcn/ui components
    │   │   ├── app-sidebar.tsx      # Main sidebar navigation
    │   │   └── mobile-top-bar.tsx   # Mobile navigation
    │   ├── hooks/           # Custom React hooks
    │   │   ├── useAuth.ts   # Authentication hook
    │   │   └── use-mobile.ts # Mobile detection
    │   ├── trpc/            # Modern tRPC client setup
    │   │   ├── client.ts    # tRPC client configuration
    │   │   ├── provider.tsx # React Query provider
    │   │   └── server.ts    # Server-side tRPC client
    │   ├── lib/             # Utilities
    │   │   └── utils.ts     # Common utility functions
    │   └── constant/        # Application constants
    │       └── env.tsx      # Environment variables
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

### tRPC Setup (`src/trpc.ts`)
- **Context Creation**: JWT token verification and user authentication
- **Procedures**: 
  - `publicProcedure`: No authentication required
  - `privateProcedure`: Requires valid JWT token
- **Error Handling**: Standardized tRPC error responses
- **Type Safety**: Full TypeScript integration

### API Routes (`src/routes/`)
- **Authentication Router**: Complete auth system with JWT tokens
  - `signup` - User registration with validation
  - `signin` - User login with credential verification
  - `logout` - Secure logout with token invalidation
  - `me` - Get current user profile
  - `refreshToken` - Automatic token refresh
- **User Router**: User profile management
- **Type Router**: Utility endpoints and health checks

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
1. Create new router in `backend/src/routes/`
2. Add route to main router in `backend/src/routes/index.ts`
3. Generate types with `npm run build:types`
4. Use in frontend with full type safety

### Adding New Pages
1. Create page in `frontend/src/app/`
2. Add to sidebar navigation if needed
3. Implement proper authentication guards
4. Add responsive design considerations

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
- **Zero Configuration**: Works out of the box
- **Modern Standards**: Latest patterns and best practices
- **Type Safety**: Full-stack TypeScript integration
- **Production Ready**: Scalable architecture
- **Developer Experience**: Excellent tooling and documentation
- **Extensibility**: Easy to customize and extend

Perfect for developers who want to build modern, type-safe web applications without spending time on boilerplate setup.

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