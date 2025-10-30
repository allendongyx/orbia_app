"use client";

import React, { useState, useEffect, useMemo } from "react";
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
import LocationSelectorDict from "@/components/common/location-selector-dict";
import LanguageSelectorDict from "@/components/common/language-selector-dict";
import { ImgsSelector, EmojiItem } from "@/components/common/imgs-selector";
import { useDictionaryTree } from "@/hooks/use-dictionary";
import avatarEmojis from "@/data/avatar-emojis.json";

export default function ApplyKOLPage() {
  const router = useRouter();
  const { isLoggedIn, isLoading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [kolInfo, setKolInfo] = useState<KolInfo | null>(null);
  const [showAvatarSelector, setShowAvatarSelector] = useState(false);

  const { tree: locationTree } = useDictionaryTree("COUNTRY");
  const { tree: languageTree } = useDictionaryTree("LANGUAGE");

  const [formData, setFormData] = useState({
    display_name: "",
    description: "",
    country: [] as number[],
    avatar_url: "",
    tiktok_url: "",
    youtube_url: "",
    x_url: "",
    discord_url: "",
    languages: [] as number[],
    tags: [] as string[],
  });

  const [tagInput, setTagInput] = useState("");

  const countryCodes = useMemo(() => {
    if (!formData.country.length || !locationTree.length) return [];
    return formData.country
      .map(id => {
        const country = locationTree.find(c => c.id === id);
        if (country) return country.code;
        for (const c of locationTree) {
          const region = (c.children || []).find(r => r.id === id);
          if (region) return region.code;
        }
        return null;
      })
      .filter((code): code is string => code !== null);
  }, [formData.country, locationTree]);

  const languageCodes = useMemo(() => {
    if (!formData.languages.length || !languageTree.length) return [];
    return formData.languages
      .map(id => {
        const lang = languageTree.find(l => l.id === id);
        return lang ? lang.code : null;
      })
      .filter((code): code is string => code !== null);
  }, [formData.languages, languageTree]);

  useEffect(() => {
    if (authLoading) return;
    if (!isLoggedIn) {
      router.push("/kol/marketplace");
      return;
    }
    checkKolStatus();
  }, [isLoggedIn, authLoading, router]);

  const checkKolStatus = async () => {
    setLoading(true);
    try {
      const result = await getKolInfo({});
      if (isSuccessResponse(result.base_resp) && result.kol_info) {
        setKolInfo(result.kol_info);
      } else {
        setKolInfo(null);
      }
    } catch {
      setKolInfo(null);
    } finally {
      setLoading(false);
    }
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({ ...prev, tags: [...prev.tags, tagInput.trim()] }));
      setTagInput("");
    }
  };

  const removeTag = (tag: string) => {
    setFormData(prev => ({ ...prev, tags: prev.tags.filter(t => t !== tag) }));
  };

  const handleCountryChange = (codes: string[]) => {
    const ids = codes.map(code => {
      const country = locationTree.find(c => c.code === code);
      if (country) return country.id;
      for (const c of locationTree) {
        const region = (c.children || []).find(r => r.code === code);
        if (region) return region.id;
      }
      return null;
    }).filter((id): id is number => id !== null);
    setFormData(prev => ({ ...prev, country: ids }));
  };

  const handleLanguageChange = (codes: string[]) => {
    const ids = codes.map(code => {
      const lang = languageTree.find(l => l.code === code);
      return lang ? lang.id : null;
    }).filter((id): id is number => id !== null);
    setFormData(prev => ({ ...prev, languages: ids }));
  };

  const handleAvatarChange = (avatarUrl: string) => {
    setFormData(prev => ({ ...prev, avatar_url: avatarUrl }));
    setShowAvatarSelector(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

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
    if (formData.languages.length === 0) {
      setError("Please select at least one language");
      return;
    }

    setSubmitting(true);

    try {
      let countryCode = "";
      if (formData.country.length > 0) {
        const countryId = formData.country[0];
        const country = locationTree.find(c => c.id === countryId);
        if (country) {
          countryCode = country.code;
        } else {
          for (const c of locationTree) {
            const region = (c.children || []).find(r => r.id === countryId);
            if (region) {
              countryCode = region.code;
              break;
            }
          }
        }
      }

      const language_codes = formData.languages
        .map(id => {
          const lang = languageTree.find(l => l.id === id);
          return lang ? lang.code : null;
        })
        .filter((code): code is string => code !== null);

      const submitData: ApplyKolReq = {
        display_name: formData.display_name,
        description: formData.description,
        country: countryCode,
        avatar_url: formData.avatar_url,
        tiktok_url: formData.tiktok_url,
        youtube_url: formData.youtube_url,
        x_url: formData.x_url,
        discord_url: formData.discord_url,
        language_codes,
        language_names: language_codes,
        tags: formData.tags,
      };

      const result = await applyKol(submitData);
      if (isSuccessResponse(result.base_resp)) {
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

  if (kolInfo) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.push("/kol/marketplace")} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Marketplace
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>KOL Application Status</CardTitle>
            <CardDescription>Your KOL application has been submitted</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-center py-8">
              {kolInfo.status === 'approved' ? (
                <div className="text-center">
                  <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="h-8 w-8 text-green-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Application Approved!</h3>
                  <p className="text-gray-600 mb-6">Congratulations! Your KOL application has been approved.</p>
                  <Button onClick={() => router.push("/kol/profile")} className="bg-gradient-to-r from-blue-600 to-blue-700">
                    Go to Profile
                  </Button>
                </div>
              ) : kolInfo.status === 'pending' ? (
                <div className="text-center">
                  <div className="h-16 w-16 rounded-full bg-yellow-100 flex items-center justify-center mx-auto mb-4">
                    <Clock className="h-8 w-8 text-yellow-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Application Under Review</h3>
                  <p className="text-gray-600 mb-6">Your application is currently being reviewed by our team.</p>
                  <Button variant="outline" onClick={() => router.push("/kol/marketplace")}>
                    Back to Marketplace
                  </Button>
                </div>
              ) : (
                <div className="text-center">
                  <div className="h-16 w-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                    <XCircle className="h-8 w-8 text-red-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Application Rejected</h3>
                  {kolInfo.reject_reason && (
                    <p className="text-gray-600 mb-4">
                      <strong>Reason:</strong> {kolInfo.reject_reason}
                    </p>
                  )}
                  <p className="text-gray-600 mb-6">Please review the feedback and consider reapplying.</p>
                  <div className="flex gap-3 justify-center">
                    <Button variant="outline" onClick={() => router.push("/kol/marketplace")}>
                      Back to Marketplace
                    </Button>
                    <Button onClick={() => setKolInfo(null)} className="bg-gradient-to-r from-blue-600 to-blue-700">
                      Reapply
                    </Button>
                  </div>
                </div>
              )}
            </div>

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
                      <Badge key={idx} variant="secondary">{tag.tag}</Badge>
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

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => router.push("/kol/marketplace")} className="gap-2">
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
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Please fill out all required fields (*). Your application will be reviewed within 2-3 business days.
              </AlertDescription>
            </Alert>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>

              <div>
                <Label>Avatar <span className="text-red-500">*</span></Label>
                <div className="flex items-center gap-4 mt-1.5">
                  <div className="h-20 w-20 rounded-full overflow-hidden border-2 border-gray-200">
                    {formData.avatar_url ? (
                      <img src={formData.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center text-white font-semibold text-lg">
                        {formData.display_name ? formData.display_name.slice(0, 2).toUpperCase() : "??"}
                      </div>
                    )}
                  </div>
                  <Button type="button" variant="outline" onClick={() => setShowAvatarSelector(true)}>
                    {formData.avatar_url ? "Change Avatar" : "Select Avatar"}
                  </Button>
                </div>
                <p className="text-xs text-gray-500 mt-2">Choose an emoji or upload your own image</p>
              </div>

              <div>
                <Label>Display Name <span className="text-red-500">*</span></Label>
                <Input
                  value={formData.display_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, display_name: e.target.value }))}
                  placeholder="Enter your public display name"
                  className="mt-1.5"
                />
              </div>

              <div>
                <Label>Bio / Description <span className="text-red-500">*</span></Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Tell us about yourself and your content..."
                  rows={4}
                  className="mt-1.5"
                />
              </div>

              <div>
                <Label>Country <span className="text-red-500">*</span></Label>
                <div className="mt-1.5">
                  <LocationSelectorDict
                    value={countryCodes}
                    onChange={handleCountryChange}
                    placeholder="Select countries or regions"
                    multiple={true}
                  />
                  <p className="text-xs text-gray-500 mt-1">Select one or more countries/regions</p>
                </div>
              </div>

              <div>
                <Label>Languages <span className="text-red-500">*</span></Label>
                <div className="mt-1.5">
                  <LanguageSelectorDict
                    value={languageCodes}
                    onChange={handleLanguageChange}
                    placeholder="Select languages"
                    multiple={true}
                  />
                  <p className="text-xs text-gray-500 mt-1">Select the languages you can create content in</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Social Media</h3>
              <p className="text-sm text-gray-600">Link your social media accounts (at least one is recommended)</p>

              <div>
                <Label>TikTok URL</Label>
                <Input
                  type="url"
                  value={formData.tiktok_url}
                  onChange={(e) => setFormData(prev => ({ ...prev, tiktok_url: e.target.value }))}
                  placeholder="https://www.tiktok.com/@username"
                  className="mt-1.5"
                />
              </div>

              <div>
                <Label>YouTube URL</Label>
                <Input
                  type="url"
                  value={formData.youtube_url}
                  onChange={(e) => setFormData(prev => ({ ...prev, youtube_url: e.target.value }))}
                  placeholder="https://www.youtube.com/@username"
                  className="mt-1.5"
                />
              </div>

              <div>
                <Label>X (Twitter) URL</Label>
                <Input
                  type="url"
                  value={formData.x_url}
                  onChange={(e) => setFormData(prev => ({ ...prev, x_url: e.target.value }))}
                  placeholder="https://x.com/username"
                  className="mt-1.5"
                />
              </div>

              <div>
                <Label>Discord URL</Label>
                <Input
                  type="url"
                  value={formData.discord_url}
                  onChange={(e) => setFormData(prev => ({ ...prev, discord_url: e.target.value }))}
                  placeholder="https://discord.gg/invite"
                  className="mt-1.5"
                />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Content Tags</h3>
              <p className="text-sm text-gray-600">Add tags to describe your content focus (e.g., DeFi, NFT, GameFi)</p>

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
                <Button type="button" onClick={addTag} variant="outline">Add</Button>
              </div>

              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="pl-3 pr-1 py-1.5 gap-1">
                      {tag}
                      <button type="button" onClick={() => removeTag(tag)} className="ml-1 hover:bg-gray-300 rounded-full p-0.5">
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

      <ImgsSelector
        open={showAvatarSelector}
        onOpenChange={setShowAvatarSelector}
        currentImage={formData.avatar_url}
        onImageChange={handleAvatarChange}
        title="Select Avatar"
        description="Choose an emoji or upload your own image"
        emojiList={avatarEmojis as EmojiItem[]}
        avatarShape="circle"
        gridCols={6}
        allowUpload={true}
      />
    </div>
  );
}
