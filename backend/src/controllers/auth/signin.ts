import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { UserModel } from "../../model/user";
import { getTokens } from "../../services/auth";
import { comparePassword, updateRefreshToken } from "../../services/password";

const signinSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(1, "Password is required"),
});

export const signin = async (input: z.infer<typeof signinSchema>) => {
  const { email, password } = input;

  const user = await UserModel.findOne({ email });
  if (!user) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Invalid credentials",
    });
  }

  const passwordMatches = await comparePassword(password, user.password);
  if (!passwordMatches) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Invalid credentials",
    });
  }

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

export { signinSchema };
