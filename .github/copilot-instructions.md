# Project Guide for GitHub Copilot

## Project Overview

This project is a full-stack application template using tRPC, Express.js, Next.js, and Tailwind CSS. It provides type-safe API communication between the frontend and backend using tRPC.

## Specialized Instruction Files

This main file provides a high-level overview of the project. For more specific guidance, please refer to these specialized instruction files:

- [Backend Development Guide](./copilot/backend.md)
- [Frontend Development Guide](./copilot/frontend.md)
- [Authentication Implementation Guide](./copilot/authentication.md)
- [Database Models Guide](./copilot/models.md)
- [Project Conventions Guide](./copilot/conventions.md)

## Tech Stack

### Backend

- **Express.js**: Web server framework
- **tRPC**: End-to-end typesafe APIs
- **MongoDB/Mongoose**: Database with Typegoose for typesafe models
- **JWT**: Authentication with access and refresh tokens
- **Node.js**: Runtime environment

### Frontend

- **Next.js**: React framework
- **React**: UI library
- **Tailwind CSS**: Utility-first CSS framework
- **tRPC client**: For API communication with the backend
- **React Query**: Data fetching and caching
- **Zustand**: State management
- **React Hook Form**: Form handling

## Project Structure

### Backend Structure

- `src/`
  - `model/`: Mongoose/Typegoose models
  - `routes/`: tRPC router definitions
  - `trpc.ts`: tRPC initialization and context
  - `config.ts`: Environment configuration
  - `server.ts`: Express and HTTP server setup

### Frontend Structure

- `src/`
  - `provider/`: Context providers including tRPC wrapper
  - `trpc/`: tRPC client setup
  - `constant/`: App constants
  - `components/`: UI components

## API Integration Examples

### Complete API Development Flow

The following examples demonstrate the complete flow of creating and consuming an API endpoint in this stack:

#### 1. Backend: Define Model (if needed)

```typescript
// Example model in backend/src/model/product.ts
import {getModelForClass, modelOptions, prop} from "@typegoose/typegoose";

@modelOptions({
	schemaOptions: {collection: "products"},
})
export class ProductClass {
	@prop({required: true, type: String})
	public name: string;

	@prop({required: true, type: Number})
	public price: number;

	@prop({type: String})
	public description?: string;

	@prop({required: true, type: String, default: "active"})
	public status: "active" | "inactive";
}

export type IProduct = ProductClass & {id: string};
export const ProductModel = getModelForClass(ProductClass);
```

#### 2. Backend: Create tRPC Router

```typescript
// Example router in backend/src/routes/product.ts
import {privateProcedure, publicProcedure, router} from "../trpc";
import {z} from "zod";
import {ProductModel} from "../model/product";
import {TRPCError} from "@trpc/server";

export const productRouter = router({
	// Public procedure - anyone can access
	getProducts: publicProcedure
		.input(
			z.object({
				limit: z.number().optional().default(10),
				cursor: z.string().optional(),
				status: z.enum(["active", "inactive"]).optional(),
			})
		)
		.query(async ({input}) => {
			const {limit, cursor, status} = input;
			const query = status ? {status} : {};

			const products = await ProductModel.find(query)
				.sort({_id: -1})
				.limit(limit + 1)
				.skip(cursor ? 1 : 0)
				.lean();

			let nextCursor: typeof cursor | undefined = undefined;
			if (products.length > limit) {
				const nextItem = products.pop();
				nextCursor = nextItem?._id?.toString();
			}

			return {
				items: products,
				nextCursor,
			};
		}),

	// Private procedure - requires authentication
	createProduct: privateProcedure
		.input(
			z.object({
				name: z.string(),
				price: z.number().positive(),
				description: z.string().optional(),
				status: z.enum(["active", "inactive"]).default("active"),
			})
		)
		.mutation(async ({input, ctx}) => {
			// You can access the authenticated user via ctx.user
			const userId = ctx.user.id;

			const product = await ProductModel.create({
				...input,
				createdBy: userId, // example of using the authenticated user
			});

			return product;
		}),

	getProductById: publicProcedure.input(z.object({id: z.string()})).query(async ({input}) => {
		const {id} = input;

		const product = await ProductModel.findById(id);
		if (!product) {
			throw new TRPCError({
				code: "NOT_FOUND",
				message: "Product not found",
			});
		}

		return product;
	}),

	updateProduct: privateProcedure
		.input(
			z.object({
				id: z.string(),
				name: z.string().optional(),
				price: z.number().positive().optional(),
				description: z.string().optional(),
				status: z.enum(["active", "inactive"]).optional(),
			})
		)
		.mutation(async ({input, ctx}) => {
			const {id, ...updateData} = input;

			const product = await ProductModel.findByIdAndUpdate(id, {...updateData}, {new: true});

			if (!product) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Product not found",
				});
			}

			return product;
		}),

	deleteProduct: privateProcedure.input(z.object({id: z.string()})).mutation(async ({input}) => {
		const {id} = input;

		const product = await ProductModel.findByIdAndDelete(id);
		if (!product) {
			throw new TRPCError({
				code: "NOT_FOUND",
				message: "Product not found",
			});
		}

		return {success: true};
	}),
});
```

