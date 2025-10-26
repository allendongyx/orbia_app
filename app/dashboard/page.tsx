"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Megaphone, 
  DollarSign, 
  LineChart, 
  TrendingUp, 
  Users, 
  Eye,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  Target,
  Zap,
  Play,
  Loader2
} from "lucide-react";
import { getDashboardData, DashboardData } from "@/lib/api/dashboard";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

export default function Dashboard() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedVideo, setSelectedVideo] = useState<{url: string, title: string} | null>(null);
  const [showFullStats, setShowFullStats] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const data = await getDashboardData();
      setDashboardData(data);
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

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + "M";
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + "K";
    }
    return num.toString();
  };

  const formatMoney = (num: number): string => {
    return new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(num);
  };

  const getValueLevelColor = (level: string) => {
    switch (level) {
      case 'high': return 'bg-red-100 text-red-700';
      case 'medium': return 'bg-yellow-100 text-yellow-700';
      case 'low': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getValueLevelText = (level: string) => {
    switch (level) {
      case 'high': return '高';
      case 'medium': return '中';
      case 'low': return '低';
      default: return level;
    }
  };

  const quickActions = [
    {
      icon: Zap,
      title: "创建你的广告",
      description: "快速创建高效的广告活动，触达目标用户",
      buttonText: "开始创建",
      href: "/ads/creation",
      color: "blue",
    },
    {
      icon: DollarSign,
      title: "充值并调整预算",
      description: "管理您的广告预算，优化投放策略",
      buttonText: "去充值",
      href: "/wallet/recharge",
      color: "green",
    },
    {
      icon: LineChart,
      title: "发布广告监控效果",
      description: "实时追踪广告表现，数据驱动决策",
      buttonText: "查看数据",
      href: "/ads",
      color: "purple",
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quick Actions */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-blue-600" />
                <CardTitle className="text-lg">快速开始</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {quickActions.map((action, index) => {
                  const Icon = action.icon;
                  const colorClasses = {
                    blue: "from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800",
                    green: "from-green-500 to-green-600 hover:from-green-600 hover:to-green-700",
                    purple: "from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700",
                  }[action.color];

                  return (
                    <Link key={index} href={action.href}>
                      <Card className="group border-0 bg-gradient-to-br from-gray-50 to-gray-100 hover:shadow-lg transition-all cursor-pointer h-full">
                        <CardContent className="pt-6">
                          <div className="flex flex-col gap-4">
                            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colorClasses} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                              <Icon className="h-6 w-6 text-white" />
                            </div>
                            <div className="space-y-2">
                              <h3 className="font-semibold text-base text-gray-900">
                                {action.title}
                              </h3>
                              <p className="text-sm text-gray-600 leading-relaxed">
                                {action.description}
                              </p>
                            </div>
                            <Button 
                              className={`w-full mt-auto bg-gradient-to-r ${colorClasses} text-white border-0`}
                            >
                              {action.buttonText}
                              <ArrowUpRight className="ml-1 h-4 w-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Creative & Inspiration */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Target className="h-5 w-5 text-purple-600" />
                <CardTitle className="text-lg">创意与灵感</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Top Ads */}
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">优秀广告案例</h4>
                    <p className="text-sm text-gray-500">高转化率广告创意参考</p>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    {dashboardData?.excellent_cases.slice(0, 3).map((adCase) => (
                      <div 
                        key={adCase.id}
                        className="aspect-square rounded-xl overflow-hidden bg-gray-100 hover:scale-105 transition-transform cursor-pointer shadow-sm relative group"
                        onClick={() => setSelectedVideo({ url: adCase.video_url, title: adCase.title })}
                      >
                        <img 
                          src={adCase.cover_url} 
                          alt={adCase.title} 
                          className="w-full h-full object-cover" 
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Play className="h-8 w-8 text-white" />
                        </div>
                      </div>
                    ))}
                  </div>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => {
                      // TODO: 跳转到完整的案例列表页面或打开 Dialog
                      toast({
                        title: "敬请期待",
                        description: "完整案例列表功能即将上线",
                      });
                    }}
                  >
                    查看更多案例
                  </Button>
                </div>

                {/* Trending Topics */}
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">内容趋势</h4>
                    <p className="text-sm text-gray-500">由 Orbia 数据分析统计</p>
                  </div>
                  <div className="space-y-2">
                    <div className="grid grid-cols-4 gap-3 text-xs font-semibold text-gray-500 uppercase tracking-wider pb-2 border-b">
                      <div>排名</div>
                      <div>热点词</div>
                      <div>价值</div>
                      <div className="text-right">热度</div>
                    </div>
                    {dashboardData?.content_trends.slice(0, 5).map((trend) => (
                      <div key={trend.id} className="grid grid-cols-4 gap-3 text-sm items-center py-2 hover:bg-gray-50 rounded-lg px-2 -mx-2 transition-colors cursor-pointer">
                        <div className="font-semibold text-gray-900">#{trend.ranking}</div>
                        <div className="font-medium text-gray-900">{trend.hot_keyword}</div>
                        <div>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getValueLevelColor(trend.value_level)}`}>
                            {getValueLevelText(trend.value_level)}
                          </span>
                        </div>
                        <div className="text-right">
                          <div className="text-gray-900 font-medium">{formatNumber(trend.heat)}</div>
                          <div className="text-xs text-green-600">+{trend.growth_rate}%</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Learning Resources */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">学习中心</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Card className="border-0 bg-gradient-to-br from-blue-50 to-blue-100 hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="pt-6">
                  <div className="space-y-3">
                    <div className="w-12 h-12 rounded-xl bg-blue-700 flex items-center justify-center">
                      <Megaphone className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="font-semibold text-gray-900 text-base">
                      KOLs 营销指南
                    </h3>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      学习如何与 KOL 合作，提升品牌影响力和转化率
                    </p>
                    <Button variant="outline" size="sm" className="w-full bg-white">
                      开始学习
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 bg-gradient-to-br from-purple-50 to-purple-100 hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="pt-6">
                  <div className="space-y-3">
                    <div className="w-12 h-12 rounded-xl bg-purple-600 flex items-center justify-center">
                      <LineChart className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="font-semibold text-gray-900 text-base">
                      数据分析入门
                    </h3>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      掌握数据分析技巧，优化广告投放效果
                    </p>
                    <Button variant="outline" size="sm" className="w-full bg-white">
                      开始学习
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card className="border-0 shadow-sm bg-gradient-to-br from-gray-900 to-gray-800 text-white">
            <CardHeader>
              <CardTitle className="text-lg text-white">平台数据</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-gray-700">
                <span className="text-gray-300 text-sm">活跃 KOLs</span>
                <span className="text-xl font-bold">{formatNumber(dashboardData?.platform_stats.active_kols || 0)}</span>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-gray-700">
                <span className="text-gray-300 text-sm">总覆盖用户</span>
                <span className="text-xl font-bold">{formatNumber(dashboardData?.platform_stats.total_coverage || 0)}</span>
              </div>
              <div className="flex items-center justify-between py-3">
                <span className="text-gray-300 text-sm">平均 ROI</span>
                <span className="text-xl font-bold text-green-400">{dashboardData?.platform_stats.average_roi || 0}%</span>
              </div>
              <Button 
                className="w-full bg-white text-gray-900 hover:bg-gray-100"
                onClick={() => setShowFullStats(true)}
              >
                查看完整数据
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Video Player Dialog */}
      <Dialog open={!!selectedVideo} onOpenChange={() => setSelectedVideo(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{selectedVideo?.title}</DialogTitle>
          </DialogHeader>
          {selectedVideo && (
            <div className="aspect-video w-full">
              <video 
                src={selectedVideo.url} 
                controls 
                autoPlay
                className="w-full h-full rounded-lg"
              >
                您的浏览器不支持视频播放
              </video>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Full Stats Dialog */}
      <Dialog open={showFullStats} onOpenChange={setShowFullStats}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>平台完整数据</DialogTitle>
          </DialogHeader>
          {dashboardData && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-2">
                    <p className="text-sm text-gray-500">活跃 KOLs</p>
                    <p className="text-2xl font-bold">{formatNumber(dashboardData.platform_stats.active_kols)}</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-2">
                    <p className="text-sm text-gray-500">总覆盖用户</p>
                    <p className="text-2xl font-bold">{formatNumber(dashboardData.platform_stats.total_coverage)}</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-2">
                    <p className="text-sm text-gray-500">累计广告曝光</p>
                    <p className="text-2xl font-bold">{formatNumber(dashboardData.platform_stats.total_ad_impressions)}</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-2">
                    <p className="text-sm text-gray-500">平台总交易额</p>
                    <p className="text-2xl font-bold">{formatMoney(dashboardData.platform_stats.total_transaction_amount)}</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-2">
                    <p className="text-sm text-gray-500">平均 ROI</p>
                    <p className="text-2xl font-bold text-green-600">{dashboardData.platform_stats.average_roi}%</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-2">
                    <p className="text-sm text-gray-500">平均 CPM</p>
                    <p className="text-2xl font-bold">${dashboardData.platform_stats.average_cpm}</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="md:col-span-2">
                <CardContent className="pt-6">
                  <div className="space-y-2">
                    <p className="text-sm text-gray-500">合作 Web3 品牌数</p>
                    <p className="text-2xl font-bold">{formatNumber(dashboardData.platform_stats.web3_brand_count)}</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

