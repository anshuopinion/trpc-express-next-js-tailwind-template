import { router } from "../trpc";
import { adminRouter } from "./admin";
import { authRouter } from "./auth";
import { typeRouter } from "./type";
import { userRouter } from "./user";

export const appRouter = router({
  auth: authRouter,
  user: userRouter,
  type: typeRouter,
  admin: adminRouter,
});

export type AppRouter = typeof appRouter;
