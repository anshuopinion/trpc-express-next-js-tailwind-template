import { router } from "../trpc";
import { authRouter } from "./auth";
import { userRouter } from "./user";
import { typeRouter } from "./type";
import { adminRouter } from "./admin";

export const appRouter = router({
  auth: authRouter,
  user: userRouter,
  type: typeRouter,
  admin: adminRouter,
});

export type AppRouter = typeof appRouter;
