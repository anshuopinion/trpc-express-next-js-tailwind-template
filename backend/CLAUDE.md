# tRPC Express Backend Template - Claude Memory

## Project Overview
A modern Express.js backend template with tRPC API, JWT authentication, and MongoDB integration. This template provides a solid foundation for building type-safe APIs with comprehensive user management and authentication features.

## Architecture

### Directory Structure
```
backend/
├── src/
│   ├── config/
│   │   └── index.ts           # Database configuration
│   ├── controllers/           # Business logic controllers (MVC pattern)
│   │   ├── auth/              # Authentication controllers
│   │   │   ├── index.ts       # Auth controller exports
│   │   │   ├── signup.ts      # User registration logic
│   │   │   ├── signin.ts      # User login logic
│   │   │   ├── logout.ts      # Logout logic
│   │   │   ├── me.ts          # Get user profile logic
│   │   │   └── refresh.ts     # Token refresh logic
│   │   ├── user/              # User management controllers
│   │   │   ├── index.ts       # User controller exports
│   │   │   ├── updateProfile.ts  # Profile update logic
│   │   │   ├── changePassword.ts # Password change logic
│   │   │   └── deleteAccount.ts  # Account deletion logic
│   │   ├── type/              # Utility controllers
│   │   │   ├── index.ts       # Type controller exports
│   │   │   ├── appInfo.ts     # App information logic
│   │   │   ├── environment.ts # Environment info logic
│   │   │   ├── validateEmail.ts # Email validation logic
│   │   │   └── healthCheck.ts # Health check logic
│   │   └── index.ts           # Main controller exports
│   ├── model/
│   │   └── user.ts            # User model with Typegoose
│   ├── routes/                # Clean tRPC route definitions
│   │   ├── index.ts           # Router aggregation
│   │   ├── auth.ts            # Authentication routes (use controllers)
│   │   ├── user.ts            # User management routes (use controllers)
│   │   └── type.ts            # Type utilities routes (use controllers)
│   ├── services/              # Shared business services
│   │   ├── auth.ts            # JWT token utilities
│   │   └── password.ts        # Password hashing utilities
│   ├── server.ts              # Express server setup
│   └── trpc.ts                # tRPC configuration and context
├── types/                     # Generated TypeScript declarations
├── dist/                      # Compiled JavaScript output
├── package.json
├── tsconfig.json
└── tsconfig.declaration.json
```

## Core Technologies

### Stack
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js 5.x
- **API Layer**: tRPC 11.x for type-safe APIs
- **Database**: MongoDB with Mongoose 8.x
- **ODM**: Typegoose for type-safe MongoDB models
- **Authentication**: JWT with bcryptjs for password hashing
- **Validation**: Zod for runtime type checking
- **CORS**: Cross-origin resource sharing support

### Key Dependencies
```json
{
  "@trpc/server": "^11.4.1",
  "@typegoose/typegoose": "^12.16.0",
  "bcryptjs": "^3.0.2",
  "cors": "^2.8.5",
  "express": "^5.1.0",
  "jsonwebtoken": "^9.0.2",
  "mongoose": "^8.16.0",
  "zod": "^3.25.67"
}
```

## Server Configuration

### Main Server (`src/server.ts`)
The Express server is configured with:
- **Port**: 4000 (configurable via `process.env.PORT`)
- **CORS**: Multiple frontend origins supported
- **Health Check**: Available at `/health`
- **tRPC Endpoint**: All API calls handled at `/trpc`

