import { apiRequest, type BaseResp } from '../api-client';

// ========== 通用类型 ==========

// 分页信息
export interface PageInfo {
  page: number;
  page_size: number;
  total: number;
  total_pages: number;
}

// ========== 用户管理 ==========

// 用户信息（管理员视图）
export interface AdminUserInfo {
  id: number;
  wallet_address?: string;
  email?: string;
  nickname?: string;
  avatar_url?: string;
  role: 'normal' | 'admin';
  status: 'normal' | 'disabled' | 'deleted';
  kol_id?: number;
  created_at: string;
  updated_at: string;
}

// 获取所有用户请求
export interface GetUsersReq {
  keyword?: string;
  role?: 'normal' | 'admin';
  status?: 'normal' | 'disabled' | 'deleted';
  page?: number;
  page_size?: number;
}

// 获取所有用户响应
export interface GetUsersResp {
  base_resp: BaseResp;
  users: AdminUserInfo[];
  page_info: PageInfo;
}

// 设置用户状态请求
export interface SetUserStatusReq {
  user_id: number;
  status: 'normal' | 'disabled' | 'deleted';
}

// 设置用户状态响应
export interface SetUserStatusResp {
  base_resp: BaseResp;
}

// 获取用户钱包信息响应
export interface UserWalletInfo {
  user_id: number;
  user_name: string;
  user_email?: string;
  balance: number;
  frozen_balance: number;
  total_recharge: number;
  total_consume: number;
  created_at: string;
  updated_at: string;
}

export interface GetUserWalletResp {
  base_resp: BaseResp;
  wallet?: UserWalletInfo;
}

// ========== KOL 管理 ==========

// KOL 信息（管理员视图）
export interface AdminKolInfo {
  id: number;
  user_id: number;
  display_name: string;
  avatar_url?: string;
  country?: string;
  status: 'pending' | 'approved' | 'rejected';
  reject_reason?: string;
  total_followers: number;
  created_at: string;
  updated_at: string;
}

// 获取所有 KOL 请求
export interface GetKolsReq {
  keyword?: string;
  status?: 'pending' | 'approved' | 'rejected';
  country?: string;
  tag?: string;
  page?: number;
  page_size?: number;
}

// 获取所有 KOL 响应
export interface GetKolsResp {
  base_resp: BaseResp;
  kols: AdminKolInfo[];
  page_info: PageInfo;
}

// 审核 KOL 请求
export interface ReviewKolReq {
  kol_id: number;
  status: 'approved' | 'rejected';
  reject_reason?: string;
}

// 审核 KOL 响应
export interface ReviewKolResp {
  base_resp: BaseResp;
}

// ========== 团队管理 ==========

// 团队信息（管理员视图）
export interface AdminTeamInfo {
  id: number;
  name: string;
  icon_url?: string;
  creator_id: number;
  creator_name: string;
  member_count: number;
  created_at: string;
}

// 获取所有团队请求
export interface GetTeamsReq {
  keyword?: string;
  page?: number;
  page_size?: number;
}

// 获取所有团队响应
export interface GetTeamsResp {
  base_resp: BaseResp;
  teams: AdminTeamInfo[];
  page_info: PageInfo;
}

// 团队成员信息
export interface TeamMemberInfo {
  user_id: number;
  nickname?: string;
  email?: string;
  avatar_url?: string;
  role: 'creator' | 'owner' | 'member';
  joined_at: string;
}

// 获取团队成员请求
export interface GetTeamMembersReq {
  page?: number;
  page_size?: number;
}

// 获取团队成员响应
export interface GetTeamMembersResp {
  base_resp: BaseResp;
  members: TeamMemberInfo[];
  page_info: PageInfo;
}

// ========== 订单管理 ==========

// 订单信息（管理员视图）
export interface AdminOrderInfo {
  order_id: string;
  user_id: number;
  user_name: string;
  user_email?: string;
  kol_id: number;
  kol_name: string;
  plan_title: string;
  plan_price: number;
  status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'refunded';
  created_at: string;
  completed_at?: string;
}

// 获取所有订单请求
export interface GetOrdersReq {
  keyword?: string;
  status?: string;
  page?: number;
  page_size?: number;
}

// 获取所有订单响应
export interface GetOrdersResp {
  base_resp: BaseResp;
  orders: AdminOrderInfo[];
  page_info: PageInfo;
}

// ========== API 函数 ==========

// 用户管理
export async function getUsers(req: GetUsersReq): Promise<GetUsersResp> {
  return apiRequest<GetUsersResp>('/api/v1/admin/users', {
    method: 'POST',
    body: JSON.stringify(req),
  });
}

export async function setUserStatus(req: SetUserStatusReq): Promise<SetUserStatusResp> {
  return apiRequest<SetUserStatusResp>('/api/v1/admin/user/status', {
    method: 'POST',
    body: JSON.stringify(req),
  });
}

export async function getUserWallet(userId: number): Promise<GetUserWalletResp> {
  return apiRequest<GetUserWalletResp>(`/api/v1/admin/user/${userId}/wallet`, {
    method: 'POST',
  });
}

// KOL 管理
export async function getKols(req: GetKolsReq): Promise<GetKolsResp> {
  return apiRequest<GetKolsResp>('/api/v1/admin/kols', {
    method: 'POST',
    body: JSON.stringify(req),
  });
}

export async function reviewKol(req: ReviewKolReq): Promise<ReviewKolResp> {
  return apiRequest<ReviewKolResp>('/api/v1/admin/kol/review', {
    method: 'POST',
    body: JSON.stringify(req),
  });
}

// 团队管理
export async function getTeams(req: GetTeamsReq): Promise<GetTeamsResp> {
  return apiRequest<GetTeamsResp>('/api/v1/admin/teams', {
    method: 'POST',
    body: JSON.stringify(req),
  });
}

export async function getTeamMembers(teamId: number, req: GetTeamMembersReq): Promise<GetTeamMembersResp> {
  return apiRequest<GetTeamMembersResp>(`/api/v1/admin/team/${teamId}/members`, {
    method: 'POST',
    body: JSON.stringify(req),
  });
}

// 订单管理
export async function getOrders(req: GetOrdersReq): Promise<GetOrdersResp> {
  return apiRequest<GetOrdersResp>('/api/v1/admin/orders', {
    method: 'POST',
    body: JSON.stringify(req),
  });
}

