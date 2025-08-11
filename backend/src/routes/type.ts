import { publicProcedure, router } from "../trpc";
import { typeController } from "../controllers";

export const typeRouter = router({
  getAppInfo: publicProcedure.query(() => {
    return typeController.getAppInfo();
  }),

  getEnvironment: publicProcedure.query(() => {
    return typeController.getEnvironment();
  }),

  validateEmail: publicProcedure
    .input(typeController.validateEmailSchema)
    .query(({ input }) => {
      return typeController.validateEmail(input);
    }),

  healthCheck: publicProcedure.query(() => {
    return typeController.healthCheck();
  }),
});
