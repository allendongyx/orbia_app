"use client";

import React, { useState } from "react";
import { Upload, Image as ImageIcon, Video, Globe, CheckCircle, HelpCircle, X, Loader2, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import { useFileUpload } from "@/hooks/use-image-upload";
import { CampaignFormData } from "./page";

interface Step3Props {
  formData: CampaignFormData;
  updateFormData: (data: Partial<CampaignFormData>) => void;
}

export default function Step3({ formData, updateFormData }: Step3Props) {
  const { toast } = useToast();
  // 允许图片和视频文件
  const { uploadFile, isUploading } = useFileUpload({
    allowedTypes: ['jpg', 'jpeg', 'png', 'gif', 'mp4', 'mov', 'avi', 'webm'],
    maxSize: 100 * 1024 * 1024, // 100MB
  });
  const [uploadedFiles, setUploadedFiles] = useState<Array<{ url: string; name: string; type: string }>>(
    (formData.attachment_urls || [])
      .filter((url): url is string => typeof url === 'string' && url.length > 0)
      .map(url => ({
        url,
        name: url.split('/').pop() || '',
        type: url.toLowerCase().endsWith('.mp4') || url.toLowerCase().endsWith('.mov') ? 'video' : 'image'
      }))
  );

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const url = await uploadFile(file);
    
    if (url) {
      const newFile = {
        url,
        name: file.name,
        type: file.type.startsWith('video/') ? 'video' : 'image'
      };

      const newFiles = [...uploadedFiles, newFile];
      setUploadedFiles(newFiles);
      updateFormData({ attachment_urls: newFiles.map(f => f.url) });
    }
    
    // 清空 input，允许重复上传同一个文件
    event.target.value = '';
  };

  const removeFile = (index: number) => {
    const newFiles = uploadedFiles.filter((_, i) => i !== index);
    setUploadedFiles(newFiles);
    updateFormData({ attachment_urls: newFiles.map(f => f.url) });
  };

  // 检查是否需要显示 Website URL
  const needsWebsite = formData.optimization_goal === 'website';
  
  // 检查是否需要显示 App Download URLs
  const needsApp = formData.optimization_goal === 'app' || formData.optimization_goal === 'app_promotion';

  return (
    <div className="max-w-5xl space-y-5">
      {/* Creative Assets */}
      <div className="space-y-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-lg font-bold">Creative Assets</h2>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Upload eye-catching images or videos. Quality creatives perform 2-3x better</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <p className="text-xs text-muted-foreground">
            Upload compelling visuals that capture attention
          </p>
        </div>

        {/* Upload Area */}
        <Card className="border-2 border-dashed border-gray-300 hover:border-blue-700 transition-colors rounded-md">
          <CardContent className="p-4">
            <div className="flex flex-col items-center justify-center py-6 text-center">
              <div className="rounded-full bg-blue-50 p-3 mb-3">
                {isUploading ? (
                  <Loader2 className="h-6 w-6 text-blue-700 animate-spin" />
                ) : (
                  <Upload className="h-6 w-6 text-blue-700" />
                )}
              </div>
              <h3 className="text-base font-semibold mb-1">Upload Your Creative</h3>
              <p className="text-xs text-muted-foreground mb-3 max-w-md">
                {isUploading ? 'Uploading...' : 'Click to browse and select files'}
              </p>
              <div className="flex gap-2 mb-3">
                <Label htmlFor="image-upload" className="cursor-pointer">
                  <Button variant="outline" size="sm" className="gap-1.5 h-8 text-xs" disabled={isUploading} asChild>
                    <span>
                      <ImageIcon className="h-3.5 w-3.5" />
                      Images
                    </span>
                  </Button>
                </Label>
                <input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileUpload}
                  disabled={isUploading}
                />

                <Label htmlFor="video-upload" className="cursor-pointer">
                  <Button variant="outline" size="sm" className="gap-1.5 h-8 text-xs" disabled={isUploading} asChild>
                    <span>
                      <Video className="h-3.5 w-3.5" />
                      Videos
                    </span>
                  </Button>
                </Label>
                <input
                  id="video-upload"
                  type="file"
                  accept="video/*"
                  className="hidden"
                  onChange={handleFileUpload}
                  disabled={isUploading}
                />
              </div>
              <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                <span>• Images: JPG, PNG (Max 10MB)</span>
                <span>• Videos: MP4, MOV (Max 50MB)</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Uploaded Files Preview */}
        {uploadedFiles.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {uploadedFiles.map((file, index) => (
              <Card key={index} className="relative group">
                <CardContent className="p-3">
                  <div className="aspect-square bg-gray-100 rounded-md flex items-center justify-center mb-2 overflow-hidden">
                    {file.type === 'video' ? (
                      <Video className="h-8 w-8 text-gray-400" />
                    ) : file.url ? (
                      <img src={file.url} alt={file.name} className="w-full h-full object-cover" />
                    ) : (
                      <ImageIcon className="h-8 w-8 text-gray-400" />
                    )}
                  </div>
                  <p className="text-xs text-center truncate">{file.name}</p>
                  <Button
                    variant="destructive"
                    size="sm"
                    className="absolute top-1 right-1 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => removeFile(index)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Landing Page / App Links */}
      <div className="space-y-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-lg font-bold">Destination</h2>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Where should users go when they click your ad?</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <p className="text-xs text-muted-foreground">
            Set up where users will be directed after clicking your ad
          </p>
        </div>

        {/* Website URL - Show if optimization goal is website */}
        {needsWebsite && (
          <Card className="border border-blue-700/30 bg-blue-50/30">
            <CardContent className="p-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-blue-700" />
                  <span className="font-semibold text-sm">
                    Website URL <span className="text-red-500">*</span>
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Direct users to an existing website or landing page
                </p>
                
                <div className="space-y-1.5">
                  <Label htmlFor="website-url" className="text-xs font-medium">
                    Destination URL
                  </Label>
                  <Input
                    id="website-url"
                    placeholder="https://example.com/landing-page"
                    className="font-mono text-xs h-9"
                    value={formData.website || ''}
                    onChange={(e) => updateFormData({ website: e.target.value })}
                  />
                </div>
                
                <div className="rounded-md bg-blue-50 border border-blue-200 p-2">
                  <div className="flex gap-1.5">
                    <CheckCircle className="h-3.5 w-3.5 text-blue-600 shrink-0 mt-0.5" />
                    <p className="text-[11px] text-blue-900">
                      <strong>Pro tip:</strong> Use UTM parameters to track campaign performance in your analytics
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* App Download URLs - Show if optimization goal is app */}
        {needsApp && (
          <Card className="border border-purple-700/30 bg-purple-50/30">
            <CardContent className="p-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Smartphone className="h-4 w-4 text-purple-700" />
                  <span className="font-semibold text-sm">
                    App Download Links {formData.optimization_goal === 'app' && <span className="text-red-500">*</span>}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Provide download links for your mobile app
                </p>
                
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="ios-url" className="text-xs font-medium flex items-center gap-1.5">
                      <span>🍎</span>
                      iOS Download URL (App Store)
                    </Label>
                    <Input
                      id="ios-url"
                      placeholder="https://apps.apple.com/..."
                      className="font-mono text-xs h-9"
                      value={formData.ios_download_url || ''}
                      onChange={(e) => updateFormData({ ios_download_url: e.target.value })}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="android-url" className="text-xs font-medium flex items-center gap-1.5">
                      <span>🤖</span>
                      Android Download URL (Google Play)
                    </Label>
                    <Input
                      id="android-url"
                      placeholder="https://play.google.com/store/apps/..."
                      className="font-mono text-xs h-9"
                      value={formData.android_download_url || ''}
                      onChange={(e) => updateFormData({ android_download_url: e.target.value })}
                    />
                  </div>
                </div>
                
                <div className="rounded-md bg-purple-50 border border-purple-200 p-2">
                  <div className="flex gap-1.5">
                    <CheckCircle className="h-3.5 w-3.5 text-purple-600 shrink-0 mt-0.5" />
                    <p className="text-[11px] text-purple-900">
                      <strong>Note:</strong> Provide at least one app download URL (iOS or Android)
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

      </div>
    </div>
  );
}
