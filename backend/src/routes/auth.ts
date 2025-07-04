import { privateProcedure, publicProcedure, router } from "../trpc";
import { z } from "zod";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { TRPCError } from "@trpc/server";
import { UserModel } from "../model/user";

const generateAccessToken = (userId: string, email: string) => {
  return jwt.sign({ userId, email }, process.env.ACCESS_TOKEN_SECRET!, {
    expiresIn: "15m",
  });
};

const generateRefreshToken = (userId: string, email: string) => {
  return jwt.sign({ userId, email }, process.env.REFRESH_TOKEN_SECRET!, {
    expiresIn: "7d",
  });
};

const hashData = async (token: string) => {
  return await bcrypt.hash(token, 10);
};

const updateRefreshToken = async (userId: string, refreshToken: string) => {
  const hashedRefreshToken = await hashData(refreshToken);
  await UserModel.findByIdAndUpdate(userId, {
    refresh_token: hashedRefreshToken,
  });
};

const getTokens = async (userId: string, email: string) => {
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

export const authRouter = router({
  signup: publicProcedure
    .input(
      z.object({
        email: z.string().email("Invalid email format"),
        password: z.string().min(6, "Password must be at least 6 characters"),
        first_name: z.string().min(1, "First name is required"),
        last_name: z.string().min(1, "Last name is required"),
      })
    )
    .mutation(async (opts) => {
      const { email, first_name, last_name, password } = opts.input;

      const existingUser = await UserModel.findOne({ email });
      if (existingUser) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "User already exists",
        });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const user = await UserModel.create({
        email,
        first_name,
        last_name,
        password: hashedPassword,
      });

      const tokens = await getTokens(user.id, user.email);
      await updateRefreshToken(user.id, tokens.refresh_token);

      return {
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        id: user.id,
        ...tokens,
      };
    }),

  signin: publicProcedure
    .input(
      z.object({
        email: z.string().email("Invalid email format"),
        password: z.string().min(1, "Password is required"),
      })
    )
    .mutation(async (opts) => {
      const { email, password } = opts.input;

      const user = await UserModel.findOne({ email });
      if (!user) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Invalid credentials",
        });
      }

      const passwordMatches = await bcrypt.compare(password, user.password);
      if (!passwordMatches) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Invalid credentials",
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
    }),

  logout: privateProcedure.mutation(async (opts) => {
    const user = opts.ctx.user;
    await UserModel.findByIdAndUpdate(user.id, {
      refresh_token: null,
    });
    return { message: "Logged out successfully" };
  }),

  me: privateProcedure.query(async (opts) => {
    const user = opts.ctx.user;
    return {
      id: user.id,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      avatar: user.avatar,
      is_email_verified: user.is_email_verified,
    };
  }),

  refreshToken: publicProcedure
    .input(
      z.object({
        userId: z.string().min(1, "User ID is required"),
        refreshToken: z.string().min(1, "Refresh token is required"),
      })
    )
    .mutation(async (opts) => {
      const { userId, refreshToken } = opts.input;

      const user = await UserModel.findById(userId);
      if (!user) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Invalid refresh token",
        });
      }

      const refreshTokenMatches = await bcrypt.compare(refreshToken, user.refresh_token || "");
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
    }),
});