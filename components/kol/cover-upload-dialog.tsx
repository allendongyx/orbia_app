"use client";

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, Loader2 } from 'lucide-react';
import { toast } from "@/hooks/use-toast";
import { useImageUpload } from "@/hooks/use-image-upload";
import { R2_PUBLIC_DOMAIN } from "@/lib/r2-upload";

interface CoverUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (imageUrl: string) => void;
}

/**
 * 视频封面上传对话框
 * 
 * 支持上传图片文件或输入图片 URL
 */
export function CoverUploadDialog({
  open,
  onOpenChange,
  onConfirm,
}: CoverUploadDialogProps) {
  const [imageUrl, setImageUrl] = useState("");
  
  const { uploadImage, uploadFromUrl, isUploading } = useImageUpload({
    onSuccess: (url) => {
      setImageUrl(url);
    },
  });

  // 重置状态
  useEffect(() => {
    if (!open) {
      setImageUrl("");
    }
  }, [open]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    await uploadImage(file);
  };

  const handleConfirm = () => {
    if (!imageUrl.trim()) {
      toast({
        variant: "error",
        title: "请先选择图片",
      });
      return;
    }
    onConfirm(imageUrl);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>上传视频封面</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* 图片预览 */}
          {imageUrl && (
            <div className="flex justify-center">
              <img
                src={imageUrl}
                alt="预览"
                className="max-h-64 rounded-lg border-2 border-gray-200"
              />
            </div>
          )}

          {/* 文件上传 */}
          <div>
            <Label htmlFor="cover-upload">选择图片</Label>
            <div className="mt-2">
              <input
                id="cover-upload"
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
                disabled={isUploading}
              />
              <label htmlFor="cover-upload">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  disabled={isUploading}
                  asChild
                >
                  <span className="flex items-center justify-center gap-2">
                    {isUploading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        上传中...
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4" />
                        {imageUrl ? "更换图片" : "选择图片"}
                      </>
                    )}
                  </span>
                </Button>
              </label>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              支持 JPG、PNG、GIF 格式，建议尺寸 9:16，最大 5MB
            </p>
          </div>

          {/* URL 输入 */}
          <div>
            <Label htmlFor="image-url">或输入图片URL</Label>
            <div className="flex gap-2 mt-2">
              <Input
                id="image-url"
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder={`${R2_PUBLIC_DOMAIN}/...`}
                className="flex-1"
              />
              {imageUrl && !imageUrl.includes(R2_PUBLIC_DOMAIN) && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => uploadFromUrl(imageUrl)}
                  disabled={isUploading}
                >
                  验证
                </Button>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              支持 R2 公开域名的图片链接
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button onClick={handleConfirm} disabled={!imageUrl || isUploading}>
            确认
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

