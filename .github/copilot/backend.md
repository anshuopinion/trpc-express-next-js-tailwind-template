# Backend Development Guide

## Architecture Overview

The backend follows a structured architecture with tRPC as the communication layer between frontend and backend:

- **Express.js**: Server framework that handles HTTP requests
- **tRPC**: Type-safe API layer that exposes procedures to the frontend
- **MongoDB/Mongoose**: Database with Typegoose for type-safe models
- **JWT**: Authentication mechanism using access and refresh tokens

## Directory Structure

```
backend/
├── src/
│   ├── config.ts         # Environment and configuration variables
│   ├── server.ts         # Express server and main entry point
│   ├── trpc.ts           # tRPC setup and context creation
│   ├── model/            # Database models (Typegoose)
│   │   ├── user.ts
│   │   └── ...
│   └── routes/           # tRPC routers
│       ├── index.ts      # Main router that combines all routers
│       ├── auth.ts       # Authentication routes
│       └── ...
```

## Creating New API Endpoints

Follow these steps to create new API endpoints:

1. Define a Mongoose/Typegoose model if needed
2. Create a tRPC router or add procedures to an existing router
3. Register the router in the main router (routes/index.ts)

### Example: Creating a Router

```typescript
// In backend/src/routes/example.ts
import {privateProcedure, publicProcedure, router} from "../trpc";
import {z} from "zod";
import {ExampleModel} from "../model/example";
import {TRPCError} from "@trpc/server";

export const exampleRouter = router({
	// Public procedure - no authentication required
	getItems: publicProcedure
		.input(
			z.object({
				limit: z.number().optional().default(10),
			})
		)
		.query(async ({input}) => {
			const {limit} = input;

			const items = await ExampleModel.find().sort({createdAt: -1}).limit(limit).lean();

			return items;
		}),

	// Private procedure - requires authentication
	createItem: privateProcedure
		.input(
			z.object({
				name: z.string().min(1),
				description: z.string().optional(),
			})
		)
		.mutation(async ({input, ctx}) => {
			// Access the authenticated user
			const userId = ctx.user.id;

			const item = await ExampleModel.create({
				...input,
				userId,
			});

			return item;
		}),
});
```

### Registering the Router

```typescript
// In backend/src/routes/index.ts
import {router} from "../trpc";
import {authRouter} from "./auth";
import {exampleRouter} from "./example";
// Import other routers

export const appRouter = router({
	auth: authRouter,
	example: exampleRouter,
	// Add other routers here
});

export type AppRouter = typeof appRouter;
```

## Context and Authentication

The `createContext` function in `trpc.ts` is responsible for extracting and validating the JWT token from the request headers and loading the corresponding user. Use `privateProcedure` to ensure endpoints are only accessible to authenticated users.

```typescript
// Example of protected procedure
const getProfile = privateProcedure.query(async ({ctx}) => {
	// ctx.user is guaranteed to exist in privateProcedure
	const {user} = ctx;
	return user;
});
```

## Error Handling

Use tRPC's error system to return appropriate error responses:

```typescript
if (!item) {
	throw new TRPCError({
		code: "NOT_FOUND",
		message: "Item not found",
	});
}
```

Common error codes:

- `NOT_FOUND`: Resource not found
- `BAD_REQUEST`: Invalid input
- `UNAUTHORIZED`: Authentication required
- `FORBIDDEN`: Authenticated but not authorized
- `INTERNAL_SERVER_ERROR`: Server error

## Database Operations

Use Typegoose's methods for database operations:

```typescript
// Create
const newItem = await ItemModel.create({name: "New Item"});

// Read
const items = await ItemModel.find({status: "active"});
const item = await ItemModel.findById(id);

// Update
const updated = await ItemModel.findByIdAndUpdate(
	id,
	{name: "Updated Name"},
	{new: true} // returns updated document
);

// Delete
await ItemModel.findByIdAndDelete(id);
```

## Environment Configuration

Access environment variables through the `config.ts` file:

```typescript
import {DATABASE_URL} from "./config";

mongoose.connect(DATABASE_URL);
```

## Testing APIs

You can test your API endpoints using tools like Postman or with automated tests:

```typescript
// Example test for an endpoint
test("getItems returns the correct number of items", async () => {
	// Setup test data
	await ItemModel.create([{name: "Item 1"}, {name: "Item 2"}]);

	// Call procedure
	const caller = appRouter.createCaller({user: null});
	const result = await caller.example.getItems({limit: 5});

	// Assert
	expect(result).toHaveLength(2);
});
```
