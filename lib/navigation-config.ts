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
        title: "我发起的订单",
        href: "/kol/orders/placed",
        icon: Receipt,
      },
      {
        title: "我收到的订单",
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
    title: "管理用户和团队",
    icon: Shield,
    children: [
      {
        title: "用户列表",
        href: "/admin/users",
        icon: UserCog,
      },
      {
        title: "KOL 列表",
        href: "/admin/kols",
        icon: UsersRound,
      },
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
  {
    title: "运营管理",
    icon: BarChart3,
    children: [
      {
        title: "优秀广告案例",
        href: "/admin/dashboard/excellent-cases",
        icon: Video,
      },
      {
        title: "内容趋势",
        href: "/admin/dashboard/content-trends",
        icon: TrendingUp,
      },
      {
        title: "平台数据",
        href: "/admin/dashboard/platform-stats",
        icon: Database,
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

