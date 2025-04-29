# Authentication Implementation Guide

## Authentication System Overview

The project uses a JWT-based authentication system with access and refresh tokens:

- **Access Tokens**: Short-lived tokens (15 minutes) used for API authentication
- **Refresh Tokens**: Long-lived tokens (7 days) used to obtain new access tokens
- **Token Storage**: Access tokens are stored in memory/local storage, refresh tokens are hashed and stored in the database

## Authentication Flow

1. User signs in with email/password
2. Server validates credentials and issues access and refresh tokens
3. Client stores tokens (access token in memory, refresh token securely)
4. Client includes access token in API requests
5. When access token expires, client uses refresh token to get a new one
6. On logout, refresh token is invalidated

## Backend Implementation

### User Model

The user model includes fields for storing the hashed refresh token:

```typescript
export class UserClass {
	// ...other fields

	@prop({type: String})
	public refresh_token?: string | null;

	// ...other fields
}
```

### Authentication Routes

```typescript
export const authRouter = router({
	signup: publicProcedure
		.input(
			z.object({
				email: z.string({required_error: "Email is required"}),
				password: z.string({required_error: "Password is required"}),
				first_name: z.string({required_error: "First name is required"}),
				last_name: z.string({required_error: "Last name is required"}),
			})
		)
		.mutation(async opts => {
			// Implementation details
		}),

	signin: publicProcedure
		.input(
			z.object({
				email: z.string({required_error: "Email is required"}),
				password: z.string({required_error: "Password is required"}),
			})
		)
		.mutation(async opts => {
			// Validate credentials and generate tokens
			const tokens = await getTokens(user.id, user.email);
			await updateRefreshToken(user.id, tokens.refresh_token);

			return {
				user_data,
				...tokens,
			};
		}),

	refreshToken: publicProcedure
		.input(
			z.object({
				userId: z.string({required_error: "User ID is required"}),
				refreshToken: z.string({required_error: "Refresh token is required"}),
			})
		)
		.mutation(async opts => {
			// Validate refresh token and issue new tokens
		}),

	logout: publicProcedure.mutation(async opts => {
		// Invalidate refresh token
	}),
});
```

### Token Generation

```typescript
const generateAccessToken = (userId: string, email: string) => {
	return jwt.sign({userId, email}, process.env.ACCESS_TOKEN_SECRET!, {
		expiresIn: "15m",
	});
};

const generateRefreshToken = (userId: string, email: string) => {
	return jwt.sign({userId, email}, process.env.REFRESH_TOKEN_SECRET!, {
		expiresIn: "7d",
	});
};

const getTokens = async (userId: string, email: string) => {
	const [access_token, refresh_token] = await Promise.all([generateAccessToken(userId, email), generateRefreshToken(userId, email)]);

	return {
		access_token,
		refresh_token,
		expires_at: Math.floor(Date.now() / 1000) + 60 * 15, // 15 minutes
	};
};
```

### Token Verification

```typescript
const decodeAndVerifyJwtToken = async (token: string) => {
	try {
		const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET!);
		return decoded;
	} catch (error) {
		throw new TRPCError({
			code: "UNAUTHORIZED",
			message: "Invalid token",
		});
	}
};
```

### tRPC Context

```typescript
const createContext = async ({req, res}: trpcExpress.CreateExpressContextOptions) => {
	async function getTokenFromHeader() {
		if (req.headers.authorization) {
			const decodedToken = await decodeAndVerifyJwtToken(req.headers.authorization?.split(" ")[1]);
			return decodedToken as {userId: string; email: string};
		}
		return null;
	}

	const token = await getTokenFromHeader();
	if (!token) {
		return {user: null};
	}

	const user = await UserModel.findById(token.userId);
	return {user};
};
```

### Private Procedure Middleware

```typescript
export const privateProcedure = publicProcedure.use(async opts => {
	const {ctx} = opts;

	if (!ctx.user) {
		throw new TRPCError({
			code: "UNAUTHORIZED",
			message: "You are not authorized to access this resource",
		});
	}

	return opts.next({
		ctx: {user: ctx.user},
	});
});
```

## Frontend Implementation

### Token Storage

```typescript
// Store access token (in memory or secure storage)
export const setAccessToken = (token: string) => {
	localStorage.setItem("accessToken", token);
};

export const getAccessToken = () => {
	return localStorage.getItem("accessToken");
};

export const removeAccessToken = () => {
	localStorage.removeItem("accessToken");
};

// Store refresh token (in HTTP-only cookie or secure storage)
// This is a simplified version, consider using HTTP-only cookies for better security
export const setRefreshToken = (token: string, userId: string) => {
	localStorage.setItem("refreshToken", token);
	localStorage.setItem("userId", userId);
};

export const getRefreshTokenData = () => {
	const refreshToken = localStorage.getItem("refreshToken");
	const userId = localStorage.getItem("userId");

	if (!refreshToken || !userId) return null;

	return {refreshToken, userId};
};

export const removeRefreshToken = () => {
	localStorage.removeItem("refreshToken");
	localStorage.removeItem("userId");
};
```

### Authentication Hook