#### 3. Backend: Register Router in Main Router File

```typescript
// In backend/src/routes/index.ts
import {router} from "../trpc";
import {authRouter} from "./auth";
import {productRouter} from "./product";
// Import other routers here

export const appRouter = router({
	auth: authRouter,
	product: productRouter,
	// Register other routers here
});

export type AppRouter = typeof appRouter;
```

#### 4. Frontend: Consuming the API in a Component/Page

```tsx
// Example in frontend/src/app/products/page.tsx
"use client";

import {useState} from "react";
import {trpc} from "@/trpc/client";
import {useRouter} from "next/navigation";

export default function ProductsPage() {
	const router = useRouter();
	const [name, setName] = useState("");
	const [price, setPrice] = useState("");
	const [description, setDescription] = useState("");

	// Query example
	const {data: productsData, isLoading, error} = trpc.product.getProducts.useQuery({limit: 20});

	// Mutation example
	const createProduct = trpc.product.createProduct.useMutation({
		onSuccess: () => {
			// Reset form
			setName("");
			setPrice("");
			setDescription("");
			// Force refetch of products data
			utils.product.getProducts.invalidate();
		},
	});

	// Get tRPC utils for query invalidation
	const utils = trpc.useUtils();

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		createProduct.mutate({
			name,
			price: Number(price),
			description,
		});
	};

	// Deletion example
	const deleteProduct = trpc.product.deleteProduct.useMutation({
		onSuccess: () => {
			utils.product.getProducts.invalidate();
		},
	});

	const handleDelete = (id: string) => {
		deleteProduct.mutate({id});
	};

	if (isLoading) return <div>Loading products...</div>;
	if (error) return <div>Error: {error.message}</div>;

	return (
		<div className='container mx-auto p-4'>
			<h1 className='text-2xl font-bold mb-4'>Products</h1>

			{/* Create Product Form */}
			<form onSubmit={handleSubmit} className='mb-8 p-4 border rounded-md'>
				<h2 className='text-xl font-semibold mb-2'>Add New Product</h2>
				<div className='grid gap-4 mb-4'>
					<div>
						<label className='block mb-1'>Name</label>
						<input type='text' value={name} onChange={e => setName(e.target.value)} className='w-full px-3 py-2 border rounded' required />
					</div>
					<div>
						<label className='block mb-1'>Price</label>
						<input type='number' value={price} onChange={e => setPrice(e.target.value)} className='w-full px-3 py-2 border rounded' required />
					</div>
					<div>
						<label className='block mb-1'>Description</label>
						<textarea value={description} onChange={e => setDescription(e.target.value)} className='w-full px-3 py-2 border rounded' />
					</div>
				</div>
				<button type='submit' className='px-4 py-2 bg-blue-500 text-white rounded' disabled={createProduct.isLoading}>
					{createProduct.isLoading ? "Creating..." : "Create Product"}
				</button>
			</form>

			{/* Products List */}
			<div className='grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3'>
				{productsData?.items.map(product => (
					<div key={product.id} className='border rounded-md p-4'>
						<h3 className='text-lg font-semibold'>{product.name}</h3>
						<p className='text-gray-600'>${product.price}</p>
						{product.description && <p>{product.description}</p>}
						<div className='mt-4 flex gap-2'>
							<button onClick={() => router.push(`/products/${product.id}`)} className='px-3 py-1 bg-gray-100 rounded'>
								View
							</button>
							<button onClick={() => router.push(`/products/${product.id}/edit`)} className='px-3 py-1 bg-yellow-100 rounded'>
								Edit
							</button>
							<button onClick={() => handleDelete(product.id)} className='px-3 py-1 bg-red-100 rounded' disabled={deleteProduct.isLoading}>
								Delete
							</button>
						</div>
					</div>
				))}
			</div>

			{/* No products message */}
			{productsData?.items.length === 0 && <p className='text-center py-8 text-gray-500'>No products found</p>}
		</div>
	);
}
```

#### 5. Frontend: Product Detail Page Example

