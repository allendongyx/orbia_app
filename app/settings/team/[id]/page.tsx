"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Mail,
  Wallet,
  UserPlus,
  Shield,
  MoreVertical,
  X,
  Check,
  Clock,
  Camera,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Team, TeamMember, TeamRole } from "@/types/team";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { IconSelector } from "@/components/common/icon-selector";
import { 
  getTeam, 
  updateTeam, 
  getTeamMembers, 
  inviteUser, 
  removeTeamMember 
} from "@/lib/api/team";
import { isSuccessResponse, getErrorMessage } from "@/lib/api-client";
import { useAuth } from "@/contexts/auth-context";

// Helper function to format date consistently on server and client
const formatDate = (dateString: string | undefined) => {
  if (!dateString) return "-";
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}/${month}/${day}`;
};

export default function TeamSettingsPage() {
  const params = useParams();
  const router = useRouter();
  const { user, refreshUser } = useAuth();
  const teamId = params.id as string;
  
  const [team, setTeam] = useState<Team | null>(null);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [inviteType, setInviteType] = useState<"email" | "wallet">("email");
  const [inviteValue, setInviteValue] = useState("");
  const [inviteRole, setInviteRole] = useState<TeamRole>(TeamRole.MEMBER);
  const [iconSelectorOpen, setIconSelectorOpen] = useState(false);
  
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isInviting, setIsInviting] = useState(false);
  const [error, setError] = useState<string>("");
  const [successMessage, setSuccessMessage] = useState<string>("");

  const getTeamInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // 加载团队信息和成员列表
  const loadTeamData = useCallback(async () => {
    setIsLoading(true);
    setError("");
    
    try {
      // 并行加载团队信息和成员列表
      const [teamResponse, membersResponse] = await Promise.all([
        getTeam({ team_id: teamId }),
        getTeamMembers({ team_id: teamId }),
      ]);

      if (isSuccessResponse(teamResponse.base_resp)) {
        setTeam(teamResponse.team);
      } else {
        setError(getErrorMessage(teamResponse.base_resp));
      }

      if (isSuccessResponse(membersResponse.base_resp)) {
        setMembers(membersResponse.members || []);
      } else {
        setError(getErrorMessage(membersResponse.base_resp));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load team data");
      console.error("Failed to load team data:", err);
    } finally {
      setIsLoading(false);
    }
  }, [teamId]);

  // 初始加载
  useEffect(() => {
    loadTeamData();
  }, [loadTeamData]);

  // 更新团队信息
  const handleUpdateTeam = async () => {
    if (!team) return;
    
    setIsUpdating(true);
    setError("");
    setSuccessMessage("");
    
    try {
      const response = await updateTeam({
        team_id: teamId,
        name: team.name,
        icon_url: team.icon_url,
      });

      if (isSuccessResponse(response.base_resp)) {
        setTeam(response.team);
        setSuccessMessage("Team updated successfully");
        // 如果更新的是当前团队，刷新用户信息
        if (user?.current_team?.id === team.id) {
          await refreshUser();
        }
      } else {
        setError(getErrorMessage(response.base_resp));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update team");
    } finally {
      setIsUpdating(false);
    }
  };

  // 邀请用户
  const handleInvite = async () => {
    if (!inviteValue.trim()) return;
    
    setIsInviting(true);
    setError("");
    setSuccessMessage("");
    
    try {
      const response = await inviteUser({
        team_id: teamId,
        email: inviteType === "email" ? inviteValue : undefined,
        wallet_address: inviteType === "wallet" ? inviteValue : undefined,
        role: inviteRole,
      });

      if (isSuccessResponse(response.base_resp)) {
        setInviteValue("");
        setSuccessMessage("Invitation sent successfully");
        // 重新加载成员列表
        await loadTeamData();
      } else {
        setError(getErrorMessage(response.base_resp));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send invitation");
    } finally {
      setIsInviting(false);
    }
  };

  // 移除成员
  const handleRemoveMember = async (memberId: number) => {
    setError("");
    setSuccessMessage("");
    
    try {
      const response = await removeTeamMember({
        team_id: teamId,
        user_id: memberId.toString(),
      });

      if (isSuccessResponse(response.base_resp)) {
        setSuccessMessage("Member removed successfully");
        // 重新加载成员列表
        await loadTeamData();
      } else {
        setError(getErrorMessage(response.base_resp));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to remove member");
    }
  };

  const handleIconChange = (iconUrl: string) => {
    if (team) {
      setTeam({ ...team, icon_url: iconUrl });
    }
  };

  // 检查用户是否有权限管理团队
  const currentUserMember = members.find(m => m.user_id === user?.id);
  const isOwnerOrCreator = currentUserMember?.role === TeamRole.CREATOR || currentUserMember?.role === TeamRole.OWNER;
  
  // 计算活跃和待处理的成员数量
  const activeMembers = members.filter(m => m.user_id !== 0);
  const pendingMembers = members.filter(m => m.user_id === 0);
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!team) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <AlertCircle className="h-12 w-12 text-gray-400" />
        <p className="text-lg text-gray-600">Team not found</p>
        <Button onClick={() => router.push("/dashboard")}>
          Go to Dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <IconSelector
        open={iconSelectorOpen}
        onOpenChange={setIconSelectorOpen}
        currentIcon={team.icon_url}
        onIconChange={handleIconChange}
      />

      {/* Success Message */}
      {successMessage && (
        <div className="p-3 rounded-md bg-green-50 border border-green-200">
          <p className="text-sm text-green-600">{successMessage}</p>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="p-3 rounded-md bg-red-50 border border-red-200">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Team Info Card */}
      <Card>
        <CardHeader>
          <CardTitle>Team Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-start gap-6">
            {/* Team Icon */}
            <div className="flex flex-col items-center gap-2">
              <div className="relative group/icon">
                <Avatar className="h-24 w-24 rounded-2xl">
                  {team.icon_url ? (
                    <img
                      src={team.icon_url}
                      alt={team.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <AvatarFallback className="bg-gradient-to-br from-blue-600 to-purple-600 text-white text-2xl font-bold rounded-2xl">
                      {getTeamInitials(team.name)}
                    </AvatarFallback>
                  )}
                </Avatar>
                <button
                  onClick={() => setIconSelectorOpen(true)}
                  className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-2xl opacity-0 group-hover/icon:opacity-100 transition-opacity"
                >
                  <Camera className="h-8 w-8 text-white" />
                </button>
              </div>
            </div>

            {/* Team Details */}
            <div className="flex-1 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="team-name">Team Name</Label>
                <Input
                  id="team-name"
                  value={team.name}
                  onChange={(e) => setTeam({ ...team, name: e.target.value })}
                  className="max-w-md"
                />
              </div>

              <div className="flex gap-2">
                <Button 
                  onClick={handleUpdateTeam}
                  disabled={isUpdating || !isOwnerOrCreator}
                >
                  {isUpdating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => loadTeamData()}
                  disabled={isUpdating}
                >
                  Cancel
                </Button>
              </div>
              {!isOwnerOrCreator && (
                <p className="text-xs text-gray-500 mt-2">
                  Only team owners can modify team information
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Invite Member Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Invite Team Member
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Invite by</Label>
                <Select
                  value={inviteType}
                  onValueChange={(v: "email" | "wallet") => setInviteType(v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="email">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        Email Address
                      </div>
                    </SelectItem>
                    <SelectItem value="wallet">
                      <div className="flex items-center gap-2">
                        <Wallet className="h-4 w-4" />
                        Wallet Address
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>
                  {inviteType === "email" ? "Email Address" : "Wallet Address"}
                </Label>
                <Input
                  placeholder={
                    inviteType === "email"
                      ? "member@example.com"
                      : "0x..."
                  }
                  value={inviteValue}
                  onChange={(e) => setInviteValue(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Role</Label>
                <Select
                  value={inviteRole.toString()}
                  onValueChange={(v) => setInviteRole(parseInt(v) as TeamRole)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={TeamRole.MEMBER.toString()}>Member</SelectItem>
                    <SelectItem value={TeamRole.OWNER.toString()}>Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button 
              onClick={handleInvite} 
              className="gap-2"
              disabled={isInviting || !inviteValue.trim() || !isOwnerOrCreator}
            >
              {isInviting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <UserPlus className="h-4 w-4" />
                  Send Invitation
                </>
              )}
            </Button>
            {!isOwnerOrCreator && (
              <p className="text-xs text-gray-500 mt-2">
                Only team owners can invite members
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Members List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Team Members
            </span>
            <span className="text-sm font-normal text-muted-foreground">
              {members.length} total
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full grid-cols-3 max-w-md">
              <TabsTrigger value="all">
                All ({members.length})
              </TabsTrigger>
              <TabsTrigger value="active">
                Active ({activeMembers.length})
              </TabsTrigger>
              <TabsTrigger value="pending">
                Pending ({pendingMembers.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="mt-4">
              <MembersTable 
                members={members} 
                onRemove={handleRemoveMember}
                canManage={isOwnerOrCreator}
                currentUserId={user?.id}
              />
            </TabsContent>

            <TabsContent value="active" className="mt-4">
              <MembersTable 
                members={members.filter(m => m.user_id !== 0)} 
                onRemove={handleRemoveMember}
                canManage={isOwnerOrCreator}
                currentUserId={user?.id}
              />
            </TabsContent>

            <TabsContent value="pending" className="mt-4">
              <MembersTable 
                members={members.filter(m => m.user_id === 0)} 
                onRemove={handleRemoveMember}
                canManage={isOwnerOrCreator}
                currentUserId={user?.id}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

interface MembersTableProps {
  members: TeamMember[];
  onRemove: (memberId: number) => void;
  canManage: boolean;
  currentUserId?: number;
}

function MembersTable({ members, onRemove, canManage, currentUserId }: MembersTableProps) {
  const getRoleBadge = (role: TeamRole) => {
    const configs = {
      [TeamRole.CREATOR]: { label: "Creator", variant: "default" as const },
      [TeamRole.OWNER]: { label: "Owner", variant: "secondary" as const },
      [TeamRole.MEMBER]: { label: "Member", variant: "outline" as const },
    };
    const config = configs[role];
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getStatusBadge = (member: TeamMember) => {
    // 如果有 user_id 且不为 0，说明用户已加入
    if (member.user_id && member.user_id !== 0) {
      return (
        <Badge variant="default" className="bg-emerald-500 gap-1">
          <Check className="h-3 w-3" />
          Active
        </Badge>
      );
    }
    return (
      <Badge variant="secondary" className="gap-1">
        <Clock className="h-3 w-3" />
        Pending
      </Badge>
    );
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-50/50 hover:bg-gray-50/50">
            <TableHead className="font-semibold">Member</TableHead>
            <TableHead className="font-semibold">Identifier</TableHead>
            <TableHead className="font-semibold">Role</TableHead>
            <TableHead className="font-semibold">Status</TableHead>
            <TableHead className="font-semibold">Joined</TableHead>
            <TableHead className="w-12"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {members.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-8">
                <p className="text-sm text-muted-foreground">No members found</p>
              </TableCell>
            </TableRow>
          ) : (
            members.map((member) => (
              <TableRow key={member.id} className="hover:bg-gray-50/50">
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9">
                      {member.user_avatar_url ? (
                        <img
                          src={member.user_avatar_url}
                          alt={member.user_nickname || "User"}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <AvatarFallback className="bg-blue-700 text-white text-xs font-medium">
                          {member.user_nickname?.[0]?.toUpperCase() ||
                            member.user_email?.[0]?.toUpperCase() ||
                            member.user_wallet_address?.slice(0, 2).toUpperCase() ||
                            "?"}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">
                        {member.user_nickname || member.user_email || "Pending User"}
                      </p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <p className="text-sm font-mono text-muted-foreground">
                    {member.user_wallet_address
                      ? `${member.user_wallet_address.slice(0, 6)}...${member.user_wallet_address.slice(-4)}`
                      : member.user_email || "-"}
                  </p>
                </TableCell>
                <TableCell>{getRoleBadge(member.role)}</TableCell>
                <TableCell>{getStatusBadge(member)}</TableCell>
                <TableCell>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(member.joined_at)}
                  </p>
                </TableCell>
                <TableCell>
                  {canManage && member.role !== TeamRole.CREATOR && member.user_id !== currentUserId && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {member.user_id === 0 ? (
                          <DropdownMenuItem
                            onClick={() => onRemove(member.id)}
                            className="text-red-600 focus:text-red-700"
                          >
                            <X className="mr-2 h-4 w-4" />
                            Revoke Invitation
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem 
                            onClick={() => onRemove(member.user_id)}
                            className="text-red-600 focus:text-red-700"
                          >
                            <X className="mr-2 h-4 w-4" />
                            Remove Member
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}

