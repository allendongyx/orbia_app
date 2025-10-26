import apiClient, { ApiResponse } from '../api-client';

// 钱包信息
export interface WalletInfo {
  id: number;
  user_id: number;
  balance: string;
  frozen_balance: string;
  total_recharge: string;
  total_consume: string;
  created_at: string;
  updated_at: string;
}

// 交易类型
export type TransactionType = 'RECHARGE' | 'CONSUME' | 'REFUND' | 'FREEZE' | 'UNFREEZE';

// 交易状态
export type TransactionStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';

// 支付方式
export type PaymentMethod = 'CRYPTO' | 'ONLINE';

// 加密货币类型
export type CryptoCurrency = 'USDT' | 'USDC';

// 加密货币链
export type CryptoChain = 'ETH' | 'BSC' | 'POLYGON' | 'TRON' | 'ARBITRUM' | 'OPTIMISM';

// 在线支付平台
export type OnlinePaymentPlatform = 'STRIPE' | 'PAYPAL';

// 交易记录
export interface Transaction {
  id: number;
  transaction_id: string;
  user_id: number;
  type: string; // TransactionType转字符串
  amount: string;
  balance_before: string;
  balance_after: string;
  status: string; // TransactionStatus转字符串
  payment_method?: string; // PaymentMethod转字符串
  crypto_currency?: string;
  crypto_chain?: string;
  crypto_address?: string;
  crypto_tx_hash?: string;
  online_payment_platform?: string;
  online_payment_order_id?: string;
  online_payment_url?: string;
  related_order_id?: string;
  remark?: string;
  failed_reason?: string;
  completed_at?: string;
  created_at: string;
  updated_at: string;
}

// 获取钱包信息响应
export interface GetWalletInfoResp {
  wallet?: WalletInfo;
  base_resp: {
    status_code: number;
    status_msg: string;
  };
}

// 充值请求（加密货币）
export interface CryptoRechargeReq {
  amount: string; // 充值金额（美元）
  crypto_currency: string; // USDT 或 USDC
  crypto_chain: string; // 链类型
  crypto_address: string; // 支付地址
}

// 充值请求（在线支付）
export interface OnlineRechargeReq {
  amount: string; // 充值金额（美元）
  platform: string; // 支付平台：stripe, paypal
}

// 充值响应
export interface RechargeResp {
  transaction?: Transaction;
  payment_url?: string; // 在线支付的URL
  base_resp: {
    status_code: number;
    status_msg: string;
  };
}

// 获取交易记录列表请求
export interface GetTransactionListReq {
  type?: string; // 交易类型筛选
  status?: string; // 状态筛选
  page?: number;
  page_size?: number;
}

// 获取交易记录列表响应
export interface GetTransactionListResp {
  transactions: Transaction[];
  total: number;
  page: number;
  page_size: number;
  base_resp: {
    status_code: number;
    status_msg: string;
  };
}

// 获取交易详情响应
export interface GetTransactionDetailResp {
  transaction?: Transaction;
  base_resp: {
    status_code: number;
    status_msg: string;
  };
}

// 确认加密货币充值请求
export interface ConfirmCryptoRechargeReq {
  transaction_id: string;
  crypto_tx_hash: string; // 加密货币交易哈希
}

// 确认加密货币充值响应
export interface ConfirmCryptoRechargeResp {
  transaction?: Transaction;
  base_resp: {
    status_code: number;
    status_msg: string;
  };
}

// ======== API 函数 ========

// 获取钱包信息
export async function getWalletInfo(): Promise<GetWalletInfoResp> {
  return apiClient.post<GetWalletInfoResp>('/api/v1/wallet/info', {});
}

// 加密货币充值
export async function cryptoRecharge(req: CryptoRechargeReq): Promise<RechargeResp> {
  return apiClient.post<RechargeResp>('/api/v1/wallet/recharge/crypto', req);
}

// 在线支付充值
export async function onlineRecharge(req: OnlineRechargeReq): Promise<RechargeResp> {
  return apiClient.post<RechargeResp>('/api/v1/wallet/recharge/online', req);
}

// 确认加密货币充值
export async function confirmCryptoRecharge(req: ConfirmCryptoRechargeReq): Promise<ConfirmCryptoRechargeResp> {
  return apiClient.post<ConfirmCryptoRechargeResp>('/api/v1/wallet/recharge/crypto/confirm', req);
}

// 获取交易记录列表
export async function getTransactionList(req: GetTransactionListReq): Promise<GetTransactionListResp> {
  return apiClient.post<GetTransactionListResp>('/api/v1/wallet/transactions', req);
}

