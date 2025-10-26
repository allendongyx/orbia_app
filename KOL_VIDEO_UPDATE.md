# KOL 视频功能更新文档

## 更新概述

根据最新的接口定义，KOL 视频功能已经更新为使用 TikTok 嵌入代码（embed code）的方式来添加和管理视频。

## 主要变更

### 1. 数据结构简化

**旧的 KolVideo 结构：**
```typescript
interface KolVideo {
  id: number;
  title: string;
  content: string;
  cover_url: string;
  video_url: string;
  platform: 'tiktok' | 'youtube';
  platform_video_id?: string;
  likes_count: number;
  views_count: number;
  comments_count: number;
  shares_count: number;
  published_at: string;
  created_at: string;
}
```

**新的 KolVideo 结构：**
```typescript
interface KolVideo {
  id: number;
  embed_code: string;  // TikTok 嵌入代码
  created_at: string;
  updated_at: string;
}
```

### 2. API 接口更新

#### 创建视频请求
```typescript
// 旧接口
interface CreateKolVideoReq {
  title: string;
  content: string;
  cover_url: string;
  video_url: string;
  platform: 'tiktok' | 'youtube';
  // ... 其他字段
}

// 新接口
interface CreateKolVideoReq {
  embed_code: string;  // 只需要嵌入代码
}
```

#### 更新视频请求
```typescript
// 旧接口
interface UpdateKolVideoReq {
  video_id: number;
  title?: string;
  content?: string;
  cover_url?: string;
  video_url?: string;
  // ... 其他可选字段
}

// 新接口
interface UpdateKolVideoReq {
  video_id: number;
  embed_code: string;  // 只需要视频ID和嵌入代码
}
```

### 3. 前端组件更新

#### KOL Profile 页面 (`app/kol/profile/page.tsx`)

**VideoModal 组件：**
- 简化了表单，只需要输入 TikTok 嵌入代码
- 添加了嵌入代码预览功能
- 提供了获取嵌入代码的提示信息

**VideoCard 组件：**
- 使用 `dangerouslySetInnerHTML` 渲染 TikTok 嵌入代码
- 显示视频创建日期
- 保留编辑和删除功能

#### KOL 详情页面 (`app/kol/marketplace/[id]/page.tsx`)

**视频展示部分：**
- 使用嵌入代码直接渲染 TikTok 视频
- 显示视频创建日期
- 优化了加载状态和空状态的显示

### 4. 全局脚本添加

在 `app/layout.tsx` 中添加了 TikTok 嵌入脚本：
```typescript
<Script 
  src="https://www.tiktok.com/embed.js" 
  strategy="lazyOnload"
/>
```

## 使用方法

### 如何获取 TikTok 嵌入代码

1. 打开 TikTok 视频页面
2. 点击分享按钮
3. 选择"嵌入"选项
4. 复制完整的嵌入代码

### 嵌入代码格式示例

```html
<blockquote class="tiktok-embed" cite="https://www.tiktok.com/@quiet_li/video/7543042661066788103" data-video-id="7543042661066788103" style="max-width: 605px;min-width: 325px;">
  <section>
    <a target="_blank" title="@quiet_li" href="https://www.tiktok.com/@quiet_li?refer=embed">@quiet_li</a>
    <p></p>
    <a target="_blank" title="♬ 原声  - 🇰🇷杨利伟🇰🇷" href="https://www.tiktok.com/music/原声-🇰🇷杨利伟🇰🇷-7543042705400548097?refer=embed">♬ 原声  - 🇰🇷杨利伟🇰🇷</a>
  </section>
</blockquote>
<script async src="https://www.tiktok.com/embed.js"></script>
```

## 文件清单

以下文件已更新：

1. **`lib/api/kol.ts`** - 更新了类型定义和接口
2. **`app/kol/profile/page.tsx`** - 更新了视频管理功能
3. **`app/kol/marketplace/[id]/page.tsx`** - 更新了视频展示功能
4. **`app/layout.tsx`** - 添加了 TikTok 嵌入脚本

## 功能特性

### ✅ 已实现的功能

- ✅ 通过嵌入代码添加 TikTok 视频
- ✅ 编辑视频的嵌入代码
- ✅ 删除视频
- ✅ 视频预览功能
- ✅ 在 KOL 个人资料页面管理视频
- ✅ 在 KOL 详情页面展示视频
- ✅ 自动加载 TikTok 嵌入脚本

### 🎯 优化建议

1. **安全性**：建议在后端验证嵌入代码的格式和来源
2. **性能**：考虑为视频添加懒加载功能
3. **体验**：可以添加视频加载失败的错误处理

## 注意事项

1. **嵌入代码必须是完整的**：包括 `<blockquote>` 标签和 `<script>` 标签
2. **安全性**：使用 `dangerouslySetInnerHTML` 需要确保内容安全
3. **兼容性**：确保 TikTok 嵌入脚本在所有目标浏览器上正常工作
4. **网络依赖**：视频展示需要连接到 TikTok 服务器

## 测试建议

1. 测试添加新视频功能
2. 测试编辑现有视频
3. 测试删除视频
4. 测试视频在不同页面的展示效果
5. 测试视频预览功能
6. 测试无效嵌入代码的错误处理

## 技术栈

- **Next.js**: 14+
- **React**: 18+
- **TypeScript**: 5+
- **TailwindCSS**: 3+
- **Radix UI**: 组件库

---

更新日期：2025-10-25

