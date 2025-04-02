import {UserModel} from "../model/user";
import {privateProcedure, router} from "../trpc";
import {z} from "zod";

export const userRouter = router({
	getProfile: privateProcedure.query(async ({ctx}) => {
		const user = ctx.user;
		return {
			id: user.id.toString(),
			first_name: user.first_name,
			last_name: user.last_name,
			email: user.email,
			avatar: user.avatar,
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
				},
			};
		}),
});