// 获取交易详情
export async function getTransactionDetail(transactionId: string): Promise<GetTransactionDetailResp> {
  return apiClient.post<GetTransactionDetailResp>(`/api/v1/wallet/transaction/${transactionId}`, {});
}

// ======== 辅助函数 ========

// 格式化金额
export function formatAmount(amount: string | number): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(num);
}

// 映射交易类型显示文本
export function getTransactionTypeText(type: string): string {
  const map: Record<string, string> = {
    RECHARGE: '充值',
    CONSUME: '消费',
    REFUND: '退款',
    FREEZE: '冻结',
    UNFREEZE: '解冻',
  };
  return map[type] || type;
}

// 映射交易状态显示文本
export function getTransactionStatusText(status: string): string {
  const map: Record<string, string> = {
    PENDING: '待处理',
    PROCESSING: '处理中',
    COMPLETED: '已完成',
    FAILED: '失败',
    CANCELLED: '已取消',
  };
  return map[status] || status;
}

// 映射交易状态到前端使用的格式
export function mapTransactionStatus(status: string): 'completed' | 'pending' | 'failed' | 'cancelled' {
  switch (status) {
    case 'COMPLETED':
      return 'completed';
    case 'PENDING':
    case 'PROCESSING':
      return 'pending';
    case 'FAILED':
      return 'failed';
    case 'CANCELLED':
      return 'cancelled';
    default:
      return 'pending';
  }
}

// 映射支付方式显示文本
export function getPaymentMethodText(method?: string, cryptoCurrency?: string, cryptoChain?: string, onlinePlatform?: string): string {
  if (method === 'CRYPTO' && cryptoCurrency && cryptoChain) {
    return `${cryptoCurrency} (${cryptoChain})`;
  }
  if (method === 'ONLINE' && onlinePlatform) {
    return onlinePlatform;
  }
  return method || '-';
}

// 前端加密货币选项到后端格式的映射
export function parseCryptoOption(value: string): { currency: CryptoCurrency; chain: CryptoChain } | null {
  const map: Record<string, { currency: CryptoCurrency; chain: CryptoChain }> = {
    'usdt-trc20': { currency: 'USDT', chain: 'TRON' },
    'usdt-erc20': { currency: 'USDT', chain: 'ETH' },
    'usdc-erc20': { currency: 'USDC', chain: 'ETH' },
    'usdc-trc20': { currency: 'USDC', chain: 'TRON' },
    'usdc-polygon': { currency: 'USDC', chain: 'POLYGON' },
  };
  return map[value] || null;
}

// 前端在线支付选项到后端格式的映射
export function parseOnlinePaymentPlatform(value: string): OnlinePaymentPlatform | null {
  const map: Record<string, OnlinePaymentPlatform> = {
    'paypal': 'PAYPAL',
    'stripe': 'STRIPE',
  };
  return map[value] || null;
}

// ======== 充值订单相关类型和接口 ========

// 充值订单信息
export interface RechargeOrder {
  id: number;
  order_id: string;
  user_id: number;
  amount: string;
  payment_type: 'crypto' | 'online';
  payment_setting_id?: number;
  payment_network?: string;
  payment_address?: string;
  payment_label?: string;
  user_crypto_address?: string;
  crypto_tx_hash?: string;
  online_payment_platform?: string;
  online_payment_order_id?: string;
  status: 'pending' | 'confirmed' | 'failed' | 'cancelled';
  confirmed_by?: number;
  confirmed_at?: string;
  failed_reason?: string;
  remark?: string;
  created_at: string;
  updated_at: string;
}

// 创建加密货币充值订单请求
export interface CreateCryptoRechargeOrderReq {
  amount: string; // 充值金额（美元）
  payment_setting_id: number; // 选择的收款钱包ID
  user_crypto_address: string; // 用户的转账钱包地址
  crypto_tx_hash?: string; // 可选：交易哈希
  remark?: string; // 可选：备注
}

// 创建加密货币充值订单响应
export interface CreateCryptoRechargeOrderResp {
  order?: RechargeOrder;
  base_resp: {
    status_code: number;
    status_msg: string;
  };
}

// 创建在线支付充值订单请求
export interface CreateOnlineRechargeOrderReq {
  amount: string; // 充值金额（美元）
  platform: 'stripe' | 'paypal'; // 支付平台
}

// 创建在线支付充值订单响应
export interface CreateOnlineRechargeOrderResp {
  order?: RechargeOrder;
  payment_url?: string; // 在线支付URL
  base_resp: {
    status_code: number;
    status_msg: string;
  };
}

