"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { 
  CheckCircle2, 
  Clock, 
  XCircle, 
  Users as UsersIcon,
  ThumbsUp,
  ThumbsDown,
  Eye
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
  getKols,
  reviewKol,
  AdminKolInfo,
} from "@/lib/api/admin";

export default function AdminKolsPage() {
  const { toast } = useToast();
  const [kols, setKols] = useState<AdminKolInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // 审核对话框
  const [showReviewDialog, setShowReviewDialog] = useState(false);
  const [reviewKolData, setReviewKolData] = useState<AdminKolInfo | null>(null);
  const [reviewAction, setReviewAction] = useState<"approved" | "rejected">("approved");
  const [rejectReason, setRejectReason] = useState("");

  useEffect(() => {
    loadKols();
  }, [page, statusFilter]);

  const loadKols = async () => {
    setLoading(true);
    try {
      const result = await getKols({
        keyword: searchKeyword || undefined,
        status: statusFilter === "all" ? undefined : (statusFilter as "pending" | "approved" | "rejected"),
        page,
        page_size: pageSize,
      });

      if (isSuccessResponse(result.base_resp)) {
        setKols(result.kols);
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
    loadKols();
  };

  const openReviewDialog = (kol: AdminKolInfo, action: "approved" | "rejected") => {
    setReviewKolData(kol);
    setReviewAction(action);
    setRejectReason("");
    setShowReviewDialog(true);
  };

  const handleReview = async () => {
    if (!reviewKolData) return;

    if (reviewAction === "rejected" && !rejectReason.trim()) {
      toast({
        variant: "error",
        title: "请填写拒绝原因",
      });
      return;
    }

    try {
      const result = await reviewKol({
        kol_id: reviewKolData.id,
        status: reviewAction,
        reject_reason: reviewAction === "rejected" ? rejectReason : undefined,
      });

      if (isSuccessResponse(result.base_resp)) {
        toast({
          title: "审核成功",
          description: `KOL 申请已${reviewAction === "approved" ? "通过" : "拒绝"}`,
        });
        setShowReviewDialog(false);
        loadKols();
      } else {
        toast({
          variant: "error",
          title: "审核失败",
          description: result.base_resp.message,
        });
      }
    } catch (error) {
      toast({
        variant: "error",
        title: "审核失败",
        description: error instanceof Error ? error.message : "网络错误",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return (
          <Badge className="bg-green-100 text-green-700 border-0">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            已通过
          </Badge>
        );
      case "pending":
        return (
          <Badge className="bg-yellow-100 text-yellow-700 border-0">
            <Clock className="h-3 w-3 mr-1" />
            待审核
          </Badge>
        );
      case "rejected":
        return (
          <Badge className="bg-red-100 text-red-700 border-0">
            <XCircle className="h-3 w-3 mr-1" />
            已拒绝
          </Badge>
        );
      default:
        return null;
    }
  };

  const stats = [
    {
      title: "总 KOL 数",
      value: total.toString(),
      icon: UsersIcon,
      gradient: "blue" as const,
    },
    {
      title: "已通过",
      value: kols.filter((k) => k.status === "approved").length.toString(),
      icon: CheckCircle2,
      gradient: "green" as const,
    },
    {
      title: "待审核",
      value: kols.filter((k) => k.status === "pending").length.toString(),
      icon: Clock,
      gradient: "orange" as const,
    },
    {
      title: "已拒绝",
      value: kols.filter((k) => k.status === "rejected").length.toString(),
      icon: XCircle,
      gradient: "red" as const,
    },
  ];

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">KOL 管理</h1>
        <p className="text-gray-600 mt-1">审核和管理平台上的 KOL 申请</p>
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
                placeholder="搜索 KOL 名称或国家..."
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="状态" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">所有状态</SelectItem>
                <SelectItem value="pending">待审核</SelectItem>
                <SelectItem value="approved">已通过</SelectItem>
                <SelectItem value="rejected">已拒绝</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* KOL 列表 */}
      <Card className="border-gray-200 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  KOL 信息
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  国家
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  粉丝数
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  状态
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  申请时间
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                      <span className="ml-3 text-gray-600">加载中...</span>
                    </div>
                  </td>
                </tr>
              ) : kols.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    没有找到 KOL
                  </td>
                </tr>
              ) : (
                kols.map((kol) => (
                  <tr key={kol.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={kol.avatar_url} />
                          <AvatarFallback className="bg-blue-700 text-white">
                            {kol.display_name.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {kol.display_name}
                          </div>
                          <div className="text-sm text-gray-500">
                            User ID: {kol.user_id}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {kol.country || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {kol.total_followers ? (kol.total_followers / 1000).toFixed(1) + "K" : "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="space-y-1">
                        {getStatusBadge(kol.status)}
                        {kol.status === "rejected" && kol.reject_reason && (
                          <div className="text-xs text-red-600 max-w-xs">
                            {kol.reject_reason}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(kol.created_at).toLocaleDateString("zh-CN")}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        {kol.status === "pending" && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openReviewDialog(kol, "approved")}
                              className="text-green-600 hover:text-green-700"
                            >
                              <ThumbsUp className="h-4 w-4 mr-1" />
                              通过
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openReviewDialog(kol, "rejected")}
                              className="text-red-600 hover:text-red-700"
                            >
                              <ThumbsDown className="h-4 w-4 mr-1" />
                              拒绝
                            </Button>
                          </>
                        )}
                        {kol.status === "approved" && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(`/kol/marketplace/${kol.id}`, "_blank")}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            查看
                          </Button>
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
        {!loading && kols.length > 0 && (
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
            pageSize={pageSize}
            total={total}
          />
        )}
      </Card>

      {/* 审核对话框 */}
      <Dialog open={showReviewDialog} onOpenChange={setShowReviewDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {reviewAction === "approved" ? "通过 KOL 申请" : "拒绝 KOL 申请"}
            </DialogTitle>
            <DialogDescription>
              {reviewAction === "approved"
                ? `确定要通过 ${reviewKolData?.display_name} 的 KOL 申请吗？`
                : `确定要拒绝 ${reviewKolData?.display_name} 的 KOL 申请吗？请填写拒绝原因。`}
            </DialogDescription>
          </DialogHeader>

          {reviewAction === "rejected" && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                拒绝原因 <span className="text-red-500">*</span>
              </label>
              <Textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="请输入拒绝原因..."
                rows={4}
                className="resize-none"
              />
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowReviewDialog(false)}>
              取消
            </Button>
            <Button
              onClick={handleReview}
              variant={reviewAction === "rejected" ? "destructive" : "default"}
            >
              确定
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

