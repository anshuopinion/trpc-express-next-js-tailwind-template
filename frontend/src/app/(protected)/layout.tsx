import { ContextMobileSidebar } from "@/components/ContextMobileSidebar";
import { ContextSidebar } from "@/components/ContextSidebar";
import { ServerUserGuard } from "@/lib/server-auth";

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  return (
    <ServerUserGuard>
      <div className="min-h-screen bg-background">
        {/* Desktop Sidebar - Server Component */}
        <ContextSidebar context="user" className="hidden md:flex fixed inset-y-0 left-0 z-30" />

        {/* Mobile Sidebar - Client Component */}
        <ContextMobileSidebar context="user" />

        {/* Main Content - Server Components can be used here */}
        <div className="md:ml-[200px] min-h-screen">
          <div className="p-4 pt-20 md:pt-4">{children}</div>
        </div>
      </div>
    </ServerUserGuard>
  );
}
