# 认证系统设置指南

## 功能特性

- ✅ 邮箱密码登录
- ✅ MetaMask 钱包登录
- ✅ JWT Token 本地存储
- ✅ Token 自动过期检查
- ✅ 用户信息管理
- ✅ 自动刷新用户状态
- ✅ 完整的错误处理

## 配置步骤

### 1. 环境变量配置

复制 `.env.example` 为 `.env.local`:

```bash
cp .env.example .env.local
```

修改 API 地址为你的后端服务地址:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080
```

### 2. API 接口要求

后端需要实现以下接口：

#### 邮箱登录
- **POST** `/api/v1/auth/email-login`
- Request:
  ```json
  {
    "email": "user@example.com",
    "password": "password123"
  }
  ```
- Response:
  ```json
  {
    "token": "jwt_token_string",
    "expires_in": 7200,
    "base_resp": {
      "code": 0,
      "msg": "success"
    }
  }
  ```

#### 钱包登录
- **POST** `/api/v1/auth/wallet-login`
- Request:
  ```json
  {
    "wallet_address": "0x...",
    "signature": "0x...",
    "message": "Welcome to Orbia!..."
  }
  ```
- Response: 同邮箱登录

#### 获取用户信息
- **POST** `/api/v1/user/profile`
- Headers: `Authorization: Bearer {token}`
- Response:
  ```json
  {
    "user": {
      "id": 123,
      "wallet_address": "0x...",
      "email": "user@example.com",
      "nickname": "User Name",
      "avatar_url": "https://...",
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z"
    },
    "base_resp": {
      "code": 0,
      "msg": "success"
    }
  }
  ```

### 3. 本地存储

系统使用 `localStorage` 存储以下信息：

- `auth_token`: JWT Token
- `token_expiry`: Token 过期时间戳

### 4. MetaMask 集成

用户点击 "Sign in with MetaMask" 按钮时：

1. 检查 MetaMask 是否安装
2. 请求账户访问权限
3. 生成签名消息
4. 请求用户签名
5. 发送签名到后端验证
6. 保存返回的 JWT Token
7. 获取用户信息

### 5. 使用方式

#### 在组件中使用认证状态

```tsx
import { useAuth } from '@/contexts/auth-context';

function MyComponent() {
  const { user, isLoggedIn, isLoading, logout } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isLoggedIn) {
    return <div>Please login</div>;
  }

  return (
    <div>
      <p>Welcome, {user.nickname}!</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

#### 在 API 请求中自动携带 Token

使用 `apiRequest` 函数会自动从 localStorage 获取 token 并添加到请求头：

```tsx
import { apiRequest } from '@/lib/api-client';

const data = await apiRequest('/api/v1/some-endpoint', {
  method: 'POST',
  body: JSON.stringify({ ... }),
});
```

## 边界情况处理

### 1. Token 过期
- 系统会自动检查 token 是否过期
- 过期后自动清除并要求重新登录

### 2. MetaMask 未安装
- 显示友好的错误提示
- 引导用户安装 MetaMask

### 3. 用户拒绝签名
- 捕获 code 4001 错误
- 显示适当的提示信息

### 4. 网络错误
- 统一的错误处理机制
- 显示错误消息给用户

### 5. API 响应错误
- 检查 `base_resp.code`
- 根据错误码显示相应提示

## 安全注意事项

1. **Token 存储**: Token 存储在 localStorage，注意防范 XSS 攻击
2. **HTTPS**: 生产环境必须使用 HTTPS
3. **Token 过期**: 设置合理的过期时间
4. **签名验证**: 后端必须验证钱包签名的有效性
5. **敏感操作**: 重要操作应要求二次验证

## 测试

### 邮箱登录测试
1. 打开应用
2. 点击左下角 "Sign In" 按钮
3. 输入邮箱和密码
4. 点击 "Sign in with Email"
5. 验证登录成功后状态更新

### MetaMask 登录测试
1. 确保已安装 MetaMask
2. 点击 "Sign in with MetaMask"
3. 在 MetaMask 弹窗中点击连接
4. 签名消息
5. 验证登录成功

### 登出测试
1. 登录后点击用户头像
2. 点击 "Logout"
3. 验证状态清除，显示登录按钮

## 故障排查

### Token 无效
```bash
# 清除浏览器存储
localStorage.clear();
```

### API 连接失败
- 检查 `.env.local` 中的 `NEXT_PUBLIC_API_BASE_URL`
- 确认后端服务正在运行
- 检查浏览器控制台网络请求

### MetaMask 问题
- 确认 MetaMask 已安装并解锁
- 检查浏览器控制台错误信息
- 尝试重新连接钱包

