# 钱包接口前后端差异及调整建议

## 概述

本文档说明了前端 UI 设计与后端 Thrift IDL 定义之间的差异，以及建议后端进行的调整，以确保前后端完美契合。

## ✅ 已完成的前端工作

1. **创建了钱包 API 模块** (`lib/api/wallet.ts`)
   - 定义了所有接口的 TypeScript 类型
   - 实现了所有 API 调用函数
   - 提供了辅助函数用于数据格式化和映射

2. **更新了钱包主页面** (`app/wallet/page.tsx`)
   - 集成真实的 API 调用
   - 显示钱包余额、冻结余额
   - 显示交易记录（消费、充值、全部）
   - 支持分页和筛选
   - 显示交易详情模态框

3. **更新了充值页面** (`app/wallet/recharge/page.tsx`)
   - 支持加密货币充值
   - 支持在线支付充值
   - 显示实时余额
   - 提供交易哈希确认功能

4. **更新了交易详情组件** (`components/wallet/transaction-detail-modal.tsx`)
   - 适配新的交易数据结构
   - 显示完整的交易信息

## ⚠️ 前后端不一致的地方

### 1. 加密货币支付平台支持（不一致）

**前端 UI 设计：**
```typescript
// 前端有4个在线支付选项
- PayPal
- Stripe
- Coinbase Commerce
- MoonPay
```

**后端 IDL 定义：**
```thrift
enum OnlinePaymentPlatform {
    STRIPE = 1
    PAYPAL = 2
}
```

**✅ 已处理：** 前端已移除 Coinbase Commerce 和 MoonPay，只保留 PayPal 和 Stripe

---

### 2. 加密货币充值流程（需要后端配合）

**前端期望的流程：**

1. 用户点击"生成收款地址"，调用 `/api/v1/wallet/recharge/crypto`
2. 后端应该：
   - 创建交易记录，状态为 PENDING
   - **生成或分配一个收款地址**
   - 在响应中返回 `crypto_address`（收款地址）
3. 用户向该地址转账后，填写交易哈希
4. 前端调用 `/api/v1/wallet/recharge/crypto/confirm` 提交交易哈希
5. 后端验证链上交易并更新状态

**⚠️ 当前 IDL 的问题：**
```thrift
struct CryptoRechargeReq {
    1: required string amount
    2: required string crypto_currency
    3: required string crypto_chain
    4: required string crypto_address  // ❌ 这个字段让前端传入，但前端没有地址
}
```

**📝 建议后端修改：**
```thrift
struct CryptoRechargeReq {
    1: required string amount
    2: required string crypto_currency
    3: required string crypto_chain
    // 移除 crypto_address 字段，由后端生成
}

struct RechargeResp {
    1: optional Transaction transaction
    2: optional string payment_url
    3: optional string crypto_address  // ✅ 添加这个字段，后端返回收款地址
    4: common.BaseResp base_resp
}
```

---

### 3. 交易记录分类统计（需要后端支持）

**前端 UI 需要：**

钱包主页需要显示消费分类饼图（广告投放 vs KOL营销）

**当前方案：**
前端使用临时估算（60% 广告，40% KOL）

**📝 建议后端添加：**

选项A：在 Transaction 中添加 category 字段
```thrift
struct Transaction {
    // ... 现有字段
    18: optional string category  // "ads" | "kol" | "other"
}
```

选项B：提供专门的统计接口
```thrift
struct GetWalletStatsReq {
    1: optional string time_range  // "7d", "30d", "90d"
}

struct CategoryStats {
    1: string category
    2: string amount
}

struct GetWalletStatsResp {
    1: list<CategoryStats> category_spending
    2: common.BaseResp base_resp
}
```

---

### 4. 每日消费趋势数据（需要后端支持）

**前端 UI 需要：**

显示每日消费趋势图表，包含：
- 日期
- 广告投放金额
- KOL营销金额

**当前方案：**
前端使用 mock 数据

**📝 建议后端添加接口：**
```thrift
struct DailySpending {
    1: string date
    2: string total_amount
    3: string ads_amount
    4: string kol_amount
}

struct GetDailySpendingReq {
    1: optional string time_range  // "7d", "30d", "90d"
}

struct GetDailySpendingResp {
    1: list<DailySpending> daily_data
    2: common.BaseResp base_resp
}
```

---

### 5. 在线支付回调处理（需要确认）

