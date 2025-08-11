import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { UserModel, UserRole } from "../../model/user";

const updateUserRoleSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  role: z.enum([UserRole.USER, UserRole.ADMIN]),
});

export const updateUserRole = async (
  input: z.infer<typeof updateUserRoleSchema>,
  adminUser: { id: string }
) => {
  const { userId, role } = input;

  // Prevent admin from changing their own role
  if (adminUser.id === userId) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "You cannot change your own role",
    });
  }

  const user = await UserModel.findById(userId);
  if (!user) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "User not found",
    });
  }

  user.role = role;
  await user.save();

  return {
    id: user.id,
    email: user.email,
    first_name: user.first_name,
    last_name: user.last_name,
    role: user.role,
    is_email_verified: user.is_email_verified,
  };
};

export { updateUserRoleSchema };
