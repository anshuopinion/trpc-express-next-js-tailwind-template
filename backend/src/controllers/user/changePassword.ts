import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { UserModel } from "../../model/user";
import { comparePassword, hashPassword } from "../../services/password";

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(6, "New password must be at least 6 characters"),
});

interface User {
  id: string;
}

export const changePassword = async (input: z.infer<typeof changePasswordSchema>, user: User) => {
  // Validate input with schema
  const validatedInput = changePasswordSchema.parse(input);
  const { currentPassword, newPassword } = validatedInput;

  const dbUser = await UserModel.findById(user.id);
  if (!dbUser) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "User not found",
    });
  }

  const passwordMatches = await comparePassword(currentPassword, dbUser.password);
  if (!passwordMatches) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Current password is incorrect",
    });
  }

  const hashedNewPassword = await hashPassword(newPassword);
  await UserModel.findByIdAndUpdate(user.id, { password: hashedNewPassword });

  return { message: "Password changed successfully" };
};

export { changePasswordSchema };
