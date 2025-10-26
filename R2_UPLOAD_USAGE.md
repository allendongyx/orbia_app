# R2 上传使用指南

本文档说明如何在前端使用 Cloudflare R2 上传功能。

## 快速开始

### 1. 使用封装好的 Hook

最简单的方式是使用 `useImageUpload` Hook：

```typescript
import { useImageUpload } from "@/hooks/use-image-upload";
import { ImageType } from "@/lib/api/upload";

function MyComponent() {
  const { uploadImage, isUploading } = useImageUpload({
    imageType: ImageType.VIDEO_COVER,
    onSuccess: (url) => {
      console.log("上传成功！URL:", url);
      // 使用 URL，例如保存到表单或发送到后端
    },
    onError: (error) => {
      console.error("上传失败:", error);
    },
  });

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = await uploadImage(file);
      // url 就是上传后的公开访问地址
    }
  };

  return (
    <input
      type="file"
      accept="image/*"
      onChange={handleFileSelect}
      disabled={isUploading}
    />
  );
}
```

### 2. 使用封装好的组件

使用 `CoverUploadDialog` 组件（用于视频封面上传）：

```typescript
import { CoverUploadDialog } from "@/components/kol/cover-upload-dialog";

function MyComponent() {
  const [showDialog, setShowDialog] = useState(false);
  const [coverUrl, setCoverUrl] = useState("");

  return (
    <>
      <Button onClick={() => setShowDialog(true)}>上传封面</Button>
      
      <CoverUploadDialog
        open={showDialog}
        onOpenChange={setShowDialog}
        onConfirm={(url) => {
          setCoverUrl(url);
          setShowDialog(false);
          console.log("封面 URL:", url);
        }}
      />
    </>
  );
}
```

### 3. 直接使用上传函数

如果需要更底层的控制：

```typescript
import { uploadToR2 } from "@/lib/r2-upload";
import { ImageType } from "@/lib/api/upload";

async function handleUpload(file: File) {
  try {
    // 上传到 R2
    const publicUrl = await uploadToR2(file, ImageType.VIDEO_COVER);
    
    console.log("上传成功！公开 URL:", publicUrl);
    // 现在可以使用这个 URL，比如保存到数据库
    
    return publicUrl;
  } catch (error) {
    console.error("上传失败:", error);
    throw error;
  }
}
```

## 图片类型

系统支持以下图片类型：

```typescript
export enum ImageType {
  AVATAR = 1,      // 头像
  TEAM_ICON = 2,   // 团队图标
  VIDEO_COVER = 3, // 视频封面
}
```

## 上传流程说明

整个上传流程分为三步：

```
1. 前端 → 后端：请求上传 Token
   ↓
2. 前端 → R2：使用预签名 URL 直接上传文件（PUT 方法）
   ↓
3. 前端 → 后端：使用返回的 public_url 更新资源
```

### 详细流程

```typescript
// 1. 获取上传凭证（预签名 URL）
const tokenResp = await generateUploadToken({
  image_type: ImageType.VIDEO_COVER,
  file_extension: ".jpg",
  file_size: file.size,
});

// tokenResp 包含：
// - upload_url: 预签名的上传 URL
// - public_url: 上传成功后的公开访问 URL
// - headers: 上传时必需的 HTTP 请求头
// - expires_in: URL 有效期（默认 30 分钟）

// 2. 使用预签名 URL 上传文件
await fetch(tokenResp.upload_url, {
  method: "PUT",
  headers: tokenResp.headers,
  body: file,
});

// 3. 使用 public_url
// 上传成功后，public_url 就是图片的 CDN 地址
// 可以直接在前端显示，或保存到后端数据库
```

## 文件验证

上传前会自动验证文件：

```typescript
import { validateImageFile } from "@/lib/r2-upload";

const validation = validateImageFile(file);
if (!validation.valid) {
  console.error(validation.error);
  // 可能的错误：
  // - "请选择图片文件"
  // - "图片大小不能超过 5MB"
  // - "只支持 JPG、PNG、GIF、WebP 格式"
}
```

## 错误处理

