"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2, Loader2, TrendingUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { 
  getContentTrendList, 
  createContentTrend, 
  updateContentTrend, 
  deleteContentTrend,
  ContentTrend,
  CreateContentTrendRequest,
  UpdateContentTrendRequest
} from "@/lib/api/dashboard";
import ContentTrendModal from "@/components/admin/content-trend-modal";
import { Pagination } from "@/components/admin/pagination";

export default function ContentTrendsPage() {
  const [trends, setTrends] = useState<ContentTrend[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedTrend, setSelectedTrend] = useState<ContentTrend | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const pageSize = 10;
  const { toast } = useToast();

  useEffect(() => {
    fetchTrends();
  }, [currentPage]);

  const fetchTrends = async () => {
    try {
      setLoading(true);
      const response = await getContentTrendList({
        page: currentPage,
        page_size: pageSize,
      });
      setTrends(response.trends);
      setTotalPages(response.page_info.total_pages);
      setTotal(response.page_info.total);
    } catch (error) {
      toast({
        variant: "error",
        title: "获取数据失败",
        description: error instanceof Error ? error.message : "请稍后重试",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setSelectedTrend(null);
    setModalOpen(true);
  };

  const handleEdit = (trend: ContentTrend) => {
    setSelectedTrend(trend);
    setModalOpen(true);
  };

  const handleSave = async (data: Record<string, unknown>) => {
    try {
      if (data.id) {
        await updateContentTrend(data as unknown as UpdateContentTrendRequest);
        toast({
          title: "更新成功",
          description: "内容趋势已更新",
        });
      } else {
        await createContentTrend(data as unknown as CreateContentTrendRequest);
        toast({
          title: "创建成功",
          description: "内容趋势已创建",
        });
      }
      fetchTrends();
      setModalOpen(false);
    } catch (error) {
      toast({
        variant: "error",
        title: "操作失败",
        description: error instanceof Error ? error.message : "请稍后重试",
      });
      throw error;
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("确定要删除这个趋势吗？")) return;

    try {
      await deleteContentTrend(id);
      toast({
        title: "删除成功",
        description: "内容趋势已删除",
      });
      fetchTrends();
    } catch (error) {
      toast({
        variant: "error",
        title: "删除失败",
        description: error instanceof Error ? error.message : "请稍后重试",
      });
    }
  };

  const getValueLevelBadge = (level: string) => {
    const config = {
      high: { label: "高", className: "bg-red-100 text-red-700" },
      medium: { label: "中", className: "bg-yellow-100 text-yellow-700" },
      low: { label: "低", className: "bg-green-100 text-green-700" },
    };
    const { label, className } = config[level as keyof typeof config] || config.medium;
    return <Badge className={className}>{label}</Badge>;
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + "M";
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + "K";
    }
    return num.toString();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">内容趋势管理</h1>
          <p className="text-gray-500 mt-1">管理 Dashboard 展示的内容趋势数据</p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" />
          新建趋势
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">趋势列表（共 {total} 条）</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>排名</TableHead>
                    <TableHead>热点关键词</TableHead>
                    <TableHead>价值等级</TableHead>
                    <TableHead>热度</TableHead>
                    <TableHead>增长比例</TableHead>
                    <TableHead>状态</TableHead>
                    <TableHead>创建时间</TableHead>
                    <TableHead className="text-right">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {trends.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center text-gray-500 py-8">
                        暂无数据
                      </TableCell>
                    </TableRow>
                  ) : (
                    trends.map((trend) => (
                      <TableRow key={trend.id}>
                        <TableCell>{trend.id}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <TrendingUp className="h-4 w-4 text-blue-500" />
                            <span className="font-semibold">#{trend.ranking}</span>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">{trend.hot_keyword}</TableCell>
                        <TableCell>{getValueLevelBadge(trend.value_level)}</TableCell>
                        <TableCell>{formatNumber(trend.heat)}</TableCell>
                        <TableCell>
                          <span className="text-green-600">+{trend.growth_rate}%</span>
                        </TableCell>
                        <TableCell>
                          <Badge variant={trend.status === 1 ? "default" : "secondary"}>
                            {trend.status === 1 ? "启用" : "禁用"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-gray-500">
                          {new Date(trend.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(trend)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(trend.id)}
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>

              {totalPages > 1 && (
                <div className="mt-4">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                    pageSize={pageSize}
                    total={total}
                  />
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <ContentTrendModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        initialData={selectedTrend}
      />
    </div>
  );
}

