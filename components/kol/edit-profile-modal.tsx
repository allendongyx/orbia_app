"use client";

import React, { useState, useEffect } from "react";
import { User, Globe, Loader2, Save, Plus, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { updateKolInfo, KolInfo, UpdateKolInfoReq } from "@/lib/api/kol";
import { isSuccessResponse } from "@/lib/api-client";
import { toast } from "@/hooks/use-toast";
import LocationSelectorDict from "@/components/common/location-selector-dict";
import LanguageSelectorDict from "@/components/common/language-selector-dict";
import { AvatarSelector } from "@/components/auth/avatar-selector";

interface EditProfileModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  kolInfo: KolInfo;
  onSuccess: () => void;
}

export function EditProfileModal({
  open,
  onOpenChange,
  kolInfo,
  onSuccess,
}: EditProfileModalProps) {
  const [activeTab, setActiveTab] = useState("basic");
  const [saving, setSaving] = useState(false);
  const [showAvatarSelector, setShowAvatarSelector] = useState(false);
  const [tagInput, setTagInput] = useState("");

  // 基本信息表单
  const [basicFormData, setBasicFormData] = useState({
    display_name: "",
    description: "",
    country: [] as string[],
    avatar_url: "",
    language_codes: [] as string[],
    language_names: [] as string[],
    tags: [] as string[],
  });

  // 社交媒体表单
  const [socialFormData, setSocialFormData] = useState({
    tiktok_url: "",
    youtube_url: "",
    x_url: "",
    discord_url: "",
  });

  // 初始化表单数据
  useEffect(() => {
    if (kolInfo && open) {
      setBasicFormData({
        display_name: kolInfo.display_name,
        description: kolInfo.description || "",
        country: kolInfo.country ? [kolInfo.country] : [],
        avatar_url: kolInfo.avatar_url || "",
        language_codes: kolInfo.languages?.map((l) => l.language_code) || [],
        language_names: kolInfo.languages?.map((l) => l.language_name) || [],
        tags: kolInfo.tags?.map((t) => t.tag) || [],
      });

      setSocialFormData({
        tiktok_url: kolInfo.tiktok_url || "",
        youtube_url: kolInfo.youtube_url || "",
        x_url: kolInfo.x_url || "",
        discord_url: kolInfo.discord_url || "",
      });
    }
  }, [kolInfo, open]);

  const handleSaveBasicInfo = async () => {
    setSaving(true);
    try {
      const submitData: UpdateKolInfoReq = {
        ...basicFormData,
        country: basicFormData.country[0] || "",
        language_names: basicFormData.language_codes,
      };

      const result = await updateKolInfo(submitData);
      if (isSuccessResponse(result.base_resp)) {
        toast({
          title: "更新成功",
          description: "基本信息已更新",
        });
        onSuccess();
        onOpenChange(false);
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
      const result = await updateKolInfo(socialFormData);
      if (isSuccessResponse(result.base_resp)) {
        toast({
          title: "更新成功",
          description: "社交媒体链接已更新",
        });
        onSuccess();
        onOpenChange(false);
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
    if (tagInput.trim() && !basicFormData.tags.includes(tagInput.trim())) {
      setBasicFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()],
      }));
      setTagInput("");
    }
  };

  const removeTag = (tag: string) => {
    setBasicFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((t) => t !== tag),
    }));
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>编辑资料</DialogTitle>
            <DialogDescription>
              更新您的个人资料信息和社交媒体链接
            </DialogDescription>
          </DialogHeader>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0">
            <TabsList className="grid w-full grid-cols-2 bg-gray-100 p-1 rounded-xl flex-shrink-0">
              <TabsTrigger value="basic" className="rounded-lg">
                <User className="h-4 w-4 mr-2" />
                基本信息
              </TabsTrigger>
              <TabsTrigger value="social" className="rounded-lg">
                <Globe className="h-4 w-4 mr-2" />
                社交媒体
              </TabsTrigger>
            </TabsList>

            {/* 基本信息 Tab */}
            <TabsContent value="basic" className="flex-1 overflow-y-auto mt-4 space-y-4">
              <div>
                <Label htmlFor="display_name">显示名称 *</Label>
                <Input
                  id="display_name"
                  value={basicFormData.display_name}
                  onChange={(e) =>
                    setBasicFormData((prev) => ({ ...prev, display_name: e.target.value }))
                  }
                  className="mt-1.5"
                />
              </div>

              <div>
                <Label htmlFor="description">简介</Label>
                <Textarea
                  id="description"
                  value={basicFormData.description}
                  onChange={(e) =>
                    setBasicFormData((prev) => ({ ...prev, description: e.target.value }))
                  }
                  rows={4}
                  className="mt-1.5"
                />
              </div>

              <div>
                <Label htmlFor="country">国家/地区 *</Label>
                <div className="mt-1.5">
                  <LocationSelectorDict
                    value={basicFormData.country}
                    onChange={(value) =>
                      setBasicFormData((prev) => ({ ...prev, country: value }))
                    }
                    placeholder="选择您的国家/地区"
                    multiple={false}
                  />
                  <p className="text-xs text-gray-500 mt-1">请只选择一个国家/地区</p>
                </div>
              </div>

              <div>
                <Label htmlFor="avatar_url">头像</Label>
                <div className="flex items-center gap-4 mt-1.5">
                  <div className="h-20 w-20 rounded-full overflow-hidden border-2 border-gray-200">
                    {basicFormData.avatar_url ? (
                      <img
                        src={basicFormData.avatar_url}
                        alt="Avatar"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center text-white font-semibold text-lg">
                        {basicFormData.display_name.slice(0, 2).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowAvatarSelector(true)}
                  >
                    更换头像
                  </Button>
                </div>
              </div>

              <div>
                <Label htmlFor="languages">语言 *</Label>
                <div className="mt-1.5">
                  <LanguageSelectorDict
                    value={basicFormData.language_codes}
                    onChange={(codes) => {
                      setBasicFormData((prev) => ({
                        ...prev,
                        language_codes: codes,
                        language_names: codes,
                      }));
                    }}
                    placeholder="选择语言"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    选择您可以创作内容的语言
                  </p>
                </div>
              </div>

              <div>
                <Label>标签</Label>
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
                    placeholder="添加标签..."
                  />
                  <Button type="button" onClick={addTag} variant="outline">
                    添加
                  </Button>
                </div>
                {basicFormData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {basicFormData.tags.map((tag) => (
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
            </TabsContent>

            {/* 社交媒体 Tab */}
            <TabsContent value="social" className="flex-1 overflow-y-auto mt-4 space-y-4">
              <div>
                <Label htmlFor="tiktok_url">TikTok URL</Label>
                <Input
                  id="tiktok_url"
                  type="url"
                  value={socialFormData.tiktok_url}
                  onChange={(e) =>
                    setSocialFormData((prev) => ({ ...prev, tiktok_url: e.target.value }))
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
                  value={socialFormData.youtube_url}
                  onChange={(e) =>
                    setSocialFormData((prev) => ({ ...prev, youtube_url: e.target.value }))
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
                  value={socialFormData.x_url}
                  onChange={(e) =>
                    setSocialFormData((prev) => ({ ...prev, x_url: e.target.value }))
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
                  value={socialFormData.discord_url}
                  onChange={(e) =>
                    setSocialFormData((prev) => ({ ...prev, discord_url: e.target.value }))
                  }
                  placeholder="https://discord.gg/invite"
                  className="mt-1.5"
                />
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter className="flex-shrink-0">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={saving}
            >
              取消
            </Button>
            <Button
              onClick={activeTab === "basic" ? handleSaveBasicInfo : handleSaveSocialLinks}
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

      {/* Avatar Selector */}
      <AvatarSelector
        open={showAvatarSelector}
        onOpenChange={setShowAvatarSelector}
        currentAvatar={basicFormData.avatar_url}
        onAvatarChange={(avatarUrl) => {
          setBasicFormData((prev) => ({ ...prev, avatar_url: avatarUrl }));
          setShowAvatarSelector(false);
        }}
      />
    </>
  );
}