```typescript
// Server startup configuration
const startServer = async () => {
  await connectDB();
  const port = process.env.PORT || 4000;
  
  app.listen(port, () => {
    console.log(`🚀 tRPC Template Server`);
    console.log(`🌐 Server: http://localhost:${port}`);
    console.log(`📡 tRPC API: http://localhost:${port}/trpc`);
    console.log(`🏥 Health: http://localhost:${port}/health`);
  });
};
```

### CORS Configuration
```typescript
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || "http://localhost:3005",
    "http://localhost:3000",
    "http://localhost:3003",
    "http://localhost:3005"
  ],
  credentials: true
}));
```

## Architecture Patterns

### MVC Controller Pattern
The backend follows a clean Model-View-Controller (MVC) pattern with clear separation of concerns:

#### Controllers (`src/controllers/`)
- **Business Logic Layer**: All business logic is encapsulated in controllers
- **Inline Schemas**: Each controller includes its own Zod validation schema
- **Feature-Based Organization**: Controllers are organized by feature (auth, user, type)
- **Reusable Functions**: Controllers can be used across different route types
- **Easy Testing**: Isolated business logic for unit testing

**Controller Structure Example:**
```typescript
// controllers/auth/signup.ts
import { z } from "zod";
import { TRPCError } from "@trpc/server";

const signupSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
});

export const signup = async (input: z.infer<typeof signupSchema>) => {
  // Business logic implementation
  return result;
};

export { signupSchema };
```

#### Services (`src/services/`)
- **Shared Utilities**: Common business services used across controllers
- **JWT Token Management**: Token generation, validation, and refresh logic
- **Password Utilities**: Hashing, comparison, and token management
- **Database Operations**: Shared database interaction patterns

**Service Example:**
```typescript
// services/auth.ts
export const generateAccessToken = (userId: string, email: string) => {
  return jwt.sign({ userId, email }, process.env.ACCESS_TOKEN_SECRET!, {
    expiresIn: "15m",
  });
};

export const getTokens = async (userId: string, email: string) => {
  const [access_token, refresh_token] = await Promise.all([
    generateAccessToken(userId, email),
    generateRefreshToken(userId, email),
  ]);
  return { access_token, refresh_token, expires_at };
};
```

#### Routes (`src/routes/`)
- **Thin Route Layer**: Routes only handle tRPC setup and delegate to controllers
- **Clean Separation**: No business logic in routes, only tRPC configuration
- **Type Safety**: Full TypeScript integration with controller schemas

**Route Structure Example:**
```typescript
// routes/auth.ts
import { privateProcedure, publicProcedure, router } from "../trpc";
import { authController } from "../controllers";

export const authRouter = router({
  signup: publicProcedure
    .input(authController.signupSchema)
    .mutation(async (opts) => {
      return await authController.signup(opts.input);
    }),
    
  me: privateProcedure.query(async (opts) => {
    const user = opts.ctx.user;
    return await authController.me(user);
  }),
});
```

## tRPC Configuration

### Context Creation (`src/trpc.ts`)
The tRPC context handles authentication and user context:

```typescript
const createContext = async ({ req, res }) => {
  // Extract JWT token from Authorization header
  const token = await getTokenFromHeader();
  
  if (!token) {
    return { user: null };
  }
  
  // Verify token and fetch user
  const user = await UserModel.findById(token.userId);
  return { user };
};
```

### Procedure Types
- **`publicProcedure`**: No authentication required
- **`privateProcedure`**: Requires valid JWT token and authenticated user

```typescript
export const privateProcedure = publicProcedure.use(async (opts) => {
  const { ctx } = opts;
  
  if (!ctx.user) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "You are not authorized to access this resource",
    });
  }
  
  return opts.next({
    ctx: { user: ctx.user }
  });
});
```

## Database Configuration

### MongoDB Connection (`src/config/index.ts`)
```typescript
export const connectDB = async () => {
  const mongoUri = process.env.DATABASE_URL || "mongodb://localhost:27017/trpc-template";
  await mongoose.connect(mongoUri);
  console.log("✅ MongoDB connected successfully");
};
```

### User Model (`src/model/user.ts`)
Uses Typegoose for type-safe MongoDB models:

```typescript
@modelOptions({
  schemaOptions: {
    collection: "users",
  },
})
export class UserClass {
  @prop({ required: true, type: String })
  public first_name: string;

