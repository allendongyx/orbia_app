import {
  LayoutDashboard,
  Megaphone,
  Users,
  Wallet,
  Settings,
  HelpCircle,
  ShoppingBag,
  Receipt,
  Shield,
  UserCog,
  UsersRound,
  Building2,
  FileText,
  BookOpen,
  CreditCard,
  DollarSign,
  Tv,
  BarChart3,
  Video,
  TrendingUp,
  Database,
  type LucideIcon,
} from "lucide-react";

export interface NavigationItem {
  title: string;
  href?: string;
  icon: LucideIcon;
  external?: boolean;
  children?: NavigationItem[];
  requireKol?: boolean; // 标记为仅KOL可见
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
        title: "Orders Placed",
        href: "/kol/orders/placed",
        icon: Receipt,
      },
      {
        title: "Orders Received",
        href: "/kol/orders/received",
        icon: Receipt,
        requireKol: true, // 标记为仅KOL可见
      },
    ],
  },
  {
    title: "Wallet",
    href: "/wallet",
    icon: Wallet,
  },
];

// 管理员导航菜单
export const adminNavItems: NavigationItem[] = [
  {
    title: "Users & Teams",
    icon: Shield,
    children: [
      {
        title: "Users",
        href: "/admin/users",
        icon: UserCog,
      },
      {
        title: "KOLs",
        href: "/admin/kols",
        icon: UsersRound,
      },
      {
        title: "Teams",
        href: "/admin/teams",
        icon: Building2,
      },
    ],
  },
  {
    title: "Order Management",
    icon: FileText,
    children: [
      {
        title: "KOL Orders",
        href: "/admin/orders/kol",
        icon: UsersRound,
      },
      {
        title: "Ad Orders",
        href: "/admin/orders/ad",
        icon: Tv,
      },
      {
        title: "Recharge Orders",
        href: "/admin/orders/recharge",
        icon: DollarSign,
      },
    ],
  },
  {
    title: "Operations",
    icon: BarChart3,
    children: [
      {
        title: "Excellent Cases",
        href: "/admin/dashboard/excellent-cases",
        icon: Video,
      },
      {
        title: "Content Trends",
        href: "/admin/dashboard/content-trends",
        icon: TrendingUp,
      },
      {
        title: "Platform Stats",
        href: "/admin/dashboard/platform-stats",
        icon: Database,
      },
    ],
  },
  {
    title: "System Settings",
    icon: Settings,
    children: [
      {
        title: "Dictionary",
        href: "/admin/dictionary",
        icon: BookOpen,
      },
      {
        title: "Payment Settings",
        href: "/admin/payment-settings",
        icon: CreditCard,
      },
    ],
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

