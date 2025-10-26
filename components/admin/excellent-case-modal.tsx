"use client";

import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ExcellentCase } from "@/lib/api/dashboard";
import { Loader2 } from "lucide-react";

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
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">案例标题 *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="请输入案例标题"
                required
              />
            </div>

            <div>
              <Label htmlFor="video_url">视频 URL *</Label>
              <Input
                id="video_url"
                value={formData.video_url}
                onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
                placeholder="https://example.com/video.mp4"
                required
              />
            </div>

            <div>
              <Label htmlFor="cover_url">封面图片 URL *</Label>
              <Input
                id="cover_url"
                value={formData.cover_url}
                onChange={(e) => setFormData({ ...formData, cover_url: e.target.value })}
                placeholder="https://example.com/cover.jpg"
                required
              />
              {formData.cover_url && (
                <div className="mt-2">
                  <img 
                    src={formData.cover_url} 
                    alt="封面预览" 
                    className="w-full h-48 object-cover rounded-lg"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </div>
              )}
            </div>

            <div>
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
              <div>
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

              <div>
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
    </Dialog>
  );
}