  @prop({ required: true, type: String })
  public last_name: string;

  @prop({ type: String })
  public avatar?: string | null;

  @prop({ required: true, unique: true, type: String })
  public email: string;

  @prop({ required: true, type: String })
  public password: string;

  @prop({ type: String })
  public refresh_token?: string | null;

  @prop({ default: false, type: Boolean })
  public is_email_verified: boolean;

  @prop({ type: String })
  public verify_token?: string | null;
}
```

## API Routes

### Router Structure (`src/routes/index.ts`)
```typescript
export const appRouter = router({
  auth: authRouter,
  user: userRouter,
  type: typeRouter,
});

export type AppRouter = typeof appRouter;
```

### Authentication Router (`src/routes/auth.ts`)

#### JWT Token Management
```typescript
const generateAccessToken = (userId: string, email: string) => {
  return jwt.sign({ userId, email }, process.env.ACCESS_TOKEN_SECRET!, {
    expiresIn: "15m",
  });
};

const generateRefreshToken = (userId: string, email: string) => {
  return jwt.sign({ userId, email }, process.env.REFRESH_TOKEN_SECRET!, {
    expiresIn: "7d",
  });
};
```

#### Available Endpoints
- **`auth.signup`**: User registration with email, password, first_name, last_name
- **`auth.signin`**: User login with email and password
- **`auth.logout`**: Clear refresh token (requires authentication)
- **`auth.me`**: Get current user profile (requires authentication)
- **`auth.refreshToken`**: Refresh access token using refresh token

#### Example Usage
```typescript
// Sign up new user
const result = await trpc.auth.signup.mutate({
  email: "user@example.com",
  password: "securepassword",
  first_name: "John",
  last_name: "Doe"
});

// Response includes tokens and user data
// {
//   id: "user_id",
//   email: "user@example.com",
//   first_name: "John",
//   last_name: "Doe",
//   access_token: "jwt_token",
//   refresh_token: "refresh_token",
//   expires_at: 1234567890
// }
```

### User Management Router (`src/routes/user.ts`)

#### Available Endpoints
- **`user.updateProfile`**: Update user profile (first_name, last_name, avatar)
- **`user.changePassword`**: Change user password (requires current password)
- **`user.deleteAccount`**: Delete user account (requires password confirmation)

#### Example Usage
```typescript
// Update user profile
const updatedUser = await trpc.user.updateProfile.mutate({
  first_name: "Jane",
  avatar: "https://example.com/avatar.jpg"
});

// Change password
await trpc.user.changePassword.mutate({
  currentPassword: "oldpassword",
  newPassword: "newpassword123"
});
```

### Type Utilities Router (`src/routes/type.ts`)

#### Available Endpoints
- **`type.getAppInfo`**: Get application information
- **`type.getEnvironment`**: Get environment details
- **`type.validateEmail`**: Validate email format
- **`type.healthCheck`**: Health check endpoint

## Environment Variables

### Required Environment Variables
Create a `.env` file in the backend root directory:

```env
# Database
DATABASE_URL=mongodb://localhost:27017/trpc-template

# JWT Secrets
ACCESS_TOKEN_SECRET=your-access-token-secret-here
REFRESH_TOKEN_SECRET=your-refresh-token-secret-here

# Server Configuration
PORT=4000
NODE_ENV=development

# Frontend CORS
FRONTEND_URL=http://localhost:3005
```

### Environment Variable Descriptions
- **`DATABASE_URL`**: MongoDB connection string
- **`ACCESS_TOKEN_SECRET`**: Secret key for signing access tokens (15min expiry)
- **`REFRESH_TOKEN_SECRET`**: Secret key for signing refresh tokens (7d expiry)
- **`PORT`**: Server port (defaults to 4000)
- **`NODE_ENV`**: Environment type (development/production)
- **`FRONTEND_URL`**: Primary frontend URL for CORS configuration

## Development Setup

### Prerequisites
- Node.js 18+ and npm
- MongoDB instance running locally or connection string
- Git for version control

### Installation
```bash
# Clone the repository
git clone <repository-url>
cd backend

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Start development server
npm run dev
```

### Development Commands
```bash
# Development with auto-reload
npm run dev

