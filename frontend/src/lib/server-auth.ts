import "server-only";

import { redirect } from "next/navigation";
import { getServerTrpcClient, serverTrpcCall } from "@/trpc/server";
import type { UserRole } from "../../../backend/types/model/user";
import { getServerAuthTokens, isServerAdmin, isServerAuthenticated } from "./server-auth-utils";

// Server-side authentication verification
export async function requireAuth() {
  if (!(await isServerAuthenticated())) {
    redirect("/signin");
  }
}

// Server-side admin role verification
export async function requireAdmin() {
  if (!(await isServerAuthenticated())) {
    redirect("/signin");
  }

  if (!(await isServerAdmin())) {
    redirect("/dashboard"); // Redirect non-admins to regular dashboard
  }
}

// Server-side user data fetching with error handling
export async function getServerUser() {
  if (!(await isServerAuthenticated())) {
    return null;
  }

  const { data: user, error } = await serverTrpcCall(() => getServerTrpcClient().auth.me.query());

  if (error) {
    console.error("Failed to fetch user on server:", error);
    return null;
  }

  return user;
}

// Server-side admin data prefetching
export async function getServerAdminData() {
  await requireAdmin();

  const serverClient = getServerTrpcClient();
  const [
    { data: systemStats, error: statsError },
    { data: healthCheck, error: healthError },
    { data: appInfo, error: appInfoError },
  ] = await Promise.all([
    serverTrpcCall(() => serverClient.admin.getSystemStats.query()),
    serverTrpcCall(() => serverClient.type.healthCheck.query()),
    serverTrpcCall(() => serverClient.type.getAppInfo.query()),
  ]);

  return {
    systemStats,
    healthCheck,
    appInfo,
    errors: {
      stats: statsError,
      health: healthError,
      app: appInfoError,
    },
  };
}

// Server-side user list prefetching for admin
export async function getServerUserList(options?: {
  page?: number;
  limit?: number;
  role?: UserRole;
}) {
  await requireAdmin();

  const { data: userList, error } = await serverTrpcCall(() =>
    getServerTrpcClient().admin.getAllUsers.query({
      page: options?.page || 1,
      limit: options?.limit || 10,
      role: options?.role,
    })
  );

  return { userList, error };
}

// Export guard components from separate files
export {
  ServerAdminGuard,
  ServerRoleGuard,
  ServerUserGuard,
} from "@/components/guards/ServerRoleGuard";
