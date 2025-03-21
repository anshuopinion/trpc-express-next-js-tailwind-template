import {UserModel, UserRole} from "../model/user";
import {privateProcedure, router, adminProcedure} from "../trpc";
import {z} from "zod";

export const userRouter = router({
	getProfile: privateProcedure.query(async ({ctx}) => {
		const userId = ctx.user?.id;
		if (!userId) {
			throw new Error("Unauthorized");
		}

		const user = await UserModel.findById(userId);
		if (!user) {
			throw new Error("User not found");
		}

		return {
			id: user._id.toString(),
			first_name: user.first_name,
			last_name: user.last_name,
			email: user.email,
			avatar: user.avatar,
			role: user.role,
		};
	}),

	updateProfile: privateProcedure
		.input(
			z.object({
				first_name: z.string().min(1, "First name is required"),
				last_name: z.string().min(1, "Last name is required"),
				avatar: z.string().nullable().optional(),
			})
		)
		.mutation(async ({ctx, input}) => {
			const userId = ctx.user?.id;
			if (!userId) {
				throw new Error("Unauthorized");
			}

			const user = await UserModel.findById(userId);
			if (!user) {
				throw new Error("User not found");
			}

			user.first_name = input.first_name;
			user.last_name = input.last_name;
			user.avatar = input.avatar ?? null;

			await user.save();

			return {
				success: true,
				user: {
					id: user._id.toString(),
					first_name: user.first_name,
					last_name: user.last_name,
					email: user.email,
					avatar: user.avatar,
					role: user.role,
				},
			};
		}),

	// Add admin specific routes
	getAllUsers: adminProcedure.query(async () => {
		const users = await UserModel.find();
		return users.map(user => ({
			id: user._id.toString(),
			first_name: user.first_name,
			last_name: user.last_name,
			email: user.email,
			role: user.role,
		}));
	}),

	updateUserRole: adminProcedure
		.input(
			z.object({
				userId: z.string(),
				role: z.nativeEnum(UserRole),
			})
		)
		.mutation(async ({input}) => {
			const {userId, role} = input;
			const user = await UserModel.findByIdAndUpdate(userId, {role}, {new: true});

			if (!user) {
				throw new Error("User not found");
			}

			return {
				success: true,
				user: {
					id: user._id.toString(),
					role: user.role,
				},
			};
		}),
});
