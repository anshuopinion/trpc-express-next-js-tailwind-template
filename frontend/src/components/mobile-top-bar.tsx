"use client";

import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MobileTopBarProps {
  onMenuClick: () => void;
}

export function MobileTopBar({ onMenuClick }: MobileTopBarProps) {
  return (
    <div className="md:hidden fixed top-0 left-0 right-0 z-30 bg-background border-b border-border backdrop-blur-md bg-background/95">
      <div className="flex items-center justify-between h-16 px-4">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={onMenuClick} className="h-10 w-10">
            <Menu className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-xs">T</span>
            </div>
            <span className="text-lg font-semibold">tRPC Template</span>
          </div>
        </div>
      </div>
    </div>
  );
}
