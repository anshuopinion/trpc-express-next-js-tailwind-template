import { adminProcedure, router } from "../trpc";
import { adminController } from "../controllers";

export const adminRouter = router({
  getAllUsers: adminProcedure
    .input(adminController.getAllUsersSchema)
    .query(async (opts) => {
      return await adminController.getAllUsers(opts.input);
    }),

  updateUserRole: adminProcedure
    .input(adminController.updateUserRoleSchema)
    .mutation(async (opts) => {
      return await adminController.updateUserRole(opts.input, opts.ctx.user);
    }),

  deleteUser: adminProcedure
    .input(adminController.deleteUserSchema)
    .mutation(async (opts) => {
      return await adminController.deleteUser(opts.input, opts.ctx.user);
    }),

  getSystemStats: adminProcedure.query(async (opts) => {
    return await adminController.getSystemStats();
  }),
});
