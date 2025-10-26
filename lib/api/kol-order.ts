import { apiRequest, BaseResp } from '../api-client';

// KOL订单信息
export interface KolOrderInfo {
  order_id: string;
  user_id: number;
  user_nickname: string;
  team_id?: number;
  team_name?: string;
  kol_id: number;
  kol_display_name: string;
  kol_avatar_url: string;
  plan_id: number;
  plan_title: string;
  plan_description: string;
  plan_price: number;
  plan_type: 'basic' | 'standard' | 'premium';
  title: string;
  requirement_description: string;
  video_type: string;
  video_duration: number;
  target_audience: string;
  expected_delivery_date: string;
  additional_requirements?: string;
  status: 'pending_payment' | 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'refunded';
  reject_reason?: string;
  confirmed_at?: string;
  completed_at?: string;
  cancelled_at?: string;
  created_at: string;
  updated_at: string;
}

// 创建KOL订单请求
export interface CreateKolOrderReq {
  kol_id: number;
  plan_id: number;
  title: string;
  requirement_description: string;
  video_type: string;
  video_duration: number;
  target_audience: string;
  expected_delivery_date: string;
  additional_requirements?: string;
  team_id?: number;
}

// 创建KOL订单响应
export interface CreateKolOrderResp {
  base_resp: BaseResp;
  order_id?: string;
}

// 获取KOL订单详情请求
export interface GetKolOrderReq {
  order_id: string;
}

// 获取KOL订单详情响应
export interface GetKolOrderResp {
  base_resp: BaseResp;
  order?: KolOrderInfo;
}

// 获取用户自己的KOL订单列表请求
export interface GetUserKolOrderListReq {
  status?: string;
  keyword?: string;
  kol_id?: number;
  team_id?: number;
  page?: number;
  page_size?: number;
}

// 获取用户自己的KOL订单列表响应
export interface GetUserKolOrderListResp {
  base_resp: BaseResp;
  orders: KolOrderInfo[];
  total: number;
}

// 获取KOL收到的订单列表请求
export interface GetKolReceivedOrderListReq {
  status?: string;
  keyword?: string;
  page?: number;
  page_size?: number;
}

// 获取KOL收到的订单列表响应
export interface GetKolReceivedOrderListResp {
  base_resp: BaseResp;
  orders: KolOrderInfo[];
  total: number;
}

// 更新KOL订单状态请求
export interface UpdateKolOrderStatusReq {
  order_id: string;
  status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'refunded';
  reject_reason?: string;
}

// 更新KOL订单状态响应
export interface UpdateKolOrderStatusResp {
  base_resp: BaseResp;
}

// 取消KOL订单请求
export interface CancelKolOrderReq {
  order_id: string;
  reason: string;
}

// 取消KOL订单响应
export interface CancelKolOrderResp {
  base_resp: BaseResp;
}

// 确认KOL订单支付请求
export interface ConfirmKolOrderPaymentReq {
  order_id: string;
}

// 确认KOL订单支付响应
export interface ConfirmKolOrderPaymentResp {
  base_resp: BaseResp;
}

// ============ API 函数 ============

/**
 * 创建KOL订单
 */
export async function createKolOrder(req: CreateKolOrderReq): Promise<CreateKolOrderResp> {
  return apiRequest<CreateKolOrderResp>('/api/v1/kol-order/create', {
    method: 'POST',
    body: JSON.stringify(req),
  });
}

/**
 * 获取KOL订单详情
 */
export async function getKolOrder(req: GetKolOrderReq): Promise<GetKolOrderResp> {
  return apiRequest<GetKolOrderResp>('/api/v1/kol-order/detail', {
    method: 'POST',
    body: JSON.stringify(req),
  });
}

/**
 * 获取用户自己的KOL订单列表
 */
export async function getUserKolOrderList(req: GetUserKolOrderListReq = {}): Promise<GetUserKolOrderListResp> {
  return apiRequest<GetUserKolOrderListResp>('/api/v1/kol-order/user/list', {
    method: 'POST',
    body: JSON.stringify(req),
  });
}

/**
 * 获取KOL收到的订单列表
 */
export async function getKolReceivedOrderList(req: GetKolReceivedOrderListReq = {}): Promise<GetKolReceivedOrderListResp> {
  return apiRequest<GetKolReceivedOrderListResp>('/api/v1/kol-order/kol/list', {
    method: 'POST',
    body: JSON.stringify(req),
  });
}

/**
 * 更新KOL订单状态（KOL使用）
 */
export async function updateKolOrderStatus(req: UpdateKolOrderStatusReq): Promise<UpdateKolOrderStatusResp> {
  return apiRequest<UpdateKolOrderStatusResp>('/api/v1/kol-order/status/update', {
    method: 'POST',
    body: JSON.stringify(req),
  });
}

/**
 * 取消KOL订单（用户使用）
 */
export async function cancelKolOrder(req: CancelKolOrderReq): Promise<CancelKolOrderResp> {
  return apiRequest<CancelKolOrderResp>('/api/v1/kol-order/cancel', {
    method: 'POST',
    body: JSON.stringify(req),
  });
}

/**
 * 确认KOL订单支付
 */
export async function confirmKolOrderPayment(req: ConfirmKolOrderPaymentReq): Promise<ConfirmKolOrderPaymentResp> {
  return apiRequest<ConfirmKolOrderPaymentResp>('/api/v1/kol-order/payment/confirm', {
    method: 'POST',
    body: JSON.stringify(req),
  });
}

