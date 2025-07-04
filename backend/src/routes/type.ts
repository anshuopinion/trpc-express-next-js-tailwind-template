import { publicProcedure, router } from "../trpc";
import { z } from "zod";

export const typeRouter = router({
  getAppInfo: publicProcedure.query(() => {
    return {
      name: "tRPC Template",
      version: "1.0.0",
      description: "A clean tRPC template with authentication",
    };
  }),

  getEnvironment: publicProcedure.query(() => {
    return {
      environment: process.env.NODE_ENV || "development",
      timestamp: new Date().toISOString(),
    };
  }),

  validateEmail: publicProcedure
    .input(z.object({ email: z.string() }))
    .query(({ input }) => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return {
        email: input.email,
        isValid: emailRegex.test(input.email),
      };
    }),

  healthCheck: publicProcedure.query(() => {
    return {
      status: "healthy",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
  }),
});