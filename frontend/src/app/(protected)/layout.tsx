"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { AppSidebar } from "@/components/app-sidebar";
import { MobileTopBar } from "@/components/mobile-top-bar";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/signin");
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-lg text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Top Bar */}
      <MobileTopBar onMenuClick={() => setSidebarOpen(true)} />
      
      {/* Desktop Sidebar - Fixed Position */}
      <AppSidebar className="hidden md:flex fixed inset-y-0 left-0 z-30" />
      
      {/* Mobile Sidebar Overlay */}
      <AppSidebar 
        className={`md:hidden fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        onClose={() => setSidebarOpen(false)}
      />
      
      {/* Mobile Backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* Main Content */}
      <div className="md:ml-[200px] min-h-screen">
        <div className="p-4 pt-20 md:pt-4">
          {children}
        </div>
      </div>
    </div>
  );
}