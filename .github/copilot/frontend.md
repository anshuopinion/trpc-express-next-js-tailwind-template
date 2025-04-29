# Frontend Development Guide

## Architecture Overview

The frontend is built with Next.js and uses tRPC client to communicate with the backend:

- **Next.js**: React framework for building server-rendered applications
- **tRPC client**: Type-safe client for making API calls to the backend
- **React Query**: Data fetching, caching, and state management
- **Tailwind CSS**: Utility-first CSS framework for styling

## Directory Structure

```
frontend/
├── src/
│   ├── app/              # Next.js app router
│   │   ├── page.tsx      # Home page
│   │   └── ...
│   ├── components/       # Reusable React components
│   ├── constant/         # App constants
│   ├── provider/         # React context providers
│   │   ├── trpc-wrapper.tsx  # tRPC provider setup
│   │   └── ...
│   ├── trpc/             # tRPC client setup
│   │   ├── client.ts     # tRPC client instance
│   │   └── utils/        # Helper utilities
│   └── ...
```

## Using tRPC Client

The tRPC client is configured in `src/trpc/client.ts` and wrapped in a provider in `src/provider/trpc-wrapper.tsx`. Use the client to make API calls to the backend:

### Queries

```tsx
import {trpc} from "@/trpc/client";

// In a React component
function UserProfile() {
	const {data, isLoading, error} = trpc.auth.me.useQuery();

	if (isLoading) return <div>Loading...</div>;
	if (error) return <div>Error: {error.message}</div>;

	return (
		<div>
			<h1>Welcome, {data.first_name}</h1>
			<p>Email: {data.email}</p>
		</div>
	);
}
```

### Mutations

```tsx
import {trpc} from "@/trpc/client";
import {useState} from "react";

function CreateItemForm() {
	const [name, setName] = useState("");
	const utils = trpc.useUtils();

	const createItem = trpc.example.createItem.useMutation({
		onSuccess: () => {
			// Reset form
			setName("");
			// Invalidate queries to refresh data
			utils.example.getItems.invalidate();
		},
	});

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		createItem.mutate({name});
	};

	return (
		<form onSubmit={handleSubmit}>
			<input type='text' value={name} onChange={e => setName(e.target.value)} placeholder='Item name' />
			<button type='submit' disabled={createItem.isLoading}>
				{createItem.isLoading ? "Creating..." : "Create"}
			</button>
		</form>
	);
}
```

### Pagination Example

```tsx
import {trpc} from "@/trpc/client";
import {useState} from "react";

function PaginatedList() {
	const [cursor, setCursor] = useState<string | undefined>(undefined);

	const {data, isLoading, isFetching} = trpc.example.getPaginatedItems.useQuery({limit: 10, cursor});

	return (
		<div>
			{isLoading ? (
				<div>Loading...</div>
			) : (
				<>
					<ul>
						{data?.items.map(item => (
							<li key={item.id}>{item.name}</li>
						))}
					</ul>

					{data?.nextCursor && (
						<button onClick={() => setCursor(data.nextCursor)} disabled={isFetching}>
							Load More
						</button>
					)}
				</>
			)}
		</div>
	);
}
```

## Authentication in Components

Authentication state can be accessed using the tRPC client:

```tsx
function AuthenticatedContent() {
	const {data: user, isLoading} = trpc.auth.me.useQuery();

	if (isLoading) return <div>Loading...</div>;
	if (!user) return <div>Please log in</div>;

	return <div>Welcome, {user.first_name}!</div>;
}
```

## Form Handling with React Hook Form

```tsx
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {z} from "zod";
import {trpc} from "@/trpc/client";

// Define validation schema
const loginSchema = z.object({
	email: z.string().email("Invalid email address"),
	password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

function LoginForm() {
	const {
		register,
		handleSubmit,
		formState: {errors},
	} = useForm<LoginFormValues>({
		resolver: zodResolver(loginSchema),
	});

	const login = trpc.auth.signin.useMutation();

	const onSubmit = (data: LoginFormValues) => {
		login.mutate(data);
	};

	return (
		<form onSubmit={handleSubmit(onSubmit)}>
			<div>
				<label>Email</label>
				<input {...register("email")} type='email' />
				{errors.email && <p>{errors.email.message}</p>}
			</div>

			<div>
				<label>Password</label>
				<input {...register("password")} type='password' />
				{errors.password && <p>{errors.password.message}</p>}
			</div>

			<button type='submit' disabled={login.isLoading}>
				{login.isLoading ? "Logging in..." : "Login"}
			</button>
		</form>
	);
}
```

## State Management with Zustand

```tsx
import {create} from "zustand";

interface AppState {
	theme: "light" | "dark";
	setTheme: (theme: "light" | "dark") => void;
}

export const useAppStore = create<AppState>(set => ({
	theme: "light",
	setTheme: theme => set({theme}),
}));

// Using the store in a component
function ThemeToggle() {
	const {theme, setTheme} = useAppStore();

	return <button onClick={() => setTheme(theme === "light" ? "dark" : "light")}>Toggle to {theme === "light" ? "Dark" : "Light"} Mode</button>;
}
```

## Component Design Patterns

### Composition Pattern

```tsx
// Button component
function Button({children, ...props}) {
	return (
		<button className='px-4 py-2 bg-blue-500 text-white rounded' {...props}>
			{children}
		</button>
	);
}

// Using the button
function LoginButton() {
	return <Button>Login</Button>;
}
```

### Container/Presenter Pattern

```tsx
// Presenter component (UI only)
function UserListView({users, isLoading, error}) {
	if (isLoading) return <div>Loading...</div>;
	if (error) return <div>Error: {error.message}</div>;

	return (
		<ul>
			{users.map(user => (
				<li key={user.id}>
					{user.first_name} {user.last_name}
				</li>
			))}
		</ul>
	);
}

// Container component (data fetching)
function UserListContainer() {
	const {data, isLoading, error} = trpc.users.getAll.useQuery();

	return <UserListView users={data || []} isLoading={isLoading} error={error} />;
}
```

## Styling with Tailwind CSS

Follow these patterns for consistent styling:

```tsx
// Button variants
function Button({variant, size, children, ...props}) {
	const baseClasses = "rounded focus:outline-none focus:ring-2";

	const variantClasses = {
		primary: "bg-blue-500 text-white hover:bg-blue-600",
		secondary: "bg-gray-200 text-gray-800 hover:bg-gray-300",
		danger: "bg-red-500 text-white hover:bg-red-600",
	}[variant || "primary"];

	const sizeClasses = {
		sm: "px-2 py-1 text-sm",
		md: "px-4 py-2",
		lg: "px-6 py-3 text-lg",
	}[size || "md"];

	return (
		<button className={`${baseClasses} ${variantClasses} ${sizeClasses}`} {...props}>
			{children}
		</button>
	);
}
```
