# TikTok 视频嵌入问题修复文档

## 问题描述

TikTok 视频嵌入代码通过 `dangerouslySetInnerHTML` 无法正常加载，视频封面和播放器不显示。

## 根本原因

1. **Script 标签不执行**：使用 `dangerouslySetInnerHTML` 时，其中的 `<script>` 标签不会被浏览器执行
2. **需要手动初始化**：TikTok 嵌入需要调用 `window.tiktokEmbed.lib.render()` 来初始化播放器

## 解决方案

### 1. 创建专用的 TikTok 嵌入组件

创建了 `components/kol/tiktok-embed.tsx`，包含两个组件：

#### `TikTokEmbed` 组件
```typescript
export function TikTokEmbed({ embedCode, className }: TikTokEmbedProps)
```

**功能：**
- 从嵌入代码中提取 `<blockquote>` 部分（不包含 script）
- 使用 `useRef` 和 `useEffect` 管理 DOM 操作
- 等待 TikTok 脚本加载完成
- 自动调用 `tiktokEmbed.lib.render()` 初始化播放器
- 包含超时保护（最多等待 10 秒）

#### `TikTokVideoPreview` 组件
```typescript
export function TikTokVideoPreview({ embedCode }: { embedCode: string })
```

**功能：**
- 带边框和标签的预览容器
- 适用于模态框中的预览场景

### 2. 在全局 Layout 中加载 TikTok 脚本

```typescript
// app/layout.tsx
<Script 
  src="https://www.tiktok.com/embed.js" 
  strategy="afterInteractive"
/>
```

**注意：**
- 使用 `afterInteractive` 策略确保脚本在页面交互前加载
- 不使用 `onLoad` 回调（避免 Server Component 错误）

### 3. 在各个页面中使用组件

#### KOL Profile 页面 (`app/kol/profile/page.tsx`)
```typescript
import { TikTokEmbed, TikTokVideoPreview } from "@/components/kol/tiktok-embed";

// 视频卡片
<TikTokEmbed embedCode={video.embed_code} />

// 预览
<TikTokVideoPreview embedCode={embedCode} />
```

#### KOL 详情页 (`app/kol/marketplace/[id]/page.tsx`)
```typescript
import { TikTokEmbed } from "@/components/kol/tiktok-embed";

// 视频展示
<TikTokEmbed embedCode={video.embed_code} />
```

## 技术实现细节

### 脚本加载检测

```typescript
// 检查 TikTok 脚本是否已加载
if ((window as any).tiktokEmbed) {
  // 直接初始化
  (window as any).tiktokEmbed.lib.render(containerRef.current);
} else {
  // 轮询等待脚本加载
  const checkTikTok = setInterval(() => {
    if ((window as any).tiktokEmbed) {
      (window as any).tiktokEmbed.lib.render(containerRef.current);
      clearInterval(checkTikTok);
    }
  }, 100);
}
```

### Blockquote 提取

```typescript
// 使用正则表达式提取 blockquote 部分
const blockquoteMatch = embedCode.match(/<blockquote[\s\S]*?<\/blockquote>/i);
if (blockquoteMatch && containerRef.current) {
  containerRef.current.innerHTML = blockquoteMatch[0];
}
```

## 工作流程

1. **用户粘贴嵌入代码** → 包含完整的 `<blockquote>` 和 `<script>` 标签
2. **保存到数据库** → 存储完整的嵌入代码字符串
3. **渲染时：**
   - 提取 `<blockquote>` 部分
   - 插入到 DOM 中
   - 等待 TikTok 脚本加载
   - 调用 `tiktokEmbed.lib.render()` 初始化
4. **TikTok 播放器显示** → 显示视频封面、标题、作者等信息

## 常见问题解决

### Q: 视频不显示
**A:** 检查以下几点：
1. TikTok 脚本是否成功加载（查看浏览器控制台）
2. 嵌入代码格式是否正确
3. 网络是否能访问 TikTok 服务器

### Q: 首次加载慢
**A:** 这是正常的，因为需要：
1. 加载 TikTok 脚本（~100KB）
2. TikTok 服务器获取视频信息
3. 渲染播放器

可以优化：
- 使用 `afterInteractive` 策略预加载脚本
- 添加加载骨架屏

### Q: Server Component 错误
**A:** 确保：
1. 使用 `"use client"` 标记客户端组件
2. 不在 Server Component 中使用事件处理器
3. DOM 操作都在 `useEffect` 中进行

## 测试建议

1. **基本功能测试**
   - 添加新视频
   - 预览功能
   - 视频列表展示

2. **边界情况测试**
   - 无效的嵌入代码
   - 网络断开时
   - 脚本加载失败

3. **性能测试**
   - 多个视频同时加载
   - 页面切换时的清理

## 文件清单

更新的文件：
- ✅ `components/kol/tiktok-embed.tsx` - 新建，TikTok 嵌入组件
- ✅ `app/layout.tsx` - 添加 TikTok 脚本
- ✅ `app/kol/profile/page.tsx` - 使用新组件
- ✅ `app/kol/marketplace/[id]/page.tsx` - 使用新组件
- ✅ `lib/api/kol.ts` - 更新类型定义（已完成）

## 优势

1. **可复用性**：统一的组件可在多处使用
2. **可维护性**：逻辑集中在一个组件中
3. **健壮性**：包含错误处理和超时保护
4. **性能**：自动清理 interval 防止内存泄漏

## 后续优化建议

1. **加载状态**：添加加载指示器
2. **错误处理**：显示加载失败的提示
3. **懒加载**：视频进入视口时才初始化
4. **预加载**：提前加载用户可能访问的视频

---

最后更新：2025-10-25
状态：✅ 已修复并测试通过

