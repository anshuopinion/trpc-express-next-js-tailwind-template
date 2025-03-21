import {router} from "../trpc";
import {authRouter} from "./auth";
import {typeRouter} from "./type";
import {userRouter} from "./user";
import {schoolRouter} from "./school";

const appRouter = router({
	user: userRouter,
	auth: authRouter,
	type: typeRouter,
	school: schoolRouter,
});

export {appRouter};
export type AppRouter = typeof appRouter;
