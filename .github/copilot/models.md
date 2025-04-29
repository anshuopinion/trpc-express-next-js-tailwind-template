# Database Models Guide

## MongoDB with Typegoose

This project uses MongoDB as the database and Typegoose to define strongly-typed models. Typegoose is a wrapper around Mongoose that uses TypeScript decorators to define schemas.

## Model Definition Pattern

```typescript
import {getModelForClass, modelOptions, prop, Ref} from "@typegoose/typegoose";

@modelOptions({
	schemaOptions: {
		collection: "users", // collection name in MongoDB
		timestamps: true, // adds createdAt and updatedAt fields
	},
})
export class UserClass {
	@prop({required: true, type: String})
	public first_name: string;

	@prop({required: true, type: String})
	public last_name: string;

	@prop({required: true, unique: true, type: String})
	public email: string;

	@prop({required: true, type: String})
	public password: string;

	// Optional field
	@prop({type: String})
	public avatar?: string | null;

	// Reference to another model
	@prop({ref: "RoleClass", type: () => String})
	public role_id?: Ref<RoleClass>;

	// Array of strings
	@prop({type: [String], default: []})
	public permissions: string[];

	// Method on the document
	public getFullName(): string {
		return `${this.first_name} ${this.last_name}`;
	}
}

// The type with document ID included
export type IUser = UserClass & {id: string};

// The actual model to use in queries
export const UserModel = getModelForClass(UserClass);
```

## Common Property Types

### String Properties

```typescript
// Required string
@prop({ required: true, type: String })
public name: string;

// Optional string
@prop({ type: String })
public description?: string;

// String with enum values
@prop({
  type: String,
  enum: ["admin", "user", "guest"],
  default: "user"
})
public role: "admin" | "user" | "guest";

// String with validation regex
@prop({
  type: String,
  validate: {
    validator: (v: string) => /^\d{3}-\d{3}-\d{4}$/.test(v),
    message: "Phone number must be in format XXX-XXX-XXXX"
  }
})
public phone: string;
```

### Number Properties

```typescript
// Required number
@prop({ required: true, type: Number })
public price: number;

// Number with min/max validation
@prop({
  type: Number,
  min: [0, "Rating can't be negative"],
  max: [5, "Rating can't be more than 5"]
})
public rating: number;
```

### Boolean Properties

```typescript
// Boolean with default
@prop({ type: Boolean, default: false })
public is_active: boolean;
```

### Date Properties

```typescript
// Date type
@prop({ type: Date })
public birthday?: Date;

// Date with default to current time
@prop({ type: Date, default: Date.now })
public created_at: Date;
```

### Array Properties

```typescript
// Array of strings
@prop({ type: [String], default: [] })
public tags: string[];

// Array of sub-documents
@prop({
  type: () => [{
    name: String,
    value: String
  }],
  default: []
})
public metadata: Array<{ name: string, value: string }>;
```

### Nested Object Properties

```typescript
// Simple nested object
@prop({
  type: () => ({
    street: String,
    city: String,
    state: String,
    zip: String
  })
})
public address?: {
  street: string;
  city: string;
  state: string;
  zip: string;
};
```

### References to Other Models

```typescript
// Reference to another model
@prop({ ref: 'CategoryClass', type: () => String })
public category_id?: Ref<CategoryClass>;

// Array of references
@prop({ ref: 'TagClass', type: () => [String] })
public tag_ids: Ref<TagClass>[];
```

## Indexes

```typescript
// Index setup using decorators
@modelOptions({
	schemaOptions: {
		collection: "products",
		timestamps: true,
	},
	options: {
		allowMixed: Severity.ALLOW, // Allow mixed types
	},
})
@index({name: 1}) // Single field index
@index({price: 1, category: 1}) // Compound index
@index({description: "text"}) // Text index
export class ProductClass {
	// Properties
}
```

## Virtuals

```typescript
// Virtual property (not stored in database)
@prop({
  type: String,
  get: function(this: DocumentType<UserClass>) {
    return `${this.first_name} ${this.last_name}`;
  },
})
public get full_name(): string {
  return "";  // TypeScript requires a return value
}
```

## Pre/Post Hooks

You can define Mongoose hooks using Typegoose:

```typescript
@pre<UserClass>("save", async function () {
	if (this.isModified("password")) {
		this.password = await bcrypt.hash(this.password, 10);
	}
})
@modelOptions({
	schemaOptions: {collection: "users"},
})
export class UserClass {
	// Properties
}
```

## Using Models in tRPC Routes

```typescript
import {ProductModel} from "../model/product";

export const productRouter = router({
	getProduct: publicProcedure.input(z.object({id: z.string()})).query(async ({input}) => {
		const product = await ProductModel.findById(input.id)
			.populate("category_id") // populating references
			.lean();

		if (!product) {
			throw new TRPCError({
				code: "NOT_FOUND",
				message: "Product not found",
			});
		}

		return product;
	}),

	createProduct: privateProcedure.input(productSchema).mutation(async ({input, ctx}) => {
		const product = await ProductModel.create({
			...input,
			created_by: ctx.user.id,
		});

		return product;
	}),

	updateProduct: privateProcedure
		.input(
			z.object({
				id: z.string(),
				data: productUpdateSchema,
			})
		)
		.mutation(async ({input}) => {
			const {id, data} = input;

			const product = await ProductModel.findByIdAndUpdate(id, data, {new: true, runValidators: true});

			if (!product) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Product not found",
				});
			}

			return product;
		}),

	deleteProduct: privateProcedure.input(z.object({id: z.string()})).mutation(async ({input}) => {
		const product = await ProductModel.findByIdAndDelete(input.id);

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

## Common Queries

```typescript
// Find by ID
const item = await ItemModel.findById(id);

