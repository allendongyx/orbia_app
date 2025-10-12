import { apiRequest, type BaseResp } from '../api-client';
import { Team } from '@/types/team';

// 用户信息
export interface UserInfo {
  id: number;
  wallet_address?: string;
  email?: string;
  nickname?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
  current_team?: Team;
}

// 获取用户信息响应
export interface GetProfileResp {
  user?: UserInfo;
  base_resp: BaseResp;
}

// 更新用户信息请求
export interface UpdateProfileReq {
  nickname?: string;
  avatar_url?: string;
}

// 更新用户信息响应
export interface UpdateProfileResp {
  base_resp: BaseResp;
}

// 获取当前用户信息
export async function getProfile(): Promise<GetProfileResp> {
  return apiRequest<GetProfileResp>('/api/v1/user/profile', {
    method: 'POST',
    body: JSON.stringify({}),
  });
}

// 更新用户信息
export async function updateProfile(req: UpdateProfileReq): Promise<UpdateProfileResp> {
  return apiRequest<UpdateProfileResp>('/api/v1/user/update-profile', {
    method: 'POST',
    body: JSON.stringify(req),
  });
}

// 切换当前团队请求
export interface SwitchCurrentTeamReq {
  team_id: number;
}

// 切换当前团队响应
export interface SwitchCurrentTeamResp {
  base_resp: BaseResp;
  current_team?: Team;
}

// 切换当前团队
export async function switchCurrentTeam(req: SwitchCurrentTeamReq): Promise<SwitchCurrentTeamResp> {
  return apiRequest<SwitchCurrentTeamResp>('/api/v1/user/switch-team', {
    method: 'POST',
    body: JSON.stringify(req),
  });
}

