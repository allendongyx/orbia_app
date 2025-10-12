"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { SidebarNav } from "./sidebar-nav";
import { PageHeader } from "./page-header";

interface DefaultLayoutProps {
  children: React.ReactNode;
}

export default function DefaultLayout({ children }: DefaultLayoutProps) {
  const pathname = usePathname();
  
  // Routes that should hide main scroll and manage their own scrolling
  const noMainScrollRoutes = ["/campaign/creation"];
  const hideMainScroll = noMainScrollRoutes.includes(pathname);

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Left Sidebar */}
      <aside className="w-64 flex-shrink-0 border-r border-gray-200 bg-gray-50 overflow-y-auto">
        <SidebarNav />
      </aside>

      {/* Right Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <PageHeader />
        <main 
          className={`flex-1 bg-gradient-to-br from-gray-50 via-white to-gray-50 ${
            hideMainScroll ? "overflow-hidden" : "overflow-y-auto p-4"
          }`}
        >
          {children}
        </main>
      </div>
    </div>
  );
}

