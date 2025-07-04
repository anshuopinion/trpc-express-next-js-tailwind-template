import {router} from "../trpc";
import {authRouter} from "./auth";
import {aiRouter} from "./ai";
import {gigsRouter} from "./gigs";
// Import other routers here

export const appRouter = router({
	auth: authRouter,
	ai: aiRouter,
	gigs: gigsRouter,
	// Register other routers here
});

export type AppRouter = typeof appRouter;
