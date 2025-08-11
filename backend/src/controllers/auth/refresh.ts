import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { UserModel } from "../../model/user";
import { comparePassword, updateRefreshToken } from "../../services/password";
import { getTokens } from "../../services/auth";

const refreshTokenSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  refreshToken: z.string().min(1, "Refresh token is required"),
});

export const refreshToken = async (
  input: z.infer<typeof refreshTokenSchema>,
) => {
  const { userId, refreshToken: refreshTokenInput } = input;

  const user = await UserModel.findById(userId);
  if (!user) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Invalid refresh token",
    });
  }

  const refreshTokenMatches = await comparePassword(
    refreshTokenInput,
    user.refresh_token || "",
  );
  if (!refreshTokenMatches) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Invalid refresh token",
    });
  }

  const tokens = await getTokens(user.id, user.email);
  await updateRefreshToken(user.id, tokens.refresh_token);

  return {
    first_name: user.first_name,
    last_name: user.last_name,
    email: user.email,
    id: user.id,
    ...tokens,
  };
};

export { refreshTokenSchema };
