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
  Edit2,
  Plus,
  Trash2,
  Video,
  DollarSign,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { getIconContainer, cardStyles } from "@/lib/design-system";
import { 
  getKolInfo, 
  getKolVideos, 
  getKolPlans, 
  KolInfo, 
  KolVideo, 
  KolPlan,
  createKolVideo,
  updateKolVideo,
  deleteKolVideo,
  saveKolPlan,
  deleteKolPlan,
  CreateKolVideoReq,
  UpdateKolVideoReq,
  SaveKolPlanReq,
} from "@/lib/api/kol";
import { isSuccessResponse } from "@/lib/api-client";
import { TikTokEmbed } from "@/components/kol/tiktok-embed";
import { VideoPlayerModal } from "@/components/kol/video-player-modal";
import { EditProfileModal } from "@/components/kol/edit-profile-modal";
import { useAuth } from "@/contexts/auth-context";
import { toast } from "@/hooks/use-toast";
import kolData from "../../data.json";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2, Save } from "lucide-react";
import { CoverUploadDialog } from "@/components/kol/cover-upload-dialog";
import { TikTokVideoPreview } from "@/components/kol/tiktok-embed";
import { getDictionaryTree, DictionaryItemInfo } from "@/lib/api/dictionary";
import { DictionaryText } from "@/components/common/dictionary-text";

