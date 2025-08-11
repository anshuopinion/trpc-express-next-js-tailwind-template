import { UserModel, UserRole } from "../../model/user";

export const getSystemStats = async () => {
  const [totalUsers, adminUsers, regularUsers, verifiedUsers] = await Promise.all([
    UserModel.countDocuments({}),
    UserModel.countDocuments({ role: UserRole.ADMIN }),
    UserModel.countDocuments({ role: UserRole.USER }),
    UserModel.countDocuments({ is_email_verified: true }),
  ]);

  const recentUsersRaw = await UserModel.find({})
    .select("-password -refresh_token -verify_token")
    .sort({ createdAt: -1 })
    .limit(5);

  // Transform to plain objects matching frontend interface
  const recentUsers = recentUsersRaw.map((user) => ({
    id: user._id.toString(),
    email: user.email,
    first_name: user.first_name,
    last_name: user.last_name,
    role: user.role,
    is_email_verified: user.is_email_verified,
    createdAt: user.createdAt?.toISOString(),
  }));

  return {
    totalUsers,
    adminUsers,
    regularUsers,
    verifiedUsers,
    unverifiedUsers: totalUsers - verifiedUsers,
    recentUsers,
    systemHealth: {
      status: "healthy",
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    },
  };
};
