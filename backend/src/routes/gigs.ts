import {z} from "zod";
import {privateProcedure, publicProcedure, router} from "../trpc";
import {GigModel} from "../model/gig";
import {TRPCError} from "@trpc/server";

const packageSchema = z.object({
	title: z.string(),
	description: z.string(),
	price: z.number().min(5, "Price must be at least $5"),
});

export const gigsRouter = router({
	create: privateProcedure
		.input(
			z.object({
				title: z.string().min(5, "Title must be at least 5 characters"),
				category: z.object({
					main: z.string().min(1, "Main category is required"),
					sub: z.string().min(1, "Subcategory is required"),
				}),
				description: z.string().min(20, "Description must be at least 20 characters"),
				searchTags: z.array(z.string()).default([]),
				packages: z.object({
					basic: packageSchema,
					standard: packageSchema,
					premium: packageSchema,
				}),
				images: z.array(z.string()).optional(),
			})
		)
		.mutation(async ({input, ctx}) => {
			try {
				const gig = await GigModel.create({
					...input,
					seller: ctx.user.id,
				});

				return gig;
			} catch (error: any) {
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Failed to create gig: " + error.message,
					cause: error,
				});
			}
		}),

	getAll: publicProcedure
		.input(
			z.object({
				limit: z.number().min(1).max(50).optional().default(20),
				cursor: z.string().optional(),
				category: z.string().optional(),
				subcategory: z.string().optional(),
				search: z.string().optional(),
				minPrice: z.number().optional(),
				maxPrice: z.number().optional(),
				sortBy: z.enum(["newest", "bestselling", "topRated"]).optional().default("newest"),
			})
		)
		.query(async ({input}) => {
			const {limit, cursor, category, subcategory, search, minPrice, maxPrice, sortBy} = input;

			// Build query
			const query: any = {};

			if (category) {
				query["category.main"] = category;
			}

			if (subcategory) {
				query["category.sub"] = subcategory;
			}

			if (search) {
				query.$or = [{title: {$regex: search, $options: "i"}}, {description: {$regex: search, $options: "i"}}, {searchTags: {$in: [new RegExp(search, "i")]}}];
			}

			// Price filtering
			if (minPrice !== undefined || maxPrice !== undefined) {
				query.$or = [
					{"packages.basic.price": {$gte: minPrice || 0, $lte: maxPrice || 10000}},
					{"packages.standard.price": {$gte: minPrice || 0, $lte: maxPrice || 10000}},
					{"packages.premium.price": {$gte: minPrice || 0, $lte: maxPrice || 10000}},
				];
			}

			// Active gigs only for public queries
			query.status = "active";

			// Cursor-based pagination
			if (cursor) {
				query._id = {$lt: cursor};
			}

			// Sorting
			let sort: any = {createdAt: -1}; // newest by default
			if (sortBy === "bestselling") {
				sort = {orders: -1};
			} else if (sortBy === "topRated") {
				sort = {averageRating: -1};
			}

			const gigs = await GigModel.find(query)
				.sort(sort)
				.limit(limit + 1) // get one extra to determine if there are more
				.populate("seller", "first_name last_name avatar")
				.lean();

			let nextCursor: string | undefined = undefined;
			if (gigs.length > limit) {
				const nextItem = gigs.pop();
				nextCursor = nextItem?._id.toString();
			}

			return {
				items: gigs,
				nextCursor,
			};
		}),

	getById: publicProcedure.input(z.object({id: z.string()})).query(async ({input}) => {
		const {id} = input;

		const gig = await GigModel.findById(id).populate("seller", "first_name last_name avatar").lean();

		if (!gig) {
			throw new TRPCError({
				code: "NOT_FOUND",
				message: "Gig not found",
			});
		}

		// Increment impression count
		await GigModel.findByIdAndUpdate(id, {$inc: {impressions: 1}});

		return gig;
	}),

	getUserGigs: privateProcedure.query(async ({ctx}) => {
		const gigs = await GigModel.find({seller: ctx.user.id}).sort({createdAt: -1}).lean();

		return gigs;
	}),

	update: privateProcedure
		.input(
			z.object({
				id: z.string(),
				title: z.string().min(5).optional(),
				category: z
					.object({
						main: z.string().min(1),
						sub: z.string().min(1),
					})
					.optional(),
				description: z.string().min(20).optional(),
				searchTags: z.array(z.string()).optional(),
				packages: z
					.object({
						basic: packageSchema.partial().optional(),
						standard: packageSchema.partial().optional(),
						premium: packageSchema.partial().optional(),
					})
					.optional(),
				images: z.array(z.string()).optional(),
				status: z.enum(["active", "paused"]).optional(),
			})
		)
		.mutation(async ({input, ctx}) => {
			const {id, ...updateData} = input;

			// Find gig and check ownership
			const gig = await GigModel.findById(id);

			if (!gig) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Gig not found",
				});
			}

			// Check if the user owns the gig
			if (gig.seller.toString() !== ctx.user.id) {
				throw new TRPCError({
					code: "FORBIDDEN",
					message: "You can only update your own gigs",
				});
			}

			// Update the gig
			const updatedGig = await GigModel.findByIdAndUpdate(id, updateData, {
				new: true,
			}).lean();

			return updatedGig;
		}),

	delete: privateProcedure.input(z.object({id: z.string()})).mutation(async ({input, ctx}) => {
		const {id} = input;

		// Find gig and check ownership
		const gig = await GigModel.findById(id);

		if (!gig) {
			throw new TRPCError({
				code: "NOT_FOUND",
				message: "Gig not found",
			});
		}

		// Check if the user owns the gig
		if (gig.seller.toString() !== ctx.user.id) {
			throw new TRPCError({
				code: "FORBIDDEN",
				message: "You can only delete your own gigs",
			});
		}

		// Delete the gig
		await GigModel.findByIdAndDelete(id);

		return {success: true};
	}),
});
