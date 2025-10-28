"use client";

import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ExcellentCase } from "@/lib/api/dashboard";
import { Loader2, Plus } from "lucide-react";
import { CoverUploadDialog } from "@/components/kol/cover-upload-dialog";

interface ExcellentCaseModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: Record<string, unknown>) => Promise<void>;
  initialData?: ExcellentCase | null;
}

export default function ExcellentCaseModal({ 
  open, 
  onClose, 
  onSave, 
  initialData 
}: ExcellentCaseModalProps) {
  const [formData, setFormData] = useState({
    video_url: "",
    cover_url: "",
    title: "",
    description: "",
    sort_order: 1,
    status: 1,
  });
  const [loading, setLoading] = useState(false);
  const [showCoverSelector, setShowCoverSelector] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        video_url: initialData.video_url,
        cover_url: initialData.cover_url,
        title: initialData.title,
        description: initialData.description || "",
        sort_order: initialData.sort_order,
        status: initialData.status,
      });
    } else {
      setFormData({
        video_url: "",
        cover_url: "",
        title: "",
        description: "",
        sort_order: 1,
        status: 1,
      });
    }
  }, [initialData, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const submitData = initialData 
        ? { id: initialData.id, ...formData }
        : formData;
      await onSave(submitData);
      onClose();
    } catch (error) {
      console.error("保存失败:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {initialData ? "编辑优秀案例" : "新建优秀案例"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="title">案例标题 *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="请输入案例标题"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="video_url">视频 URL *</Label>
              <Input
                id="video_url"
                value={formData.video_url}
                onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
                placeholder="https://example.com/video.mp4"
                required
              />
            </div>

            <div className="space-y-2">
              <Label>封面图片 *</Label>
              <div className="mt-2">
                {formData.cover_url ? (
                  <div className="space-y-2">
                    <div className="relative inline-block">
                      <img
                        src={formData.cover_url}
                        alt="封面预览"
                        className="w-64 h-64 object-cover rounded-lg border-2 border-gray-200"
                      />
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => setShowCoverSelector(true)}
                    >
                      更换封面
                    </Button>
                  </div>
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowCoverSelector(true)}
                    className="w-64 h-64 border-2 border-dashed border-gray-300 hover:border-blue-500 flex flex-col items-center justify-center gap-2"
                  >
                    <Plus className="h-8 w-8 text-gray-400" />
                    <span className="text-sm text-gray-600">上传封面图片</span>
                  </Button>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                建议尺寸: 16:9 或 1:1，用于案例展示
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">案例描述</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="请输入案例描述（可选）"
                rows={4}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="sort_order">排序序号</Label>
                <Input
                  id="sort_order"
                  type="number"
                  min="1"
                  value={formData.sort_order}
                  onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 1 })}
                />
                <p className="text-xs text-gray-500 mt-1">数字越小越靠前</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">状态</Label>
                <select
                  id="status"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: parseInt(e.target.value) })}
                  className="w-full h-10 rounded-md border border-gray-300 px-3"
                >
                  <option value={1}>启用</option>
                  <option value={0}>禁用</option>
                </select>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              取消
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {initialData ? "保存" : "创建"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>

      {/* 封面上传对话框 */}
      <CoverUploadDialog
        open={showCoverSelector}
        onOpenChange={setShowCoverSelector}
        onConfirm={(url: string) => {
          setFormData({ ...formData, cover_url: url });
          setShowCoverSelector(false);
        }}
      />
    </Dialog>
  );
}

