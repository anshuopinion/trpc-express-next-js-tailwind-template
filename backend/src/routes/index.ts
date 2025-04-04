import {router} from "../trpc";
import {authRouter} from "./auth";
import {typeRouter} from "./type";
import {userRouter} from "./user";

const appRouter = router({
	user: userRouter,
	auth: authRouter,
	type: typeRouter,
});

export {appRouter};
export type AppRouter = typeof appRouter;
