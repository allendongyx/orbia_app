import { apiRequest, type BaseResp } from '../api-client';

// 团队角色枚举
export enum TeamRole {
  CREATOR = 1,
  OWNER = 2,
  MEMBER = 3,
}

// 邀请状态枚举
export enum InvitationStatus {
  PENDING = 1,
  ACCEPTED = 2,
  REJECTED = 3,
  EXPIRED = 4,
}

// 团队信息
export interface Team {
  id: number;
  name: string;
  icon_url?: string;
  creator_id: number;
  created_at: string;
  updated_at: string;
}

// 团队成员信息
export interface TeamMember {
  id: number;
  team_id: number;
  user_id: number;
  role: TeamRole;
  joined_at: string;
  user_nickname?: string;
  user_avatar_url?: string;
  user_email?: string;
  user_wallet_address?: string;
}

// 团队邀请信息
export interface TeamInvitation {
  id: number;
  team_id: number;
  inviter_id: number;
  invitee_email?: string;
  invitee_wallet?: string;
  role: TeamRole;
  status: InvitationStatus;
  invitation_code: string;
  expires_at: string;
  created_at: string;
  team_name?: string;
  inviter_nickname?: string;
}

// 分页请求
export interface PageReq {
  page?: number;
  page_size?: number;
}

// 分页响应
export interface PageResp {
  page: number;
  page_size: number;
  total: number;
  total_pages: number;
}

// ==================== 请求和响应类型 ====================

// 创建团队
export interface CreateTeamReq {
  name: string;
  icon_url?: string;
}

export interface CreateTeamResp {
  team: Team;
  base_resp: BaseResp;
}

// 获取团队详情
export interface GetTeamReq {
  team_id: string;
}

export interface GetTeamResp {
  team: Team;
  base_resp: BaseResp;
}

// 更新团队
export interface UpdateTeamReq {
  team_id: string;
  name?: string;
  icon_url?: string;
}

export interface UpdateTeamResp {
  team: Team;
  base_resp: BaseResp;
}

// 获取用户团队列表
export interface GetUserTeamsReq {
  page_req?: PageReq;
}

export interface GetUserTeamsResp {
  teams: Team[];
  page_resp?: PageResp;
  base_resp: BaseResp;
}

// 邀请用户加入团队
export interface InviteUserReq {
  team_id: string;
  email?: string;
  wallet_address?: string;
  role: TeamRole;
}

export interface InviteUserResp {
  invitation: TeamInvitation;
  base_resp: BaseResp;
}

// 获取团队成员列表
export interface GetTeamMembersReq {
  team_id: string;
  page_req?: PageReq;
}

export interface GetTeamMembersResp {
  members: TeamMember[];
  page_resp?: PageResp;
  base_resp: BaseResp;
}

// 移除团队成员
export interface RemoveTeamMemberReq {
  team_id: string;
  user_id: string;
}

export interface RemoveTeamMemberResp {
  base_resp: BaseResp;
}

// 撤销邀请（使用移除成员接口，当用户尚未接受时）
export interface RevokeInvitationReq {
  team_id: string;
  invitation_id: string;
}

// 获取团队邀请列表
export interface GetTeamInvitationsReq {
  team_id: string;
  page_req?: PageReq;
}

export interface GetTeamInvitationsResp {
  invitations: TeamInvitation[];
  page_resp?: PageResp;
  base_resp: BaseResp;
}

// ==================== API 函数 ====================

// 创建团队
export async function createTeam(req: CreateTeamReq): Promise<CreateTeamResp> {
  return apiRequest<CreateTeamResp>('/api/v1/team/create', {
    method: 'POST',
    body: JSON.stringify(req),
  });
}

// 获取团队详情
export async function getTeam(req: GetTeamReq): Promise<GetTeamResp> {
  return apiRequest<GetTeamResp>('/api/v1/team/get', {
    method: 'POST',
    body: JSON.stringify(req),
  });
}

// 更新团队
export async function updateTeam(req: UpdateTeamReq): Promise<UpdateTeamResp> {
  return apiRequest<UpdateTeamResp>('/api/v1/team/update', {
    method: 'POST',
    body: JSON.stringify(req),
  });
}

// 获取用户团队列表
export async function getUserTeams(req: GetUserTeamsReq = {}): Promise<GetUserTeamsResp> {
  return apiRequest<GetUserTeamsResp>('/api/v1/team/user-teams', {
    method: 'POST',
    body: JSON.stringify(req),
  });
}

// 邀请用户加入团队
export async function inviteUser(req: InviteUserReq): Promise<InviteUserResp> {
  return apiRequest<InviteUserResp>('/api/v1/team/invite', {
    method: 'POST',
    body: JSON.stringify(req),
  });
}

// 获取团队成员列表
export async function getTeamMembers(req: GetTeamMembersReq): Promise<GetTeamMembersResp> {
  return apiRequest<GetTeamMembersResp>('/api/v1/team/members', {
    method: 'POST',
    body: JSON.stringify(req),
  });
}

// 移除团队成员
export async function removeTeamMember(req: RemoveTeamMemberReq): Promise<RemoveTeamMemberResp> {
  return apiRequest<RemoveTeamMemberResp>('/api/v1/team/remove-member', {
    method: 'POST',
    body: JSON.stringify(req),
  });
}

// 获取团队邀请列表（待处理的邀请）
export async function getTeamInvitations(req: GetTeamInvitationsReq): Promise<GetTeamInvitationsResp> {
  return apiRequest<GetTeamInvitationsResp>('/api/v1/team/invitations', {
    method: 'POST',
    body: JSON.stringify(req),
  });
}

