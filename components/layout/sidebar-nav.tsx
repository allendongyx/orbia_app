"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LogOut, MoreVertical, LogIn, Settings2, Camera, ChevronDown } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { mainNavItems, bottomNavItems } from "@/lib/navigation-config";
import { useAuth } from "@/contexts/auth-context";
import { LoginModal } from "@/components/auth/login-modal";
import { AvatarSelector } from "@/components/auth/avatar-selector";
import { TeamSelector } from "@/components/layout/team-selector";

interface SidebarNavProps extends React.HTMLAttributes<HTMLElement> {}

export function SidebarNav({ className, ...props }: SidebarNavProps) {
  const pathname = usePathname();
  const { user, isLoggedIn, logout, refreshUser } = useAuth();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showAvatarSelector, setShowAvatarSelector] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState<string[]>(["KOLs"]); // 默认展开 KOLs

  const handleAvatarChange = async (avatarUrl: string) => {
    // Refresh user data after avatar change
    await refreshUser();
  };

  const toggleMenu = (title: string) => {
    setExpandedMenus(prev =>
      prev.includes(title)
        ? prev.filter(item => item !== title)
        : [...prev, title]
    );
  };

  return (
    <div className="flex h-full flex-col bg-gray-50">
      {/* Logo Section */}
      <div className="flex items-center h-12 px-4 border-b border-gray-200 bg-white">
        <div className="relative h-5 w-auto">
          <Image
            src="/logo.png"
            alt="Orbia Logo"
            width={60}
            height={20}
            className="object-contain"
            priority
          />
        </div>
      </div>

      {/* Team Selector */}
      {isLoggedIn && (
        <div className="px-3 pt-3 pb-3 border-b border-gray-200 bg-gray-50">
          <TeamSelector />
        </div>
      )}

      {/* Main Navigation */}
      <nav className={cn("flex-1 overflow-auto px-3 pt-3 pb-1", className)} {...props}>
        <div className="flex flex-col space-y-0.5">
          {mainNavItems.map((item) => {
            const Icon = item.icon;
            const isExpanded = expandedMenus.includes(item.title);
            
            // 检查当前路径是否匹配
            // 对于有子菜单的项目，只检查是否有子项被激活，但父菜单本身不高亮
            const isActive = item.href 
              ? pathname === item.href || pathname?.startsWith(item.href + "/")
              : false; // 父菜单不高亮
            
            const hasActiveChild = item.children?.some(child => 
              pathname === child.href || pathname?.startsWith(child.href + "/")
            );

            // 如果有子菜单
            if (item.children) {
              return (
                <div key={item.title}>
                  <button
                    onClick={() => toggleMenu(item.title)}
                    className={cn(
                      "flex items-center justify-between w-full gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                      hasActiveChild
                        ? "text-gray-900 font-medium" // 有子项激活时只加深文字颜色
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-100 font-normal"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="h-[18px] w-[18px] shrink-0" />
                      <span>{item.title}</span>
                    </div>
                    <ChevronDown 
                      className={cn(
                        "h-4 w-4 transition-transform",
                        isExpanded && "rotate-180"
                      )} 
                    />
                  </button>
                  
                  {/* 子菜单 */}
                  {isExpanded && (
                    <div className="ml-6 mt-1 space-y-0.5">
                      {item.children.map((child) => {
                        if (!child.href) return null;
                        
                        const ChildIcon = child.icon;
                        const isChildActive = pathname === child.href || pathname?.startsWith(child.href + "/");
                        
                        return (
                          <Link
                            key={child.href}
                            href={child.href}
                            className={cn(
                              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                              isChildActive
                                ? "bg-gray-900 text-white font-medium"
                                : "text-gray-600 hover:text-gray-900 hover:bg-gray-100 font-normal"
                            )}
                          >
                            <ChildIcon className="h-[16px] w-[16px] shrink-0" />
                            <span>{child.title}</span>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            }

            // 普通菜单项
            if (!item.href) return null;
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                  isActive
                    ? "bg-gray-900 text-white font-medium"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100 font-normal"
                )}
              >
                <Icon className="h-[18px] w-[18px] shrink-0" />
                <span>{item.title}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Bottom Section */}
      <div className="border-t border-gray-200 px-3 py-3">
        <div className="flex flex-col space-y-0.5 mb-3">
          {bottomNavItems.map((item) => {
            if (!item.href) return null;
            
            const Icon = item.icon;
            const isActive = !item.external && (pathname === item.href || pathname?.startsWith(item.href + "/"));

            if (item.external) {
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 font-normal transition-colors"
                >
                  <Icon className="h-[18px] w-[18px] shrink-0" />
                  <span>{item.title}</span>
                </Link>
              );
            }

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                  isActive
                    ? "bg-gray-900 text-white font-medium"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100 font-normal"
                )}
              >
                <Icon className="h-[18px] w-[18px] shrink-0" />
                <span>{item.title}</span>
              </Link>
            );
          })}
        </div>

        {/* User Info / Login Button */}
        {isLoggedIn && user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-3 w-full rounded-lg px-3 py-2 hover:bg-gray-100 transition-colors group">
                <Avatar className="h-9 w-9">
                  {user.avatar_url ? (
                    <img src={user.avatar_url} alt={user.nickname || 'User'} className="h-full w-full object-cover" />
                  ) : (
                    <AvatarFallback className="bg-blue-700 text-white text-xs font-medium">
                      {user.nickname?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || user.wallet_address?.slice(0, 2).toUpperCase() || 'U'}
                    </AvatarFallback>
                  )}
                </Avatar>
                <div className="flex flex-col overflow-hidden flex-1 text-left">
                  <span className="text-sm font-medium text-gray-900 truncate">
                    {user.nickname || user.email?.split('@')[0] || `${user.wallet_address?.slice(0, 6)}...${user.wallet_address?.slice(-4)}`}
                  </span>
                  <span className="text-xs text-gray-500 truncate">
                    {user.wallet_address || user.email}
                  </span>
                </div>
                <MoreVertical className="h-4 w-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent 
              align="start" 
              side="top"
              sideOffset={8}
              className="w-72 bg-gray-50 border-gray-200"
            >
              {/* User Profile Section */}
              <div className="p-4">
                <div className="flex items-start gap-3">
                  <div className="relative group/avatar">
                    <Avatar className="h-16 w-16 border-2 border-gray-200">
                      {user.avatar_url ? (
                        <img src={user.avatar_url} alt={user.nickname || 'User'} className="h-full w-full object-cover" />
                      ) : (
                        <AvatarFallback className="bg-blue-700 text-white text-xl font-medium">
                          {user.nickname?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || user.wallet_address?.slice(0, 2).toUpperCase() || 'U'}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <button
                      onClick={() => setShowAvatarSelector(true)}
                      className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover/avatar:opacity-100 transition-opacity"
                    >
                      <Camera className="h-6 w-6 text-white" />
                    </button>
                  </div>
                  <div className="flex-1 min-w-0 pt-1">
                    <p className="text-base font-semibold text-gray-900 truncate">
                      {user.nickname || 'User'}
                    </p>
                    <p className="text-xs text-gray-600 truncate mt-1 font-mono">
                      {user.wallet_address || user.email}
                    </p>
                  </div>
                </div>
              </div>

              <DropdownMenuSeparator />

              {/* Menu Items */}
              <div className="p-2">
                <Link href="/settings/profile">
                  <DropdownMenuItem 
                    className="cursor-pointer focus:bg-gray-100 rounded-md py-2.5"
                  >
                    <Settings2 className="mr-3 h-4 w-4 text-gray-600" />
                    <span className="text-sm text-gray-700">Settings</span>
                  </DropdownMenuItem>
                </Link>
                
                <DropdownMenuItem 
                  className="cursor-pointer focus:bg-red-50 text-red-600 focus:text-red-700 rounded-md py-2.5 mt-1"
                  onClick={logout}
                >
                  <LogOut className="mr-3 h-4 w-4" />
                  <span className="text-sm font-medium">Sign Out</span>
                </DropdownMenuItem>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button
            variant="outline"
            className="w-full justify-start gap-3 px-3 py-2 text-sm font-normal text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            onClick={() => setShowLoginModal(true)}
          >
            <LogIn className="h-[18px] w-[18px]" />
            <span>Sign In</span>
          </Button>
        )}
      </div>

      {/* Modals */}
      <LoginModal open={showLoginModal} onOpenChange={setShowLoginModal} />
      <AvatarSelector 
        open={showAvatarSelector} 
        onOpenChange={setShowAvatarSelector}
        currentAvatar={user?.avatar_url}
        onAvatarChange={handleAvatarChange}
      />
    </div>
  );
}
