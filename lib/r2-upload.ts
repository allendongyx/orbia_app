import { generateUploadToken } from "./api/upload";
import { isSuccessResponse, getErrorMessage } from "./api-client";

export const R2_PUBLIC_DOMAIN = "https://pub-7fecd33efbfc4271b901992eefd6a9ba.r2.dev";

/**
 * 上传文件到 Cloudflare R2
 * 
 * 使用预签名 URL（Presigned URL）方式上传，安全且高效：
 * 1. 不在前端暴露 R2 访问凭证
 * 2. 前端直接上传到 R2，不经过后端服务器
 * 3. 使用标准的 HTTP PUT 请求
 * 4. 支持多种文件类型（图片、文档、视频等）
 * 5. 文件路径由服务器自动管理，格式：{目录}/{年月}/{时间戳}_{随机数}.{扩展名}
 * 
 * @param file 要上传的文件
 * @returns 上传后的公开 URL
 * 
 * @example
 * ```typescript
 * const file = event.target.files[0];
 * const url = await uploadToR2(file);
 * console.log('文件地址：', url);
 * // 输出：https://pub-xxx.r2.dev/images/2025/01/1737849600_abc123.png
 * ```
 */
export async function uploadToR2(file: File): Promise<string> {
  // 1. 获取文件扩展名（自动转为小写）
  const fileExtension = file.name.split(".").pop() || "jpg";
  const extensionWithDot = fileExtension.startsWith(".")
    ? fileExtension.toLowerCase()
    : `.${fileExtension.toLowerCase()}`;

  // 2. 从后端获取预签名上传 URL 和必需的请求头
  const tokenResp = await generateUploadToken({
    file_extension: extensionWithDot,
    file_size: file.size,
  });

  if (!isSuccessResponse(tokenResp.base_resp)) {
    throw new Error(
      getErrorMessage(tokenResp.base_resp) || "Failed to generate upload token"
    );
  }

  // 3. 使用预签名 URL 直接上传文件到 R2（使用 PUT 方法）
  // 注意：这里直接上传到 Cloudflare R2，不经过我们的后端服务器
  const uploadResponse = await fetch(tokenResp.upload_url, {
    method: "PUT",
    headers: tokenResp.headers, // 使用服务端返回的必需请求头（包含 Content-Type 等）
    body: file,
  });

  if (!uploadResponse.ok) {
    throw new Error(`Upload failed: ${uploadResponse.statusText}`);
  }

  // 4. 返回公开访问 URL（CDN 地址）
  return tokenResp.public_url;
}

/**
 * 支持的文件类型配置
 */
const FILE_TYPE_CONFIG: Record<
  string,
  { maxSize: number; description: string }
> = {
  // 图片类型
  jpg: { maxSize: 10 * 1024 * 1024, description: "JPG 图片" },
  jpeg: { maxSize: 10 * 1024 * 1024, description: "JPEG 图片" },
  png: { maxSize: 10 * 1024 * 1024, description: "PNG 图片" },
  gif: { maxSize: 5 * 1024 * 1024, description: "GIF 图片" },
  webp: { maxSize: 10 * 1024 * 1024, description: "WebP 图片" },
  
  // 文档类型
  pdf: { maxSize: 50 * 1024 * 1024, description: "PDF 文档" },
  doc: { maxSize: 20 * 1024 * 1024, description: "Word 文档" },
  docx: { maxSize: 20 * 1024 * 1024, description: "Word 文档" },
  xls: { maxSize: 20 * 1024 * 1024, description: "Excel 表格" },
  xlsx: { maxSize: 20 * 1024 * 1024, description: "Excel 表格" },
  ppt: { maxSize: 50 * 1024 * 1024, description: "PowerPoint 演示文稿" },
  pptx: { maxSize: 50 * 1024 * 1024, description: "PowerPoint 演示文稿" },
  txt: { maxSize: 1 * 1024 * 1024, description: "文本文件" },
  
  // 视频类型
  mp4: { maxSize: 100 * 1024 * 1024, description: "MP4 视频" },
  mov: { maxSize: 100 * 1024 * 1024, description: "MOV 视频" },
  avi: { maxSize: 100 * 1024 * 1024, description: "AVI 视频" },
};

/**
 * 验证文件
 * 
 * @param file 要验证的文件
 * @param options 验证选项
 * @returns 验证结果
 */
export function validateFile(
  file: File,
  options?: {
    allowedTypes?: string[]; // 允许的文件类型，如 ['jpg', 'png']
    maxSize?: number; // 最大文件大小（字节），覆盖默认配置
  }
): {
  valid: boolean;
  error?: string;
} {
  // 获取文件扩展名
  const extension = file.name.split(".").pop()?.toLowerCase() || "";

  // 检查是否是支持的文件类型
  if (!FILE_TYPE_CONFIG[extension]) {
    return {
      valid: false,
      error: `不支持的文件格式：.${extension}`,
    };
  }

  // 如果指定了允许的类型，检查是否在允许列表中
  if (options?.allowedTypes && !options.allowedTypes.includes(extension)) {
    return {
      valid: false,
      error: `只支持 ${options.allowedTypes.map(t => t.toUpperCase()).join("、")} 格式`,
    };
  }

  // 检查文件大小
  const maxSize = options?.maxSize ?? FILE_TYPE_CONFIG[extension].maxSize;
  if (file.size > maxSize) {
    const maxSizeMB = (maxSize / (1024 * 1024)).toFixed(0);
    return {
      valid: false,
      error: `文件大小不能超过 ${maxSizeMB}MB`,
    };
  }

  return { valid: true };
}

/**
 * 验证图片文件（兼容旧代码）
 */
export function validateImageFile(file: File): {
  valid: boolean;
  error?: string;
} {
  return validateFile(file, {
    allowedTypes: ["jpg", "jpeg", "png", "gif", "webp"],
  });
}

/**
 * 获取文件类型描述
 */
export function getFileTypeDescription(filename: string): string {
  const extension = filename.split(".").pop()?.toLowerCase() || "";
  return FILE_TYPE_CONFIG[extension]?.description || "未知文件类型";
}

