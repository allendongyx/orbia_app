"use client";

import { usePathname } from "next/navigation";
import { Bell, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getNavItemByPath } from "@/lib/navigation-config";

export function PageHeader() {
  const pathname = usePathname();
  
  // 获取当前导航项
  const currentNavItem = pathname ? getNavItemByPath(pathname) : null;
  const Icon = currentNavItem?.icon;

  // 获取面包屑路径
  const getBreadcrumbs = () => {
    if (!pathname) return [{ label: "Dashboard", href: "/dashboard" }];
    
    const segments = pathname.split("/").filter(Boolean);
    if (segments.length === 0) return [{ label: "Dashboard", href: "/dashboard" }];
    
    const breadcrumbs = segments.map((segment, index) => {
      const titles: Record<string, string> = {
        dashboard: "Dashboard",
        campaign: "Campaign",
        kol: "KOLs",
        wallet: "Wallet",
        settings: "Settings",
        creation: "Creation",
        recharge: "Recharge",
        profile: "Profile",
        marketplace: "Marketplace",
        orders: "My Orders",
      };
      
      const path = "/" + segments.slice(0, index + 1).join("/");
      return {
        label: titles[segment] || segment.charAt(0).toUpperCase() + segment.slice(1),
        href: path,
      };
    });
    
    return breadcrumbs;
  };

  const breadcrumbs = getBreadcrumbs();

  return (
    <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/80 backdrop-blur-md">
      <div className="flex h-12 items-center justify-between px-4">
        {/* Page Title with Icon & Breadcrumbs */}
        <div className="flex items-center gap-3">
          {Icon && (
            <div className="flex items-center justify-center h-6 w-6 rounded-md bg-gradient-to-br from-blue-600 to-blue-700 shadow-sm">
              <Icon className="h-3 w-3 text-white" />
            </div>
          )}
          <div className="flex items-center gap-1.5 text-xs">
            {breadcrumbs.map((crumb, index) => (
              <div key={index} className="flex items-center gap-1.5">
                {index > 0 && <ChevronRight className="h-3.5 w-3.5 text-gray-400" />}
                <span className={index === breadcrumbs.length - 1 
                  ? "font-semibold text-gray-900 text-sm" 
                  : "text-gray-500 hover:text-gray-700 cursor-pointer"
                }>
                  {crumb.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Right Section - Notifications */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl"
            >
              <Bell className="h-5 w-5" />
            </Button>
            <Badge
              variant="destructive"
              className="absolute -right-1 -top-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-[10px] shadow-sm"
            >
              3
            </Badge>
          </div>
        </div>
      </div>
    </header>
  );
}

