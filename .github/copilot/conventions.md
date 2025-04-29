# Project Conventions Guide

## Code Style & Formatting

This project follows specific conventions for consistent code quality:

### TypeScript

- Use strict mode and explicit typing
- Prefer interfaces for public APIs and types for internal use
- Use type guards for runtime type checking
- Always define return types for functions that aren't immediately obvious

```typescript
// Good
function getUserById(id: string): Promise<User | null> {
	return UserModel.findById(id);
}

// Avoid
function getUserById(id) {
	return UserModel.findById(id);
}
```

### Naming Conventions

- **Files**: Use kebab-case for filenames (`user-profile.tsx`)
- **Classes**: Use PascalCase for class names (`UserClass`)
- **Variables/Functions**: Use camelCase for variables and functions (`getUserData`)
- **Constants**: Use UPPER_SNAKE_CASE for true constants (`MAX_RETRY_COUNT`)
- **Interfaces/Types**: Prefix with 'I' for interfaces (`IUser`)
- **Components**: Use PascalCase for React components (`UserProfile`)

### Import Order

Organize imports in the following groups, separated by a blank line:

1. React and Next.js imports
2. External libraries
3. Project imports (absolute paths)
4. Relative imports

```typescript
import {useState, useEffect} from "react";
import {useRouter} from "next/router";

import {z} from "zod";
import {TRPCError} from "@trpc/server";

import {trpc} from "@/trpc/client";
import {formatDate} from "@/utils/date";

import {UserCard} from "./user-card";
import styles from "./styles.module.css";
```

## File Structure

### Backend

- One model per file in `/backend/src/model`
- Group related routes in a single router file in `/backend/src/routes`
- Keep utility functions in separate files in `/backend/src/utils`

### Frontend

- One component per file in `/frontend/src/components`
- Group related components in subdirectories
- Keep pages clean, move logic to components and hooks

## API Design

### tRPC Procedures

- Use descriptive names that indicate the action and resource
- Follow RESTful conventions when appropriate

```typescript
// Good
getUserById: publicProcedure...
createUser: privateProcedure...
updateUserProfile: privateProcedure...
deleteUser: privateProcedure...

// Avoid
getById: publicProcedure... // Too vague
user: privateProcedure... // Doesn't indicate action
```

### Input Validation

- Always validate inputs using Zod schemas
- Provide helpful error messages in validation rules

```typescript
// Good input validation
createUser: privateProcedure
	.input(
		z.object({
			email: z.string().email("Invalid email address"),
			password: z.string().min(8, "Password must be at least 8 characters"),
			first_name: z.string().min(1, "First name is required"),
			last_name: z.string().min(1, "Last name is required"),
		})
	)
	.mutation(async ({input}) => {
		// Implementation
	});
```

### Error Handling

- Use appropriate tRPC error codes
- Provide specific error messages
- Don't expose sensitive information in error messages

```typescript
// Good error handling
if (!user) {
	throw new TRPCError({
		code: "NOT_FOUND",
		message: "User not found",
	});
}

// Avoid
if (!user) {
	throw new Error("User with ID 1234 not found in database");
}
```

## Component Design

### Component Structure

- Keep components focused on a single responsibility
- Split large components into smaller ones
- Use composition to build complex UIs

```tsx
// Good component composition
function UserProfile({userId}: {userId: string}) {
	const {data: user, isLoading} = trpc.users.getUserById.useQuery({id: userId});

	if (isLoading) return <LoadingSpinner />;
	if (!user) return <NotFound entity='User' />;

	return (
		<Card>
			<UserHeader user={user} />
			<UserDetails user={user} />
			<UserActions user={user} />
		</Card>
	);
}
```

### Props Design

- Use destructuring for props
- Provide default values where appropriate
- Use TypeScript interfaces to define prop types

```tsx
// Good props design
interface ButtonProps {
	variant?: "primary" | "secondary" | "danger";
	size?: "sm" | "md" | "lg";
	isLoading?: boolean;
	children: React.ReactNode;
	onClick?: () => void;
}

function Button({variant = "primary", size = "md", isLoading = false, children, onClick}: ButtonProps) {
	// Implementation
}
```

## State Management

### Local State

- Use `useState` for simple component state
- Use `useReducer` for complex state logic
- Keep state as close to where it's used as possible

### Global State

- Use Zustand for global application state
- Organize stores by domain (e.g., `useAuthStore`, `useCartStore`)
- Keep store logic separate from UI components

```typescript
// Good Zustand store
import {create} from "zustand";

interface AuthState {
	user: User | null;
	isLoading: boolean;
	error: string | null;
	login: (email: string, password: string) => Promise<void>;
	logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>(set => ({
	user: null,
	isLoading: false,
	error: null,

	login: async (email, password) => {
		set({isLoading: true, error: null});
		try {
			// Login implementation
			set({user: userData, isLoading: false});
		} catch (error) {
			set({error: getErrorMessage(error), isLoading: false});
		}
	},

	logout: async () => {
		set({isLoading: true});
		try {
			// Logout implementation
			set({user: null, isLoading: false});
		} catch (error) {
			set({error: getErrorMessage(error), isLoading: false});
		}
	},
}));
```

## Forms and Validation

### Form Structure

- Use React Hook Form for form state management
- Use Zod with zodResolver for form validation
- Structure forms with appropriate HTML elements

