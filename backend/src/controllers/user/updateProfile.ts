import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { UserModel } from "../../model/user";

const updateProfileSchema = z.object({
  first_name: z.string().min(1, "First name is required").optional(),
  last_name: z.string().min(1, "Last name is required").optional(),
  avatar: z.string().url("Invalid avatar URL").optional(),
});

interface User {
  id: string;
}

export const updateProfile = async (input: z.infer<typeof updateProfileSchema>, user: User) => {
  const { first_name, last_name, avatar } = input;

  const updateData: Record<string, unknown> = {};
  if (first_name) updateData.first_name = first_name;
  if (last_name) updateData.last_name = last_name;
  if (avatar !== undefined) updateData.avatar = avatar;

  const updatedUser = await UserModel.findByIdAndUpdate(user.id, updateData, {
    new: true,
  });

  if (!updatedUser) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "User not found",
    });
  }

  return {
    id: updatedUser.id,
    email: updatedUser.email,
    first_name: updatedUser.first_name,
    last_name: updatedUser.last_name,
    avatar: updatedUser.avatar,
    is_email_verified: updatedUser.is_email_verified,
  };
};

export { updateProfileSchema };
