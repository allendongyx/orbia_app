"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  User,
  Globe,
  Video,
  DollarSign,
  Save,
  Loader2,
  Plus,
  Edit2,
  Trash2,
  ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  getKolInfo,
  updateKolInfo,
  getKolVideos,
  createKolVideo,
  updateKolVideo,
  deleteKolVideo,
  getKolPlans,
  saveKolPlan,
  deleteKolPlan,
  KolInfo,
  KolVideo,
  KolPlan,
  UpdateKolInfoReq,
  CreateKolVideoReq,
  UpdateKolVideoReq,
  SaveKolPlanReq,
} from "@/lib/api/kol";
import { isSuccessResponse } from "@/lib/api-client";
import { useAuth } from "@/contexts/auth-context";
import { toast } from "@/hooks/use-toast";
import LocationSelector from "@/components/common/location-selector";
import LanguageSelector from "@/components/common/language-selector";
import { AvatarSelector } from "@/components/auth/avatar-selector";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle2, Clock, XCircle, AlertCircle, Play } from "lucide-react";
import { TikTokEmbed, TikTokVideoPreview } from "@/components/kol/tiktok-embed";
import { VideoPlayerModal } from "@/components/kol/video-player-modal";
import { CoverUploadDialog } from "@/components/kol/cover-upload-dialog";