```tsx
// Example in frontend/src/app/products/[id]/page.tsx
"use client";

import {trpc} from "@/trpc/client";
import {useRouter} from "next/navigation";
import {useParams} from "next/navigation";

export default function ProductDetailPage() {
	const params = useParams();
	const productId = params.id as string;
	const router = useRouter();

	const {data: product, isLoading, error} = trpc.product.getProductById.useQuery({id: productId});

	const deleteProduct = trpc.product.deleteProduct.useMutation({
		onSuccess: () => {
			router.push("/products");
		},
	});

	const handleDelete = () => {
		if (window.confirm("Are you sure you want to delete this product?")) {
			deleteProduct.mutate({id: productId});
		}
	};

	if (isLoading) return <div>Loading product details...</div>;
	if (error) return <div>Error: {error.message}</div>;
	if (!product) return <div>Product not found</div>;

	return (
		<div className='container mx-auto p-4'>
			<div className='mb-4'>
				<button onClick={() => router.back()} className='text-blue-500'>
					← Back
				</button>
			</div>

			<div className='bg-white p-6 rounded-lg shadow-md'>
				<h1 className='text-2xl font-bold mb-4'>{product.name}</h1>
				<div className='mb-4'>
					<span className='text-gray-600 font-semibold'>Price: </span>
					<span className='text-lg'>${product.price}</span>
				</div>
				{product.description && (
					<div className='mb-6'>
						<h2 className='text-lg font-semibold mb-2'>Description:</h2>
						<p>{product.description}</p>
					</div>
				)}

				<div className='flex gap-4 mt-6'>
					<button onClick={() => router.push(`/products/${product.id}/edit`)} className='px-4 py-2 bg-yellow-500 text-white rounded'>
						Edit Product
					</button>
					<button onClick={handleDelete} className='px-4 py-2 bg-red-500 text-white rounded' disabled={deleteProduct.isLoading}>
						{deleteProduct.isLoading ? "Deleting..." : "Delete Product"}
					</button>
				</div>
			</div>
		</div>
	);
}
```

### Error Handling Patterns

```typescript
// Common error handling patterns with tRPC
try {
	// Your code here
} catch (error) {
	throw new TRPCError({
		code: "INTERNAL_SERVER_ERROR", // use appropriate error code
		message: "Something went wrong",
		cause: error,
	});
}

// Common error codes:
// - NOT_FOUND: Resource not found
// - BAD_REQUEST: Invalid input
// - UNAUTHORIZED: Authentication required
// - FORBIDDEN: Authenticated but not authorized
// - INTERNAL_SERVER_ERROR: Server error
```

### Pagination Pattern

```typescript
// Backend: Cursor-based pagination pattern
.input(
  z.object({
    limit: z.number().optional().default(10),
    cursor: z.string().optional(),
    filters: z.object({
      // your filter fields
    }).optional(),
  })
)
.query(async ({ input }) => {
  const { limit, cursor, filters } = input;
  const query = { ...filters };

  if (cursor) {
    query._id = { $lt: new mongoose.Types.ObjectId(cursor) };
  }

  const items = await SomeModel
    .find(query)
    .sort({ _id: -1 })
    .limit(limit + 1)
    .lean();

  let nextCursor: string | undefined = undefined;
  if (items.length > limit) {
    const nextItem = items.pop();
    nextCursor = nextItem?._id.toString();
  }

  return {
    items,
    nextCursor
  };
})

// Frontend: Using the paginated API
function PaginatedList() {
  const [cursor, setCursor] = useState<string | undefined>(undefined);

  const { data, isLoading, isFetching } = trpc.someRouter.getPaginatedItems.useQuery(
    { limit: 10, cursor }
  );

  return (
    <div>
      {/* Render your list items */}
      {data?.items.map(item => (
        <div key={item.id}>{/* render item */}</div>
      ))}

      {data?.nextCursor && (
        <button
          onClick={() => setCursor(data.nextCursor)}
          disabled={isFetching}
        >
          Load More
        </button>
      )}
    </div>
  );
}
```

## Authentication Flow

- JWT-based authentication with access and refresh tokens
- Access tokens expire in 15 minutes
- Refresh tokens expire in 7 days and are stored in user model (hashed)
- Token refresh mechanism is implemented for seamless UX

## Data Models

### User Model

The main user model has the following structure:

```typescript
export class UserClass {
	first_name: string;
	last_name: string;
	avatar?: string | null;
	email: string;
	password: string;
	refresh_token?: string | null;
	is_email_verified: boolean;
	verify_token?: string | null;
}
```

## API Structure

APIs are organized through tRPC routers with a separation between public and private procedures:

- `publicProcedure`: Accessible without authentication
- `privateProcedure`: Requires authenticated user

## Coding Conventions

### Backend Conventions

- Use Typegoose for MongoDB schema definitions
- Implement proper error handling with tRPC error objects
- Separate route logic into distinct router files
- Use environment variables for configuration

### Frontend Conventions

- Use React Query through tRPC for data fetching
- Implement proper authentication header management
- Use strong TypeScript typing throughout the application
- Follow component-based architecture for UI elements

## Common Patterns

- Authentication token handling: Storing in cookies/local storage and refreshing when needed
- Error handling through tRPC's error system
- Type-safe communication between frontend and backend

## Development Workflow

- Backend development typically involves creating/updating models and tRPC routes
- Frontend development involves creating components, pages, and tRPC hooks

When making suggestions:

- Maintain the existing project structure
- Follow TypeScript best practices
- Ensure security best practices for authentication flows
- Respect the established code style and patterns
