"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, Loader2, X } from "lucide-react";
import { useImageUpload } from "@/hooks/use-image-upload";

interface IconUploadProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  description?: string;
}

/**
 * 图标上传组件
 * 
 * 用于上传图标图片（如国旗、分类图标等）
 * - 只能通过上传按钮选择文件
 * - URL 输入框禁用，不可手动修改
 * - 支持预览和清除
 */
export function IconUpload({
  value,
  onChange,
  label = "图标",
  description = "支持 JPG、PNG、GIF、SVG 格式，建议尺寸 64x64px，最大 2MB",
}: IconUploadProps) {
  const { uploadFile, isUploading } = useImageUpload({
    onSuccess: (url) => {
      onChange(url);
    },
  });

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    await uploadFile(file);
    // 清空 input，这样下次选择同一文件也会触发
    e.target.value = "";
  };

  const handleClear = () => {
    onChange("");
  };

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      
      {/* 图片预览 */}
      {value && (
        <div className="relative inline-block">
          <div className="w-16 h-16 border-2 border-gray-200 rounded-lg overflow-hidden bg-gray-50 flex items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={value}
              alt="图标预览"
              className="max-w-full max-h-full object-contain"
            />
          </div>
          <button
            type="button"
            onClick={handleClear}
            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-md transition-colors"
            title="清除图标"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      )}

      {/* 上传按钮 */}
      <div>
        <input
          id="icon-upload"
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
          disabled={isUploading}
        />
        <label htmlFor="icon-upload">
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
                  {value ? "重新上传" : "选择图标"}
                </>
              )}
            </span>
          </Button>
        </label>
      </div>

      {/* URL 显示（只读） */}
      {value && (
        <div>
          <Label className="text-xs text-gray-500">图标URL（只读）</Label>
          <Input
            value={value}
            readOnly
            disabled
            className="text-xs font-mono bg-gray-50 cursor-not-allowed"
          />
        </div>
      )}

      {/* 描述 */}
      {description && (
        <p className="text-xs text-gray-500">{description}</p>
      )}
    </div>
  );
}