```typescript
try {
  const url = await uploadToR2(file, ImageType.VIDEO_COVER);
} catch (error) {
  if (error.message.includes("Failed to generate upload token")) {
    // 后端返回错误
    console.error("无法获取上传凭证");
  } else if (error.message.includes("Upload failed")) {
    // R2 上传失败
    console.error("上传到 R2 失败");
  } else {
    console.error("未知错误:", error);
  }
}
```

## 安全性说明

✅ **安全优势：**

1. **不暴露凭证**：前端无法获取 R2 的 Access Key 和 Secret Key
2. **预签名 URL**：URL 包含签名，只能上传到指定路径
3. **时间限制**：URL 有 30 分钟有效期
4. **文件验证**：后端验证文件类型和大小
5. **用户认证**：必须登录才能获取上传 Token

## 使用建议

1. **不要缓存 Token**：每次上传都重新获取
2. **前端验证文件**：上传前验证文件类型和大小
3. **显示上传进度**：使用 XMLHttpRequest 或 Axios
4. **错误处理**：捕获并友好提示错误信息
5. **使用 CDN URL**：`public_url` 已经是 CDN 地址，直接使用

## 完整示例

```typescript
import { useState } from "react";
import { uploadToR2, validateImageFile } from "@/lib/r2-upload";
import { ImageType } from "@/lib/api/upload";
import { toast } from "@/hooks/use-toast";

function ImageUploader() {
  const [uploading, setUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState("");

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 1. 前端验证
    const validation = validateImageFile(file);
    if (!validation.valid) {
      toast({
        variant: "error",
        title: "文件验证失败",
        description: validation.error,
      });
      return;
    }

    setUploading(true);

    try {
      // 2. 上传到 R2
      const publicUrl = await uploadToR2(file, ImageType.VIDEO_COVER);

      // 3. 保存 URL
      setImageUrl(publicUrl);

      // 4. 可选：将 URL 发送到后端保存
      // await saveToBackend({ cover_url: publicUrl });

      toast({
        title: "上传成功",
        description: "图片已上传到云端",
      });
    } catch (error) {
      console.error("Upload error:", error);
      toast({
        variant: "error",
        title: "上传失败",
        description: error instanceof Error ? error.message : "请重试",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <input
        type="file"
        accept="image/*"
        onChange={handleUpload}
        disabled={uploading}
      />
      {uploading && <p>上传中...</p>}
      {imageUrl && (
        <div>
          <p>上传成功！</p>
          <img src={imageUrl} alt="Uploaded" style={{ maxWidth: "300px" }} />
          <p>URL: {imageUrl}</p>
        </div>
      )}
    </div>
  );
}
```

## 常见问题

### Q: 为什么使用 PUT 而不是 POST？

A: 预签名 URL 使用的是 S3 的 PutObject 操作，对应 HTTP PUT 方法。这是标准做法。

### Q: 上传 Token 可以重复使用吗？

A: 不建议。虽然 Token 有 30 分钟有效期，但每次上传都应该获取新的 Token，确保安全性。

### Q: 支持上传进度吗？

A: 可以使用 XMLHttpRequest 或 Axios 的进度回调：

```typescript
const xhr = new XMLHttpRequest();
xhr.upload.addEventListener("progress", (e) => {
  if (e.lengthComputable) {
    const percent = (e.loaded / e.total) * 100;
    console.log(`上传进度: ${percent.toFixed(2)}%`);
  }
});

xhr.open("PUT", uploadToken.upload_url);
Object.entries(uploadToken.headers).forEach(([key, value]) => {
  xhr.setRequestHeader(key, value);
});
xhr.send(file);
```

### Q: 公开 URL 是什么格式？

A: 类似 `https://pub-7fecd33efbfc4271b901992eefd6a9ba.r2.dev/avatars/xxx.jpg`

这是 CDN 地址，可以直接在前端使用。

## 技术支持

如有问题，请查看：
- Cloudflare R2 文档：https://developers.cloudflare.com/r2/
- AWS S3 预签名 URL：https://docs.aws.amazon.com/AmazonS3/latest/userguide/PresignedUrlUploadObject.html