```typescript
import {useCallback, useEffect, useState} from "react";
import {trpc} from "@/trpc/client";
import {getAccessToken, getRefreshTokenData, removeAccessToken, removeRefreshToken, setAccessToken, setRefreshToken} from "@/utils/token";

export function useAuth() {
	const [isLoading, setIsLoading] = useState(true);
	const [isAuthenticated, setIsAuthenticated] = useState(false);

	const utils = trpc.useUtils();
	const login = trpc.auth.signin.useMutation();
	const refreshTokenMutation = trpc.auth.refreshToken.useMutation();
	const logout = trpc.auth.logout.useMutation();

	const checkAuth = useCallback(async () => {
		const accessToken = getAccessToken();
		if (accessToken) {
			setIsAuthenticated(true);
			setIsLoading(false);
			return;
		}

		const refreshData = getRefreshTokenData();
		if (!refreshData) {
			setIsAuthenticated(false);
			setIsLoading(false);
			return;
		}

		try {
			const result = await refreshTokenMutation.mutateAsync({
				userId: refreshData.userId,
				refreshToken: refreshData.refreshToken,
			});

			setAccessToken(result.access_token);
			setRefreshToken(result.refresh_token, result.id);
			setIsAuthenticated(true);
		} catch (error) {
			removeAccessToken();
			removeRefreshToken();
			setIsAuthenticated(false);
		} finally {
			setIsLoading(false);
		}
	}, [refreshTokenMutation]);

	useEffect(() => {
		checkAuth();
	}, [checkAuth]);

	const handleLogin = async (email: string, password: string) => {
		try {
			const result = await login.mutateAsync({email, password});
			setAccessToken(result.access_token);
			setRefreshToken(result.refresh_token, result.id);
			setIsAuthenticated(true);
			return result;
		} catch (error) {
			throw error;
		}
	};

	const handleLogout = async () => {
		try {
			await logout.mutateAsync();
		} finally {
			removeAccessToken();
			removeRefreshToken();
			setIsAuthenticated(false);
			utils.invalidate();
		}
	};

	return {
		isLoading,
		isAuthenticated,
		login: handleLogin,
		logout: handleLogout,
		refreshToken: checkAuth,
	};
}
```

### tRPC Client Configuration

```typescript
// In trpc-wrapper.tsx
const [trpcClient] = useState(() =>
	trpc.createClient({
		links: [
			// ...other links
			httpBatchLink({
				url: baseUrl,
				fetch: fetcher, // Custom fetcher for handling token refresh
				async headers() {
					const accessToken = getAccessToken();
					return {
						authorization: accessToken ? `Bearer ${accessToken}` : "",
					};
				},
			}),
		],
	})
);
```

### Custom Fetcher for Token Refresh

```typescript
// In /src/trpc/utils/refreshHeaderToken.ts
export const fetcher: (input: RequestInfo | URL, init?: RequestInit | undefined) => Promise<Response> = async (url, options = {}) => {
	let response = await fetch(url, options);

	// If unauthorized, attempt token refresh
	if (response.status === 401) {
		const refreshData = getRefreshTokenData();
		if (!refreshData) {
			// No refresh token, return original response
			return response;
		}

		try {
			// Attempt to refresh token
			const refreshResponse = await fetch(`${baseURl}/auth.refreshToken`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					userId: refreshData.userId,
					refreshToken: refreshData.refreshToken,
				}),
			});

			if (!refreshResponse.ok) {
				// Refresh failed, clean up tokens
				removeAccessToken();
				removeRefreshToken();
				return response;
			}

			const result = await refreshResponse.json();

			// Store new tokens
			setAccessToken(result.result.data.access_token);
			setRefreshToken(result.result.data.refresh_token, result.result.data.id);

			// Retry original request with new token
			const newOptions = {
				...options,
				headers: {
					...options.headers,
					authorization: `Bearer ${result.result.data.access_token}`,
				},
			};

			response = await fetch(url, newOptions);
		} catch (error) {
			// Error during refresh, clean up tokens
			removeAccessToken();
			removeRefreshToken();
		}
	}

	return response;
};
```

### Protected Route Component

```tsx
import {ReactNode} from "react";
import {useAuth} from "@/hooks/useAuth";
import {Redirect} from "next";

interface ProtectedRouteProps {
	children: ReactNode;
	redirectTo?: string;
}

export function ProtectedRoute({children, redirectTo = "/login"}: ProtectedRouteProps) {
	const {isLoading, isAuthenticated} = useAuth();

	if (isLoading) {
		return <div>Loading...</div>;
	}

	if (!isAuthenticated) {
		return <Redirect to={redirectTo} />;
	}

	return <>{children}</>;
}

// Usage
function AdminPage() {
	return (
		<ProtectedRoute>
			<h1>Admin Dashboard</h1>
			{/* Protected content */}
		</ProtectedRoute>
	);
}
```

## Security Best Practices

1. **Store access tokens in memory** (not localStorage) for production applications
2. **Use HTTP-only cookies** for refresh tokens
3. **Implement CSRF protection** if using cookies
4. **Validate tokens on the server** with proper error handling
5. **Implement token rotation** on refresh to prevent reuse
6. **Set appropriate expiration times** for both tokens
7. **Use secure, HttpOnly, SameSite cookies** when possible
8. **Implement rate limiting** for authentication endpoints
9. **Log authentication events** for audit purposes
