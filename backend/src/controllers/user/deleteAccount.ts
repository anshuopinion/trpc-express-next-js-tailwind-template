import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { UserModel } from "../../model/user";
import { comparePassword } from "../../services/password";

const deleteAccountSchema = z.object({
  password: z.string().min(1, "Password is required"),
});

interface User {
  id: string;
}

export const deleteAccount = async (
  input: z.infer<typeof deleteAccountSchema>,
  user: User,
) => {
  const { password } = input;

  const dbUser = await UserModel.findById(user.id);
  if (!dbUser) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "User not found",
    });
  }

  const passwordMatches = await comparePassword(password, dbUser.password);
  if (!passwordMatches) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Password is incorrect",
    });
  }

  await UserModel.findByIdAndDelete(user.id);
  return { message: "Account deleted successfully" };
};

export { deleteAccountSchema };
