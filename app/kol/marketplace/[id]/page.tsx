"use client";

import React, { useState, useEffect } from "react";
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
  Youtube,
  Twitter,
  Globe,
  MapPin,
  Calendar,
  Languages,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { getIconContainer, cardStyles } from "@/lib/design-system";
import { getKolInfo, getKolVideos, getKolPlans, KolInfo, KolVideo, KolPlan } from "@/lib/api/kol";
import { isSuccessResponse } from "@/lib/api-client";
import { TikTokEmbed } from "@/components/kol/tiktok-embed";
import { VideoPlayerModal } from "@/components/kol/video-player-modal";
import { Video } from "lucide-react";
import kolData from "../../data.json";

export default function KOLDetail() {
  const params = useParams();
  const router = useRouter();
  const kolId = params.id as string;

  const [kolInfo, setKolInfo] = useState<KolInfo | null>(null);
  const [kolVideos, setKolVideos] = useState<KolVideo[]>([]);
  const [kolPlans, setKolPlans] = useState<KolPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingVideos, setLoadingVideos] = useState(true);
  const [loadingPlans, setLoadingPlans] = useState(true);
  const [showVideoPlayerModal, setShowVideoPlayerModal] = useState(false);
  const [playingVideo, setPlayingVideo] = useState<KolVideo | null>(null);
  const [showPricingModal, setShowPricingModal] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    if (kolId) {
      loadKolData();
      loadKolVideos();
      loadKolPlans();
    }
  }, [kolId]);

  const loadKolData = async () => {
    setLoading(true);
    try {
      const result = await getKolInfo({ kol_id: parseInt(kolId) });
      if (isSuccessResponse(result.base_resp) && result.kol_info) {
        setKolInfo(result.kol_info);
      }
    } catch (err) {
      console.error("Failed to load KOL info:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadKolVideos = async () => {
    setLoadingVideos(true);
    try {
      const result = await getKolVideos({ 
        kol_id: parseInt(kolId),
        page: 1,
        page_size: 10,
      });
      if (isSuccessResponse(result.base_resp)) {
        setKolVideos(result.videos);
      }
    } catch (err) {
      console.error("Failed to load KOL videos:", err);
    } finally {
      setLoadingVideos(false);
    }
  };

  const loadKolPlans = async () => {
    setLoadingPlans(true);
    try {
      const result = await getKolPlans({ kol_id: parseInt(kolId) });
      if (isSuccessResponse(result.base_resp)) {
        setKolPlans(result.plans);
      }
    } catch (err) {
      console.error("Failed to load KOL plans:", err);
    } finally {
      setLoadingPlans(false);
    }
  };

  // 查找对应的 KOL (fallback)
  const kol = kolData.find((k) => k.id === kolId);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
        <p className="text-gray-600">Loading KOL profile...</p>
      </div>
    );
  }

  if (!kolInfo && !kol) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <Sparkles className="h-16 w-16 text-gray-400 mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">KOL Not Found</h2>
        <p className="text-gray-600 mb-4">The KOL you're looking for doesn't exist.</p>
        <Button onClick={() => router.push("/kol/marketplace")}>Back to Marketplace</Button>
      </div>
    );
  }

  // 使用 API 数据或 fallback 到本地数据
  const displayData = kolInfo || (kol ? {
    id: parseInt(kol.id),
    user_id: 0,
    display_name: kol.name,
    description: "Leading voice in blockchain and Web3 technology.",
    country: "Singapore",
    status: 'approved' as const,
    languages: [{ language_code: 'en', language_name: 'English' }],
    tags: kol.tags.map(t => ({ tag: t.name })),
    stats: {
      total_followers: parseInt(kol.follower_all.replace(/[^0-9]/g, '')) * 1000000,
      tiktok_followers: 2800000,
      youtube_subscribers: 1200000,
      x_followers: 890000,
      discord_members: 0,
      tiktok_avg_views: 850000,
      engagement_rate: 0.048,
    },
    created_at: "2020-01-01",
    updated_at: "2024-01-01",
  } : null);

  if (!displayData) {
    return null;
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
      value: displayData.stats ? `${(displayData.stats.total_followers / 1000000).toFixed(1)}M` : "N/A",
      icon: Users,
      gradient: "from-blue-500 to-blue-600",
      bgGradient: "from-blue-50 to-blue-100",
      change: "+12.5%",
    },
    {
      title: "TikTok Followers",
      value: displayData.stats ? `${(displayData.stats.tiktok_followers / 1000000).toFixed(1)}M` : "N/A",
      icon: TrendingUp,
      gradient: "from-purple-500 to-purple-600",
      bgGradient: "from-purple-50 to-purple-100",
      change: "+8.2%",
    },
    {
      title: "Avg. Likes",
      value: displayData.stats?.tiktok_avg_views ? `${((displayData.stats.tiktok_avg_views * 0.05) / 1000).toFixed(0)}K` : "N/A",
      icon: Heart,
      gradient: "from-pink-500 to-pink-600",
      bgGradient: "from-pink-50 to-pink-100",
      change: "+15.3%",
    },
    {
      title: "Avg. Views",
      value: displayData.stats ? `${(displayData.stats.tiktok_avg_views / 1000).toFixed(0)}K` : "N/A",
      icon: Eye,
      gradient: "from-green-500 to-green-600",
      bgGradient: "from-green-50 to-green-100",
      change: "+10.8%",
    },
  ];

  const platformStats = [
    { 
      platform: "TikTok", 
      followers: displayData.stats ? `${(displayData.stats.tiktok_followers / 1000000).toFixed(1)}M` : "N/A",
      engagement: displayData.stats ? `${(displayData.stats.engagement_rate * 100).toFixed(1)}%` : "N/A",
    },
    { 
      platform: "YouTube", 
      followers: displayData.stats ? `${(displayData.stats.youtube_subscribers / 1000000).toFixed(1)}M` : "N/A",
      engagement: "4.1%",
    },
    { 
      platform: "X (Twitter)", 
      followers: displayData.stats ? `${(displayData.stats.x_followers / 1000).toFixed(0)}K` : "N/A",
      engagement: "3.8%",
    },
  ];

  return (
    <div className="space-y-6">
      {/* KOL 头部卡片 - 整合统计数据 */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 border border-white shadow-xl">
        {/* 顶部装饰 */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl -z-0"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-tr from-pink-400/20 to-blue-400/20 rounded-full blur-3xl -z-0"></div>
        
        <div className="relative z-10 p-6">
          {/* 顶部信息区 */}
          <div className="flex flex-col lg:flex-row gap-6 mb-6">
            {/* 左侧：头像和基本信息 */}
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <Avatar className="h-24 w-24 border-4 border-white shadow-2xl">
                  <AvatarImage
                    src={displayData.avatar_url || `https://randomuser.me/api/portraits/men/${displayData.id}.jpg`}
                    alt={displayData.display_name}
                  />
                  <AvatarFallback className="bg-gradient-to-br from-blue-600 to-blue-700 text-white text-2xl font-bold">
                    {displayData.display_name.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h1 className="text-3xl font-bold text-gray-900">{displayData.display_name}</h1>
                  {displayData.status === 'approved' && (
                    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg">
                      <CheckCircle2 className="h-3.5 w-3.5 text-white" />
                    </div>
                  )}
                </div>
                <p className="text-gray-600 mb-3 text-base">{displayData.description || extraData.bio}</p>
                
                <div className="flex flex-wrap gap-2 mb-3">
                  {displayData.tags.map((tag, idx) => (
                    <Badge
                      key={idx}
                      className="bg-white/80 backdrop-blur-sm text-blue-700 border border-blue-200/50 hover:bg-white transition-colors px-2.5 py-0.5 text-xs"
                    >
                      {tag.tag}
                    </Badge>
                  ))}
                </div>

                <div className="flex flex-wrap gap-3 text-xs text-gray-600 mb-3">
                  {displayData.country && (
                    <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/60 backdrop-blur-sm">
                      <MapPin className="h-3.5 w-3.5" />
                      {displayData.country}
                    </span>
                  )}
                  {displayData.created_at && (
                    <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/60 backdrop-blur-sm">
                      <Calendar className="h-3.5 w-3.5" />
                      Joined {new Date(displayData.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                    </span>
                  )}
                  {displayData.languages.length > 0 && (
                    <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/60 backdrop-blur-sm">
                      <Languages className="h-3.5 w-3.5" />
                      {displayData.languages.map(l => l.language_name).join(", ")}
                    </span>
                  )}
                </div>

                {/* 社交链接 */}
                {(displayData.tiktok_url || displayData.youtube_url || displayData.x_url) && (
                  <div className="flex gap-2">
                    {displayData.tiktok_url && (
                      <a 
                        href={displayData.tiktok_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="p-2 rounded-lg bg-white/80 backdrop-blur-sm hover:bg-white border border-gray-200/50 transition-all hover:scale-110 shadow-sm"
                      >
                        <Globe className="h-3.5 w-3.5 text-gray-600" />
                      </a>
                    )}
                    {displayData.youtube_url && (
                      <a 
                        href={displayData.youtube_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="p-2 rounded-lg bg-white/80 backdrop-blur-sm hover:bg-white border border-gray-200/50 transition-all hover:scale-110 shadow-sm"
                      >
                        <Youtube className="h-3.5 w-3.5 text-red-600" />
                      </a>
                    )}
                    {displayData.x_url && (
                      <a 
                        href={displayData.x_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="p-2 rounded-lg bg-white/80 backdrop-blur-sm hover:bg-white border border-gray-200/50 transition-all hover:scale-110 shadow-sm"
                      >
                        <Twitter className="h-3.5 w-3.5 text-blue-600" />
                      </a>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* 右侧：操作按钮 */}
            <div className="flex flex-col gap-2 lg:ml-auto">
              <Button 
                onClick={() => setShowPricingModal(true)}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 rounded-xl shadow-lg hover:shadow-xl transition-all h-11 px-6"
              >
                <Sparkles className="mr-2 h-4 w-4" />
                下单
              </Button>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={() => setIsFavorite(!isFavorite)}
                  className={`rounded-xl bg-white/80 backdrop-blur-sm border-gray-200/50 hover:bg-white h-11 w-11 transition-all ${isFavorite ? 'text-yellow-500 border-yellow-300' : ''}`}
                >
                  <Star className={`h-4 w-4 ${isFavorite ? 'fill-yellow-500' : ''}`} />
                </Button>
                <Button variant="outline" className="rounded-xl bg-white/80 backdrop-blur-sm border-gray-200/50 hover:bg-white h-11 px-4 flex-1">
                  <Share2 className="mr-2 h-4 w-4" />
                  分享
                </Button>
              </div>
            </div>
          </div>

          {/* 底部：统计数据栏 */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 pt-5 border-t border-white/60">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div
                  key={index}
                  className="group relative"
                >
                  <div className="flex items-center gap-2.5 p-3 rounded-xl bg-white/60 backdrop-blur-sm border border-white/80 hover:bg-white hover:shadow-lg transition-all duration-300">
                    <div className={`flex-shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br ${stat.gradient} flex items-center justify-center shadow-md group-hover:scale-110 transition-transform`}>
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-500 mb-0.5">{stat.title}</p>
                      <p className="text-xl font-bold text-gray-900">{stat.value}</p>
                      <div className="flex items-center gap-1">
                        <ArrowUpRight className="h-2.5 w-2.5 text-green-600" />
                        <span className="text-xs font-semibold text-green-600">{stat.change}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
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
              {loadingVideos ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-3"></div>
                    <p className="text-gray-600 text-sm">加载视频中...</p>
                  </div>
                </div>
              ) : kolVideos.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {kolVideos.map((video) => (
                    <KolVideoCard 
                      key={video.id} 
                      video={video}
                      onClick={() => {
                        setPlayingVideo(video);
                        setShowVideoPlayerModal(true);
                      }}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Play className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">暂无视频</h3>
                  <p className="text-gray-600">该KOL还没有上传视频作品</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="stats" className="mt-6">
              <Card className="border-0 shadow-sm">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {platformStats.map((platform, index) => (
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

        {/* 右侧：Need Help */}
        <div className="space-y-6">
          <Card className="border-0 shadow-sm bg-gradient-to-br from-gray-900 to-gray-800 text-white">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-2">需要帮助？</h3>
              <p className="text-sm text-gray-300 mb-4">
                联系我们的团队获取个性化的营销策略方案
              </p>
              <Button variant="outline" className="w-full bg-white text-gray-900 hover:bg-gray-100 rounded-xl">
                联系客服
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Video Player Modal */}
      <VideoPlayerModal
        open={showVideoPlayerModal}
        onOpenChange={setShowVideoPlayerModal}
        embedCode={playingVideo?.embed_code || ""}
        createdAt={playingVideo?.created_at}
      />

      {/* 报价选择 Modal */}
      <Dialog open={showPricingModal} onOpenChange={setShowPricingModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">选择报价方案</DialogTitle>
            <DialogDescription>
              请选择一个适合您需求的报价方案，然后填写订单详情
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 mt-4">
            {loadingPlans ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto mb-3"></div>
                  <p className="text-gray-600 text-sm">加载报价中...</p>
                </div>
              </div>
            ) : kolPlans.length > 0 ? (
              kolPlans.map((plan) => (
                <div
                  key={plan.id}
                  onClick={() => {
                    // 跳转到下单页面，并传递选择的报价
                    router.push(`/kol/orders/create?kol_id=${kolId}&plan_id=${plan.id}`);
                  }}
                  className={`group relative p-5 rounded-2xl border-2 transition-all cursor-pointer hover:shadow-lg ${
                    plan.plan_type === 'standard'
                      ? "border-blue-500 bg-gradient-to-br from-blue-50 to-purple-50"
                      : "border-gray-200 hover:border-blue-300 bg-white"
                  }`}
                >
                  {plan.plan_type === 'standard' && (
                    <div className="absolute -top-3 left-4">
                      <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0 shadow-md">
                        🔥 最受欢迎
                      </Badge>
                    </div>
                  )}
                  
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900 mb-1">{plan.title}</h3>
                      <p className="text-sm text-gray-600">{plan.description}</p>
                    </div>
                    <div className="text-right ml-4">
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-bold text-gray-900">${plan.price}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                    <span className="text-sm text-gray-500">点击选择此方案</span>
                    <ArrowUpRight className="h-5 w-5 text-blue-600 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <Sparkles className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">暂无报价方案</h3>
                <p className="text-gray-600">该 KOL 还没有设置报价方案</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// KOL Video Card Component
function KolVideoCard({ 
  video, 
  onClick 
}: { 
  video: KolVideo;
  onClick: () => void;
}) {
  return (
    <div 
      className="relative group cursor-pointer"
      onClick={onClick}
    >
      {/* 封面图片容器 */}
      <div className="relative w-full aspect-[9/16] bg-gray-100 rounded-lg overflow-hidden">
        {video.cover_url ? (
          <>
            <img
              src={video.cover_url}
              alt="视频封面"
              className="w-full h-full object-cover"
            />
            {/* 播放按钮 */}
            <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/40 transition-all duration-300">
              <div className="w-16 h-16 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <Play className="h-8 w-8 text-blue-600 ml-1" fill="currentColor" />
              </div>
            </div>
          </>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 bg-gray-50">
            <Video className="h-12 w-12 mb-2" />
            <span className="text-sm">TikTok 视频</span>
          </div>
        )}
      </div>
      
      {/* 悬浮信息条 - 只在 hover 时显示 */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none rounded-b-lg">
        <div className="flex items-center justify-between text-white">
          <Badge className="bg-white/20 text-white border-0 backdrop-blur-sm">
            TikTok
          </Badge>
          <span className="text-xs">
            {new Date(video.created_at).toLocaleDateString('zh-CN', { 
              month: 'short', 
              day: 'numeric' 
            })}
          </span>
        </div>
      </div>
    </div>
  );
}

