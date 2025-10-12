import {
  LayoutDashboard,
  Megaphone,
  Users,
  Wallet,
  Settings,
  HelpCircle,
  Search,
  ShoppingBag,
  Receipt,
  type LucideIcon,
} from "lucide-react";

export interface NavigationItem {
  title: string;
  href?: string;
  icon: LucideIcon;
  external?: boolean;
  children?: NavigationItem[];
}

export const mainNavItems: NavigationItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Campaign",
    href: "/campaign",
    icon: Megaphone,
  },
  {
    title: "KOLs",
    icon: Users,
    children: [
      {
        title: "Marketplace",
        href: "/kol/marketplace",
        icon: ShoppingBag,
      },
      {
        title: "My Orders",
        href: "/kol/orders",
        icon: Receipt,
      },
    ],
  },
  {
    title: "Wallet",
    href: "/wallet",
    icon: Wallet,
  },
];

export const bottomNavItems: NavigationItem[] = [
  {
    title: "Settings",
    href: "/settings",
    icon: Settings,
  },
  {
    title: "Get Help",
    href: "https://orbia.gitbook.io/orbia-docs",
    icon: HelpCircle,
    external: true,
  },
];

export const allNavItems = [...mainNavItems, ...bottomNavItems];

// 根据路径获取导航项
export function getNavItemByPath(pathname: string): NavigationItem | undefined {
  return allNavItems.find(
    (item) => !item.external && (pathname === item.href || pathname.startsWith(item.href + "/"))
  );
}