export default function KOLProfilePage() {
  const router = useRouter();
  const { user, isLoggedIn, isLoading: authLoading, refreshUser } = useAuth();
  const [activeTab, setActiveTab] = useState("basic");
  
  // KOL Info State
  const kolInfo = user?.kol_info || null;
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showAvatarSelector, setShowAvatarSelector] = useState(false);
  
  // Basic Info Form (country 作为数组使用)
  const [formData, setFormData] = useState({
    display_name: "",
    description: "",
    country: [] as string[],
    avatar_url: "",
    language_codes: [] as string[],
    language_names: [] as string[],
    tags: [] as string[],
  });
  
  // Social Links Form
  const [socialLinks, setSocialLinks] = useState({
    tiktok_url: "",
    youtube_url: "",
    x_url: "",
    discord_url: "",
  });
  
  // Videos State
  const [videos, setVideos] = useState<KolVideo[]>([]);
  const [loadingVideos, setLoadingVideos] = useState(false);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [editingVideo, setEditingVideo] = useState<KolVideo | null>(null);
  const [showVideoPlayerModal, setShowVideoPlayerModal] = useState(false);
  const [playingVideo, setPlayingVideo] = useState<KolVideo | null>(null);
  
  // Plans State
  const [plans, setPlans] = useState<KolPlan[]>([]);
  const [loadingPlans, setLoadingPlans] = useState(false);
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState<KolPlan | null>(null);
  
  // Tags Input
  const [tagInput, setTagInput] = useState("");

  // 初始化表单数据
  useEffect(() => {
    if (authLoading) return;

    if (!isLoggedIn) {
      router.push("/kol/marketplace");
      return;
    }

    if (!kolInfo) {
      // 没有 KOL 信息，跳转到市场页面
      router.push("/kol/marketplace");
      return;
    }

    // 填充表单数据
    setFormData({
      display_name: kolInfo.display_name,
      description: kolInfo.description || "",
      country: kolInfo.country ? [kolInfo.country] : [],
      avatar_url: kolInfo.avatar_url || "",
      language_codes: kolInfo.languages?.map(l => l.language_code) || [],
      language_names: kolInfo.languages?.map(l => l.language_name) || [],
      tags: kolInfo.tags?.map(t => t.tag) || [],
    });
    
    setSocialLinks({
      tiktok_url: kolInfo.tiktok_url || "",
      youtube_url: kolInfo.youtube_url || "",
      x_url: kolInfo.x_url || "",
      discord_url: kolInfo.discord_url || "",
    });

    // 加载视频和 Plans
    loadVideos();
    loadPlans();
  }, [authLoading, isLoggedIn, kolInfo]);

  const loadVideos = async () => {
    setLoadingVideos(true);
    try {
      const result = await getKolVideos({});
      if (isSuccessResponse(result.base_resp)) {
        setVideos(result.videos);
      }
    } catch (err) {
      console.error("Failed to load videos:", err);
    } finally {
      setLoadingVideos(false);
    }
  };

  const loadPlans = async () => {
    setLoadingPlans(true);
    try {
      const result = await getKolPlans({});
      if (isSuccessResponse(result.base_resp)) {
        setPlans(result.plans);
      }
    } catch (err) {
      console.error("Failed to load plans:", err);
    } finally {
      setLoadingPlans(false);
    }
  };

  const handleSaveBasicInfo = async () => {
    setSaving(true);
    try {
      // 转换数据：country 从数组转为字符串
      const submitData: UpdateKolInfoReq = {
        ...formData,
        country: formData.country[0] || "",
      };
      
      const result = await updateKolInfo(submitData);
      if (isSuccessResponse(result.base_resp)) {
        toast({
          title: "更新成功",
          description: "个人资料已更新",
        });
        // 刷新用户信息
        await refreshUser();
      } else {
        toast({
          variant: "error",
          title: "更新失败",
          description: result.base_resp.message || "请重试",
        });
      }
    } catch (err) {
      toast({
        variant: "error",
        title: "更新失败",
        description: err instanceof Error ? err.message : "请重试",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSaveSocialLinks = async () => {
    setSaving(true);
    try {
      const result = await updateKolInfo(socialLinks);
      if (isSuccessResponse(result.base_resp)) {
        toast({
          title: "更新成功",
          description: "社交媒体链接已更新",
        });
        // 刷新用户信息
        await refreshUser();
      } else {
        toast({
          variant: "error",
          title: "更新失败",
          description: result.base_resp.message || "请重试",
        });
      }
    } catch (err) {
      toast({
        variant: "error",
        title: "更新失败",
        description: err instanceof Error ? err.message : "请重试",
      });
    } finally {
      setSaving(false);
    }
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()],
      }));
      setTagInput("");
    }
  };

  const removeTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag),
    }));
  };


  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!kolInfo) {
    return null;
  }

  // 获取状态 Badge
  const getStatusBadge = () => {
    switch (kolInfo.status) {
      case 'approved':
        return (
          <Badge className="bg-green-100 text-green-700 border-0 gap-1">
            <CheckCircle2 className="h-3 w-3" />
            Approved
          </Badge>
        );
      case 'pending':
        return (
          <Badge className="bg-yellow-100 text-yellow-700 border-0 gap-1">
            <Clock className="h-3 w-3" />
            Under Review
          </Badge>
        );
      case 'rejected':
        return (
          <Badge className="bg-red-100 text-red-700 border-0 gap-1">
            <XCircle className="h-3 w-3" />
            Rejected
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => router.push("/kol/marketplace")}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Marketplace
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">KOL Management</h1>
            <p className="text-sm text-gray-600">Manage your profile, videos, and pricing plans</p>
          </div>
        </div>
        {getStatusBadge()}
      </div>

      {/* Status Alert */}
      {kolInfo.status === 'pending' && (
        <Alert className="border-yellow-200 bg-yellow-50">
          <Clock className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-800">
            Your KOL application is currently under review. We'll notify you once it's been processed.
          </AlertDescription>
        </Alert>
      )}
      
      {kolInfo.status === 'rejected' && kolInfo.reject_reason && (
        <Alert className="border-red-200 bg-red-50">
          <XCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <strong>Application Rejected:</strong> {kolInfo.reject_reason}
          </AlertDescription>
        </Alert>
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-gray-100 p-1 rounded-xl">
          <TabsTrigger value="basic" className="rounded-lg">
            <User className="h-4 w-4 mr-2" />
            Basic Info
          </TabsTrigger>
          <TabsTrigger value="social" className="rounded-lg">
            <Globe className="h-4 w-4 mr-2" />
            Social Links
          </TabsTrigger>
          <TabsTrigger value="videos" className="rounded-lg">
            <Video className="h-4 w-4 mr-2" />
            Videos
          </TabsTrigger>
          <TabsTrigger value="plans" className="rounded-lg">
            <DollarSign className="h-4 w-4 mr-2" />
            Pricing Plans
          </TabsTrigger>
        </TabsList>

        {/* Basic Info Tab */}
        <TabsContent value="basic" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>
                Update your display name, description, and other basic details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="display_name">Display Name *</Label>
                <Input
                  id="display_name"
                  value={formData.display_name}
                  onChange={(e) =>
                    setFormData(prev => ({ ...prev, display_name: e.target.value }))
                  }
                  className="mt-1.5"
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData(prev => ({ ...prev, description: e.target.value }))
                  }
                  rows={4}
                  className="mt-1.5"
                />
              </div>

              <div>
                <Label htmlFor="country">Country *</Label>
                <div className="mt-1.5">
                  <LocationSelector
                    value={formData.country}
                    onChange={(value) =>
                      setFormData(prev => ({ ...prev, country: value.slice(0, 1) }))
                    }
                    placeholder="Select your country"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Please select only one country
                  </p>
                </div>
              </div>

              <div>
                <Label htmlFor="avatar_url">Avatar</Label>
                <div className="flex items-center gap-4 mt-1.5">
                  <div className="h-20 w-20 rounded-full overflow-hidden border-2 border-gray-200">
                    {formData.avatar_url ? (
                      <img
                        src={formData.avatar_url}
                        alt="Avatar"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center text-white font-semibold text-lg">
                        {formData.display_name.slice(0, 2).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowAvatarSelector(true)}
                  >
                    Change Avatar
                  </Button>
                </div>
              </div>

              <div>
                <Label htmlFor="languages">Languages *</Label>
                <LanguageSelector
                  value={formData.language_codes}
                  onChange={(codes) => {
                    // 从语言代码映射到完整的语言信息
                    const languageMap: Record<string, string> = {
                      "en": "English",
                      "es": "Spanish",
                      "fr": "French",
                      "de": "German",
                      "zh": "中文",
                      "ja": "Japanese",
                      "ko": "Korean",
                      "pt": "Portuguese",
                      "ru": "Russian",
                      "ar": "Arabic",
                      "hi": "Hindi",
                      "it": "Italian",
                      "th": "Thai",
                      "vi": "Vietnamese",
                      "id": "Indonesian",
                      "tr": "Turkish",
                    };
                    
                    setFormData(prev => ({
                      ...prev,
                      language_codes: codes,
                      language_names: codes.map(code => languageMap[code] || code),
                    }));
                  }}
                  placeholder="Select languages"
                />
              </div>

              <div>
                <Label>Tags</Label>
                <div className="flex gap-2 mt-1.5">
                  <Input
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addTag();
                      }
                    }}
                    placeholder="Add a tag..."
                  />
                  <Button type="button" onClick={addTag} variant="outline">
                    Add
                  </Button>
                </div>
                {formData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {formData.tags.map((tag) => (
                      <Badge
                        key={tag}
                        variant="secondary"
                        className="pl-3 pr-1 py-1.5 gap-1"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="ml-1 hover:bg-gray-300 rounded-full p-0.5"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-end pt-4">
                <Button
                  onClick={handleSaveBasicInfo}
                  disabled={saving}
                  className="bg-gradient-to-r from-blue-600 to-blue-700"
                >
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Social Links Tab */}
        <TabsContent value="social" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Social Media Links</CardTitle>
              <CardDescription>
                Connect your social media accounts to showcase your presence
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="tiktok_url">TikTok URL</Label>
                <Input
                  id="tiktok_url"
                  type="url"
                  value={socialLinks.tiktok_url}
                  onChange={(e) =>
                    setSocialLinks(prev => ({ ...prev, tiktok_url: e.target.value }))
                  }
                  placeholder="https://www.tiktok.com/@username"
                  className="mt-1.5"
                />
              </div>

              <div>
                <Label htmlFor="youtube_url">YouTube URL</Label>
                <Input
                  id="youtube_url"
                  type="url"
                  value={socialLinks.youtube_url}
                  onChange={(e) =>
                    setSocialLinks(prev => ({ ...prev, youtube_url: e.target.value }))
                  }
                  placeholder="https://www.youtube.com/@username"
                  className="mt-1.5"
                />
              </div>

              <div>
                <Label htmlFor="x_url">X (Twitter) URL</Label>
                <Input
                  id="x_url"
                  type="url"
                  value={socialLinks.x_url}
                  onChange={(e) =>
                    setSocialLinks(prev => ({ ...prev, x_url: e.target.value }))
                  }
                  placeholder="https://x.com/username"
                  className="mt-1.5"
                />
              </div>

              <div>
                <Label htmlFor="discord_url">Discord URL</Label>
                <Input
                  id="discord_url"
                  type="url"
                  value={socialLinks.discord_url}
                  onChange={(e) =>
                    setSocialLinks(prev => ({ ...prev, discord_url: e.target.value }))
                  }
                  placeholder="https://discord.gg/invite"
                  className="mt-1.5"
                />
              </div>

              <div className="flex justify-end pt-4">
                <Button
                  onClick={handleSaveSocialLinks}
                  disabled={saving}
                  className="bg-gradient-to-r from-blue-600 to-blue-700"
                >
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Videos Tab */}
        <TabsContent value="videos" className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Video Portfolio</CardTitle>
                  <CardDescription>
                    Showcase your best work by adding videos from your social media
                  </CardDescription>
                </div>
                <Button
                  onClick={() => {
                    setEditingVideo(null);
                    setShowVideoModal(true);
                  }}
                  className="bg-gradient-to-r from-blue-600 to-blue-700"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Video
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {loadingVideos ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : videos.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {videos.map((video) => (
                    <VideoCard
                      key={video.id}
                      video={video}
                      onPlay={(v) => {
                        setPlayingVideo(v);
                        setShowVideoPlayerModal(true);
                      }}
                      onEdit={(v) => {
                        setEditingVideo(v);
                        setShowVideoModal(true);
                      }}
                      onDelete={async (v) => {
                        if (confirm("确定要删除这个视频吗？")) {
                          try {
                            await deleteKolVideo({ video_id: v.id });
                            toast({
                              title: "删除成功",
                              description: "视频已删除",
                            });
                            loadVideos();
                          } catch (err) {
                            toast({
                              variant: "error",
                              title: "删除失败",
                              description: "请重试",
                            });
                          }
                        }
                      }}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Video className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No videos yet</h3>
                  <p className="text-gray-600 mb-4">Start building your portfolio by adding videos</p>
                  <Button
                    onClick={() => {
                      setEditingVideo(null);
                      setShowVideoModal(true);
                    }}
                    variant="outline"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Your First Video
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Pricing Plans Tab */}
        <TabsContent value="plans" className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Pricing Plans</CardTitle>
                  <CardDescription>
                    Set your pricing for different types of content
                  </CardDescription>
                </div>
                <Button
                  onClick={() => {
                    setEditingPlan(null);
                    setShowPlanModal(true);
                  }}
                  className="bg-gradient-to-r from-blue-600 to-blue-700"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Plan
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {loadingPlans ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : plans.length > 0 ? (
                <div className="space-y-3">
                  {plans.map((plan) => (
                    <PlanCard
                      key={plan.id}
                      plan={plan}
                      onEdit={(p) => {
                        setEditingPlan(p);
                        setShowPlanModal(true);
                      }}
                      onDelete={async (p) => {
                        if (confirm("确定要删除这个定价方案吗？")) {
                          try {
                            await deleteKolPlan({ plan_id: p.id });
                            toast({
                              title: "删除成功",
                              description: "定价方案已删除",
                            });
                            loadPlans();
                          } catch (err) {
                            toast({
                              variant: "error",
                              title: "删除失败",
                              description: "请重试",
                            });
                          }
                        }
                      }}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No pricing plans yet</h3>
                  <p className="text-gray-600 mb-4">Create pricing plans for your services</p>
                  <Button
                    onClick={() => {
                      setEditingPlan(null);
                      setShowPlanModal(true);
                    }}
                    variant="outline"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Your First Plan
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Video Modal */}
      <VideoModal
        open={showVideoModal}
        onOpenChange={setShowVideoModal}
        video={editingVideo}
        onSave={async (videoData) => {
          try {
            if ('video_id' in videoData) {
              // 更新视频
              await updateKolVideo(videoData);
            } else {
              // 创建视频
              await createKolVideo(videoData);
            }
            toast({
              title: "保存成功",
              description: "视频已保存",
            });
            setShowVideoModal(false);
            loadVideos();
          } catch (err) {
            toast({
              variant: "error",
              title: "保存失败",
              description: "请重试",
            });
          }
        }}
      />

      {/* Plan Modal */}
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
            loadPlans();
          } catch (err) {
            toast({
              variant: "error",
              title: "保存失败",
              description: "请重试",
            });
          }
        }}
      />

      {/* Video Player Modal */}
      <VideoPlayerModal
        open={showVideoPlayerModal}
        onOpenChange={setShowVideoPlayerModal}
        embedCode={playingVideo?.embed_code || ""}
        createdAt={playingVideo?.created_at}
      />

      {/* Avatar Selector */}
      <AvatarSelector
        open={showAvatarSelector}
        onOpenChange={setShowAvatarSelector}
        currentAvatar={formData.avatar_url}
        onAvatarChange={(avatarUrl) => {
          setFormData(prev => ({ ...prev, avatar_url: avatarUrl }));
          setShowAvatarSelector(false);
        }}
      />
    </div>
  );
}

// Video Card Component
function VideoCard({
  video,
  onEdit,
  onDelete,
  onPlay,
}: {
  video: KolVideo;
  onEdit: (video: KolVideo) => void;
  onDelete: (video: KolVideo) => void;
  onPlay: (video: KolVideo) => void;
}) {
  return (
    <div className="relative group">
      {/* 封面图片容器 */}
      <div 
        className="relative w-full aspect-[9/16] bg-gray-100 rounded-lg overflow-hidden cursor-pointer"
        onClick={() => onPlay(video)}
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
          <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
            <Video className="h-12 w-12 mb-2" />
            <span className="text-sm">无封面</span>
          </div>
        )}
      </div>
      
      {/* 操作按钮层 - hover 时显示 */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-lg pointer-events-none">
        <div className="absolute bottom-3 left-3 right-3 flex justify-between items-center pointer-events-auto">
          <Badge className="bg-white/90 text-gray-900 border-0 backdrop-blur-sm">
            {new Date(video.created_at).toLocaleDateString('zh-CN', { 
              month: 'short', 
              day: 'numeric' 
            })}
          </Badge>
          
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="secondary"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(video);
              }}
              className="bg-white/90 hover:bg-white h-8"
            >
              <Edit2 className="h-3 w-3 mr-1" />
              编辑
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(video);
              }}
              className="bg-red-500/90 hover:bg-red-600 text-white h-8"
            >
              <Trash2 className="h-3 w-3 mr-1" />
              删除
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Plan Card Component
function PlanCard({
  plan,
  onEdit,
  onDelete,
}: {
  plan: KolPlan;
  onEdit: (plan: KolPlan) => void;
  onDelete: (plan: KolPlan) => void;
}) {
  return (
    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors">
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <h4 className="font-semibold text-gray-900">{plan.title}</h4>
          <Badge variant="secondary">{plan.plan_type}</Badge>
        </div>
        <p className="text-sm text-gray-600 mb-2">{plan.description}</p>
        <p className="text-2xl font-bold text-blue-600">${plan.price}</p>
      </div>
      <div className="flex gap-2">
        <Button
          size="sm"
          variant="outline"
          onClick={() => onEdit(plan)}
        >
          <Edit2 className="h-3 w-3" />
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => onDelete(plan)}
          className="text-red-600 hover:text-red-700"
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
}


// Video Modal Component
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
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{video ? "编辑视频" : "添加视频"}</DialogTitle>
          <DialogDescription>
            粘贴TikTok视频的嵌入代码来添加到您的作品集
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
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
              placeholder='粘贴完整的TikTok嵌入代码，例如：
<blockquote class="tiktok-embed" cite="https://www.tiktok.com/@username/video/123" data-video-id="123" style="max-width: 605px;min-width: 325px;">
  <section>
    <a target="_blank" title="@username" href="https://www.tiktok.com/@username?refer=embed">@username</a>
    <p></p>
    <a target="_blank" title="♬ original sound" href="https://www.tiktok.com/music/original-sound-123?refer=embed">♬ original sound</a>
  </section>
</blockquote>
<script async src="https://www.tiktok.com/embed.js"></script>'
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

        <DialogFooter>
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

// Plan Modal Component
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
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{plan ? "Edit Plan" : "Add Pricing Plan"}</DialogTitle>
          <DialogDescription>
            Create a pricing plan for your services
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div>
            <Label>Plan Type *</Label>
            <select
              value={formData.plan_type}
              onChange={(e) => setFormData(prev => ({ ...prev, plan_type: e.target.value as 'basic' | 'standard' | 'premium' }))}
              className="w-full mt-1.5 px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="basic">Basic</option>
              <option value="standard">Standard</option>
              <option value="premium">Premium</option>
            </select>
          </div>

          <div>
            <Label>Title *</Label>
            <Input
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="e.g., 30-60s Video"
              className="mt-1.5"
            />
          </div>

          <div>
            <Label>Description *</Label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe what's included in this plan"
              rows={3}
              className="mt-1.5"
            />
          </div>

          <div>
            <Label>Price (USD) *</Label>
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

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-gradient-to-r from-blue-600 to-blue-700"
          >
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Plan
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

