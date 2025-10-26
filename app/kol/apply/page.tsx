"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, CheckCircle2, XCircle, Clock, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { applyKol, getKolInfo, ApplyKolReq, KolInfo } from "@/lib/api/kol";
import { isSuccessResponse } from "@/lib/api-client";
import { useAuth } from "@/contexts/auth-context";
import LocationSelector from "@/components/common/location-selector";
import LanguageSelector from "@/components/common/language-selector";

export default function ApplyKOLPage() {
  const router = useRouter();
  const { isLoggedIn, isLoading: authLoading, user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [kolInfo, setKolInfo] = useState<KolInfo | null>(null);

  // 表单数据 (country 在 UI 中使用数组，提交时转换为字符串)
  const [formData, setFormData] = useState({
    display_name: "",
    description: "",
    country: [] as string[],
    avatar_url: "",
    tiktok_url: "",
    youtube_url: "",
    x_url: "",
    discord_url: "",
    language_codes: [],
    language_names: [],
    tags: [],
  });

  const [tagInput, setTagInput] = useState("");

  useEffect(() => {
    // 等待认证状态加载完成
    if (authLoading) {
      return;
    }

    // 如果未登录，跳转到 marketplace
    if (!isLoggedIn) {
      router.push("/kol/marketplace");
      return;
    }

    // 检查用户是否已经申请过
    checkKolStatus();
  }, [isLoggedIn, authLoading]);

  const checkKolStatus = async () => {
    setLoading(true);
    try {
      const result = await getKolInfo({});
      if (isSuccessResponse(result.base_resp) && result.kol_info) {
        setKolInfo(result.kol_info);
      }
    } catch (err) {
      console.error("Failed to check KOL status:", err);
    } finally {
      setLoading(false);
    }
  };

  // 添加标签
  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()],
      }));
      setTagInput("");
    }
  };

  // 删除标签
  const removeTag = (tag: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((t) => t !== tag),
    }));
  };

  // 处理语言选择
  const handleLanguageChange = (languages: Array<{ code: string; name: string }>) => {
    setFormData((prev) => ({
      ...prev,
      language_codes: languages.map(l => l.code),
      language_names: languages.map(l => l.name),
    }));
  };

  // 提交申请
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // 验证必填字段
    if (!formData.display_name) {
      setError("Please enter your display name");
      return;
    }
    if (!formData.description) {
      setError("Please enter a description");
      return;
    }
    if (formData.country.length === 0) {
      setError("Please select your country");
      return;
    }
    if (formData.language_codes.length === 0) {
      setError("Please select at least one language");
      return;
    }

    setSubmitting(true);

    try {
      // 转换数据格式：country 从数组转为字符串（取第一个）
      const submitData: ApplyKolReq = {
        ...formData,
        country: formData.country[0] || "",
      };
      
      const result = await applyKol(submitData);
      if (isSuccessResponse(result.base_resp)) {
        // 申请成功，刷新状态
        await checkKolStatus();
      } else {
        setError(result.base_resp.message || "Application failed");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Application failed");
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // 如果已经申请过，显示申请状态
  if (kolInfo) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => router.push("/kol/marketplace")}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Marketplace
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>KOL Application Status</CardTitle>
            <CardDescription>
              Your KOL application has been submitted
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* 状态显示 */}
            <div className="flex items-center justify-center py-8">
              {kolInfo.status === 'approved' ? (
                <div className="text-center">
                  <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="h-8 w-8 text-green-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Application Approved!
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Congratulations! Your KOL application has been approved.
                  </p>
                  <Button
                    onClick={() => router.push("/kol/profile")}
                    className="bg-gradient-to-r from-blue-600 to-blue-700"
                  >
                    Go to Profile
                  </Button>
                </div>
              ) : kolInfo.status === 'pending' ? (
                <div className="text-center">
                  <div className="h-16 w-16 rounded-full bg-yellow-100 flex items-center justify-center mx-auto mb-4">
                    <Clock className="h-8 w-8 text-yellow-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Application Under Review
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Your application is currently being reviewed by our team. We'll notify you once it's processed.
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => router.push("/kol/marketplace")}
                  >
                    Back to Marketplace
                  </Button>
                </div>
              ) : (
                <div className="text-center">
                  <div className="h-16 w-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                    <XCircle className="h-8 w-8 text-red-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Application Rejected
                  </h3>
                  {kolInfo.reject_reason && (
                    <p className="text-gray-600 mb-4">
                      <strong>Reason:</strong> {kolInfo.reject_reason}
                    </p>
                  )}
                  <p className="text-gray-600 mb-6">
                    Please review the feedback and consider reapplying.
                  </p>
                  <div className="flex gap-3 justify-center">
                    <Button
                      variant="outline"
                      onClick={() => router.push("/kol/marketplace")}
                    >
                      Back to Marketplace
                    </Button>
                    <Button
                      onClick={() => {
                        setKolInfo(null);
                        // 可以选择重新申请
                      }}
                      className="bg-gradient-to-r from-blue-600 to-blue-700"
                    >
                      Reapply
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* 申请信息概览 */}
            <div className="border-t pt-6">
              <h4 className="font-semibold text-gray-900 mb-4">Application Details</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Display Name</p>
                  <p className="font-medium text-gray-900">{kolInfo.display_name}</p>
                </div>
                <div>
                  <p className="text-gray-500">Country</p>
                  <p className="font-medium text-gray-900">{kolInfo.country}</p>
                </div>
                <div>
                  <p className="text-gray-500">Languages</p>
                  <p className="font-medium text-gray-900">
                    {kolInfo.languages.map(l => l.language_name).join(", ")}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Submitted</p>
                  <p className="font-medium text-gray-900">
                    {new Date(kolInfo.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
              {kolInfo.tags.length > 0 && (
                <div className="mt-4">
                  <p className="text-gray-500 text-sm mb-2">Tags</p>
                  <div className="flex flex-wrap gap-2">
                    {kolInfo.tags.map((tag, idx) => (
                      <Badge key={idx} variant="secondary">
                        {tag.tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // 申请表单
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          onClick={() => router.push("/kol/marketplace")}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Marketplace
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Apply to Become a KOL</CardTitle>
          <CardDescription>
            Join our KOL marketplace and start earning by creating content for Web3 projects.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 提示信息 */}
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Please fill out all required fields (*). Your application will be reviewed by our team within 2-3 business days.
              </AlertDescription>
            </Alert>

            {/* 基本信息 */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>

              <div>
                <Label htmlFor="display_name">
                  Display Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="display_name"
                  value={formData.display_name}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      display_name: e.target.value,
                    }))
                  }
                  placeholder="Enter your public display name"
                  className="mt-1.5"
                />
              </div>

              <div>
                <Label htmlFor="description">
                  Bio / Description <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  placeholder="Tell us about yourself and your content..."
                  rows={4}
                  className="mt-1.5"
                />
              </div>

              <div>
                <Label htmlFor="country">
                  Country <span className="text-red-500">*</span>
                </Label>
                <div className="mt-1.5">
                  <LocationSelector
                    value={formData.country}
                    onChange={(value) =>
                      setFormData((prev) => ({ ...prev, country: value.slice(0, 1) }))
                    }
                    placeholder="Select your country"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Please select only one country
                  </p>
                </div>
              </div>

              <div>
                <Label htmlFor="languages">
                  Languages <span className="text-red-500">*</span>
                </Label>
                <LanguageSelector
                  value={formData.language_codes.map((code, idx) => ({
                    code,
                    name: formData.language_names[idx] || code,
                  }))}
                  onChange={handleLanguageChange}
                  className="mt-1.5"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Select the languages you can create content in
                </p>
              </div>

              <div>
                <Label htmlFor="avatar_url">Avatar URL (Optional)</Label>
                <Input
                  id="avatar_url"
                  type="url"
                  value={formData.avatar_url}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      avatar_url: e.target.value,
                    }))
                  }
                  placeholder="https://example.com/avatar.jpg"
                  className="mt-1.5"
                />
              </div>
            </div>

            {/* 社交账号 */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Social Media</h3>
              <p className="text-sm text-gray-600">
                Link your social media accounts (at least one is recommended)
              </p>

              <div>
                <Label htmlFor="tiktok_url">TikTok URL</Label>
                <Input
                  id="tiktok_url"
                  type="url"
                  value={formData.tiktok_url}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      tiktok_url: e.target.value,
                    }))
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
                  value={formData.youtube_url}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      youtube_url: e.target.value,
                    }))
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
                  value={formData.x_url}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      x_url: e.target.value,
                    }))
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
                  value={formData.discord_url}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      discord_url: e.target.value,
                    }))
                  }
                  placeholder="https://discord.gg/invite"
                  className="mt-1.5"
                />
              </div>
            </div>

            {/* 标签 */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Content Tags</h3>
              <p className="text-sm text-gray-600">
                Add tags to describe your content focus (e.g., DeFi, NFT, GameFi)
              </p>

              <div className="flex gap-2">
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
                <div className="flex flex-wrap gap-2">
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
                        <XCircle className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/kol/marketplace")}
                disabled={submitting}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={submitting}
                className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
              >
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit Application"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

