/**
 * 设计系统常量
 * 统一管理项目中常用的样式组合
 */

// 渐变色组合
export const gradients = {
  blue: "from-blue-600 to-blue-700",
  purple: "from-purple-500 to-purple-600",
  green: "from-green-500 to-green-600",
  orange: "from-orange-500 to-orange-600",
  red: "from-red-500 to-red-600",
  dark: "from-gray-900 to-gray-800",
} as const;

// Hover 渐变色
export const hoverGradients = {
  blue: "hover:from-blue-700 hover:to-blue-800",
  purple: "hover:from-purple-600 hover:to-purple-700",
  green: "hover:from-green-600 hover:to-green-700",
  orange: "hover:from-orange-600 hover:to-orange-700",
  red: "hover:from-red-600 hover:to-red-700",
} as const;

// 完整渐变按钮类名
export const gradientButtons = {
  blue: `bg-gradient-to-r ${gradients.blue} ${hoverGradients.blue} text-white border-0`,
  purple: `bg-gradient-to-r ${gradients.purple} ${hoverGradients.purple} text-white border-0`,
  green: `bg-gradient-to-r ${gradients.green} ${hoverGradients.green} text-white border-0`,
  orange: `bg-gradient-to-r ${gradients.orange} ${hoverGradients.orange} text-white border-0`,
} as const;

// 图标容器样式
export const iconContainers = {
  small: (gradient: keyof typeof gradients = "blue") =>
    `p-2 rounded-lg bg-gradient-to-br ${gradients[gradient]}`,
  medium: (gradient: keyof typeof gradients = "blue") =>
    `h-10 w-10 rounded-xl bg-gradient-to-br ${gradients[gradient]} flex items-center justify-center`,
  large: (gradient: keyof typeof gradients = "blue") =>
    `w-12 h-12 rounded-xl bg-gradient-to-br ${gradients[gradient]} flex items-center justify-center group-hover:scale-110 transition-transform`,
} as const;

// 卡片样式
export const cardStyles = {
  base: "border-0 shadow-sm hover:shadow-md transition-shadow",
  clickable: "group border-0 bg-gradient-to-br from-gray-50 to-gray-100 hover:shadow-lg transition-all cursor-pointer",
  stats: "relative overflow-hidden border-0 shadow-sm hover:shadow-md transition-shadow",
  dark: "border-0 shadow-sm bg-gradient-to-br from-gray-900 to-gray-800 text-white",
} as const;

// 背景装饰（用于统计卡片）
export const backgroundDecoration = (gradient: keyof typeof gradients = "blue") =>
  `absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${gradients[gradient]} opacity-5 rounded-full -mr-16 -mt-16`;

// 间距规范
export const spacing = {
  pageLevel: "space-y-6",
  cardContent: "p-6",
  smallGap: "gap-2",
  mediumGap: "gap-4",
  largeGap: "gap-6",
} as const;

// 图标尺寸
export const iconSizes = {
  xs: "h-4 w-4",
  sm: "h-5 w-5",
  md: "h-6 w-6",
  nav: "h-[18px] w-[18px]",
} as const;

// 圆角规范
export const borderRadius = {
  sm: "rounded-lg",
  md: "rounded-xl",
  full: "rounded-full",
} as const;

// 阴影规范
export const shadows = {
  light: "shadow-sm",
  medium: "shadow-md",
  heavy: "shadow-lg",
  hover: "hover:shadow-md",
  clickableHover: "hover:shadow-lg",
} as const;

// 过渡动画
export const transitions = {
  colors: "transition-colors",
  shadow: "transition-shadow",
  transform: "transition-transform",
  all: "transition-all",
} as const;

// 徽章颜色
export const badgeColors = {
  high: "bg-red-100 text-red-700",
  medium: "bg-yellow-100 text-yellow-700",
  low: "bg-green-100 text-green-700",
  info: "bg-blue-100 text-blue-700",
} as const;

// 状态颜色
export const statusColors = {
  success: "text-green-600",
  danger: "text-red-600",
  info: "text-blue-600",
  warning: "text-yellow-600",
} as const;

// 工具函数：组合渐变按钮类名
export function getGradientButton(color: keyof typeof gradientButtons = "blue") {
  return gradientButtons[color];
}

// 工具函数：获取图标容器类名
export function getIconContainer(
  size: keyof typeof iconContainers,
  gradient: keyof typeof gradients = "blue"
) {
  return iconContainers[size](gradient);
}

// 工具函数：获取背景装饰类名
export function getBackgroundDecoration(gradient: keyof typeof gradients = "blue") {
  return backgroundDecoration(gradient);
}