// 查询我的充值订单列表请求
export interface GetMyRechargeOrdersReq {
  status?: 'pending' | 'confirmed' | 'failed' | 'cancelled';
  page?: number;
  page_size?: number;
}

// 查询我的充值订单列表响应
export interface GetMyRechargeOrdersResp {
  orders: RechargeOrder[];
  total: number;
  page: number;
  page_size: number;
  base_resp: {
    status_code: number;
    status_msg: string;
  };
}

// 查询充值订单详情响应
export interface GetRechargeOrderDetailResp {
  order?: RechargeOrder;
  base_resp: {
    status_code: number;
    status_msg: string;
  };
}

// 管理员：查询所有充值订单请求
export interface GetAllRechargeOrdersReq {
  user_id?: number;
  status?: 'pending' | 'confirmed' | 'failed' | 'cancelled';
  payment_type?: 'crypto' | 'online';
  page?: number;
  page_size?: number;
}

// 管理员：查询所有充值订单响应
export interface GetAllRechargeOrdersResp {
  orders: RechargeOrder[];
  total: number;
  page: number;
  page_size: number;
  base_resp: {
    status_code: number;
    status_msg: string;
  };
}

// 管理员：确认充值订单请求
export interface ConfirmRechargeOrderReq {
  order_id: string;
  crypto_tx_hash?: string; // 可选：补充或更新交易哈希
  remark?: string; // 可选：管理员备注
}

// 管理员：确认充值订单响应
export interface ConfirmRechargeOrderResp {
  order?: RechargeOrder;
  base_resp: {
    status_code: number;
    status_msg: string;
  };
}

// 管理员：拒绝充值订单请求
export interface RejectRechargeOrderReq {
  order_id: string;
  failed_reason: string;
}

// 管理员:拒绝充值订单响应
export interface RejectRechargeOrderResp {
  order?: RechargeOrder;
  base_resp: {
    status_code: number;
    status_msg: string;
  };
}

// ======== 充值订单 API 函数 ========

// 创建加密货币充值订单
export async function createCryptoRechargeOrder(req: CreateCryptoRechargeOrderReq): Promise<CreateCryptoRechargeOrderResp> {
  return apiClient.post<CreateCryptoRechargeOrderResp>('/api/v1/recharge/create/crypto', req);
}

// 创建在线支付充值订单
export async function createOnlineRechargeOrder(req: CreateOnlineRechargeOrderReq): Promise<CreateOnlineRechargeOrderResp> {
  return apiClient.post<CreateOnlineRechargeOrderResp>('/api/v1/recharge/create/online', req);
}

// 查询我的充值订单列表
export async function getMyRechargeOrders(req: GetMyRechargeOrdersReq): Promise<GetMyRechargeOrdersResp> {
  return apiClient.post<GetMyRechargeOrdersResp>('/api/v1/recharge/my/list', req);
}

// 查询充值订单详情
export async function getRechargeOrderDetail(orderId: string): Promise<GetRechargeOrderDetailResp> {
  return apiClient.post<GetRechargeOrderDetailResp>(`/api/v1/recharge/detail/${orderId}`, {});
}

// 管理员：查询所有充值订单
export async function getAllRechargeOrders(req: GetAllRechargeOrdersReq): Promise<GetAllRechargeOrdersResp> {
  return apiClient.post<GetAllRechargeOrdersResp>('/api/v1/admin/recharge/list', req);
}

// 管理员：确认充值订单
export async function confirmRechargeOrder(req: ConfirmRechargeOrderReq): Promise<ConfirmRechargeOrderResp> {
  return apiClient.post<ConfirmRechargeOrderResp>('/api/v1/admin/recharge/confirm', req);
}

// 管理员：拒绝充值订单
export async function rejectRechargeOrder(req: RejectRechargeOrderReq): Promise<RejectRechargeOrderResp> {
  return apiClient.post<RejectRechargeOrderResp>('/api/v1/admin/recharge/reject', req);
}

// 充值订单状态映射
export function getRechargeOrderStatusText(status: string): string {
  const map: Record<string, string> = {
    pending: '待确认',
    confirmed: '已确认',
    failed: '失败',
    cancelled: '已取消',
  };
  return map[status] || status;
}

// 充值订单状态映射到徽章类型
export function mapRechargeOrderStatus(status: string): 'completed' | 'pending' | 'failed' | 'cancelled' {
  switch (status) {
    case 'confirmed':
      return 'completed';
    case 'pending':
      return 'pending';
    case 'failed':
      return 'failed';
    case 'cancelled':
      return 'cancelled';
    default:
      return 'pending';
  }
}

