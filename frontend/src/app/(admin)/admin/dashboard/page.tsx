import { getServerAdminData } from "@/lib/server-auth";
import { AdminDashboard } from "./_components/AdminDashboard";

export default async function AdminDashboardPage() {
  // Server-side data prefetching - no loading states needed!
  const { systemStats, healthCheck, appInfo, errors } =
    await getServerAdminData();

  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-foreground">Admin Dashboard</h2>
        <p className="text-muted-foreground mt-1">
          System overview and management controls
        </p>
      </div>

      <AdminDashboard
        initialSystemStats={systemStats}
        initialHealthCheck={healthCheck}
        initialAppInfo={appInfo}
        serverErrors={errors}
      />
    </div>
  );
}