**前端流程：**
1. 调用 `/api/v1/wallet/recharge/online`
2. 如果返回 `payment_url`，跳转到第三方支付页面
3. 用户支付完成后，第三方会回调后端
4. 后端更新交易状态

**📝 建议后端提供：**
- 支付成功/失败的重定向 URL
- 前端可以通过查询交易状态来更新UI

---

### 6. 今日消费统计（需要优化）

**当前方案：**
前端从所有交易记录中筛选今日的 CONSUME 类型交易并求和

**性能问题：**
如果交易记录很多，这个计算会比较慢

**📝 建议后端优化：**
在 `GetWalletInfoResp` 中添加字段：
```thrift
struct WalletInfo {
    // ... 现有字段
    7: optional string today_consume  // 今日消费
    8: optional string today_recharge  // 今日充值
}
```

---

### 7. 交易记录时间字段（小问题）

**前端处理：**
```typescript
{new Date(transaction.created_at).toLocaleString('zh-CN')}
```

**⚠️ 确认：**
- `created_at` 字段是 ISO 8601 格式字符串？(例如: "2025-10-26T10:30:00Z")
- 还是 UNIX 时间戳字符串？

如果是时间戳，前端需要调整为：
```typescript
{new Date(parseInt(transaction.created_at)).toLocaleString('zh-CN')}
```

---

## 📋 后端调整清单

### 必须修改（Critical）

- [ ] **修改 CryptoRechargeReq**：移除 `crypto_address` 参数，改由后端生成
- [ ] **修改 RechargeResp**：添加 `crypto_address` 字段返回收款地址
- [ ] **确认 created_at 格式**：确保时间字段是前端可以直接解析的格式

### 强烈建议（Recommended）

- [ ] **添加交易分类字段**：在 Transaction 中添加 `category` 字段，或提供统计接口
- [ ] **添加每日消费接口**：提供 `GetDailySpending` 接口用于图表展示
- [ ] **优化钱包信息**：在 WalletInfo 中添加 `today_consume` 和 `today_recharge`
- [ ] **确认支付回调**：确保在线支付成功后有适当的重定向

### 可选优化（Optional）

- [ ] **添加交易分页元数据**：在 GetTransactionListResp 中可以添加 `has_more` 等字段
- [ ] **添加交易搜索**：支持按交易 ID、金额范围等搜索
- [ ] **添加导出功能**：提供交易记录导出接口（CSV/Excel）

---

## 🔄 数据类型映射

### 前端 → 后端

| 前端选项 | 后端枚举值 | 说明 |
|---------|----------|------|
| `usdt-trc20` | `USDT` + `TRON` | USDT TRC20 |
| `usdt-erc20` | `USDT` + `ETH` | USDT ERC20 |
| `usdc-erc20` | `USDC` + `ETH` | USDC ERC20 |
| `usdc-trc20` | `USDC` + `TRON` | USDC TRC20 |
| `usdc-polygon` | `USDC` + `POLYGON` | USDC Polygon |
| `paypal` | `PAYPAL` | PayPal支付 |
| `stripe` | `STRIPE` | Stripe支付 |

### 状态映射

| 后端状态 | 前端显示 | Badge颜色 |
|---------|---------|----------|
| `PENDING` | 待处理 | 黄色 |
| `PROCESSING` | 处理中 | 黄色 |
| `COMPLETED` | 已完成 | 绿色 |
| `FAILED` | 失败 | 红色 |
| `CANCELLED` | 已取消 | 灰色 |

---

## 🧪 测试建议

### 加密货币充值流程
1. 选择 USDT (TRC20)，输入金额 $100
2. 点击"生成收款地址"
3. 验证返回的地址格式正确
4. 输入测试交易哈希
5. 点击"确认已转账"
6. 验证交易状态更新

### 在线支付流程
1. 选择 PayPal，输入金额 $50
2. 点击"前往支付"
3. 验证跳转到 PayPal 支付页面
4. 完成支付后验证回调
5. 验证交易记录更新

### 交易记录查询
1. 测试分页功能
2. 测试类型筛选（消费/充值/全部）
3. 测试状态筛选
4. 验证时间格式显示正确
5. 验证金额计算准确

---

## 📞 联系方式

如有任何疑问或需要进一步讨论，请联系前端开发团队。

**前端实现完成日期：** 2025-10-26