```tsx
// Good form implementation
function LoginForm() {
	const loginSchema = z.object({
		email: z.string().email("Invalid email address"),
		password: z.string().min(6, "Password must be at least 6 characters"),
	});

	type LoginFormValues = z.infer<typeof loginSchema>;

	const {
		register,
		handleSubmit,
		formState: {errors, isSubmitting},
	} = useForm<LoginFormValues>({
		resolver: zodResolver(loginSchema),
	});

	const onSubmit = async (data: LoginFormValues) => {
		// Form submission logic
	};

	return (
		<form onSubmit={handleSubmit(onSubmit)}>
			<div className='form-group'>
				<label htmlFor='email'>Email</label>
				<input id='email' type='email' {...register("email")} />
				{errors.email && <span className='error'>{errors.email.message}</span>}
			</div>

			<div className='form-group'>
				<label htmlFor='password'>Password</label>
				<input id='password' type='password' {...register("password")} />
				{errors.password && <span className='error'>{errors.password.message}</span>}
			</div>

			<button type='submit' disabled={isSubmitting}>
				{isSubmitting ? "Logging in..." : "Log In"}
			</button>
		</form>
	);
}
```

## CSS & Styling

### Tailwind Classes

- Group related classes together
- Order classes by layout, spacing, size, typography, visual style
- Extract common patterns to components

```tsx
// Good Tailwind organization
<button
	className='
    flex items-center justify-center
    px-4 py-2 
    text-sm font-medium
    bg-blue-500 text-white rounded
    hover:bg-blue-600 
    disabled:opacity-50 disabled:cursor-not-allowed
  '
>
	Submit
</button>
```

### Component Variants

- Use class-variance-authority (cva) for component variants

```tsx
// Using cva for component variants
import {cva, type VariantProps} from "class-variance-authority";

const buttonVariants = cva(
	"inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2",
	{
		variants: {
			variant: {
				primary: "bg-blue-500 text-white hover:bg-blue-600",
				secondary: "bg-gray-100 text-gray-900 hover:bg-gray-200",
				danger: "bg-red-500 text-white hover:bg-red-600",
			},
			size: {
				sm: "h-8 px-3 text-xs",
				md: "h-10 px-4",
				lg: "h-12 px-6 text-lg",
			},
		},
		defaultVariants: {
			variant: "primary",
			size: "md",
		},
	}
);

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
	children: React.ReactNode;
}

function Button({children, variant, size, className, ...props}: ButtonProps) {
	return (
		<button className={buttonVariants({variant, size, className})} {...props}>
			{children}
		</button>
	);
}
```

## Testing

### Unit Testing

- Test individual functions and components
- Use Jest for assertions
- Test behavior, not implementation details

```typescript
// Good unit test
describe("formatCurrency", () => {
	it("formats numbers with 2 decimal places", () => {
		expect(formatCurrency(12.345)).toBe("$12.35");
	});

	it("handles negative numbers", () => {
		expect(formatCurrency(-5)).toBe("-$5.00");
	});

	it("returns zero for NaN", () => {
		expect(formatCurrency(NaN)).toBe("$0.00");
	});
});
```

### Integration Testing

- Test API routes with mock databases
- Test component interactions and data flow

```typescript
// Good API route test
describe("createUser procedure", () => {
	beforeAll(async () => {
		await connectTestDatabase();
	});

	afterAll(async () => {
		await disconnectTestDatabase();
	});

	it("creates a user successfully", async () => {
		const caller = appRouter.createCaller({user: null});

		const result = await caller.auth.signup({
			email: "test@example.com",
			password: "password123",
			first_name: "Test",
			last_name: "User",
		});

		expect(result).toHaveProperty("id");
		expect(result.email).toBe("test@example.com");
		expect(result).not.toHaveProperty("password"); // Ensure password is not returned
	});

	it("throws an error for duplicate email", async () => {
		const caller = appRouter.createCaller({user: null});

		// First create a user
		await caller.auth.signup({
			email: "duplicate@example.com",
			password: "password123",
			first_name: "Test",
			last_name: "User",
		});

		// Try to create another with same email
		await expect(
			caller.auth.signup({
				email: "duplicate@example.com",
				password: "another123",
				first_name: "Another",
				last_name: "User",
			})
		).rejects.toThrow("User already exists");
	});
});
```

## Documentation

### Code Comments

- Add JSDoc comments to explain complex functions
- Comment non-obvious code only
- Keep comments up to date with code changes

```typescript
/**
 * Calculates the shipping cost based on product weight, destination and shipping method.
 *
 * @param weight - Product weight in kilograms
 * @param destination - Shipping destination country code
 * @param method - Shipping method ('standard', 'express', 'overnight')
 * @returns The shipping cost in the store's currency
 */
function calculateShippingCost(weight: number, destination: string, method: "standard" | "express" | "overnight"): number {
	// Implementation
}
```

### API Documentation

- Document API endpoints with examples
- Include input/output schemas
- Document error codes and responses

## Performance

### Frontend Performance

- Implement virtualization for long lists
- Use memoization for expensive calculations
- Optimize React re-renders with useMemo and useCallback
- Use React Query's caching features

### Backend Performance

- Use projections to limit returned fields
- Implement pagination for large datasets
- Create indexes for frequently queried fields
- Use lean() for better Mongoose performance

## Security

### Authentication & Authorization

- Never store plain text passwords
- Use HTTPS for all requests
- Implement proper authorization checks for private routes
- Set secure, HTTP-only cookies for sensitive data

### Data Validation

- Validate all user inputs, both client and server side
- Use specific input validation rules
- Sanitize data to prevent XSS attacks

### Error Handling

- Log errors but don't expose sensitive details to users
- Use consistent error handling patterns
- Return appropriate HTTP status codes
