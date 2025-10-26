/**
 * 用户角色常量
 */
export const UserRole = {
  NORMAL: 'normal' as const,
  ADMIN: 'admin' as const,
} as const;

export type UserRoleType = typeof UserRole[keyof typeof UserRole];

/**
 * 检查是否为管理员
 */
export function isAdmin(role?: string): boolean {
  return role === UserRole.ADMIN;
}

/**
 * 检查是否为普通用户
 */
export function isNormalUser(role?: string): boolean {
  return role === UserRole.NORMAL;
}

