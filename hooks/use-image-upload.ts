import { useState } from "react";
import { uploadToR2, validateFile, validateImageFile } from "@/lib/r2-upload";
import { toast } from "@/hooks/use-toast";

export interface UseFileUploadOptions {
  onSuccess?: (url: string) => void;
  onError?: (error: Error) => void;
  allowedTypes?: string[]; // 允许的文件类型，如 ['jpg', 'png', 'pdf']
  maxSize?: number; // 最大文件大小（字节）
  isImageOnly?: boolean; // 是否只允许图片（默认 false）
}

export interface UseFileUploadReturn {
  uploadFile: (file: File) => Promise<string | null>;
  uploadFromUrl: (url: string) => Promise<string | null>;
  isUploading: boolean;
  error: Error | null;
}

/**
 * 文件上传 Hook
 * 
 * 统一处理文件上传到 Cloudflare R2，支持图片、文档、视频等多种文件类型
 * 
 * @example
 * ```typescript
 * // 上传图片
 * const { uploadFile, isUploading } = useFileUpload({
 *   isImageOnly: true,
 *   onSuccess: (url) => console.log('上传成功：', url),
 * });
 * 
 * // 上传任意文件
 * const { uploadFile } = useFileUpload({
 *   allowedTypes: ['pdf', 'doc', 'docx'],
 *   maxSize: 50 * 1024 * 1024, // 50MB
 * });
 * ```
 */
export function useFileUpload({
  onSuccess,
  onError,
  allowedTypes,
  maxSize,
  isImageOnly = false,
}: UseFileUploadOptions = {}): UseFileUploadReturn {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  /**
   * 上传文件
   */
  const uploadFile = async (file: File): Promise<string | null> => {
    // 验证文件
    const validation = isImageOnly
      ? validateImageFile(file)
      : validateFile(file, { allowedTypes, maxSize });

    if (!validation.valid) {
      const err = new Error(validation.error);
      setError(err);
      toast({
        variant: "error",
        title: "文件验证失败",
        description: validation.error,
      });
      if (onError) onError(err);
      return null;
    }

    setIsUploading(true);
    setError(null);

    try {
      // 上传到 Cloudflare R2
      const publicUrl = await uploadToR2(file);

      setIsUploading(false);

      toast({
        title: "上传成功",
        description: "文件已上传到云端",
      });

      if (onSuccess) onSuccess(publicUrl);
      return publicUrl;
    } catch (err) {
      setIsUploading(false);
      const error = err instanceof Error ? err : new Error("上传失败");
      setError(error);

      console.error("Upload error:", error);
      toast({
        variant: "error",
        title: "上传失败",
        description: error.message,
      });

      if (onError) onError(error);
      return null;
    }
  };

  /**
   * 从 URL 直接使用（不需要上传）
   */
  const uploadFromUrl = async (url: string): Promise<string | null> => {
    if (!url || !url.trim()) {
      const err = new Error("请输入有效的文件 URL");
      setError(err);
      toast({
        variant: "error",
        title: "URL 无效",
        description: "请输入有效的文件 URL",
      });
      if (onError) onError(err);
      return null;
    }

    // TODO: 可以调用 validateFileURL API 验证 URL 是否有效
    if (onSuccess) onSuccess(url);
    return url;
  };

  return {
    uploadFile,
    uploadFromUrl,
    isUploading,
    error,
  };
}

/**
 * 图片上传 Hook（兼容旧代码）
 */
export function useImageUpload(
  options: Omit<UseFileUploadOptions, "isImageOnly"> = {}
): UseFileUploadReturn {
  const result = useFileUpload({ ...options, isImageOnly: true });
  
  return {
    ...result,
    uploadImage: result.uploadFile, // 保持旧的 API 命名
  } as UseFileUploadReturn & { uploadImage: typeof result.uploadFile };
}

