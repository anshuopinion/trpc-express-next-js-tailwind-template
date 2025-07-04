# 🚀 Modern tRPC Full-Stack Template

A clean, modern full-stack TypeScript template featuring **Next.js 15**, **tRPC**, **React Query**, and **JWT authentication**. This template uses the latest tRPC patterns with TanStack React Query integration.

## ✨ Features

- 🔥 **Modern tRPC Setup** - Latest tRPC patterns with React Query integration
- 🔐 **JWT Authentication** - Complete auth system with refresh tokens
- 🛡️ **Type Safety** - End-to-end type safety with TypeScript
- ⚡ **Next.js 15** - App Router with Server and Client Components
- 🎨 **Tailwind CSS** - Modern, responsive styling
- 📱 **Responsive Design** - Mobile-first approach
- 🔄 **Real-time State** - React Query for efficient data management
- 🧪 **Production Ready** - Clean, maintainable code structure

## 🏗️ Project Structure

```
template-folder/
├── backend/                 # Express.js + tRPC server
│   ├── src/
│   │   ├── config/         # Database configuration
│   │   ├── model/          # MongoDB models (User)
│   │   ├── routes/         # tRPC routers (auth, user, type)
│   │   ├── server.ts       # Express server setup
│   │   └── trpc.ts         # tRPC configuration
│   ├── types/              # Generated TypeScript declarations
│   └── package.json
└── frontend/               # Next.js 15 application
    ├── src/
    │   ├── app/            # Next.js App Router
    │   │   ├── (protected)/  # Protected routes
    │   │   └── (public)/     # Public routes
    │   ├── hooks/          # Custom React hooks
    │   ├── trpc/           # Modern tRPC client setup
    │   └── lib/            # Utilities
    └── package.json
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- MongoDB (local or cloud)
- npm or yarn

### 1. Clone and Setup

```bash
# Navigate to the template folder
cd template-folder

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies  
cd ../frontend
npm install
```

### 2. Environment Configuration

**Backend (.env)**
```bash
cd backend
cp .env.example .env
```

Edit `.env`:
```env
DATABASE_URL=mongodb://localhost:27017/trpc-template
ACCESS_TOKEN_SECRET=your-super-secret-access-token-key
REFRESH_TOKEN_SECRET=your-super-secret-refresh-token-key
PORT=4000
FRONTEND_URL=http://localhost:3000
```

**Frontend (.env.local)**
```bash
cd frontend
cp .env.local.example .env.local
```

Edit `.env.local`:
```env
NEXT_PUBLIC_BACKEND_URL=http://localhost:4000
```

### 3. Start Development Servers

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

### 4. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:4000/trpc
- **Health Check**: http://localhost:4000/health

## 🔧 Modern tRPC Usage

This template uses the **latest tRPC patterns** with TanStack React Query:

### Client-Side Usage

```typescript
'use client';

import { trpc } from '@/trpc/client';
import { useQuery, useMutation } from '@tanstack/react-query';

export function UserProfile() {
  // Modern tRPC pattern - no more trpc.auth.me.useQuery()
  const userQuery = useQuery(trpc.auth.me.queryOptions());
  const logoutMutation = useMutation(trpc.auth.logout.mutationOptions());

  return (
    <div>
      <p>Welcome, {userQuery.data?.first_name}!</p>
      <button onClick={() => logoutMutation.mutate()}>
        Logout
      </button>
    </div>
  );
}
```

### Server-Side Usage (Next.js Server Components)

```typescript
import { serverTrpc } from '@/trpc/server';
import { QueryClient, HydrationBoundary, dehydrate } from '@tanstack/react-query';

export default async function DashboardPage() {
  const queryClient = new QueryClient();
  
  // Prefetch data on server
  await queryClient.prefetchQuery(serverTrpc.auth.me.queryOptions());
  
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <UserProfile />
    </HydrationBoundary>
  );
}
```

## 🛠️ Available Scripts

### Backend

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run build:types  # Generate TypeScript declarations
npm run start        # Start production server
npm run typecheck    # Type checking
```

### Frontend

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # Type checking
```

## 🔐 Authentication Flow

1. **Sign Up/Sign In** → Get JWT tokens
2. **Automatic Token Management** → Stored in localStorage
3. **Protected Routes** → Redirect if not authenticated
4. **Auto Refresh** → Tokens refresh automatically
5. **Type-Safe Requests** → tRPC handles everything

## 📊 API Routes

### Authentication
- `auth.signup` - User registration
- `auth.signin` - User login  
- `auth.logout` - User logout
- `auth.me` - Get current user
- `auth.refreshToken` - Refresh JWT tokens

### User Management
- `user.updateProfile` - Update user profile
- `user.changePassword` - Change password
- `user.deleteAccount` - Delete user account

### Utilities
- `type.healthCheck` - Server health check
- `type.getAppInfo` - Application information
- `type.validateEmail` - Email validation

## 🎨 Frontend Pages

- **Home** (`/`) - Landing page
- **Sign In** (`/signin`) - User login
- **Sign Up** (`/signup`) - User registration  
- **Dashboard** (`/dashboard`) - Protected user dashboard

## 🔄 Type Generation

The template includes automatic TypeScript declaration generation:

```bash
cd backend
npm run build:types  # Generates types/ directory
```

The frontend automatically imports these types for full type safety across the stack.

## 🚀 Deployment

### Backend (Express)
- Set up MongoDB connection
- Configure environment variables
- Deploy to your preferred platform (Railway, Heroku, etc.)

### Frontend (Next.js)
- Build the application: `npm run build`
- Deploy to Vercel, Netlify, or your preferred platform
- Update `NEXT_PUBLIC_BACKEND_URL` to your backend URL

## 🛡️ Security Features

- JWT token-based authentication
- Automatic token refresh
- Protected API routes
- Input validation with Zod
- CORS configuration
- Secure password hashing with bcrypt

## 🧩 Customization

This template provides a solid foundation. Customize by:

1. **Adding new tRPC routes** in `backend/src/routes/`
2. **Creating new pages** in `frontend/src/app/`
3. **Adding UI components** in `frontend/src/components/`
4. **Extending the user model** in `backend/src/model/user.ts`

## 📚 Technologies Used

### Backend
- **Express.js** - Web framework
- **tRPC** - Type-safe API layer
- **MongoDB** with Mongoose - Database
- **JWT** - Authentication
- **Zod** - Input validation
- **TypeScript** - Type safety

### Frontend  
- **Next.js 15** - React framework
- **tRPC** - Type-safe API client
- **TanStack React Query** - Data fetching
- **Tailwind CSS** - Styling
- **TypeScript** - Type safety

## 🤝 Contributing

Feel free to submit issues and enhancement requests!

## 📝 License

This project is licensed under the ISC License.

---

**Happy coding! 🎉**

This template gives you a solid foundation for building modern, type-safe full-stack applications with the latest tRPC patterns.