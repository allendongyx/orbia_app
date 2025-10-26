"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Save, Database } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getPlatformStats, updatePlatformStats, PlatformStats } from "@/lib/api/dashboard";

export default function PlatformStatsPage() {
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    active_kols: 0,
    total_coverage: 0,
    total_ad_impressions: 0,
    total_transaction_amount: 0,
    average_roi: 0,
    average_cpm: 0,
    web3_brand_count: 0,
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const data = await getPlatformStats();
      setStats(data);
      setFormData({
        active_kols: data.active_kols,
        total_coverage: data.total_coverage,
        total_ad_impressions: data.total_ad_impressions,
        total_transaction_amount: data.total_transaction_amount,
        average_roi: data.average_roi,
        average_cpm: data.average_cpm,
        web3_brand_count: data.web3_brand_count,
      });
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updatePlatformStats(formData);
      toast({
        title: "保存成功",
        description: "平台数据已更新",
      });
      fetchStats();
    } catch (error) {
      toast({
        variant: "error",
        title: "保存失败",
        description: error instanceof Error ? error.message : "请稍后重试",
      });
    } finally {
      setSaving(false);
    }
  };

  const formatNumber = (num: number): string => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">平台数据管理</h1>
          <p className="text-gray-500 mt-1">管理 Dashboard 展示的平台统计数据</p>
        </div>
      </div>

      {/* 当前数据预览 */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-2">
                <p className="text-sm text-gray-500">活跃 KOLs</p>
                <p className="text-2xl font-bold">{formatNumber(stats.active_kols)}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="space-y-2">
                <p className="text-sm text-gray-500">总覆盖用户</p>
                <p className="text-2xl font-bold">{formatNumber(stats.total_coverage)}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="space-y-2">
                <p className="text-sm text-gray-500">累计广告曝光</p>
                <p className="text-2xl font-bold">{formatNumber(stats.total_ad_impressions)}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="space-y-2">
                <p className="text-sm text-gray-500">平台总交易额</p>
                <p className="text-2xl font-bold">
                  ${formatNumber(stats.total_transaction_amount)}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="space-y-2">
                <p className="text-sm text-gray-500">平均 ROI</p>
                <p className="text-2xl font-bold text-green-600">{stats.average_roi}%</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="space-y-2">
                <p className="text-sm text-gray-500">平均 CPM</p>
                <p className="text-2xl font-bold">${stats.average_cpm}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="space-y-2">
                <p className="text-sm text-gray-500">合作 Web3 品牌数</p>
                <p className="text-2xl font-bold">{formatNumber(stats.web3_brand_count)}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="space-y-2">
                <p className="text-sm text-gray-500">最后更新</p>
                <p className="text-sm font-medium text-gray-700">
                  {new Date(stats.updated_at).toLocaleString()}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 编辑表单 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            编辑平台数据
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="active_kols">活跃 KOLs 数量</Label>
                <Input
                  id="active_kols"
                  type="number"
                  min="0"
                  value={formData.active_kols}
                  onChange={(e) => setFormData({ ...formData, active_kols: parseInt(e.target.value) || 0 })}
                />
              </div>

              <div>
                <Label htmlFor="total_coverage">总覆盖用户数</Label>
                <Input
                  id="total_coverage"
                  type="number"
                  min="0"
                  value={formData.total_coverage}
                  onChange={(e) => setFormData({ ...formData, total_coverage: parseInt(e.target.value) || 0 })}
                />
              </div>

              <div>
                <Label htmlFor="total_ad_impressions">累计广告曝光次数</Label>
                <Input
                  id="total_ad_impressions"
                  type="number"
                  min="0"
                  value={formData.total_ad_impressions}
                  onChange={(e) => setFormData({ ...formData, total_ad_impressions: parseInt(e.target.value) || 0 })}
                />
              </div>

              <div>
                <Label htmlFor="total_transaction_amount">平台总交易额 (USD)</Label>
                <Input
                  id="total_transaction_amount"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.total_transaction_amount}
                  onChange={(e) => setFormData({ ...formData, total_transaction_amount: parseFloat(e.target.value) || 0 })}
                />
              </div>

              <div>
                <Label htmlFor="average_roi">平均 ROI (%)</Label>
                <Input
                  id="average_roi"
                  type="number"
                  min="0"
                  step="0.1"
                  value={formData.average_roi}
                  onChange={(e) => setFormData({ ...formData, average_roi: parseFloat(e.target.value) || 0 })}
                />
              </div>

              <div>
                <Label htmlFor="average_cpm">平均 CPM (USD)</Label>
                <Input
                  id="average_cpm"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.average_cpm}
                  onChange={(e) => setFormData({ ...formData, average_cpm: parseFloat(e.target.value) || 0 })}
                />
              </div>

              <div>
                <Label htmlFor="web3_brand_count">合作 Web3 品牌数</Label>
                <Input
                  id="web3_brand_count"
                  type="number"
                  min="0"
                  value={formData.web3_brand_count}
                  onChange={(e) => setFormData({ ...formData, web3_brand_count: parseInt(e.target.value) || 0 })}
                />
              </div>
            </div>

            <div className="flex justify-end gap-4 pt-4">
              <Button type="button" variant="outline" onClick={fetchStats}>
                重置
              </Button>
              <Button type="submit" disabled={saving}>
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <Save className="mr-2 h-4 w-4" />
                保存更新
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

