import { z } from "zod";
import { UserModel, UserRole } from "../../model/user";

const getAllUsersSchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(10),
  role: z.enum([UserRole.USER, UserRole.ADMIN]).optional(),
});

export const getAllUsers = async (input: z.infer<typeof getAllUsersSchema>) => {
  // Validate input with schema
  const validatedInput = getAllUsersSchema.parse(input);
  const { page, limit, role } = validatedInput;
  const skip = (page - 1) * limit;

  const filter = role ? { role } : {};

  const [users, total] = await Promise.all([
    UserModel.find(filter)
      .select("-password -refresh_token -verify_token")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(), // Add .lean() to return plain JS objects instead of Mongoose documents
    UserModel.countDocuments(filter),
  ]);

  return {
    users,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
};

export { getAllUsersSchema };