// Find one document that matches criteria
const item = await ItemModel.findOne({slug: "example-slug"});

// Find all documents that match criteria
const items = await ItemModel.find({status: "active"});

// Find with sorting
const items = await ItemModel.find()
	.sort({created_at: -1}) // descending (-1) or ascending (1)
	.lean(); // Convert to plain objects (more efficient)

// Find with pagination
const items = await ItemModel.find()
	.skip(page * limit)
	.limit(limit)
	.lean();

// Count documents
const count = await ItemModel.countDocuments({status: "active"});

// Projections (select specific fields)
const users = await UserModel.find({}, "first_name email").lean();

// Populate references
const user = await UserModel.findById(id).populate("role_id").lean();

// Nested populate
const user = await UserModel.findById(id)
	.populate({
		path: "role_id",
		populate: {
			path: "permissions",
		},
	})
	.lean();
```

## Transactions

For operations that need to be atomic, use transactions:

```typescript
import mongoose from "mongoose";

async function transferPoints(fromUserId: string, toUserId: string, amount: number) {
	const session = await mongoose.startSession();

	try {
		session.startTransaction();

		// Update sender account
		const fromUser = await UserModel.findByIdAndUpdate(fromUserId, {$inc: {points: -amount}}, {new: true, session});

		if (!fromUser || fromUser.points < 0) {
			throw new Error("Insufficient points");
		}

		// Update receiver account
		await UserModel.findByIdAndUpdate(toUserId, {$inc: {points: amount}}, {session});

		// Create transaction record
		await TransactionModel.create(
			[
				{
					from_user_id: fromUserId,
					to_user_id: toUserId,
					amount,
					status: "completed",
					created_at: new Date(),
				},
			],
			{session}
		);

		await session.commitTransaction();
		return {success: true};
	} catch (error) {
		await session.abortTransaction();
		throw error;
	} finally {
		session.endSession();
	}
}
```

## Working with Subdocuments

```typescript
// Model with subdocuments
@modelOptions({
	schemaOptions: {collection: "orders"},
})
export class OrderClass {
	@prop({required: true, ref: "UserClass", type: () => String})
	public user_id: Ref<UserClass>;

	@prop({
		type: () => [
			{
				product_id: {type: String, ref: "ProductClass", required: true},
				quantity: {type: Number, required: true, min: 1},
				price: {type: Number, required: true},
			},
		],
		default: [],
	})
	public items: Array<{
		product_id: Ref<ProductClass>;
		quantity: number;
		price: number;
	}>;

	@prop({
		type: String,
		enum: ["pending", "processing", "shipped", "delivered", "cancelled"],
		default: "pending",
	})
	public status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
}

export const OrderModel = getModelForClass(OrderClass);

// Adding an item to the subdocuments array
await OrderModel.findByIdAndUpdate(orderId, {
	$push: {
		items: {
			product_id: productId,
			quantity: 1,
			price: 99.99,
		},
	},
});

// Updating a specific subdocument
await OrderModel.findOneAndUpdate(
	{_id: orderId, "items.product_id": productId},
	{
		$set: {
			"items.$.quantity": 2,
			"items.$.price": 89.99,
		},
	}
);

// Removing a subdocument
await OrderModel.findByIdAndUpdate(orderId, {
	$pull: {
		items: {product_id: productId},
	},
});
```

## Model Validation with Zod

While Typegoose provides schema validation, you can use Zod schemas for API input validation:

```typescript
// Zod schema for product creation
const createProductSchema = z.object({
  name: z.string().min(1, "Name is required"),
  price: z.number().positive("Price must be positive"),
  description: z.string().optional(),
  category_id: z.string().optional(),
  status: z.enum(["active", "inactive"]).default("active"),
});

// Use in tRPC procedure
.input(createProductSchema)
.mutation(async ({ input }) => {
  // Input is already validated by Zod
  const product = await ProductModel.create(input);
  return product;
});
```

## Schema Evolution

When your schema needs to evolve:

1. Add new fields with `optional` or `default` values
2. Modify validations to accommodate legacy data
3. Use migration scripts for breaking changes

Example migration:

```typescript
// Migration script to update existing documents
async function migrateUsers() {
	// Find users without the new field
	const users = await UserModel.find({
		has_profile_picture: {$exists: false},
	});

	// Update in batches
	const batchSize = 100;
	for (let i = 0; i < users.length; i += batchSize) {
		const batch = users.slice(i, i + batchSize);

		await Promise.all(
			batch.map(async user => {
				user.has_profile_picture = Boolean(user.avatar);
				await user.save();
			})
		);

		console.log(`Processed ${Math.min(i + batchSize, users.length)} of ${users.length} users`);
	}
}
```
