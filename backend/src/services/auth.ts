import jwt from "jsonwebtoken";

export const generateAccessToken = (userId: string, email: string) => {
  return jwt.sign({ userId, email }, process.env.ACCESS_TOKEN_SECRET!, {
    expiresIn: "15m",
  });
};

export const generateRefreshToken = (userId: string, email: string) => {
  return jwt.sign({ userId, email }, process.env.REFRESH_TOKEN_SECRET!, {
    expiresIn: "7d",
  });
};

export const getTokens = async (userId: string, email: string) => {
  const [access_token, refresh_token] = await Promise.all([
    generateAccessToken(userId, email),
    generateRefreshToken(userId, email),
  ]);
  return {
    access_token,
    refresh_token,
    expires_at: Math.floor(Date.now() / 1000) + 60 * 15,
  };
};
