"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Building2, 
  Users as UsersIcon,
  User,
  Crown,
  Shield,
  Eye
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { SearchBar } from "@/components/admin/search-bar";
import { Pagination } from "@/components/admin/pagination";
import { getIconContainer } from "@/lib/design-system";
import { isSuccessResponse } from "@/lib/api-client";
import {
  getTeams,
  getTeamMembers,
  AdminTeamInfo,
  TeamMemberInfo,
} from "@/lib/api/admin";

export default function AdminTeamsPage() {
  const { toast } = useToast();
  const [teams, setTeams] = useState<AdminTeamInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // 团队成员对话框
  const [showMembersDialog, setShowMembersDialog] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<AdminTeamInfo | null>(null);
  const [members, setMembers] = useState<TeamMemberInfo[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [membersPage, setMembersPage] = useState(1);
  const [membersPageSize] = useState(10);
  const [membersTotal, setMembersTotal] = useState(0);
  const [membersTotalPages, setMembersTotalPages] = useState(0);

  useEffect(() => {
    loadTeams();
  }, [page]);

  useEffect(() => {
    if (selectedTeam && showMembersDialog) {
      loadTeamMembers();
    }
  }, [selectedTeam, membersPage, showMembersDialog]);

  const loadTeams = async () => {
    setLoading(true);
    try {
      const result = await getTeams({
        keyword: searchKeyword || undefined,
        page,
        page_size: pageSize,
      });

      if (isSuccessResponse(result.base_resp)) {
        setTeams(result.teams);
        setTotal(result.page_info.total);
        setTotalPages(result.page_info.total_pages);
      } else {
        toast({
          variant: "error",
          title: "加载失败",
          description: result.base_resp.message,
        });
      }
    } catch (error) {
      toast({
        variant: "error",
        title: "加载失败",
        description: error instanceof Error ? error.message : "网络错误",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadTeamMembers = async () => {
    if (!selectedTeam) return;

    setLoadingMembers(true);
    try {
      const result = await getTeamMembers(selectedTeam.id, {
        page: membersPage,
        page_size: membersPageSize,
      });

      if (isSuccessResponse(result.base_resp)) {
        setMembers(result.members);
        setMembersTotal(result.page_info.total);
        setMembersTotalPages(result.page_info.total_pages);
      } else {
        toast({
          variant: "error",
          title: "加载失败",
          description: result.base_resp.message,
        });
      }
    } catch (error) {
      toast({
        variant: "error",
        title: "加载失败",
        description: error instanceof Error ? error.message : "网络错误",
      });
    } finally {
      setLoadingMembers(false);
    }
  };

  const handleSearch = () => {
    setPage(1);
    loadTeams();
  };

  const openMembersDialog = (team: AdminTeamInfo) => {
    setSelectedTeam(team);
    setMembersPage(1);
    setShowMembersDialog(true);
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "creator":
        return (
          <Badge className="bg-purple-100 text-purple-700 border-0">
            <Crown className="h-3 w-3 mr-1" />
            创建者
          </Badge>
        );
      case "owner":
        return (
          <Badge className="bg-blue-100 text-blue-700 border-0">
            <Shield className="h-3 w-3 mr-1" />
            所有者
          </Badge>
        );
      case "member":
        return (
          <Badge variant="secondary" className="bg-gray-100 text-gray-700 border-0">
            <User className="h-3 w-3 mr-1" />
            成员
          </Badge>
        );
      default:
        return null;
    }
  };

  const stats = [
    {
      title: "总团队数",
      value: total.toString(),
      icon: Building2,
      gradient: "blue",
    },
    {
      title: "总成员数",
      value: teams.reduce((sum, team) => sum + team.member_count, 0).toString(),
      icon: UsersIcon,
      gradient: "green",
    },
    {
      title: "平均成员",
      value: teams.length > 0 
        ? (teams.reduce((sum, team) => sum + team.member_count, 0) / teams.length).toFixed(1)
        : "0",
      icon: User,
      gradient: "purple",
    },
  ];

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">团队管理</h1>
        <p className="text-gray-600 mt-1">查看和管理平台上的所有团队</p>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="border-0 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {stat.title}
                </CardTitle>
                <div className={getIconContainer("small", stat.gradient as 'blue' | 'green' | 'purple' | 'orange')}>
                  <Icon className="h-4 w-4 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-900">{stat.value}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* 搜索 */}
      <Card className="border-gray-200 shadow-sm">
        <CardContent className="p-6">
          <SearchBar
            value={searchKeyword}
            onChange={setSearchKeyword}
            onSearch={handleSearch}
            placeholder="搜索团队名称..."
          />
        </CardContent>
      </Card>

      {/* 团队列表 */}
      <Card className="border-gray-200 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  团队
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  创建者
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  成员数
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  创建时间
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                      <span className="ml-3 text-gray-600">加载中...</span>
                    </div>
                  </td>
                </tr>
              ) : teams.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    没有找到团队
                  </td>
                </tr>
              ) : (
                teams.map((team) => (
                  <tr key={team.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={team.icon_url} />
                          <AvatarFallback className="bg-blue-700 text-white">
                            {team.name.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {team.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            ID: {team.id}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{team.creator_name}</div>
                      <div className="text-sm text-gray-500">ID: {team.creator_id}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant="secondary" className="bg-blue-50 text-blue-700">
                        <UsersIcon className="h-3 w-3 mr-1" />
                        {team.member_count} 人
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(team.created_at).toLocaleDateString("zh-CN")}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openMembersDialog(team)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        查看成员
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* 分页 */}
        {!loading && teams.length > 0 && (
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
            pageSize={pageSize}
            total={total}
          />
        )}
      </Card>

      {/* 团队成员对话框 */}
      <Dialog open={showMembersDialog} onOpenChange={setShowMembersDialog}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>团队成员</DialogTitle>
            <DialogDescription>
              {selectedTeam?.name} - 共 {membersTotal} 名成员
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex-1 overflow-auto">
            {loadingMembers ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-3 text-gray-600">加载中...</span>
              </div>
            ) : members.length === 0 ? (
              <div className="py-12 text-center text-gray-500">
                没有成员
              </div>
            ) : (
              <div className="space-y-3">
                {members.map((member) => (
                  <div
                    key={member.user_id}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex items-center gap-4">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={member.avatar_url} />
                        <AvatarFallback className="bg-blue-700 text-white">
                          {member.nickname?.[0]?.toUpperCase() || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {member.nickname}
                        </div>
                        <div className="text-sm text-gray-500">
                          {member.email || `ID: ${member.user_id}`}
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                          加入时间: {new Date(member.joined_at).toLocaleDateString("zh-CN")}
                        </div>
                      </div>
                    </div>
                    <div>
                      {getRoleBadge(member.role)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 成员列表分页 */}
          {!loadingMembers && members.length > 0 && membersTotalPages > 1 && (
            <div className="border-t border-gray-200 pt-4 mt-4">
              <Pagination
                currentPage={membersPage}
                totalPages={membersTotalPages}
                onPageChange={setMembersPage}
                pageSize={membersPageSize}
                total={membersTotal}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

