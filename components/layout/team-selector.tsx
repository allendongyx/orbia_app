"use client";

import { useState, useEffect, useCallback } from "react";
import { Check, ChevronDown, Plus, Settings, Loader2 } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Team } from "@/types/team";
import { useAuth } from "@/contexts/auth-context";
import { getUserTeams } from "@/lib/api/team";
import { isSuccessResponse } from "@/lib/api-client";
import { CreateTeamModal } from "./create-team-modal";

export function TeamSelector() {
  const { user, isLoggedIn, refreshUser, switchTeam } = useAuth();
  const [teams, setTeams] = useState<Team[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSwitching, setIsSwitching] = useState(false);
  const [createTeamModalOpen, setCreateTeamModalOpen] = useState(false);

  const getTeamInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // 加载团队列表
  const loadTeams = useCallback(async () => {
    // 只有在用户已登录且有用户信息时才加载
    if (!isLoggedIn || !user) {
      return;
    }

    setIsLoading(true);
    try {
      const response = await getUserTeams({});
      if (isSuccessResponse(response.base_resp)) {
        setTeams(response.teams || []);
      }
    } catch (error) {
      console.error("Failed to load teams:", error);
    } finally {
      setIsLoading(false);
    }
  }, [isLoggedIn, user]);

  // 当用户登录后加载团队列表
  useEffect(() => {
    if (isLoggedIn && user) {
      loadTeams();
    } else {
      // 如果用户未登录，重置状态
      setTeams([]);
      setIsLoading(false);
    }
  }, [isLoggedIn, user, loadTeams]);

  // 切换团队
  const handleSwitchTeam = async (team: Team) => {
    if (user?.current_team?.id === team.id || isSwitching) {
      return;
    }

    setIsSwitching(true);
    try {
      await switchTeam(team.id);
    } finally {
      setIsSwitching(false);
    }
  };

  // 团队创建成功后的回调
  const handleTeamCreated = async () => {
    // 重新加载团队列表
    await loadTeams();
    // 刷新用户信息（新创建的团队会自动成为当前团队）
    await refreshUser();
  };

  const currentTeam = user?.current_team;

  // 如果没有当前团队，不显示
  if (!currentTeam) {
    return null;
  }

  return (
    <>
      <CreateTeamModal 
        open={createTeamModalOpen}
        onOpenChange={setCreateTeamModalOpen}
        onTeamCreated={handleTeamCreated}
      />
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2.5 w-full rounded-lg px-2.5 py-2 hover:bg-gray-100 transition-colors group border border-gray-200 bg-white">
          <Avatar className="h-8 w-8 rounded-lg">
            {currentTeam.icon_url ? (
              <img
                src={currentTeam.icon_url}
                alt={currentTeam.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <AvatarFallback className="bg-gradient-to-br from-blue-600 to-purple-600 text-white text-xs font-bold rounded-lg">
                {getTeamInitials(currentTeam.name)}
              </AvatarFallback>
            )}
          </Avatar>
          <div className="flex flex-col overflow-hidden flex-1 text-left min-w-0">
            <span className="text-sm font-semibold text-gray-900 truncate">
              {currentTeam.name}
            </span>
            <span className="text-[10px] text-gray-500 uppercase tracking-wide">Team</span>
          </div>
          <ChevronDown className="h-3.5 w-3.5 text-gray-400 shrink-0" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        side="right"
        sideOffset={8}
        className="w-72 bg-white border-gray-200"
      >
        <DropdownMenuLabel className="text-xs font-semibold text-gray-500 uppercase">
          Switch Team
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {/* Team List */}
        <div className="max-h-64 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
            </div>
          ) : teams.length === 0 ? (
            <div className="px-4 py-8 text-center">
              <p className="text-sm text-gray-500">No teams found</p>
            </div>
          ) : (
            teams.map((team) => (
              <DropdownMenuItem
                key={team.id}
                className="cursor-pointer focus:bg-gray-50 py-2.5"
                onClick={() => handleSwitchTeam(team)}
                disabled={isSwitching}
              >
                <div className="flex items-center gap-3 w-full">
                  <Avatar className="h-8 w-8 rounded-lg">
                    {team.icon_url ? (
                      <img
                        src={team.icon_url}
                        alt={team.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <AvatarFallback className="bg-gradient-to-br from-blue-600 to-purple-600 text-white text-xs font-bold rounded-lg">
                        {getTeamInitials(team.name)}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <span className="text-sm text-gray-700 flex-1 truncate">
                    {team.name}
                  </span>
                  {currentTeam.id === team.id && (
                    <Check className="h-4 w-4 text-blue-600" />
                  )}
                </div>
              </DropdownMenuItem>
            ))
          )}
        </div>

        <DropdownMenuSeparator />

        {/* Actions */}
        <div className="p-2">
          <Link href={`/settings/team/${currentTeam.id}`}>
            <DropdownMenuItem className="cursor-pointer focus:bg-gray-50 rounded-md py-2.5">
              <Settings className="mr-3 h-4 w-4 text-gray-600" />
              <span className="text-sm text-gray-700">Team Settings</span>
            </DropdownMenuItem>
          </Link>
          <DropdownMenuItem 
            className="cursor-pointer focus:bg-gray-50 rounded-md py-2.5 mt-1"
            onClick={() => setCreateTeamModalOpen(true)}
          >
            <Plus className="mr-3 h-4 w-4 text-gray-600" />
            <span className="text-sm text-gray-700">Create New Team</span>
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
    </>
  );
}

