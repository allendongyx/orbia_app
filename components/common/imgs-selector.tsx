"use client";

import { useState } from "react";
import { Camera, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "@/hooks/use-toast";
import { uploadToR2, validateImageFile } from "@/lib/r2-upload";

export interface EmojiItem {
  name: string;
  url: string;
}

interface ImgsSelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentImage?: string;
  onImageChange: (imageUrl: string) => void;
  title: string;
  description: string;
  emojiList: EmojiItem[];
  avatarShape?: "circle" | "rounded"; // circle for avatar, rounded for team icon
  gridCols?: number; // default 6
  allowUpload?: boolean; // default true
}

export function ImgsSelector({
  open,
  onOpenChange,
  currentImage,
  onImageChange,
  title,
  description,
  emojiList,
  avatarShape = "circle",
  gridCols = 6,
  allowUpload = true,
}: ImgsSelectorProps) {
  const [selectedEmojiUrl, setSelectedEmojiUrl] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleEmojiSelect = async (emojiUrl: string) => {
    setSelectedEmojiUrl(emojiUrl);
    setIsSaving(true);

    try {
      // Call the callback
      onImageChange(emojiUrl);
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to select emoji:", error);
      toast({
        variant: "error",
        title: "选择失败",
        description: "请重试",
      });
    } finally {
      setIsSaving(false);
      setSelectedEmojiUrl("");
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // 验证图片文件
    const validation = validateImageFile(file);
    if (!validation.valid) {
      toast({
        variant: "error",
        title: "文件验证失败",
        description: validation.error,
      });
      return;
    }

    setIsUploading(true);

    try {
      // 使用 R2 预签名方式上传
      const publicUrl = await uploadToR2(file);
      
      // 上传成功，调用回调
      onImageChange(publicUrl);
      onOpenChange(false);

      toast({
        title: "上传成功",
        description: "图片已上传到云端",
      });
    } catch (error) {
      console.error("Failed to upload image:", error);
      toast({
        variant: "error",
        title: "上传失败",
        description: error instanceof Error ? error.message : "请重试",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const avatarClassName = avatarShape === "circle" ? "" : "rounded-2xl";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="emoji" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="emoji">Emoji</TabsTrigger>
            {allowUpload && <TabsTrigger value="upload">Upload</TabsTrigger>}
          </TabsList>

          <TabsContent value="emoji" className="mt-4">
            <div className="max-h-[400px] overflow-y-auto pr-2">
              <div className={`grid gap-3 ${
                gridCols === 5 ? 'grid-cols-5' : 
                gridCols === 6 ? 'grid-cols-6' : 
                gridCols === 4 ? 'grid-cols-4' : 
                'grid-cols-6'
              }`}>
                {emojiList.map((emoji, index) => (
                  <button
                    key={index}
                    onClick={() => handleEmojiSelect(emoji.url)}
                    disabled={isSaving}
                    title={emoji.name}
                    className={`
                      relative aspect-square rounded-lg border-2 p-2
                      transition-all hover:scale-105 hover:border-blue-700 hover:shadow-md
                      disabled:opacity-50 disabled:cursor-not-allowed
                      ${selectedEmojiUrl === emoji.url ? "border-blue-700 bg-blue-50 shadow-md" : "border-gray-200 bg-white"}
                    `}
                  >
                    <img 
                      src={emoji.url} 
                      alt={emoji.name}
                      className="w-full h-full object-contain"
                      loading="lazy"
                    />
                    {selectedEmojiUrl === emoji.url && isSaving && (
                      <div className="absolute inset-0 flex items-center justify-center bg-white/90 rounded-lg">
                        <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-700 border-t-transparent" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </TabsContent>

          {allowUpload && (
            <TabsContent value="upload" className="mt-4">
              <div className="flex flex-col items-center justify-center gap-4 py-8">
                <div className="relative">
                  <Avatar className={`h-32 w-32 ${avatarClassName}`}>
                    {currentImage ? (
                      <img
                        src={currentImage}
                        alt="Current image"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <AvatarFallback className={`bg-gray-200 text-gray-600 text-4xl ${avatarClassName}`}>
                        <Camera className="h-12 w-12" />
                      </AvatarFallback>
                    )}
                  </Avatar>
                </div>

                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-4">
                    Upload a new image
                  </p>
                  <p className="text-xs text-gray-500 mb-4">
                    Max size: 10MB. Formats: JPG, PNG, GIF, WebP
                  </p>
                  <input
                    type="file"
                    id="image-upload"
                    accept="image/*"
                    onChange={handleFileUpload}
                    disabled={isUploading}
                    className="hidden"
                  />
                  <label htmlFor="image-upload">
                    <Button
                      type="button"
                      disabled={isUploading}
                      className="cursor-pointer"
                      onClick={() => document.getElementById("image-upload")?.click()}
                    >
                      {isUploading ? (
                        <>
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent mr-2" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload className="h-4 w-4 mr-2" />
                          Choose File
                        </>
                      )}
                    </Button>
                  </label>
                </div>
              </div>
            </TabsContent>
          )}
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

