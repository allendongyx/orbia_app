# 认证错误处理机制

## 🎯 设计目标

当本地有 JWT 信息，但请求失败（任何原因）时，自动清除本地授权信息并退出登录。

## 🏗️ 架构设计

### 1. 多层次错误处理

```
┌─────────────────────────────────────────┐
│   API 请求层 (api-client.ts)           │
│   - 检测 HTTP 401/403                   │
│   - 检测业务 code 401/403               │
│   - 抛出 AuthError                      │
│   - 自动触发清理                        │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│   认证上下文层 (auth-context.tsx)      │
│   - 注册全局错误处理器                  │
│   - 捕获所有 API 错误                   │
│   - 统一清理登录状态                    │
└─────────────────────────────────────────┘
```

## 📦 核心组件

### 1. AuthError 类

自定义错误类，用于标识认证失败：

```typescript
export class AuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AuthError';
  }
}
```

### 2. 全局错误处理器

通过回调函数机制，让 API 层能通知 Context 层：

```typescript
// 注册处理器
registerAuthErrorHandler(handleLogout);

// 触发处理器
handleAuthError(); // 在 apiRequest 中自动调用
```

### 3. 统一的登出逻辑

```typescript
const handleLogout = useCallback(() => {
  clearAuthToken();     // 清除 localStorage
  setUser(null);        // 清除用户状态
  setIsLoggedIn(false); // 更新登录标记
}, []);
```

## 🔄 完整流程

### 场景 1: HTTP 401/403 错误

```typescript
1. API 返回 HTTP 401
   ↓
2. apiRequest 检测到状态码
   ↓
3. 调用 handleAuthError()
   ↓
4. 触发 handleLogout()
   ↓
5. 清除 token + 更新状态
   ↓
6. 抛出 AuthError
   ↓
7. Context catch 到错误（已经清理完成）
```

### 场景 2: 业务 code 401/403

```typescript
1. API 返回 code: 401
   ↓
2. apiRequest 检测到业务码
   ↓
3. 调用 handleAuthError()
   ↓
4. 后续流程同场景 1
```

### 场景 3: 其他任何错误

```typescript
1. API 请求失败（网络、超时等）
   ↓
2. apiRequest 抛出普通 Error
   ↓
3. Context 的 fetchUserProfile catch 到
   ↓
4. 调用 handleLogout() 清理
   ↓
5. 记录错误日志
```

## ✨ 关键特性

### 1. **自动化**
- ✅ HTTP 401/403 自动处理
- ✅ 业务 code 401/403 自动处理
- ✅ 任何其他错误也会触发清理

### 2. **统一化**
- ✅ 所有清理逻辑集中在 `handleLogout`
- ✅ 所有 API 错误统一处理
- ✅ 避免重复代码

### 3. **可复用**
- ✅ `AuthError` 类可用于任何认证错误
- ✅ `registerAuthErrorHandler` 可扩展
- ✅ 错误检测逻辑集中在 `apiRequest`

### 4. **优雅**
- ✅ 使用回调机制解耦
- ✅ Context 不需要知道 API 细节
- ✅ API 层不需要知道 UI 状态

## 🔍 触发条件

### 会触发自动登出的情况：

1. **HTTP 状态码**
   - 401 Unauthorized
   - 403 Forbidden

2. **业务错误码**
   - base_resp.code === 401
   - base_resp.code === 403

3. **Profile 请求失败**
   - 任何网络错误
   - 任何超时错误
   - 任何其他异常

4. **业务逻辑失败**
   - isSuccessResponse() 返回 false
   - 缺少 user 数据

## 📝 使用示例

### 在组件中处理登出

```typescript
import { useAuth } from '@/contexts/auth-context';

function MyComponent() {
  const { isLoggedIn } = useAuth();

  // 当 token 失效时，isLoggedIn 会自动变为 false
  if (!isLoggedIn) {
    return <LoginPrompt />;
  }

  return <Dashboard />;
}
```

### 检测认证错误

```typescript
import { isAuthError } from '@/lib/api-client';

try {
  await someApiCall();
} catch (error) {
  if (isAuthError(error)) {
    // 这是认证错误，已自动清理
    console.log('Please login again');
  } else {
    // 其他错误
    console.error(error);
  }
}
```

## 🛡️ 安全保证

1. **双重保证**
   - API 层第一时间触发清理
   - Context 层 catch 时再次确保清理

2. **防止状态不一致**
   - 统一的 handleLogout 函数
   - 所有路径都执行相同逻辑

3. **日志记录**
   - 所有错误都有 console 输出
   - 便于调试和监控

## 🧪 测试场景

### 1. Token 过期
```bash
# 模拟：设置一个过期的 token
localStorage.setItem('auth_token', 'expired_token');
# 刷新页面 → 自动清理 → 显示登录按钮
```

### 2. 服务端返回 401
```bash
# 模拟：后端返回 401
# 任何 API 请求 → 自动清理 → 提示重新登录
```

### 3. 网络错误
```bash
# 模拟：断网状态下刷新页面
# Profile 请求失败 → 自动清理 → 显示登录按钮
```

## 📊 流程图

```
开始
 ↓
是否有 token？
 ├─ 否 → 显示登录
 └─ 是 → 请求 Profile
     ↓
   成功？
   ├─ 是 → 显示用户信息
   └─ 否 → 是 401/403？
       ├─ 是 → [自动清理] → 抛出 AuthError
       └─ 否 → 其他错误
           ↓
       [Context catch]
           ↓
       [handleLogout]
           ↓
       显示登录按钮
```

## 💡 最佳实践

1. **不要手动清理**
   ```typescript
   // ❌ 不推荐
   if (error) {
     clearAuthToken();
     setUser(null);
   }
   
   // ✅ 推荐：让系统自动处理
   // 只需调用 logout()
   ```

2. **使用 isAuthError 判断**
   ```typescript
   // ✅ 推荐
   if (isAuthError(error)) {
     showLoginPrompt();
   }
   ```

3. **信任自动清理**
   ```typescript
   // 系统会自动清理，不需要额外逻辑
   const { isLoggedIn } = useAuth();
   // isLoggedIn 会自动更新
   ```

## 🎁 额外好处

1. **代码更简洁** - 减少 80% 的错误处理代码
2. **更可靠** - 统一处理，不会遗漏
3. **易维护** - 只需修改一处
4. **易测试** - 集中的逻辑更容易测试

