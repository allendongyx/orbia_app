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

// 管理员导航菜单
export const adminNavItems: NavigationItem[] = [
  {
    title: "管理用户",
    icon: Shield,
    children: [
      {
        title: "用户列表",
        href: "/admin/users",
        icon: UserCog,
      },
    ],
  },
  {
    title: "KOL 管理",
    icon: UsersRound,
    children: [
      {
        title: "KOL 列表",
        href: "/admin/kols",
        icon: UsersRound,
      },
    ],
  },
  {
    title: "团队管理",
    icon: Building2,
    children: [
      {
        title: "团队列表",
        href: "/admin/teams",
        icon: Building2,
      },
    ],
  },
  {
    title: "订单管理",
    icon: FileText,
    children: [
      {
        title: "KOL 订单",
        href: "/admin/orders/kol",
        icon: UsersRound,
      },
      {
        title: "广告订单",
        href: "/admin/orders/ad",
        icon: Tv,
      },
      {
        title: "充值订单",
        href: "/admin/orders/recharge",
        icon: DollarSign,
      },
    ],
  },
  {
    title: "系统设置",
    icon: Settings,
    children: [
      {
        title: "字典管理",
        href: "/admin/dictionary",
        icon: BookOpen,
      },
      {
        title: "收款设置",
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

