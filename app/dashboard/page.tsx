"use client";

import React from "react";
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
  Zap
} from "lucide-react";

export default function Dashboard() {
  const stats = [
    {
      title: "Total Campaigns",
      value: "24",
      change: "+12.5%",
      trend: "up",
      icon: Megaphone,
      gradient: "from-blue-600 to-blue-700",
    },
    {
      title: "Active Users",
      value: "12,543",
      change: "+18.2%",
      trend: "up",
      icon: Users,
      gradient: "from-purple-500 to-purple-600",
    },
    {
      title: "Total Spend",
      value: "$45,231",
      change: "-4.3%",
      trend: "down",
      icon: DollarSign,
      gradient: "from-green-500 to-green-600",
    },
    {
      title: "Impressions",
      value: "2.4M",
      change: "+23.1%",
      trend: "up",
      icon: Eye,
      gradient: "from-orange-500 to-orange-600",
    },
  ];

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

  const trendingTopics = [
    { rank: 1, keyword: "DeFi", value: "高", heat: "3,434,932", change: "+12%" },
    { rank: 2, keyword: "NFT", value: "中", heat: "2,891,234", change: "+8%" },
    { rank: 3, keyword: "GameFi", value: "高", heat: "1,923,456", change: "+15%" },
    { rank: 4, keyword: "Web3", value: "中", heat: "1,654,321", change: "+5%" },
    { rank: 5, keyword: "AI", value: "高", heat: "1,234,567", change: "+20%" },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="relative overflow-hidden border-0 shadow-sm hover:shadow-md transition-shadow">
              <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${stat.gradient} opacity-5 rounded-full -mr-16 -mt-16`} />
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {stat.title}
                </CardTitle>
                <div className={`p-2 rounded-lg bg-gradient-to-br ${stat.gradient}`}>
                  <Icon className="h-4 w-4 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-900">{stat.value}</div>
                <div className="flex items-center gap-1 mt-2">
                  {stat.trend === "up" ? (
                    <ArrowUpRight className="h-4 w-4 text-green-600" />
                  ) : (
                    <ArrowDownRight className="h-4 w-4 text-red-600" />
                  )}
                  <span className={`text-sm font-medium ${stat.trend === "up" ? "text-green-600" : "text-red-600"}`}>
                    {stat.change}
                  </span>
                  <span className="text-sm text-gray-500 ml-1">vs last month</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

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
                    <div className="aspect-square rounded-xl overflow-hidden bg-gray-100 hover:scale-105 transition-transform cursor-pointer shadow-sm">
                      <img src="/ad_1.png" alt="Ad 1" className="w-full h-full object-cover" />
                    </div>
                    <div className="aspect-square rounded-xl overflow-hidden bg-gray-100 hover:scale-105 transition-transform cursor-pointer shadow-sm">
                      <img src="/ad_2.png" alt="Ad 2" className="w-full h-full object-cover" />
                    </div>
                    <div className="aspect-square rounded-xl overflow-hidden bg-gray-100 hover:scale-105 transition-transform cursor-pointer shadow-sm">
                      <img src="/ad_3.png" alt="Ad 3" className="w-full h-full object-cover" />
                    </div>
                  </div>
                  <Button variant="outline" className="w-full">
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
                    {trendingTopics.slice(0, 5).map((topic) => (
                      <div key={topic.rank} className="grid grid-cols-4 gap-3 text-sm items-center py-2 hover:bg-gray-50 rounded-lg px-2 -mx-2 transition-colors cursor-pointer">
                        <div className="font-semibold text-gray-900">#{topic.rank}</div>
                        <div className="font-medium text-gray-900">{topic.keyword}</div>
                        <div>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                            topic.value === "高" ? "bg-red-100 text-red-700" : "bg-yellow-100 text-yellow-700"
                          }`}>
                            {topic.value}
                          </span>
                        </div>
                        <div className="text-right">
                          <div className="text-gray-900 font-medium">{topic.heat}</div>
                          <div className="text-xs text-green-600">{topic.change}</div>
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
                <span className="text-xl font-bold">1,234</span>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-gray-700">
                <span className="text-gray-300 text-sm">总覆盖用户</span>
                <span className="text-xl font-bold">8.5M</span>
              </div>
              <div className="flex items-center justify-between py-3">
                <span className="text-gray-300 text-sm">平均转化率</span>
                <span className="text-xl font-bold text-green-400">3.2%</span>
              </div>
              <Button className="w-full bg-white text-gray-900 hover:bg-gray-100">
                查看完整数据
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

