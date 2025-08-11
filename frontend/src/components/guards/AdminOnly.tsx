"use client";

import { RoleGuard } from "./RoleGuard";

interface AdminOnlyProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function AdminOnly({ children, fallback }: AdminOnlyProps) {
  return (
    <RoleGuard roles={["admin"]} fallback={fallback}>
      {children}
    </RoleGuard>
  );
}
