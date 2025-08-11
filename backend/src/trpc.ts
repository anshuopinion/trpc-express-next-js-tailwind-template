import { initTRPC, TRPCError } from "@trpc/server";
import * as trpcExpress from "@trpc/server/adapters/express";
import jwt from "jsonwebtoken";
import { type IUser, UserModel, UserRole } from "./model/user";

const decodeAndVerifyJwtToken = async (token: string) => {
  try {
    const secret = process.env.ACCESS_TOKEN_SECRET;
    if (!secret)
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "ACCESS_TOKEN_SECRET is not defined",
      });
    const decoded = jwt.verify(token, secret);
    return decoded;
  } catch (_error) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Invalid token",
    });
  }
};

const createContext = async ({ req }: trpcExpress.CreateExpressContextOptions) => {
  async function getTokenFromHeader() {
    if (req.headers.authorization) {
      const token = req.headers.authorization.split(" ")[1];
      const decodedToken = await decodeAndVerifyJwtToken(token);
      return decodedToken as { userId: string; email: string; role: string };
    }
    return null;
  }
  const token = await getTokenFromHeader();

  if (!token) {
    return {
      user: null,
    };
  }
  const user = (await UserModel.findById(token.userId)) as IUser;
  return {
    user,
  };
};

type Context = Awaited<ReturnType<typeof createContext>>;
const t = initTRPC.context<Context>().create();

export const router = t.router;
export const publicProcedure = t.procedure;

export const privateProcedure = publicProcedure.use(async (opts) => {
  const { ctx } = opts;

  if (!ctx.user) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "You are not authorized to access this resource",
    });
  }
  return opts.next({
    ctx: {
      user: ctx.user,
    },
  });
});

export const adminProcedure = privateProcedure.use(async (opts) => {
  const { ctx } = opts;

  if (ctx.user.role !== UserRole.ADMIN) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Admin access required",
    });
  }
  return opts.next({
    ctx: {
      user: ctx.user,
    },
  });
});

export { createContext, trpcExpress };
