import { UserModel } from "../../model/user";

export const logout = async (userId: string) => {
  await UserModel.findByIdAndUpdate(userId, {
    refresh_token: null,
  });
  return { message: "Logged out successfully" };
};
