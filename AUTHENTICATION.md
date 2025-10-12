# 登录功能实现说明

## ✅ 已完成功能

### 1. 认证系统架构

#### 文件结构
```
lib/
  ├── api-client.ts          # API 请求基础配置
  ├── auth.ts                # 认证工具函数
  └── api/
      ├── auth.ts            # 认证相关 API
      └── user.ts            # 用户相关 API

contexts/
  └── auth-context.tsx       # 全局认证状态管理

components/
  ├── auth/
  │   └── login-modal.tsx    # 登录模态框
  └── ui/
      └── dialog.tsx         # Dialog 组件
```

### 2. JWT Token 管理

#### 本地存储方案
- **存储位置**: `localStorage`
- **存储内容**:
  - `auth_token`: JWT Token 字符串
  - `token_expiry`: 过期时间戳（毫秒）

#### 自动过期检查
```typescript
// 获取 token 时自动检查是否过期
const token = getAuthToken(); // 如果过期自动返回 null
```

### 3. 登录方式

#### A. 邮箱登录
- 输入邮箱和密码
- 调用 `/api/v1/auth/email-login`
- 保存返回的 JWT Token
- 获取用户信息

#### B. MetaMask 钱包登录  
- 检查 MetaMask 是否安装
- 请求账户连接权限
- 生成签名消息
- 用户在 MetaMask 中签名
- 发送签名到后端验证
- 保存 JWT Token
- 获取用户信息

### 4. 用户状态管理

使用 React Context 管理全局登录状态：

```typescript
const { 
  user,         // 用户信息
  isLoggedIn,   // 是否已登录
  isLoading,    // 加载状态
  login,        // 登录方法
  logout,       // 登出方法
  refreshUser   // 刷新用户信息
} = useAuth();
```

### 5. UI 集成

#### 未登录状态
- 左下角显示 "Sign In" 按钮
- 点击弹出登录模态框

#### 已登录状态
- 显示用户头像和信息
- 点击显示下拉菜单
- 包含登出选项

### 6. 边界情况处理

#### ✅ Token 过期
- 自动检测并清除过期 token
- 重定向到登录状态

#### ✅ MetaMask 未安装
```typescript
if (typeof window.ethereum === 'undefined') {
  setError('Please install MetaMask to use wallet login');
}
```

#### ✅ 用户拒绝签名
```typescript
if (err.code === 4001) {
  setError('You rejected the signature request');
}
```

#### ✅ 网络请求失败
- 统一错误处理
- 友好的错误提示

#### ✅ API 错误响应
- 检查 `base_resp.code`
- 显示后端返回的错误消息

## 📝 使用指南

### 1. 配置 API 地址

创建 `.env.local` 文件：

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080
```

### 2. 启动开发服务器

```bash
npm run dev
```

### 3. 测试登录功能

#### 邮箱登录测试
1. 访问 http://localhost:3000
2. 点击左下角 "Sign In" 
3. 输入邮箱和密码
4. 点击 "Sign in with Email"
5. 检查是否成功登录

#### MetaMask 登录测试
1. 确保安装了 MetaMask 浏览器扩展
2. 点击 "Sign in with MetaMask"
3. 在 MetaMask 弹窗中：
   - 选择账户并点击"下一步"
   - 点击"连接"
4. 签名消息
5. 检查是否成功登录

### 4. 在组件中使用

```tsx
'use client';

import { useAuth } from '@/contexts/auth-context';

export default function MyPage() {
  const { user, isLoggedIn, logout } = useAuth();

  if (!isLoggedIn) {
    return <div>Please login</div>;
  }

  return (
    <div>
      <h1>Welcome, {user.nickname}!</h1>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

### 5. API 请求示例

```tsx
import { apiRequest } from '@/lib/api-client';

// Token 会自动从 localStorage 获取并添加到 Header
const response = await apiRequest('/api/v1/some-endpoint', {
  method: 'POST',
  body: JSON.stringify({ data: 'value' }),
});
```

## 🔒 安全考虑

### 1. Token 存储
- ⚠️ localStorage 容易受 XSS 攻击
- 建议：生产环境考虑使用 httpOnly cookie

### 2. HTTPS
- ⚠️ Token 传输必须使用 HTTPS
- 本地开发可以用 HTTP

### 3. Token 过期
- ✅ 默认 2 小时过期（7200 秒）
- 可根据需求调整

### 4. 签名验证
- ✅ 后端必须验证 MetaMask 签名
- 防止伪造签名攻击

## 🐛 故障排查

### Token 无法保存
```javascript
// 在浏览器控制台检查
console.log(localStorage.getItem('auth_token'));
```

### API 请求失败
1. 检查 `.env.local` 配置
2. 确认后端服务运行中
3. 查看浏览器 Network 面板
4. 检查 CORS 设置

### MetaMask 连接失败
1. 确认 MetaMask 已安装
2. 确认 MetaMask 已解锁
3. 查看浏览器控制台错误
4. 尝试刷新页面重新连接

## 📦 依赖包

```json
{
  "@radix-ui/react-dialog": "^1.1.15",
  "@radix-ui/react-avatar": "^1.1.10",
  "@radix-ui/react-dropdown-menu": "^2.1.16"
}
```

## 🎯 下一步优化建议

1. **刷新 Token**: 实现 token 自动刷新机制
2. **记住登录**: 添加"记住我"功能
3. **多因素认证**: 支持 2FA
4. **社交登录**: 添加 Google、Twitter 等登录
5. **密码重置**: 实现忘记密码功能
6. **错误日志**: 集成错误追踪服务
7. **加载状态**: 优化加载动画
8. **表单验证**: 增强表单验证逻辑

