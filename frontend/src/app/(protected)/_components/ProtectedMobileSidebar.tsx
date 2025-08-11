"use client";

import { useState } from "react";
import { MobileTopBar } from "@/components/mobile-top-bar";
import { UserSidebar } from "./UserSidebar";

export function ProtectedMobileSidebar() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <>
      {/* Mobile Top Bar - Only show on mobile */}
      <MobileTopBar onMenuClick={() => setSidebarOpen(true)} />

      {/* Mobile Sidebar Overlay */}
      <UserSidebar
        className={`md:hidden fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Mobile Backdrop */}
      {sidebarOpen && (
        <button
          type="button"
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
          onKeyDown={(e) => {
            if (e.key === "Escape" || e.key === "Enter" || e.key === " ") {
              setSidebarOpen(false);
            }
          }}
          aria-label="Close sidebar"
        />
      )}
    </>
  );
}
