"use client";

import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ContentTrend } from "@/lib/api/dashboard";
import { Loader2 } from "lucide-react";

interface ContentTrendModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: Record<string, unknown>) => Promise<void>;
  initialData?: ContentTrend | null;
}

export default function ContentTrendModal({ 
  open, 
  onClose, 
  onSave, 
  initialData 
}: ContentTrendModalProps) {
  const [formData, setFormData] = useState({
    ranking: 1,
    hot_keyword: "",
    value_level: "medium" as "low" | "medium" | "high",
    heat: 0,
    growth_rate: 0,
    status: 1,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        ranking: initialData.ranking,
        hot_keyword: initialData.hot_keyword,
        value_level: initialData.value_level,
        heat: initialData.heat,
        growth_rate: initialData.growth_rate,
        status: initialData.status,
      });
    } else {
      setFormData({
        ranking: 1,
        hot_keyword: "",
        value_level: "medium",
        heat: 0,
        growth_rate: 0,
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
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {initialData ? "编辑内容趋势" : "新建内容趋势"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="ranking">排名 *</Label>
                <Input
                  id="ranking"
                  type="number"
                  min="1"
                  value={formData.ranking}
                  onChange={(e) => setFormData({ ...formData, ranking: parseInt(e.target.value) || 1 })}
                  required
                />
                <p className="text-xs text-gray-500 mt-1">排名不能重复</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="hot_keyword">热点关键词 *</Label>
                <Input
                  id="hot_keyword"
                  value={formData.hot_keyword}
                  onChange={(e) => setFormData({ ...formData, hot_keyword: e.target.value })}
                  placeholder="如：DeFi, NFT"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="value_level">价值等级 *</Label>
              <select
                id="value_level"
                value={formData.value_level}
                onChange={(e) => setFormData({ ...formData, value_level: e.target.value as "low" | "medium" | "high" })}
                className="w-full h-10 rounded-md border border-gray-300 px-3"
                required
              >
                <option value="high">高</option>
                <option value="medium">中</option>
                <option value="low">低</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="heat">热度值 *</Label>
                <Input
                  id="heat"
                  type="number"
                  min="0"
                  value={formData.heat}
                  onChange={(e) => setFormData({ ...formData, heat: parseInt(e.target.value) || 0 })}
                  placeholder="如：100000"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="growth_rate">增长比例 (%) *</Label>
                <Input
                  id="growth_rate"
                  type="number"
                  step="0.1"
                  value={formData.growth_rate}
                  onChange={(e) => setFormData({ ...formData, growth_rate: parseFloat(e.target.value) || 0 })}
                  placeholder="如：15.5"
                  required
                />
              </div>
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

