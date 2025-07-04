import { router } from "../trpc";
import { authRouter } from "./auth";
import { userRouter } from "./user";
import { typeRouter } from "./type";

export const appRouter = router({
  auth: authRouter,
  user: userRouter,
  type: typeRouter,
});

export type AppRouter = typeof appRouter;