import "server-only";
import { redirect } from "next/navigation";
import type React from "react";
import { getServerAuthTokens, isServerAuthenticated } from "@/lib/server-auth-utils";

// Server-side role check component
export async function ServerRoleGuard({
  children,
  roles,
}: {
  children: React.ReactNode;
  roles: string[];
}) {
  const { userRole } = await getServerAuthTokens();

  if (!(await isServerAuthenticated())) {
    redirect("/signin");
  }

  if (!userRole || !roles.includes(userRole)) {
    redirect("/dashboard");
  }

  return <>{children}</>;
}

// Server-side admin guard component
export async function ServerAdminGuard({ children }: { children: React.ReactNode }) {
  return <ServerRoleGuard roles={["admin"]}>{children}</ServerRoleGuard>;
}

// Server-side user authentication guard component (any authenticated user)
export async function ServerUserGuard({ children }: { children: React.ReactNode }) {
  if (!(await isServerAuthenticated())) {
    redirect("/signin");
  }

  return <>{children}</>;
}
