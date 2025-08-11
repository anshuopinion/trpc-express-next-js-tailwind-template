import { authController } from "../controllers";
import { privateProcedure, publicProcedure, router } from "../trpc";

export const authRouter = router({
  signup: publicProcedure.input(authController.signupSchema).mutation(async (opts) => {
    return await authController.signup(opts.input);
  }),

  signin: publicProcedure.input(authController.signinSchema).mutation(async (opts) => {
    return await authController.signin(opts.input);
  }),

  logout: privateProcedure.mutation(async (opts) => {
    const user = opts.ctx.user;
    return await authController.logout(user.id);
  }),

  me: privateProcedure.query(async (opts) => {
    const user = opts.ctx.user;
    return await authController.me(user);
  }),

  refreshToken: publicProcedure.input(authController.refreshTokenSchema).mutation(async (opts) => {
    return await authController.refreshToken(opts.input);
  }),
});
