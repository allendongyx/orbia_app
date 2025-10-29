"use client";

import React, { useState, useEffect } from "react";
import { CheckCircle2, XCircle, Pause, Eye, Loader2, Play, StopCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  adminListCampaigns, 
  adminUpdateCampaignStatus, 
  Campaign,
  AdminListCampaignRequest 
} from "@/lib/api/campaign";
import { Pagination } from "@/components/admin/pagination";

export default function AdminAdOrdersPage() {
  const { toast } = useToast();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(false);
  const [keyword, setKeyword] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [objectiveFilter, setObjectiveFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const pageSize = 20;

  // 加载 campaigns
  const loadCampaigns = async () => {
    try {
      setLoading(true);
      const params: AdminListCampaignRequest = {
        page: currentPage,
        page_size: pageSize,
      };
      
      if (keyword) params.keyword = keyword;
      if (statusFilter !== "all") params.status = statusFilter as 'pending' | 'active' | 'paused' | 'ended';
      if (objectiveFilter !== "all") params.promotion_objective = objectiveFilter as 'awareness' | 'consideration' | 'conversion';

      const response = await adminListCampaigns(params);
      
      if (response.base_resp.code === 0) {
        setCampaigns(response.campaigns || []);
        setTotalPages(response.page_info.total_pages);
        setTotal(response.page_info.total);
      } else {
        toast({
          title: "Error",
          description: response.base_resp.message || "Failed to load campaigns",
          variant: "error",
        });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to load campaigns";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCampaigns();
  }, [currentPage, statusFilter, objectiveFilter]);

  // 搜索
  const handleSearch = () => {
    setCurrentPage(1);
    loadCampaigns();
  };

  // 更新状态
  const handleStatusChange = async (campaignId: string, newStatus: 'active' | 'paused' | 'ended') => {
    try {
      const response = await adminUpdateCampaignStatus({
        campaign_id: campaignId,
        status: newStatus,
      });

      if (response.base_resp.code === 0) {
        toast({
          title: "Success",
          description: "Campaign status updated successfully",
        });
        loadCampaigns();
      } else {
        toast({
          title: "Error",
          description: response.base_resp.message || "Failed to update status",
          variant: "error",
        });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to update status";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "error",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const configs: Record<string, { label: string; variant: 'default' | 'secondary' | 'outline'; icon: React.ComponentType<{ className?: string }>; className: string }> = {
      active: {
        label: "Active",
        variant: "default" as const,
        icon: CheckCircle2,
        className: "bg-emerald-500 hover:bg-emerald-600 border-emerald-600",
      },
      pending: {
        label: "Pending",
        variant: "secondary" as const,
        icon: XCircle,
        className: "bg-amber-500 hover:bg-amber-600 border-amber-600 text-white",
      },
      paused: {
        label: "Paused",
        variant: "outline" as const,
        icon: Pause,
        className: "border-gray-400 text-gray-600",
      },
      ended: {
        label: "Ended",
        variant: "outline" as const,
        icon: StopCircle,
        className: "border-red-400 text-red-600",
      },
    };

    const config = configs[status] || configs.pending;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className={`gap-1 ${config.className}`}>
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const getObjectiveBadge = (objective: string) => {
    const configs: Record<string, { label: string; className: string }> = {
      awareness: { label: "Awareness", className: "bg-blue-100 text-blue-700 border-blue-300" },
      consideration: { label: "Consideration", className: "bg-purple-100 text-purple-700 border-purple-300" },
      conversion: { label: "Conversion", className: "bg-green-100 text-green-700 border-green-300" },
    };

    const config = configs[objective] || { label: objective, className: "" };
    return (
      <Badge variant="outline" className={config.className}>
        {config.label}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">广告订单管理 (Campaign)</h1>
        <p className="text-gray-600 mt-1">查看和管理所有广告投放订单</p>
      </div>

      {/* Campaign List with Filters */}
      <Card className="overflow-hidden shadow-sm border-gray-200">
        {/* Filters Section */}
        <div className="bg-gradient-to-br from-gray-50 to-gray-100/50 border-b border-gray-200 px-6 py-4">
          <div className="flex flex-wrap gap-4 items-end">
            <div className="space-y-1.5 flex-1 min-w-[280px]">
              <Label htmlFor="keyword" className="text-xs font-medium text-gray-700">
                活动名称
              </Label>
              <div className="flex gap-2">
                <Input
                  id="keyword"
                  placeholder="搜索活动..."
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="h-9 bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
                <Button onClick={handleSearch} size="sm" className="h-9">
                  搜索
                </Button>
              </div>
            </div>
            <div className="space-y-1.5 min-w-[180px]">
              <Label htmlFor="status" className="text-xs font-medium text-gray-700">
                状态
              </Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger id="status" className="h-9 bg-white border-gray-300">
                  <SelectValue placeholder="选择状态" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部状态</SelectItem>
                  <SelectItem value="pending">待启动</SelectItem>
                  <SelectItem value="active">已启动</SelectItem>
                  <SelectItem value="paused">已暂停</SelectItem>
                  <SelectItem value="ended">已结束</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5 min-w-[180px]">
              <Label htmlFor="objective" className="text-xs font-medium text-gray-700">
                推广目标
              </Label>
              <Select value={objectiveFilter} onValueChange={setObjectiveFilter}>
                <SelectTrigger id="objective" className="h-9 bg-white border-gray-300">
                  <SelectValue placeholder="选择目标" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部目标</SelectItem>
                  <SelectItem value="awareness">品牌认知</SelectItem>
                  <SelectItem value="consideration">受众意向</SelectItem>
                  <SelectItem value="conversion">行为转化</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Header Section */}
        <div className="flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4">
          <div className="flex items-center gap-3">
            <h2 className="text-base font-semibold text-gray-900">
              所有活动
            </h2>
            <Badge variant="secondary" className="h-6 px-2 text-xs font-medium bg-gray-100 text-gray-700">
              {total}
            </Badge>
          </div>
        </div>

        {/* Table Section */}
        <div className="bg-white">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gradient-to-r from-gray-50 to-gray-100/50 hover:from-gray-50 hover:to-gray-100/50 border-b border-gray-200">
                    <TableHead className="font-semibold text-xs text-gray-700">活动名称</TableHead>
                    <TableHead className="font-semibold text-xs text-gray-700">用户ID</TableHead>
                    <TableHead className="font-semibold text-xs text-gray-700">团队ID</TableHead>
                    <TableHead className="font-semibold text-xs text-gray-700">推广目标</TableHead>
                    <TableHead className="font-semibold text-xs text-gray-700">状态</TableHead>
                    <TableHead className="font-semibold text-xs text-gray-700 text-right">预算</TableHead>
                    <TableHead className="font-semibold text-xs text-gray-700">开始时间</TableHead>
                    <TableHead className="font-semibold text-xs text-gray-700">结束时间</TableHead>
                    <TableHead className="font-semibold text-xs text-gray-700 text-center">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {campaigns.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-12">
                        <div className="flex flex-col items-center gap-2 text-muted-foreground">
                          <p className="text-sm">暂无活动</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    campaigns.map((campaign) => (
                      <TableRow 
                        key={campaign.id} 
                        className="hover:bg-blue-50/30 transition-colors border-b border-gray-100 last:border-0"
                      >
                        <TableCell className="font-medium text-gray-900">{campaign.campaign_name}</TableCell>
                        <TableCell className="text-sm text-gray-700">{campaign.user_id}</TableCell>
                        <TableCell className="text-sm text-gray-700">{campaign.team_id}</TableCell>
                        <TableCell>{getObjectiveBadge(campaign.promotion_objective)}</TableCell>
                        <TableCell>{getStatusBadge(campaign.status)}</TableCell>
                        <TableCell className="text-right font-medium text-gray-900">
                          ${campaign.budget_amount.toLocaleString()}
                          <span className="text-xs text-muted-foreground ml-1">
                            {campaign.budget_type === 0 ? '/天' : '总计'}
                          </span>
                        </TableCell>
                        <TableCell className="text-sm text-gray-700">
                          {new Date(campaign.planned_start_time).toLocaleDateString('zh-CN')}
                        </TableCell>
                        <TableCell className="text-sm text-gray-700">
                          {new Date(campaign.planned_end_time).toLocaleDateString('zh-CN')}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-center gap-1">
                            {campaign.status === 'pending' && (
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-8 px-2 text-xs hover:bg-emerald-50 text-emerald-600"
                                onClick={() => handleStatusChange(campaign.campaign_id, 'active')}
                              >
                                <Play className="h-3 w-3 mr-1" />
                                启动
                              </Button>
                            )}
                            {campaign.status === 'active' && (
                              <>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="h-8 px-2 text-xs hover:bg-amber-50 text-amber-600"
                                  onClick={() => handleStatusChange(campaign.campaign_id, 'paused')}
                                >
                                  <Pause className="h-3 w-3 mr-1" />
                                  暂停
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="h-8 px-2 text-xs hover:bg-red-50 text-red-600"
                                  onClick={() => handleStatusChange(campaign.campaign_id, 'ended')}
                                >
                                  <StopCircle className="h-3 w-3 mr-1" />
                                  结束
                                </Button>
                              </>
                            )}
                            {campaign.status === 'paused' && (
                              <>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="h-8 px-2 text-xs hover:bg-emerald-50 text-emerald-600"
                                  onClick={() => handleStatusChange(campaign.campaign_id, 'active')}
                                >
                                  <Play className="h-3 w-3 mr-1" />
                                  重启
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="h-8 px-2 text-xs hover:bg-red-50 text-red-600"
                                  onClick={() => handleStatusChange(campaign.campaign_id, 'ended')}
                                >
                                  <StopCircle className="h-3 w-3 mr-1" />
                                  结束
                                </Button>
                              </>
                            )}
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-8 w-8 p-0 hover:bg-blue-50"
                            >
                              <Eye className="h-4 w-4 text-gray-600" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Pagination */}
          {!loading && campaigns.length > 0 && (
            <div className="border-t border-gray-200 px-6 py-4">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                pageSize={pageSize}
                total={total}
              />
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
