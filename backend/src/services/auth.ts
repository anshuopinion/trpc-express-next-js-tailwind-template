import jwt from "jsonwebtoken";
import type { UserRole } from "../model/user";

export const generateAccessToken = (userId: string, email: string, role: UserRole) => {
  const secret = process.env.ACCESS_TOKEN_SECRET;
  if (!secret) throw new Error("ACCESS_TOKEN_SECRET is not defined");
  return jwt.sign({ userId, email, role }, secret, {
    expiresIn: "15m",
  });
};

export const generateRefreshToken = (userId: string, email: string, role: UserRole) => {
  const secret = process.env.REFRESH_TOKEN_SECRET;
  if (!secret) throw new Error("REFRESH_TOKEN_SECRET is not defined");
  return jwt.sign({ userId, email, role }, secret, {
    expiresIn: "7d",
  });
};

export const getTokens = async (userId: string, email: string, role: UserRole) => {
  const [access_token, refresh_token] = await Promise.all([
    generateAccessToken(userId, email, role),
    generateRefreshToken(userId, email, role),
  ]);
  return {
    access_token,
    refresh_token,
    expires_at: Math.floor(Date.now() / 1000) + 60 * 15,
  };
};