# Build TypeScript to JavaScript
npm run build

# Build type declarations
npm run build:types

# Start production server
npm start

# Type checking
npm run typecheck

# Linting
npm run lint
npm run lint:check

# Testing
npm test

# Watch mode for development
npm run watch
npm run watch:types
```

## API Usage Examples

### Authentication Flow
```typescript
// 1. Register new user
const signupResult = await trpc.auth.signup.mutate({
  email: "user@example.com",
  password: "password123",
  first_name: "John",
  last_name: "Doe"
});

// 2. Store tokens
const { access_token, refresh_token, expires_at } = signupResult;

// 3. Use access token for authenticated requests
const userProfile = await trpc.auth.me.query();

// 4. Refresh tokens when access token expires
const newTokens = await trpc.auth.refreshToken.mutate({
  userId: signupResult.id,
  refreshToken: refresh_token
});
```

### Client-side Integration
```typescript
// Example tRPC client setup
import { createTRPCProxyClient, httpBatchLink } from '@trpc/client';
import type { AppRouter } from './backend/src/routes';

const trpc = createTRPCProxyClient<AppRouter>({
  links: [
    httpBatchLink({
      url: 'http://localhost:4000/trpc',
      headers() {
        return {
          authorization: `Bearer ${getAccessToken()}`,
        };
      },
    }),
  ],
});
```

## Security Features

### Password Security
- **Bcrypt Hashing**: Passwords hashed with salt rounds (10)
- **Password Validation**: Minimum 6 characters required
- **Current Password Verification**: Required for password changes

### Token Security
- **JWT Access Tokens**: Short-lived (15 minutes)
- **JWT Refresh Tokens**: Longer-lived (7 days) 
- **Token Hashing**: Refresh tokens hashed in database
- **Token Rotation**: New refresh token generated on each refresh

### API Security
- **Input Validation**: Zod schemas for all inputs
- **CORS Configuration**: Specific origin allowlist
- **Error Handling**: Standardized tRPC error responses
- **Authentication Middleware**: Protected routes require valid tokens

## Error Handling

### tRPC Error Codes
- **`UNAUTHORIZED`**: Invalid or missing authentication
- **`CONFLICT`**: Resource already exists (e.g., email in use)
- **`NOT_FOUND`**: Resource doesn't exist
- **`BAD_REQUEST`**: Invalid input data

### Example Error Response
```typescript
{
  "error": {
    "code": "UNAUTHORIZED",
    "message": "You are not authorized to access this resource"
  }
}
```

## Performance Considerations

### Database Optimization
- **Indexes**: Unique index on user email field
- **Connection Pooling**: MongoDB connection pooling via Mongoose
- **Query Optimization**: Efficient user lookups by ID

### API Optimization
- **Batch Requests**: tRPC HTTP batch linking support
- **Type Safety**: Zero runtime type checking overhead
- **Minimal Dependencies**: Lean dependency tree

## Deployment

### Build Process
```bash
# Build application
npm run build

# Build type declarations
npm run build:types

# Start production server
npm run start:prod
```

### Environment Setup
```bash
# Production environment variables
NODE_ENV=production
PORT=4000
DATABASE_URL=mongodb://your-production-db
ACCESS_TOKEN_SECRET=your-secure-secret
REFRESH_TOKEN_SECRET=your-secure-refresh-secret
```

### Docker Deployment
```dockerfile
# Example Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 4000

CMD ["npm", "run", "start:prod"]
```

## Testing

### Test Structure
```bash
# Run all tests
npm test

# Test with coverage
npm run test:coverage

