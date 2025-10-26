"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  BookOpen,
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Settings,
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
  getDictionaryList,
  createDictionary,
  updateDictionary,
  deleteDictionary,
  DictionaryInfo,
} from "@/lib/api/dictionary";

export default function AdminDictionaryPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [dictionaries, setDictionaries] = useState<DictionaryInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // 创建/编辑对话框
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingDict, setEditingDict] = useState<DictionaryInfo | null>(null);
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    description: "",
    status: 1,
  });

  // 删除确认对话框
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deletingDict, setDeletingDict] = useState<DictionaryInfo | null>(null);

  useEffect(() => {
    loadDictionaries();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, statusFilter]);

  const loadDictionaries = async () => {
    setLoading(true);
    try {
      const result = await getDictionaryList({
        keyword: searchKeyword || undefined,
        status: statusFilter === "all" ? undefined : parseInt(statusFilter),
        page,
        page_size: pageSize,
      });

      if (isSuccessResponse(result.base_resp)) {
        setDictionaries(result.dictionaries);
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
    loadDictionaries();
  };

  const openCreateDialog = () => {
    setEditingDict(null);
    setFormData({
      code: "",
      name: "",
      description: "",
      status: 1,
    });
    setShowEditDialog(true);
  };

  const openEditDialog = (dict: DictionaryInfo) => {
    setEditingDict(dict);
    setFormData({
      code: dict.code,
      name: dict.name,
      description: dict.description || "",
      status: dict.status,
    });
    setShowEditDialog(true);
  };

  const handleSave = async () => {
    // 验证
    if (!formData.name.trim()) {
      toast({
        variant: "error",
        title: "验证失败",
        description: "字典名称不能为空",
      });
      return;
    }

    if (!editingDict && !formData.code.trim()) {
      toast({
        variant: "error",
        title: "验证失败",
        description: "字典编码不能为空",
      });
      return;
    }

    if (!editingDict && !/^[a-zA-Z]+$/.test(formData.code)) {
      toast({
        variant: "error",
        title: "验证失败",
        description: "字典编码只能包含大小写字母",
      });
      return;
    }

    try {
      if (editingDict) {
        // 更新
        const result = await updateDictionary({
          id: editingDict.id,
          name: formData.name,
          description: formData.description || undefined,
          status: formData.status,
        });

        if (isSuccessResponse(result.base_resp)) {
          toast({
            title: "更新成功",
            description: "字典已更新",
          });
          setShowEditDialog(false);
          loadDictionaries();
        } else {
          toast({
            variant: "error",
            title: "更新失败",
            description: result.base_resp.message,
          });
        }
      } else {
        // 创建
        const result = await createDictionary({
          code: formData.code,
          name: formData.name,
          description: formData.description || undefined,
        });

        if (isSuccessResponse(result.base_resp)) {
          toast({
            title: "创建成功",
            description: "字典已创建",
          });
          setShowEditDialog(false);
          loadDictionaries();
        } else {
          toast({
            variant: "error",
            title: "创建失败",
            description: result.base_resp.message,
          });
        }
      }
    } catch (error) {
      toast({
        variant: "error",
        title: "操作失败",
        description: error instanceof Error ? error.message : "网络错误",
      });
    }
  };

  const openDeleteDialog = (dict: DictionaryInfo) => {
    setDeletingDict(dict);
    setShowDeleteDialog(true);
  };

  const handleDelete = async () => {
    if (!deletingDict) return;

    try {
      const result = await deleteDictionary({ id: deletingDict.id });

      if (isSuccessResponse(result.base_resp)) {
        toast({
          title: "删除成功",
          description: "字典已删除",
        });
        setShowDeleteDialog(false);
        loadDictionaries();
      } else {
        toast({
          variant: "error",
          title: "删除失败",
          description: result.base_resp.message,
        });
      }
    } catch (error) {
      toast({
        variant: "error",
        title: "删除失败",
        description: error instanceof Error ? error.message : "网络错误",
      });
    }
  };

  const handleManageItems = (dict: DictionaryInfo) => {
    router.push(`/admin/dictionary/${dict.id}`);
  };

  const getStatusBadge = (status: number) => {
    if (status === 1) {
      return (
        <Badge className="bg-green-100 text-green-700 border-0">
          <CheckCircle className="h-3 w-3 mr-1" />
          启用
        </Badge>
      );
    }
    return (
      <Badge className="bg-gray-100 text-gray-700 border-0">
        <XCircle className="h-3 w-3 mr-1" />
        禁用
      </Badge>
    );
  };

  const stats = [
    {
      title: "总字典数",
      value: total.toString(),
      icon: BookOpen,
      gradient: "blue",
    },
    {
      title: "启用中",
      value: dictionaries.filter((d) => d.status === 1).length.toString(),
      icon: CheckCircle,
      gradient: "green",
    },
    {
      title: "已禁用",
      value: dictionaries.filter((d) => d.status === 0).length.toString(),
      icon: XCircle,
      gradient: "gray",
    },
  ];

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">数据字典管理</h1>
          <p className="text-gray-600 mt-1">管理系统中的预定义数据配置</p>
        </div>
        <Button onClick={openCreateDialog} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          创建字典
        </Button>
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
                <div className={getIconContainer("small", stat.gradient as "blue" | "green" | "yellow" | "red" | "purple" | "orange" | "gray")}>
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
                placeholder="搜索字典编码或名称..."
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="状态" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">所有状态</SelectItem>
                <SelectItem value="1">启用</SelectItem>
                <SelectItem value="0">禁用</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* 字典列表 */}
      <Card className="border-gray-200 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  编码
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  名称
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  描述
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  状态
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
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                      <span className="ml-3 text-gray-600">加载中...</span>
                    </div>
                  </td>
                </tr>
              ) : dictionaries.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    没有找到字典
                  </td>
                </tr>
              ) : (
                dictionaries.map((dict) => (
                  <tr key={dict.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-mono font-semibold text-blue-600">
                        {dict.code}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{dict.name}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-600 max-w-xs truncate">
                        {dict.description || "-"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(dict.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(dict.created_at).toLocaleDateString("zh-CN")}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleManageItems(dict)}
                        >
                          <Settings className="h-4 w-4 mr-1" />
                          管理项目
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditDialog(dict)}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          编辑
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openDeleteDialog(dict)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          删除
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* 分页 */}
        {!loading && dictionaries.length > 0 && (
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
            pageSize={pageSize}
            total={total}
          />
        )}
      </Card>

      {/* 创建/编辑对话框 */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingDict ? "编辑字典" : "创建字典"}</DialogTitle>
            <DialogDescription>
              {editingDict
                ? "更新字典的基本信息（编码不可修改）"
                : "创建一个新的数据字典"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="code">
                字典编码 <span className="text-red-500">*</span>
              </Label>
              <Input
                id="code"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                placeholder="只能包含大小写字母，如: COUNTRY"
                disabled={!!editingDict}
                className="font-mono"
              />
              {!editingDict && (
                <p className="text-xs text-gray-500">
                  编码创建后不可修改，只能包含大小写字母
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">
                字典名称 <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="如: 国家列表"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">字典描述</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="字典的用途说明"
                rows={3}
              />
            </div>
            {editingDict && (
              <div className="space-y-2">
                <Label htmlFor="status">状态</Label>
                <Select
                  value={formData.status.toString()}
                  onValueChange={(value) =>
                    setFormData({ ...formData, status: parseInt(value) })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">启用</SelectItem>
                    <SelectItem value="0">禁用</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              取消
            </Button>
            <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700">
              {editingDict ? "更新" : "创建"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 删除确认对话框 */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>删除字典</DialogTitle>
            <DialogDescription>
              确定要删除字典 <strong>{deletingDict?.name}</strong> ({deletingDict?.code})
              吗？
              <br />
              <span className="text-red-600 font-medium">
                删除字典将同时删除该字典下的所有字典项，此操作无法撤销！
              </span>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              取消
            </Button>
            <Button onClick={handleDelete} variant="destructive">
              确定删除
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

