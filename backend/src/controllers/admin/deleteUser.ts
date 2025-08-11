import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { UserModel } from "../../model/user";

const deleteUserSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
});

export const deleteUser = async (
  input: z.infer<typeof deleteUserSchema>,
  adminUser: { id: string },
) => {
  const { userId } = input;

  // Prevent admin from deleting their own account
  if (adminUser.id === userId) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "You cannot delete your own account",
    });
  }

  const user = await UserModel.findById(userId);
  if (!user) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "User not found",
    });
  }

  await UserModel.findByIdAndDelete(userId);

  return {
    success: true,
    message: "User deleted successfully",
    deletedUser: {
      id: user.id,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
    },
  };
};

export { deleteUserSchema };
