import { privateProcedure, router } from "../trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { UserModel } from "../model/user";
import bcrypt from "bcryptjs";

export const userRouter = router({
  updateProfile: privateProcedure
    .input(
      z.object({
        first_name: z.string().min(1, "First name is required").optional(),
        last_name: z.string().min(1, "Last name is required").optional(),
        avatar: z.string().url("Invalid avatar URL").optional(),
      })
    )
    .mutation(async (opts) => {
      const { first_name, last_name, avatar } = opts.input;
      const user = opts.ctx.user;

      const updateData: any = {};
      if (first_name) updateData.first_name = first_name;
      if (last_name) updateData.last_name = last_name;
      if (avatar !== undefined) updateData.avatar = avatar;

      const updatedUser = await UserModel.findByIdAndUpdate(user.id, updateData, { new: true });

      if (!updatedUser) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }

      return {
        id: updatedUser.id,
        email: updatedUser.email,
        first_name: updatedUser.first_name,
        last_name: updatedUser.last_name,
        avatar: updatedUser.avatar,
        is_email_verified: updatedUser.is_email_verified,
      };
    }),

  changePassword: privateProcedure
    .input(
      z.object({
        currentPassword: z.string().min(1, "Current password is required"),
        newPassword: z.string().min(6, "New password must be at least 6 characters"),
      })
    )
    .mutation(async (opts) => {
      const { currentPassword, newPassword } = opts.input;
      const user = opts.ctx.user;

      const dbUser = await UserModel.findById(user.id);
      if (!dbUser) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }

      const passwordMatches = await bcrypt.compare(currentPassword, dbUser.password);
      if (!passwordMatches) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Current password is incorrect",
        });
      }

      const hashedNewPassword = await bcrypt.hash(newPassword, 10);
      await UserModel.findByIdAndUpdate(user.id, { password: hashedNewPassword });

      return { message: "Password changed successfully" };
    }),

  deleteAccount: privateProcedure
    .input(
      z.object({
        password: z.string().min(1, "Password is required"),
      })
    )
    .mutation(async (opts) => {
      const { password } = opts.input;
      const user = opts.ctx.user;

      const dbUser = await UserModel.findById(user.id);
      if (!dbUser) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }

      const passwordMatches = await bcrypt.compare(password, dbUser.password);
      if (!passwordMatches) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Password is incorrect",
        });
      }

      await UserModel.findByIdAndDelete(user.id);
      return { message: "Account deleted successfully" };
    }),
});