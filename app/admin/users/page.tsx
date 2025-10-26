"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Ban, 
  CheckCircle, 
  Trash2, 
  Wallet, 
  RotateCcw,
  Users as UsersIcon,
  Shield,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { SearchBar } from "@/components/admin/search-bar";
import { Pagination } from "@/components/admin/pagination";
import { getIconContainer } from "@/lib/design-system";
import { isSuccessResponse } from "@/lib/api-client";
import {
  getUsers,
  setUserStatus,
  getUserWallet,
  AdminUserInfo,
  UserWalletInfo,
} from "@/lib/api/admin";

export default function AdminUsersPage() {
  const { toast } = useToast();
  const [users, setUsers] = useState<AdminUserInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // 操作确认对话框
  const [showActionDialog, setShowActionDialog] = useState(false);
  const [actionUser, setActionUser] = useState<AdminUserInfo | null>(null);
  const [actionType, setActionType] = useState<"disable" | "enable" | "delete">("disable");

  // 钱包信息对话框
  const [showWalletDialog, setShowWalletDialog] = useState(false);
  const [walletInfo, setWalletInfo] = useState<UserWalletInfo | null>(null);
  const [loadingWallet, setLoadingWallet] = useState(false);

  useEffect(() => {
    loadUsers();
  }, [page, roleFilter, statusFilter]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const result = await getUsers({
        keyword: searchKeyword || undefined,
        role: roleFilter === "all" ? undefined : (roleFilter as "normal" | "admin"),
        status: statusFilter === "all" ? undefined : (statusFilter as "normal" | "disabled" | "deleted"),
        page,
        page_size: pageSize,
      });

      if (isSuccessResponse(result.base_resp)) {
        setUsers(result.users);
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

  const handleSearch = () => {
    setPage(1);
    loadUsers();
  };

  const handleStatusChange = async () => {
    if (!actionUser) return;

    try {
      let newStatus: "normal" | "disabled" | "deleted";
      if (actionType === "enable") {
        newStatus = "normal";
      } else if (actionType === "disable") {
        newStatus = "disabled";
      } else {
        newStatus = "deleted";
      }

      const result = await setUserStatus({
        user_id: actionUser.id,
        status: newStatus,
      });

      if (isSuccessResponse(result.base_resp)) {
        toast({
          title: "操作成功",
          description: "用户状态已更新",
        });
        setShowActionDialog(false);
        loadUsers();
      } else {
        toast({
          variant: "error",
          title: "操作失败",
          description: result.base_resp.message,
        });
      }
    } catch (error) {
      toast({
        variant: "error",
        title: "操作失败",
        description: error instanceof Error ? error.message : "网络错误",
      });
    }
  };

  const handleViewWallet = async (userId: number) => {
    setLoadingWallet(true);
    setShowWalletDialog(true);
    setWalletInfo(null);

    try {
      const result = await getUserWallet(userId);
      if (isSuccessResponse(result.base_resp) && result.wallet) {
        setWalletInfo(result.wallet);
      } else {
        toast({
          variant: "error",
          title: "加载失败",
          description: result.base_resp.message,
        });
        setShowWalletDialog(false);
      }
    } catch (error) {
      toast({
        variant: "error",
        title: "加载失败",
        description: error instanceof Error ? error.message : "网络错误",
      });
      setShowWalletDialog(false);
    } finally {
      setLoadingWallet(false);
    }
  };

  const openActionDialog = (user: AdminUserInfo, type: "disable" | "enable" | "delete") => {
    setActionUser(user);
    setActionType(type);
    setShowActionDialog(true);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "normal":
        return (
          <Badge className="bg-green-100 text-green-700 border-0">
            <CheckCircle className="h-3 w-3 mr-1" />
            正常
          </Badge>
        );
      case "disabled":
        return (
          <Badge className="bg-red-100 text-red-700 border-0">
            <Ban className="h-3 w-3 mr-1" />
            已禁用
          </Badge>
        );
      case "deleted":
        return (
          <Badge className="bg-gray-100 text-gray-700 border-0">
            <Trash2 className="h-3 w-3 mr-1" />
            已删除
          </Badge>
        );
      default:
        return null;
    }
  };

  const getRoleBadge = (role: string) => {
    if (role === "admin") {
      return (
        <Badge className="bg-purple-100 text-purple-700 border-0">
          <Shield className="h-3 w-3 mr-1" />
          管理员
        </Badge>
      );
    }
    return (
      <Badge variant="secondary" className="bg-gray-100 text-gray-700 border-0">
        普通用户
      </Badge>
    );
  };

  const stats = [
    {
      title: "总用户数",
      value: total.toString(),
      icon: UsersIcon,
      gradient: "blue" as const,
    },
    {
      title: "正常用户",
      value: users.filter((u) => u.status === "normal").length.toString(),
      icon: CheckCircle,
      gradient: "green" as const,
    },
    {
      title: "已禁用",
      value: users.filter((u) => u.status === "disabled").length.toString(),
      icon: Ban,
      gradient: "red" as const,
    },
    {
      title: "管理员",
      value: users.filter((u) => u.role === "admin").length.toString(),
      icon: Shield,
      gradient: "purple" as const,
    },
  ];

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">用户管理</h1>
        <p className="text-gray-600 mt-1">管理所有用户账户、状态和权限</p>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="border-0 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {stat.title}
                </CardTitle>
                <div className={getIconContainer("small", stat.gradient)}>
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

      {/* 搜索和筛选 */}
      <Card className="border-gray-200 shadow-sm">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <SearchBar
                value={searchKeyword}
                onChange={setSearchKeyword}
                onSearch={handleSearch}
                placeholder="搜索用户名、邮箱或钱包地址..."
              />
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="角色" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">所有角色</SelectItem>
                <SelectItem value="normal">普通用户</SelectItem>
                <SelectItem value="admin">管理员</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="状态" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">所有状态</SelectItem>
                <SelectItem value="normal">正常</SelectItem>
                <SelectItem value="disabled">已禁用</SelectItem>
                <SelectItem value="deleted">已删除</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* 用户列表 */}
      <Card className="border-gray-200 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  用户
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  角色
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  状态
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  注册时间
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
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    没有找到用户
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={user.avatar_url} />
                          <AvatarFallback className="bg-blue-700 text-white">
                            {user.nickname?.[0]?.toUpperCase() || 
                             user.email?.[0]?.toUpperCase() || 
                             "U"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {user.nickname || "未设置昵称"}
                          </div>
                          <div className="text-sm text-gray-500">
                            {user.email || user.wallet_address?.slice(0, 6) + "..." + user.wallet_address?.slice(-4)}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getRoleBadge(user.role)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(user.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(user.created_at).toLocaleDateString("zh-CN")}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewWallet(user.id)}
                        >
                          <Wallet className="h-4 w-4 mr-1" />
                          钱包
                        </Button>
                        {user.role !== "admin" && (
                          <>
                            {user.status === "normal" && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openActionDialog(user, "disable")}
                              >
                                <Ban className="h-4 w-4 mr-1" />
                                禁用
                              </Button>
                            )}
                            {user.status === "disabled" && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openActionDialog(user, "enable")}
                              >
                                <RotateCcw className="h-4 w-4 mr-1" />
                                恢复
                              </Button>
                            )}
                            {user.status !== "deleted" && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openActionDialog(user, "delete")}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="h-4 w-4 mr-1" />
                                删除
                              </Button>
                            )}
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* 分页 */}
        {!loading && users.length > 0 && (
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
            pageSize={pageSize}
            total={total}
          />
        )}
      </Card>

      {/* 操作确认对话框 */}
      <Dialog open={showActionDialog} onOpenChange={setShowActionDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionType === "enable" && "恢复用户"}
              {actionType === "disable" && "禁用用户"}
              {actionType === "delete" && "删除用户"}
            </DialogTitle>
            <DialogDescription>
              {actionType === "enable" &&
                `确定要恢复用户 ${actionUser?.nickname || actionUser?.email} 吗？`}
              {actionType === "disable" &&
                `确定要禁用用户 ${actionUser?.nickname || actionUser?.email} 吗？禁用后该用户将无法登录。`}
              {actionType === "delete" &&
                `确定要删除用户 ${actionUser?.nickname || actionUser?.email} 吗？此操作无法撤销！`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowActionDialog(false)}>
              取消
            </Button>
            <Button
              onClick={handleStatusChange}
              variant={actionType === "delete" ? "destructive" : "default"}
            >
              确定
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 钱包信息对话框 */}
      <Dialog open={showWalletDialog} onOpenChange={setShowWalletDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>用户钱包信息</DialogTitle>
          </DialogHeader>
          {loadingWallet ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600">加载中...</span>
            </div>
          ) : walletInfo ? (
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-sm text-gray-600 mb-1">用户信息</div>
                <div className="font-semibold text-gray-900">{walletInfo.user_name}</div>
                {walletInfo.user_email && (
                  <div className="text-sm text-gray-600">{walletInfo.user_email}</div>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="text-xs text-blue-600 mb-1">可用余额</div>
                  <div className="text-2xl font-bold text-blue-900">
                    ${walletInfo.balance.toFixed(2)}
                  </div>
                </div>
                <div className="bg-orange-50 rounded-lg p-4">
                  <div className="text-xs text-orange-600 mb-1">冻结金额</div>
                  <div className="text-2xl font-bold text-orange-900">
                    ${walletInfo.frozen_balance.toFixed(2)}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-green-50 rounded-lg p-4">
                  <div className="text-xs text-green-600 mb-1">累计充值</div>
                  <div className="text-xl font-semibold text-green-900">
                    ${walletInfo.total_recharge.toFixed(2)}
                  </div>
                </div>
                <div className="bg-purple-50 rounded-lg p-4">
                  <div className="text-xs text-purple-600 mb-1">累计消费</div>
                  <div className="text-xl font-semibold text-purple-900">
                    ${walletInfo.total_consume.toFixed(2)}
                  </div>
                </div>
              </div>
              <div className="text-xs text-gray-500 pt-2 border-t">
                创建时间: {new Date(walletInfo.created_at).toLocaleString("zh-CN")}
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}

