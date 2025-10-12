"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Users,
  TrendingUp,
  Eye,
  Star,
  Play,
  Heart,
  MessageCircle,
  Share2,
  Award,
  Target,
  Sparkles,
  CheckCircle2,
  ArrowUpRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getIconContainer, cardStyles } from "@/lib/design-system";
import kolData from "../../data.json";

export default function KOLDetail() {
  const params = useParams();
  const router = useRouter();
  const kolId = params.id as string;

  // 查找对应的 KOL
  const kol = kolData.find((k) => k.id === kolId);

  if (!kol) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <Sparkles className="h-16 w-16 text-gray-400 mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">KOL Not Found</h2>
        <p className="text-gray-600 mb-4">The KOL you're looking for doesn't exist.</p>
        <Button onClick={() => router.push("/kol")}>Back to KOLs</Button>
      </div>
    );
  }

  // 模拟的额外数据
  const extraData = {
    bio: "Leading voice in blockchain and Web3 technology. Passionate about decentralization and cryptocurrency education.",
    languages: ["English", "Mandarin"],
    location: "Singapore",
    joined: "Jan 2020",
    engagement_rate: "4.8%",
    avg_views: "850K",
    total_videos: 234,
    verified: true,
    specialties: [
      { name: "DeFi Protocols", level: "Expert" },
      { name: "NFT Strategy", level: "Advanced" },
      { name: "Web3 Gaming", level: "Expert" },
      { name: "Token Economics", level: "Advanced" },
    ],
    recentWorks: [
      {
        id: "1",
        title: "Understanding DeFi Yield Farming",
        cover: kol.masterpiece_works[0].cover,
        views: "1.2M",
        likes: "45K",
        comments: "2.3K",
        date: "2 days ago",
      },
      {
        id: "2",
        title: "NFT Market Analysis 2024",
        cover: kol.masterpiece_works[1]?.cover || kol.masterpiece_works[0].cover,
        views: "980K",
        likes: "38K",
        comments: "1.9K",
        date: "5 days ago",
      },
      {
        id: "3",
        title: "Top 10 GameFi Projects",
        cover: kol.masterpiece_works[0].cover,
        views: "760K",
        likes: "29K",
        comments: "1.5K",
        date: "1 week ago",
      },
      {
        id: "4",
        title: "Blockchain Security Tips",
        cover: kol.masterpiece_works[1]?.cover || kol.masterpiece_works[0].cover,
        views: "650K",
        likes: "25K",
        comments: "1.2K",
        date: "2 weeks ago",
      },
    ],
    platformStats: [
      { platform: "TikTok", followers: "2.8M", engagement: "5.2%" },
      { platform: "YouTube", followers: "1.2M", engagement: "4.1%" },
      { platform: "Twitter", followers: "890K", engagement: "3.8%" },
    ],
    pricingPlans: [
      { duration: "15-20s", price: "$" + parseInt(kol.offer_price.replace(/[^0-9]/g, "")) * 0.7 + "k", description: "Short-form content" },
      { duration: "21-60s", price: kol.offer_price, description: "Standard content", popular: true },
      { duration: "60s+", price: "$" + parseInt(kol.offer_price.replace(/[^0-9]/g, "")) * 1.5 + "k", description: "Long-form content" },
    ],
  };

  const stats = [
    {
      title: "Total Followers",
      value: kol.follower_all,
      icon: Users,
      gradient: "blue",
      change: "+12.5%",
    },
    {
      title: "Spread Index",
      value: kol.spread_index,
      icon: TrendingUp,
      gradient: "purple",
      change: "+8.2%",
    },
    {
      title: "Avg. Views",
      value: extraData.avg_views,
      icon: Eye,
      gradient: "green",
      change: "+15.3%",
    },
    {
      title: "Engagement Rate",
      value: extraData.engagement_rate,
      icon: Heart,
      gradient: "orange",
      change: "+3.1%",
    },
  ];

  return (
    <div className="space-y-6">
      {/* 返回按钮 */}
      <Button
        variant="ghost"
        onClick={() => router.push("/kol/marketplace")}
        className="gap-2 hover:bg-gray-100"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Marketplace
      </Button>

      {/* KOL 头部卡片 */}
      <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-50 to-purple-50">
        <CardContent className="p-8">
          <div className="flex flex-col md:flex-row gap-6">
            {/* 头像和基本信息 */}
            <div className="flex-shrink-0">
              <Avatar className="h-32 w-32 border-4 border-white shadow-lg">
                <AvatarImage
                  src={`https://randomuser.me/api/portraits/men/${kol.id}.jpg`}
                  alt={kol.name}
                />
                <AvatarFallback className="bg-gradient-to-br from-blue-600 to-blue-700 text-white text-3xl font-bold">
                  {kol.avatar}
                </AvatarFallback>
              </Avatar>
            </div>

            <div className="flex-1">
              <div className="flex items-start justify-between flex-wrap gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <h1 className="text-3xl font-bold text-gray-900">{kol.name}</h1>
                    {extraData.verified && (
                      <div className={getIconContainer("small", "blue")}>
                        <CheckCircle2 className="h-3 w-3 text-white" />
                      </div>
                    )}
                  </div>
                  <p className="text-gray-600 mb-3">{extraData.bio}</p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {kol.tags.map((tag) => (
                      <Badge
                        key={tag.id}
                        className="bg-white text-blue-700 border border-blue-200"
                      >
                        {tag.name}
                      </Badge>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                    <span>📍 {extraData.location}</span>
                    <span>🗓️ Joined {extraData.joined}</span>
                    <span>🗣️ {extraData.languages.join(", ")}</span>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <Button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white border-0 rounded-xl">
                    <Star className="mr-2 h-4 w-4" />
                    Book KOL
                  </Button>
                  <Button variant="outline" className="rounded-xl">
                    <Share2 className="mr-2 h-4 w-4" />
                    Share Profile
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="border-0 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {stat.title}
                </CardTitle>
                <div className={getIconContainer("small", stat.gradient as any)}>
                  <Icon className="h-4 w-4 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</div>
                <p className="text-xs text-green-600 font-medium">{stat.change} this month</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* 主要内容区 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 左侧：作品和详情 */}
        <div className="lg:col-span-2 space-y-6">
          <Tabs defaultValue="works" className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-gray-100 p-1 rounded-xl">
              <TabsTrigger value="works" className="rounded-lg">Recent Works</TabsTrigger>
              <TabsTrigger value="stats" className="rounded-lg">Platform Stats</TabsTrigger>
              <TabsTrigger value="specialties" className="rounded-lg">Specialties</TabsTrigger>
            </TabsList>

            <TabsContent value="works" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {extraData.recentWorks.map((work) => (
                  <Card key={work.id} className="group border-0 shadow-sm hover:shadow-lg transition-all cursor-pointer">
                    <CardContent className="p-0">
                      <div className="relative aspect-video rounded-t-lg overflow-hidden bg-gray-100">
                        <img
                          src={work.cover}
                          alt={work.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <Play className="h-12 w-12 text-white" />
                        </div>
                        <Badge className="absolute top-3 right-3 bg-black/70 text-white border-0">
                          {work.views} views
                        </Badge>
                      </div>
                      <div className="p-4">
                        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                          {work.title}
                        </h3>
                        <div className="flex items-center justify-between text-sm text-gray-600">
                          <div className="flex items-center gap-3">
                            <span className="flex items-center gap-1">
                              <Heart className="h-4 w-4" />
                              {work.likes}
                            </span>
                            <span className="flex items-center gap-1">
                              <MessageCircle className="h-4 w-4" />
                              {work.comments}
                            </span>
                          </div>
                          <span className="text-xs text-gray-500">{work.date}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="stats" className="mt-6">
              <Card className="border-0 shadow-sm">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {extraData.platformStats.map((platform, index) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div>
                          <h4 className="font-semibold text-gray-900">{platform.platform}</h4>
                          <p className="text-sm text-gray-600">{platform.followers} followers</p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-blue-600">{platform.engagement}</p>
                          <p className="text-xs text-gray-500">Engagement</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="specialties" className="mt-6">
              <Card className="border-0 shadow-sm">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {extraData.specialties.map((specialty, index) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className={getIconContainer("small", "purple")}>
                            <Target className="h-4 w-4 text-white" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900">{specialty.name}</h4>
                            <p className="text-sm text-gray-600">{specialty.level}</p>
                          </div>
                        </div>
                        <Award className="h-5 w-5 text-yellow-500" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* 右侧：定价和预期效果 */}
        <div className="space-y-6">
          {/* 定价方案 */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-blue-600" />
                Pricing Plans
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {extraData.pricingPlans.map((plan, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    plan.popular
                      ? "border-blue-700 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  {plan.popular && (
                    <Badge className="mb-2 bg-blue-700 text-white">Most Popular</Badge>
                  )}
                  <div className="flex items-baseline justify-between mb-1">
                    <span className="text-sm font-medium text-gray-600">{plan.duration}</span>
                    <span className="text-2xl font-bold text-gray-900">{plan.price}</span>
                  </div>
                  <p className="text-xs text-gray-500">{plan.description}</p>
                </div>
              ))}
              <Button className="w-full mt-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white border-0 rounded-xl">
                Request Quote
                <ArrowUpRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>

          {/* 预期效果 */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                Expected Results
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-green-50 rounded-lg">
                <p className="text-xs text-gray-600 mb-1">Est. CPM</p>
                <p className="text-2xl font-bold text-green-600">{kol.prospective_cmp}</p>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg">
                <p className="text-xs text-gray-600 mb-1">Est. Views</p>
                <p className="text-2xl font-bold text-purple-600">{kol.prospective_vv}</p>
              </div>
              <div className="p-4 bg-orange-50 rounded-lg">
                <p className="text-xs text-gray-600 mb-1">Engagement Rate</p>
                <p className="text-2xl font-bold text-orange-600">{extraData.engagement_rate}</p>
              </div>
            </CardContent>
          </Card>

          {/* 联系信息 */}
          <Card className="border-0 shadow-sm bg-gradient-to-br from-gray-900 to-gray-800 text-white">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-2">Need Help?</h3>
              <p className="text-sm text-gray-300 mb-4">
                Contact our team for personalized campaign strategies
              </p>
              <Button variant="outline" className="w-full bg-white text-gray-900 hover:bg-gray-100 rounded-xl">
                Contact Support
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