export default function KOLDetail() {
  const params = useParams();
  const router = useRouter();
  const kolId = params.id as string;
  const { user, isLoggedIn } = useAuth();

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
  
  // 编辑功能相关状态
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [editingVideo, setEditingVideo] = useState<KolVideo | null>(null);
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState<KolPlan | null>(null);

  // 判断是否是本人访问
  const isOwner = isLoggedIn && user?.kol_info?.id === kolInfo?.id;

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

  const handleDeleteVideo = async (video: KolVideo) => {
    if (!confirm("确定要删除这个视频吗？")) return;
    
    try {
      await deleteKolVideo({ video_id: video.id });
      toast({
        title: "删除成功",
        description: "视频已删除",
      });
      loadKolVideos();
    } catch (err) {
      toast({
        variant: "error",
        title: "删除失败",
        description: "请重试",
      });
    }
  };

  const handleDeletePlan = async (plan: KolPlan) => {
    if (!confirm("确定要删除这个定价方案吗？")) return;
    
    try {
      await deleteKolPlan({ plan_id: plan.id });
      toast({
        title: "删除成功",
        description: "定价方案已删除",
      });
      loadKolPlans();
    } catch (err) {
      toast({
        variant: "error",
        title: "删除失败",
        description: "请重试",
      });
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
        <p className="text-gray-600 mb-4">The KOL you&apos;re looking for doesn&apos;t exist.</p>
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
                <p className="text-gray-600 mb-3 text-base">{displayData.description}</p>
                
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
                      <DictionaryText 
                        dictionaryCode="COUNTRY" 
                        code={displayData.country} 
                        fallback={displayData.country} 
                      />
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
                      {displayData.languages.map((l, idx) => (
                        <React.Fragment key={l.language_code}>
                          {idx > 0 && ", "}
                          <DictionaryText 
                            dictionaryCode="LANGUAGE" 
                            code={l.language_code} 
                            fallback={l.language_name} 
                          />
                        </React.Fragment>
                      ))}
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
              {isOwner ? (
                // 如果是本人，显示编辑按钮
                <Button 
                  onClick={() => setShowEditProfileModal(true)}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 rounded-xl shadow-lg hover:shadow-xl transition-all h-11 px-6"
                >
                  <Edit2 className="mr-2 h-4 w-4" />
                  编辑资料
                </Button>
              ) : (
                // 如果不是本人，显示下单按钮
                <Button 
                  onClick={() => setShowPricingModal(true)}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 rounded-xl shadow-lg hover:shadow-xl transition-all h-11 px-6"
                >
                  <Sparkles className="mr-2 h-4 w-4" />
                  下单
                </Button>
              )}
              {!isOwner && (
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
              )}
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
        {/* 左侧：视频作品 */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>最近发布的视频</CardTitle>
                {isOwner && (
                  <Button
                    onClick={() => {
                      setEditingVideo(null);
                      setShowVideoModal(true);
                    }}
                    size="sm"
                    className="bg-gradient-to-r from-blue-600 to-blue-700"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    添加视频
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
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
                      isOwner={isOwner}
                      onClick={() => {
                        setPlayingVideo(video);
                        setShowVideoPlayerModal(true);
                      }}
                      onEdit={() => {
                        setEditingVideo(video);
                        setShowVideoModal(true);
                      }}
                      onDelete={() => handleDeleteVideo(video)}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Video className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {isOwner ? "还没有视频" : "暂无视频"}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {isOwner ? "开始添加您的视频作品吧" : "该KOL还没有上传视频作品"}
                  </p>
                  {isOwner && (
                    <Button
                      onClick={() => {
                        setEditingVideo(null);
                        setShowVideoModal(true);
                      }}
                      variant="outline"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      添加第一个视频
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* 右侧：报价和帮助 */}
        <div className="space-y-6">
          {/* 报价卡片 */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>报价方案</CardTitle>
                {isOwner && (
                  <Button
                    onClick={() => {
                      setEditingPlan(null);
                      setShowPlanModal(true);
                    }}
                    size="sm"
                    variant="outline"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {loadingPlans ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                </div>
              ) : kolPlans.length > 0 ? (
                <div className="space-y-3">
                  {kolPlans.map((plan) => (
                    <PricingPlanCard
                      key={plan.id}
                      plan={plan}
                      isOwner={isOwner}
                      onEdit={() => {
                        setEditingPlan(plan);
                        setShowPlanModal(true);
                      }}
                      onDelete={() => handleDeletePlan(plan)}
                      onClick={() => {
                        if (!isOwner) {
                          router.push(`/kol/orders/create?kol_id=${kolId}&plan_id=${plan.id}`);
                        }
                      }}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <DollarSign className="h-10 w-10 text-gray-400 mx-auto mb-3" />
                  <p className="text-sm text-gray-600 mb-3">
                    {isOwner ? "还没有报价方案" : "暂无报价"}
                  </p>
                  {isOwner && (
                    <Button
                      onClick={() => {
                        setEditingPlan(null);
                        setShowPlanModal(true);
                      }}
                      variant="outline"
                      size="sm"
                    >
                      <Plus className="mr-2 h-3 w-3" />
                      添加报价
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* 帮助卡片 */}
          {!isOwner && (
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
          )}
        </div>
      </div>

      {/* Video Player Modal */}
      <VideoPlayerModal
        open={showVideoPlayerModal}
        onOpenChange={setShowVideoPlayerModal}
        embedCode={playingVideo?.embed_code || ""}
        createdAt={playingVideo?.created_at}
      />

      {/* 报价选择 Modal（非本人访问时） */}
      {!isOwner && (
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
      )}

      {/* 编辑资料 Modal */}
      {isOwner && kolInfo && (
        <EditProfileModal
          open={showEditProfileModal}
          onOpenChange={setShowEditProfileModal}
          kolInfo={kolInfo}
          onSuccess={loadKolData}
        />
      )}

      {/* 视频编辑 Modal */}
      {isOwner && (
        <VideoModal
          open={showVideoModal}
          onOpenChange={setShowVideoModal}
          video={editingVideo}
          onSave={async (videoData) => {
            try {
              if ('video_id' in videoData) {
                await updateKolVideo(videoData);
              } else {
                await createKolVideo(videoData);
              }
              toast({
                title: "保存成功",
                description: "视频已保存",
              });
              setShowVideoModal(false);
              loadKolVideos();
            } catch (err) {
              toast({
                variant: "error",
                title: "保存失败",
                description: "请重试",
              });
            }
          }}
        />
      )}

      {/* 报价编辑 Modal */}
      {isOwner && (
        <PlanModal
          open={showPlanModal}
          onOpenChange={setShowPlanModal}
          plan={editingPlan}
          onSave={async (planData) => {
            try {
              await saveKolPlan(planData);
              toast({
                title: "保存成功",
                description: "定价方案已保存",
              });
              setShowPlanModal(false);
              loadKolPlans();
            } catch (err) {
              toast({
                variant: "error",
                title: "保存失败",
                description: "请重试",
              });
            }
          }}
        />
      )}
    </div>
  );
}

// KOL Video Card Component
function KolVideoCard({ 
  video, 
  isOwner,
  onClick,
  onEdit,
  onDelete,
}: { 
  video: KolVideo;
  isOwner: boolean;
  onClick: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}) {
  return (
    <div className="relative group">
      {/* 封面图片容器 */}
      <div 
        className="relative w-full aspect-[9/16] bg-gray-100 rounded-lg overflow-hidden cursor-pointer"
        onClick={onClick}
      >
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
      
      {/* 操作按钮 - 只有本人可见 */}
      {isOwner && onEdit && onDelete && (
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex gap-1">
          <Button
            size="sm"
            variant="secondary"
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
            className="bg-white/90 hover:bg-white h-7 w-7 p-0"
          >
            <Edit2 className="h-3 w-3" />
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="bg-red-500/90 hover:bg-red-600 text-white h-7 w-7 p-0"
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      )}
    </div>
  );
}

// Pricing Plan Card Component
function PricingPlanCard({
  plan,
  isOwner,
  onEdit,
  onDelete,
  onClick,
}: {
  plan: KolPlan;
  isOwner: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
  onClick?: () => void;
}) {
  return (
    <div
      className={`group relative p-4 rounded-lg border transition-all ${
        isOwner ? 'border-gray-200' : 'border-gray-200 hover:border-blue-300 cursor-pointer hover:shadow-md'
      }`}
      onClick={!isOwner ? onClick : undefined}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-semibold text-gray-900">{plan.title}</h4>
            <Badge variant="secondary" className="text-xs">
              <DictionaryText dictionaryCode="KOL_PLAN_TYPE" code={plan.plan_type} fallback={plan.plan_type} />
            </Badge>
          </div>
          <p className="text-sm text-gray-600">{plan.description}</p>
        </div>
        {isOwner && onEdit && onDelete && (
          <div className="flex gap-1 ml-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
              className="h-7 w-7 p-0"
            >
              <Edit2 className="h-3 w-3" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="h-7 w-7 p-0 text-red-600 hover:text-red-700"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        )}
      </div>
      <p className="text-2xl font-bold text-blue-600">${plan.price}</p>
      {!isOwner && (
        <div className="flex items-center justify-end mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <span className="text-xs text-blue-600">选择 →</span>
        </div>
      )}
    </div>
  );
}

// Video Modal Component (从 profile 页面复制)
function VideoModal({
  open,
  onOpenChange,
  video,
  onSave,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  video: KolVideo | null;
  onSave: (data: CreateKolVideoReq | UpdateKolVideoReq) => Promise<void>;
}) {
  const [embedCode, setEmbedCode] = useState("");
  const [coverUrl, setCoverUrl] = useState("");
  const [showCoverSelector, setShowCoverSelector] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (video) {
      setEmbedCode(video.embed_code);
      setCoverUrl(video.cover_url || "");
    } else {
      setEmbedCode("");
      setCoverUrl("");
    }
  }, [video, open]);

  const handleSave = async () => {
    if (!embedCode.trim()) {
      toast({
        variant: "error",
        title: "信息不完整",
        description: "请输入TikTok视频的嵌入代码",
      });
      return;
    }

    if (!coverUrl.trim()) {
      toast({
        variant: "error",
        title: "信息不完整",
        description: "请上传视频封面图片",
      });
      return;
    }

    setSaving(true);
    try {
      if (video) {
        await onSave({ video_id: video.id, embed_code: embedCode, cover_url: coverUrl });
      } else {
        await onSave({ embed_code: embedCode, cover_url: coverUrl });
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>{video ? "编辑视频" : "添加视频"}</DialogTitle>
          <DialogDescription>
            粘贴TikTok视频的嵌入代码来添加到您的作品集
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4 overflow-y-auto flex-1 min-h-0">
          {/* 视频封面 */}
          <div>
            <Label>视频封面 *</Label>
            <div className="mt-2">
              {coverUrl ? (
                <div className="relative inline-block">
                  <img
                    src={coverUrl}
                    alt="视频封面"
                    className="w-48 h-48 object-cover rounded-lg border-2 border-gray-200"
                  />
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => setShowCoverSelector(true)}
                    className="mt-2"
                  >
                    更换封面
                  </Button>
                </div>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowCoverSelector(true)}
                  className="w-48 h-48 border-2 border-dashed border-gray-300 hover:border-blue-500 flex flex-col items-center justify-center gap-2"
                >
                  <Plus className="h-8 w-8 text-gray-400" />
                  <span className="text-sm text-gray-600">上传视频封面</span>
                </Button>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              建议尺寸: 9:16 竖版图片，用于列表展示
            </p>
          </div>

          {/* TikTok 嵌入代码 */}
          <div>
            <Label htmlFor="embed_code">TikTok 嵌入代码 *</Label>
            <Textarea
              id="embed_code"
              value={embedCode}
              onChange={(e) => setEmbedCode(e.target.value)}
              placeholder='粘贴完整的TikTok嵌入代码...'
              rows={8}
              className="mt-1.5 font-mono text-xs"
            />
            <p className="text-xs text-gray-500 mt-2">
              💡 如何获取嵌入代码：打开TikTok视频页面 → 点击分享 → 选择&ldquo;嵌入&rdquo; → 复制完整代码
            </p>
          </div>

          {/* 预览 */}
          {embedCode && (
            <div className="border-t pt-4">
              <Label className="mb-2 block">视频预览</Label>
              <TikTokVideoPreview embedCode={embedCode} />
            </div>
          )}
        </div>

        <DialogFooter className="flex-shrink-0">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            取消
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-gradient-to-r from-blue-600 to-blue-700"
          >
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                保存中...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                保存视频
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>

      {/* 封面上传对话框 */}
      <CoverUploadDialog
        open={showCoverSelector}
        onOpenChange={setShowCoverSelector}
        onConfirm={(url: string) => {
          setCoverUrl(url);
          setShowCoverSelector(false);
        }}
      />
    </Dialog>
  );
}

// Plan Modal Component (从 profile 页面复制)
function PlanModal({
  open,
  onOpenChange,
  plan,
  onSave,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  plan: KolPlan | null;
  onSave: (data: SaveKolPlanReq) => Promise<void>;
}) {
  const [formData, setFormData] = useState<SaveKolPlanReq>({
    title: "",
    description: "",
    price: 0,
    plan_type: "standard",
  });
  const [saving, setSaving] = useState(false);
  const [planTypes, setPlanTypes] = useState<DictionaryItemInfo[]>([]);

  // 加载报价类型字典
  useEffect(() => {
    if (open) {
      getDictionaryTree({ dictionary_code: 'KOL_PLAN_TYPE', only_enabled: 1 })
        .then((result) => {
          if (isSuccessResponse(result.base_resp) && result.tree) {
            setPlanTypes(result.tree);
          }
        })
        .catch((error) => {
          console.error('Failed to load plan types:', error);
        });
    }
  }, [open]);

  useEffect(() => {
    if (plan) {
      setFormData({
        id: plan.id,
        title: plan.title,
        description: plan.description,
        price: plan.price,
        plan_type: plan.plan_type,
      });
    } else {
      setFormData({
        title: "",
        description: "",
        price: 0,
        plan_type: "standard",
      });
    }
  }, [plan, open]);

  const handleSave = async () => {
    if (!formData.title || !formData.description || formData.price <= 0) {
      toast({
        variant: "error",
        title: "信息不完整",
        description: "请填写所有必填字段，价格必须大于0",
      });
      return;
    }

    setSaving(true);
    try {
      await onSave(formData);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>{plan ? "编辑报价" : "添加报价"}</DialogTitle>
          <DialogDescription>
            为您的服务创建定价方案
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4 overflow-y-auto flex-1 min-h-0">
          <div>
            <Label>方案类型 *</Label>
            <select
              value={formData.plan_type}
              onChange={(e) => setFormData(prev => ({ ...prev, plan_type: e.target.value as 'basic' | 'standard' | 'premium' }))}
              className="w-full mt-1.5 px-3 py-2 border border-gray-300 rounded-md"
            >
              {planTypes.length > 0 ? (
                planTypes.map((type) => (
                  <option key={type.code} value={type.code}>
                    {type.name}
                  </option>
                ))
              ) : (
                <>
                  <option value="basic">Basic</option>
                  <option value="standard">Standard</option>
                  <option value="premium">Premium</option>
                </>
              )}
            </select>
          </div>

          <div>
            <Label>标题 *</Label>
            <Input
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="例如：30-60秒视频"
              className="mt-1.5"
            />
          </div>

          <div>
            <Label>描述 *</Label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="描述此方案包含的内容"
              rows={3}
              className="mt-1.5"
            />
          </div>

          <div>
            <Label>价格 (USD) *</Label>
            <Input
              type="number"
              step="0.01"
              value={formData.price}
              onChange={(e) => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
              placeholder="0.00"
              className="mt-1.5"
            />
          </div>
        </div>

        <DialogFooter className="flex-shrink-0">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            取消
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-gradient-to-r from-blue-600 to-blue-700"
          >
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                保存中...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                保存
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
