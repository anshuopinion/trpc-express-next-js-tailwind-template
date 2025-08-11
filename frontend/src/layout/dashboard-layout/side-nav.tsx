"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { BiCog } from "react-icons/bi";
import { IoIosArrowDropleft, IoIosArrowDropright } from "react-icons/io";
import { RxDashboard } from "react-icons/rx";
import { Button } from "@/components/ui/button";
import { WEB_APP, WEB_SHORT_NAME } from "@/constant/env";
import { cn } from "@/lib/utils";

const Sidenav = ({ onClose, isDrawer = false }: { onClose?: () => void; isDrawer?: boolean }) => {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const isActiveLink = (link: string) => {
    return pathname === link;
  };

  const navLinks = [
    {
      icon: RxDashboard,
      text: "Dashboard",
      link: "/dashboard",
    },
    {
      icon: RxDashboard,
      text: "Scanner",
      link: "/dashboard/scanner",
    },
  ];

  const bottomLinks = [
    {
      icon: BiCog,
      text: "Settings",
      link: "/dashboard/settings",
    },
  ];

  return (
    <div
      className={cn(
        "flex flex-col justify-between bg-background shadow-md transition-all duration-200 relative",
        isDrawer ? "h-auto" : "h-screen",
        isCollapsed ? "lg:w-16" : "lg:w-40",
        "w-full"
      )}
    >
      <Button
        variant="ghost"
        size="icon"
        className="absolute -right-3 top-2 hidden lg:flex shadow-md rounded-full bg-background hover:bg-muted z-20"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        {isCollapsed ? (
          <IoIosArrowDropright className="h-5 w-5" />
        ) : (
          <IoIosArrowDropleft className="h-5 w-5" />
        )}
      </Button>

      <div>
        <h3 className="px-4 pt-4 lg:pt-4 font-medium text-foreground transition-opacity duration-200">
          {!isCollapsed ? WEB_APP : WEB_SHORT_NAME}
        </h3>

        <div className="mt-6 mx-3 space-y-1">
          {navLinks.map((nav) => (
            <Link href={nav.link} key={nav.text}>
              <button
                type="button"
                className={cn(
                  "flex items-center py-3 px-4 rounded-lg transition-colors w-full",
                  isActiveLink(nav.link)
                    ? "bg-muted text-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  isCollapsed ? "lg:justify-center" : "lg:justify-start"
                )}
                onClick={onClose}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    onClose?.();
                  }
                }}
              >
                <nav.icon className="h-4 w-4" />
                <span
                  className={cn(
                    "ml-2 text-sm font-medium transition-opacity duration-200",
                    isCollapsed ? "lg:hidden" : "lg:inline-block"
                  )}
                >
                  {nav.text}
                </span>
              </button>
            </Link>
          ))}
        </div>
      </div>

      <div className="mt-6 mx-3 mb-6 space-y-1">
        {bottomLinks.map((nav) => (
          <Link href={nav.link} key={nav.text}>
            <button
              type="button"
              className={cn(
                "flex items-center py-3 px-4 rounded-lg transition-colors w-full",
                isActiveLink(nav.link)
                  ? "bg-muted text-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
                isCollapsed ? "lg:justify-center" : "lg:justify-start"
              )}
              onClick={onClose}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  onClose?.();
                }
              }}
            >
              <nav.icon className="h-4 w-4" />
              <span
                className={cn(
                  "ml-2 text-sm font-medium transition-opacity duration-200",
                  isCollapsed ? "lg:hidden" : "lg:inline-block"
                )}
              >
                {nav.text}
              </span>
            </button>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Sidenav;
