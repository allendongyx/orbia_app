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

export interface Team {
  id: number;
  name: string;
  icon_url?: string;
  creator_id: number;
  created_at: string;
  updated_at: string;
}

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

