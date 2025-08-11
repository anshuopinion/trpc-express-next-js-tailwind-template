import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { UserModel } from "../../model/user";
import { hashPassword, updateRefreshToken } from "../../services/password";
import { getTokens } from "../../services/auth";

const signupSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
});

export const signup = async (input: z.infer<typeof signupSchema>) => {
  const { email, first_name, last_name, password } = input;

  const existingUser = await UserModel.findOne({ email });
  if (existingUser) {
    throw new TRPCError({
      code: "CONFLICT",
      message: "User already exists",
    });
  }

  const hashedPassword = await hashPassword(password);

  const user = await UserModel.create({
    email,
    first_name,
    last_name,
    password: hashedPassword,
  });

  const tokens = await getTokens(user.id, user.email, user.role);
  await updateRefreshToken(user.id, tokens.refresh_token);

  return {
    first_name: user.first_name,
    last_name: user.last_name,
    email: user.email,
    id: user.id,
    role: user.role,
    ...tokens,
  };
};

export { signupSchema };
