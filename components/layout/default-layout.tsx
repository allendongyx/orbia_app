"use client";

import React, { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { SidebarNav } from "./sidebar-nav";
import { PageHeader } from "./page-header";
import { useAuth } from "@/contexts/auth-context";

interface DefaultLayoutProps {
  children: React.ReactNode;
}

export default function DefaultLayout({ children }: DefaultLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { isLoggedIn, isLoading } = useAuth();
  
  // Routes that should hide main scroll and manage their own scrolling
  const noMainScrollRoutes = ["/campaign/creation"];
  const hideMainScroll = noMainScrollRoutes.includes(pathname);

  // 检查未登录用户访问受保护路由
  useEffect(() => {
    // 登录页面不需要检查
    if (pathname === '/login') {
      return;
    }

    // 等待加载完成
    if (isLoading) {
      return;
    }

    // 未登录用户跳转到登录页
    if (!isLoggedIn) {
      router.push('/login');
    }
  }, [isLoggedIn, isLoading, pathname, router]);

  // 如果是登录页面，不显示侧边栏和头部
  if (pathname === '/login') {
    return <>{children}</>;
  }

  // 加载中或未登录时显示空白页（避免闪烁）
  if (isLoading || !isLoggedIn) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="animate-pulse text-gray-400">Loading...</div>
      </div>
    );
  }

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

