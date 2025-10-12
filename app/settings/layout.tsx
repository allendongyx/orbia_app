"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { User } from "lucide-react";
import { cn } from "@/lib/utils";

interface SettingsLayoutProps {
  children: React.ReactNode;
}

export default function SettingsLayout({ children }: SettingsLayoutProps) {
  const pathname = usePathname();

  // Only show sidebar for profile route
  const showSidebar = pathname?.startsWith('/settings/profile');

  const navItems = [
    {
      title: "Profile",
      href: "/settings/profile",
      icon: User,
    },
  ];

  // If not showing sidebar, return children directly
  if (!showSidebar) {
    return <>{children}</>;
  }

  return (
    <div className="flex gap-6">
      <aside className="w-48">
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  "hover:bg-accent hover:text-accent-foreground",
                  isActive
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground"
                )}
              >
                <Icon className="h-4 w-4" />
                {item.title}
              </Link>
            );
          })}
        </nav>
      </aside>
      <div className="flex-1">{children}</div>
    </div>
  );
}

