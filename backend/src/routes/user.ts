import { privateProcedure, router } from "../trpc";
import { userController } from "../controllers";

export const userRouter = router({
  updateProfile: privateProcedure
    .input(userController.updateProfileSchema)
    .mutation(async (opts) => {
      return await userController.updateProfile(opts.input, opts.ctx.user);
    }),

  changePassword: privateProcedure
    .input(userController.changePasswordSchema)
    .mutation(async (opts) => {
      return await userController.changePassword(opts.input, opts.ctx.user);
    }),

  deleteAccount: privateProcedure
    .input(userController.deleteAccountSchema)
    .mutation(async (opts) => {
      return await userController.deleteAccount(opts.input, opts.ctx.user);
    }),
});
