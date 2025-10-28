"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { 
  getExcellentCaseList, 
  createExcellentCase, 
  updateExcellentCase, 
  deleteExcellentCase,
  ExcellentCase,
  CreateExcellentCaseRequest,
  UpdateExcellentCaseRequest
} from "@/lib/api/dashboard";
import ExcellentCaseModal from "@/components/admin/excellent-case-modal";
import { Pagination } from "@/components/admin/pagination";

export default function ExcellentCasesPage() {
  const [cases, setCases] = useState<ExcellentCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCase, setSelectedCase] = useState<ExcellentCase | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const pageSize = 10;
  const { toast } = useToast();

  const truncateUrl = (url: string, maxLength: number = 16) => {
    if (url.length <= maxLength) return url;
    return url.substring(0, maxLength) + '...';
  };

  useEffect(() => {
    fetchCases();
  }, [currentPage]);

  const fetchCases = async () => {
    try {
      setLoading(true);
      const response = await getExcellentCaseList({
        page: currentPage,
        page_size: pageSize,
      });
      setCases(response.cases);
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
    setSelectedCase(null);
    setModalOpen(true);
  };

  const handleEdit = (caseItem: ExcellentCase) => {
    setSelectedCase(caseItem);
    setModalOpen(true);
  };

  const handleSave = async (data: Record<string, unknown>) => {
    try {
      if (data.id) {
        await updateExcellentCase(data as unknown as UpdateExcellentCaseRequest);
        toast({
          title: "更新成功",
          description: "优秀案例已更新",
        });
      } else {
        await createExcellentCase(data as unknown as CreateExcellentCaseRequest);
        toast({
          title: "创建成功",
          description: "优秀案例已创建",
        });
      }
      fetchCases();
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
    if (!confirm("确定要删除这个案例吗？")) return;

    try {
      await deleteExcellentCase(id);
      toast({
        title: "删除成功",
        description: "优秀案例已删除",
      });
      fetchCases();
    } catch (error) {
      toast({
        variant: "error",
        title: "删除失败",
        description: error instanceof Error ? error.message : "请稍后重试",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">优秀广告案例管理</h1>
          <p className="text-gray-500 mt-1">管理 Dashboard 展示的优秀广告案例</p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" />
          新建案例
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">案例列表（共 {total} 条）</CardTitle>
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
                    <TableHead>封面</TableHead>
                    <TableHead>标题</TableHead>
                    <TableHead>视频链接</TableHead>
                    <TableHead>描述</TableHead>
                    <TableHead>排序</TableHead>
                    <TableHead>状态</TableHead>
                    <TableHead>创建时间</TableHead>
                    <TableHead className="text-right">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {cases.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center text-gray-500 py-8">
                        暂无数据
                      </TableCell>
                    </TableRow>
                  ) : (
                    cases.map((caseItem) => (
                      <TableRow key={caseItem.id}>
                        <TableCell>{caseItem.id}</TableCell>
                        <TableCell>
                          <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100">
                            <img 
                              src={caseItem.cover_url} 
                              alt={caseItem.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">{caseItem.title}</TableCell>
                        <TableCell>
                          <a
                            href={caseItem.video_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                            title={caseItem.video_url}
                          >
                            {truncateUrl(caseItem.video_url)}
                          </a>
                        </TableCell>
                        <TableCell className="max-w-xs truncate">{caseItem.description}</TableCell>
                        <TableCell>{caseItem.sort_order}</TableCell>
                        <TableCell>
                          <Badge variant={caseItem.status === 1 ? "default" : "secondary"}>
                            {caseItem.status === 1 ? "启用" : "禁用"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-gray-500">
                          {new Date(caseItem.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(caseItem)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(caseItem.id)}
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

      <ExcellentCaseModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        initialData={selectedCase}
      />
    </div>
  );
}

