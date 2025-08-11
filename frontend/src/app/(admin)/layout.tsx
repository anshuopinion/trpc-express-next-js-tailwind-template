import { ServerAdminGuard } from "@/lib/server-auth";
import { ContextSidebar } from "@/components/ContextSidebar";
import { ContextMobileSidebar } from "@/components/ContextMobileSidebar";

export default function AdminRouteGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ServerAdminGuard>
      <div className="min-h-screen bg-background">
        {/* Desktop Sidebar - Server Component */}
        <ContextSidebar
          context="admin"
          className="hidden md:flex fixed inset-y-0 left-0 z-30"
        />

        {/* Mobile Sidebar - Client Component */}
        <ContextMobileSidebar context="admin" />

        {/* Main Content - Server Components can be used here */}
        <div className="md:ml-[200px] min-h-screen">
          <div className="p-4 pt-20 md:pt-4">{children}</div>
        </div>
      </div>
    </ServerAdminGuard>
  );
}
