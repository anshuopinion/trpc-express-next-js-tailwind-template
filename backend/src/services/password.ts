import bcrypt from "bcryptjs";
import { UserModel } from "../model/user";

export const hashPassword = async (password: string) => {
  return await bcrypt.hash(password, 10);
};

export const comparePassword = async (password: string, hashedPassword: string) => {
  return await bcrypt.compare(password, hashedPassword);
};

export const hashData = async (token: string) => {
  return await bcrypt.hash(token, 10);
};

export const updateRefreshToken = async (userId: string, refreshToken: string) => {
  const hashedRefreshToken = await hashData(refreshToken);
  await UserModel.findByIdAndUpdate(userId, {
    refresh_token: hashedRefreshToken,
  });
};