# Watch mode for development
npm run test:watch
```

### Example Test
```typescript
describe('Auth Router', () => {
  it('should create a new user', async () => {
    const result = await trpc.auth.signup.mutate({
      email: 'test@example.com',
      password: 'password123',
      first_name: 'Test',
      last_name: 'User'
    });

    expect(result.email).toBe('test@example.com');
    expect(result.access_token).toBeDefined();
  });
});
```

## Extending the Template

### Adding New Routes with Controller Pattern
```typescript
// 1. Create controller
// src/controllers/posts/create.ts
import { z } from "zod";

const createPostSchema = z.object({
  title: z.string().min(1, "Title is required"),
  content: z.string().min(1, "Content is required"),
});

export const createPost = async (input: z.infer<typeof createPostSchema>, user: User) => {
  // Business logic implementation
  const post = await PostModel.create({
    title: input.title,
    content: input.content,
    author: user.id,
  });
  
  return post;
};

export { createPostSchema };

// 2. Export from controller index
// src/controllers/posts/index.ts
export { createPost, createPostSchema } from "./create";
export { getAllPosts } from "./getAll";

// 3. Add to main controller exports
// src/controllers/index.ts
export * as postsController from "./posts";

// 4. Create router using controller
// src/routes/posts.ts
import { privateProcedure, publicProcedure, router } from "../trpc";
import { postsController } from "../controllers";

export const postsRouter = router({
  getAll: publicProcedure.query(async () => {
    return await postsController.getAllPosts();
  }),
  
  create: privateProcedure
    .input(postsController.createPostSchema)
    .mutation(async (opts) => {
      return await postsController.createPost(opts.input, opts.ctx.user);
    })
});

// 5. Add to main router
// src/routes/index.ts
export const appRouter = router({
  auth: authRouter,
  user: userRouter,
  type: typeRouter,
  posts: postsRouter, // Add new router
});
```

### Adding New Models
```typescript
// src/model/post.ts
@modelOptions({
  schemaOptions: {
    collection: "posts",
    timestamps: true
  }
})
export class PostClass {
  @prop({ required: true, type: String })
  public title: string;

  @prop({ required: true, type: String })
  public content: string;

  @prop({ required: true, ref: () => UserClass })
  public author: Ref<UserClass>;
}

export const PostModel = getModelForClass(PostClass);
```

## Troubleshooting

### Common Issues

#### Database Connection Error
```bash
# Check MongoDB is running
mongod --version

# Verify connection string
DATABASE_URL=mongodb://localhost:27017/trpc-template
```

#### JWT Token Errors
```bash
# Ensure secrets are set
ACCESS_TOKEN_SECRET=your-secret-here
REFRESH_TOKEN_SECRET=your-refresh-secret-here

# Check token expiration
# Access tokens expire in 15 minutes
# Refresh tokens expire in 7 days
```

#### CORS Issues
```bash
# Add your frontend URL to CORS configuration
FRONTEND_URL=http://localhost:3000
```

#### TypeScript Compilation Errors
```bash
# Clean build
rm -rf dist/
npm run build

# Check TypeScript configuration
npm run typecheck
```

### Health Check Endpoints
- **`GET /health`**: Server health status
- **`GET /trpc/type.healthCheck`**: tRPC health check
- **`GET /trpc/type.getEnvironment`**: Environment information

## Best Practices

### Code Organization
- Keep routes focused and single-purpose
- Use Zod schemas for all input validation
- Implement proper error handling with tRPC errors
- Use TypeScript interfaces for type safety

### Security
- Always validate inputs with Zod
- Use environment variables for sensitive data
- Implement rate limiting for production
- Keep JWT secrets secure and rotate regularly

### Performance
- Index frequently queried database fields
- Use connection pooling for database connections
- Implement caching for frequently accessed data
- Monitor API response times

## Version Information
- **Template Version**: 1.0.0
- **Node.js**: 18+
- **Express**: 5.1.0
- **tRPC**: 11.4.1
- **MongoDB**: 8.16.0
- **TypeScript**: 5.8.3