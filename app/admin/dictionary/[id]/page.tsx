"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  ArrowLeft,
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  ChevronRight,
  ChevronDown,
  FileText,
  Folder,
  FolderOpen,
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
import { getIconContainer } from "@/lib/design-system";
import { isSuccessResponse } from "@/lib/api-client";
import { IconUpload } from "@/components/admin/icon-upload";
import {
  getDictionary,
  getDictionaryItemList,
  createDictionaryItem,
  updateDictionaryItem,
  deleteDictionaryItem,
  DictionaryInfo,
  DictionaryItemInfo,
} from "@/lib/api/dictionary";

// 树节点组件
interface TreeNodeProps {
  item: DictionaryItemInfo;
  level: number;
  onEdit: (item: DictionaryItemInfo) => void;
  onDelete: (item: DictionaryItemInfo) => void;
  onAddChild: (parentItem: DictionaryItemInfo) => void;
  expandedIds: Set<number>;
  onToggleExpand: (id: number) => void;
}

const TreeNode: React.FC<TreeNodeProps> = ({
  item,
  level,
  onEdit,
  onDelete,
  onAddChild,
  expandedIds,
  onToggleExpand,
}) => {
  const hasChildren = item.children && item.children.length > 0;
  const isExpanded = expandedIds.has(item.id);

  return (
    <div>
      <div
        className={`flex items-center gap-2 py-2 px-4 hover:bg-gray-50 rounded-lg group ${
          level > 1 ? "ml-" + (level - 1) * 6 : ""
        }`}
        style={{ marginLeft: `${(level - 1) * 24}px` }}
      >
        {/* 展开/折叠按钮 */}
        <button
          onClick={() => hasChildren && onToggleExpand(item.id)}
          className="w-5 h-5 flex items-center justify-center"
        >
          {hasChildren ? (
            isExpanded ? (
              <ChevronDown className="h-4 w-4 text-gray-500" />
            ) : (
              <ChevronRight className="h-4 w-4 text-gray-500" />
            )
          ) : (
            <div className="w-4 h-4" />
          )}
        </button>

        {/* 图标 */}
        <div className="w-5 h-5 flex items-center justify-center">
          {hasChildren ? (
            isExpanded ? (
              <FolderOpen className="h-4 w-4 text-yellow-600" />
            ) : (
              <Folder className="h-4 w-4 text-yellow-600" />
            )
          ) : (
            <FileText className="h-4 w-4 text-blue-600" />
          )}
        </div>

        {/* 图标URL */}
        {item.icon_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={item.icon_url} alt="" className="w-5 h-5 object-contain" />
        )}

        {/* 编码和名称 */}
        <div className="flex-1 flex items-center gap-3">
          <span className="font-mono text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
            {item.code}
          </span>
          <span className="font-medium text-gray-900">{item.name}</span>
          {item.description && (
            <span className="text-xs text-gray-500">- {item.description}</span>
          )}
        </div>

        {/* 状态 */}
        <div className="flex items-center gap-2">
          {item.status === 1 ? (
            <Badge className="bg-green-100 text-green-700 border-0 text-xs">
              <CheckCircle className="h-3 w-3 mr-1" />
              启用
            </Badge>
          ) : (
            <Badge className="bg-gray-100 text-gray-700 border-0 text-xs">
              <XCircle className="h-3 w-3 mr-1" />
              禁用
            </Badge>
          )}

          {/* 层级 */}
          <Badge variant="outline" className="text-xs">L{item.level}</Badge>

          {/* 排序 */}
          <Badge variant="outline" className="text-xs">{item.sort_order}</Badge>
        </div>

        {/* 操作按钮 */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onAddChild(item)}
            className="h-7 px-2"
          >
            <Plus className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(item)}
            className="h-7 px-2"
          >
            <Edit className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(item)}
            className="h-7 px-2 text-red-600 hover:text-red-700"
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {/* 子节点 */}
      {hasChildren && isExpanded && (
        <div>
          {item.children!.map((child) => (
            <TreeNode
              key={child.id}
              item={child}
              level={level + 1}
              onEdit={onEdit}
              onDelete={onDelete}
              onAddChild={onAddChild}
              expandedIds={expandedIds}
              onToggleExpand={onToggleExpand}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default function DictionaryItemsPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();

  const dictionaryId = parseInt(params.id as string);

  const [dictionary, setDictionary] = useState<DictionaryInfo | null>(null);
  const [items, setItems] = useState<DictionaryItemInfo[]>([]);
  const [treeData, setTreeData] = useState<DictionaryItemInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());

  // 创建/编辑对话框
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingItem, setEditingItem] = useState<DictionaryItemInfo | null>(null);
  const [parentItem, setParentItem] = useState<DictionaryItemInfo | null>(null);
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    description: "",
    icon_url: "",
    sort_order: 0,
    status: 1,
  });

  // 删除确认对话框
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deletingItem, setDeletingItem] = useState<DictionaryItemInfo | null>(null);

  useEffect(() => {
    loadDictionary();
    loadItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dictionaryId]);

  const loadDictionary = async () => {
    try {
      const result = await getDictionary(dictionaryId);
      if (isSuccessResponse(result.base_resp)) {
        setDictionary(result.dictionary);
      }
    } catch (error) {
      console.error("Failed to load dictionary:", error);
    }
  };

  const loadItems = async () => {
    setLoading(true);
    try {
      const result = await getDictionaryItemList({
        dictionary_id: dictionaryId,
        page: 1,
        page_size: 1000, // 获取所有项
      });

      if (isSuccessResponse(result.base_resp)) {
        setItems(result.items);
        // 构建树形结构
        const tree = buildTree(result.items);
        setTreeData(tree);
        // 默认展开所有一级节点
        const firstLevelIds = result.items
          .filter((item) => item.level === 1)
          .map((item) => item.id);
        setExpandedIds(new Set(firstLevelIds));
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

  // 构建树形结构
  const buildTree = (items: DictionaryItemInfo[]): DictionaryItemInfo[] => {
    const itemMap = new Map<number, DictionaryItemInfo>();
    const roots: DictionaryItemInfo[] = [];

    // 创建映射并初始化children
    items.forEach((item) => {
      itemMap.set(item.id, { ...item, children: [] });
    });

    // 构建树
    items.forEach((item) => {
      const node = itemMap.get(item.id)!;
      if (item.parent_id === 0) {
        roots.push(node);
      } else {
        const parent = itemMap.get(item.parent_id);
        if (parent) {
          parent.children = parent.children || [];
          parent.children.push(node);
        }
      }
    });

    // 排序
    const sortNodes = (nodes: DictionaryItemInfo[]) => {
      nodes.sort((a, b) => a.sort_order - b.sort_order);
      nodes.forEach((node) => {
        if (node.children && node.children.length > 0) {
          sortNodes(node.children);
        }
      });
    };

    sortNodes(roots);
    return roots;
  };

  const handleToggleExpand = (id: number) => {
    const newExpanded = new Set(expandedIds);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedIds(newExpanded);
  };

  const handleExpandAll = () => {
    const allIds = new Set(items.map((item) => item.id));
    setExpandedIds(allIds);
  };

  const handleCollapseAll = () => {
    setExpandedIds(new Set());
  };

  const openCreateDialog = (parent: DictionaryItemInfo | null = null) => {
    setEditingItem(null);
    setParentItem(parent);
    setFormData({
      code: "",
      name: "",
      description: "",
      icon_url: "",
      sort_order: 0,
      status: 1,
    });
    setShowEditDialog(true);
  };

  const openEditDialog = (item: DictionaryItemInfo) => {
    setEditingItem(item);
    setParentItem(null);
    setFormData({
      code: item.code,
      name: item.name,
      description: item.description || "",
      icon_url: item.icon_url || "",
      sort_order: item.sort_order,
      status: item.status,
    });
    setShowEditDialog(true);
  };

  const handleSave = async () => {
    // 验证
    if (!formData.name.trim()) {
      toast({
        variant: "error",
        title: "验证失败",
        description: "字典项名称不能为空",
      });
      return;
    }

    if (!editingItem && !formData.code.trim()) {
      toast({
        variant: "error",
        title: "验证失败",
        description: "字典项编码不能为空",
      });
      return;
    }

    try {
      if (editingItem) {
        // 更新
        const result = await updateDictionaryItem({
          id: editingItem.id,
          name: formData.name,
          description: formData.description || undefined,
          icon_url: formData.icon_url || undefined,
          sort_order: formData.sort_order,
          status: formData.status,
        });

        if (isSuccessResponse(result.base_resp)) {
          toast({
            title: "更新成功",
            description: "字典项已更新",
          });
          setShowEditDialog(false);
          loadItems();
        } else {
          toast({
            variant: "error",
            title: "更新失败",
            description: result.base_resp.message,
          });
        }
      } else {
        // 创建
        const result = await createDictionaryItem({
          dictionary_id: dictionaryId,
          parent_id: parentItem?.id || 0,
          code: formData.code,
          name: formData.name,
          description: formData.description || undefined,
          icon_url: formData.icon_url || undefined,
          sort_order: formData.sort_order,
        });

        if (isSuccessResponse(result.base_resp)) {
          toast({
            title: "创建成功",
            description: "字典项已创建",
          });
          setShowEditDialog(false);
          loadItems();
          // 展开父节点
          if (parentItem) {
            setExpandedIds(new Set(expandedIds).add(parentItem.id));
          }
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

  const openDeleteDialog = (item: DictionaryItemInfo) => {
    setDeletingItem(item);
    setShowDeleteDialog(true);
  };

  const handleDelete = async () => {
    if (!deletingItem) return;

    try {
      const result = await deleteDictionaryItem({ id: deletingItem.id });

      if (isSuccessResponse(result.base_resp)) {
        toast({
          title: "删除成功",
          description: "字典项已删除",
        });
        setShowDeleteDialog(false);
        loadItems();
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

  const stats = [
    {
      title: "总项目数",
      value: items.length.toString(),
      icon: FileText,
      gradient: "blue",
    },
    {
      title: "根节点",
      value: items.filter((i) => i.parent_id === 0).length.toString(),
      icon: Folder,
      gradient: "yellow",
    },
    {
      title: "启用项",
      value: items.filter((i) => i.status === 1).length.toString(),
      icon: CheckCircle,
      gradient: "green",
    },
  ];

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push("/admin/dictionary")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            返回
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {dictionary?.name || "字典项管理"}
            </h1>
            <p className="text-gray-600 mt-1">
              字典编码: <span className="font-mono text-blue-600">{dictionary?.code}</span>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleExpandAll}>
            展开全部
          </Button>
          <Button variant="outline" size="sm" onClick={handleCollapseAll}>
            折叠全部
          </Button>
          <Button onClick={() => openCreateDialog()} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-2" />
            添加根节点
          </Button>
        </div>
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

      {/* 树形列表 */}
      <Card className="border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">字典项树形结构</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600">加载中...</span>
            </div>
          ) : treeData.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Folder className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>暂无字典项，点击上方按钮添加</p>
            </div>
          ) : (
            <div className="space-y-1">
              {treeData.map((item) => (
                <TreeNode
                  key={item.id}
                  item={item}
                  level={1}
                  onEdit={openEditDialog}
                  onDelete={openDeleteDialog}
                  onAddChild={(parent) => openCreateDialog(parent)}
                  expandedIds={expandedIds}
                  onToggleExpand={handleToggleExpand}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 创建/编辑对话框 */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingItem ? "编辑字典项" : parentItem ? "添加子项" : "添加根节点"}
            </DialogTitle>
            <DialogDescription>
              {editingItem
                ? "更新字典项信息（编码、父级不可修改）"
                : parentItem
                ? `在 ${parentItem.name} 下添加子项`
                : "添加一个根级字典项"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="code">
                编码 <span className="text-red-500">*</span>
              </Label>
              <Input
                id="code"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                placeholder="如: CN, US, SH"
                disabled={!!editingItem}
                className="font-mono"
              />
              {!editingItem && (
                <p className="text-xs text-gray-500">编码创建后不可修改</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">
                名称 <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="如: 中国, 美国, 上海"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">描述</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="字典项的说明"
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <IconUpload
                value={formData.icon_url}
                onChange={(url) => setFormData({ ...formData, icon_url: url })}
                label="图标"
                description="可选，用于国旗、分类图标等，支持 JPG、PNG、GIF、SVG 格式，建议尺寸 64x64px"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="sort_order">排序</Label>
                <Input
                  id="sort_order"
                  type="number"
                  value={formData.sort_order}
                  onChange={(e) =>
                    setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })
                  }
                  placeholder="0"
                />
              </div>
              {editingItem && (
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
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              取消
            </Button>
            <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700">
              {editingItem ? "更新" : "创建"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 删除确认对话框 */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>删除字典项</DialogTitle>
            <DialogDescription>
              确定要删除字典项 <strong>{deletingItem?.name}</strong> ({deletingItem?.code})
              吗？
              <br />
              <span className="text-red-600 font-medium">
                删除字典项将同时删除其所有子节点，此操作无法撤销！
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

