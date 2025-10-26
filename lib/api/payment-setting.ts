import { apiRequest, type BaseResp } from '../api-client';

// ========== 收款钱包类型 ==========

// 收款钱包信息
export interface PaymentSettingInfo {
  id: number;
  network: string; // 网络，如 "TRC-20 - TRON Network (TRC-20)"
  address: string;
  label?: string;
  status: number; // 1-启用, 0-禁用
  created_at: string;
  updated_at: string;
}

// ========== 管理员接口 ==========

// 获取收款钱包列表请求
export interface GetPaymentSettingsReq {
  keyword?: string;
  network?: string;
  status?: number;
  page?: number;
  page_size?: number;
}

// 获取收款钱包列表响应
export interface GetPaymentSettingsResp {
  base_resp: BaseResp;
  list?: PaymentSettingInfo[]; // 钱包列表
  total?: number; // 总数
  page?: number; // 当前页
  page_size?: number; // 每页数量
}

// 获取收款钱包详情请求
export interface GetPaymentSettingReq {
  id: number;
}

// 获取收款钱包详情响应
export interface GetPaymentSettingResp {
  base_resp: BaseResp;
  payment_setting: PaymentSettingInfo;
}

// 创建收款钱包请求
export interface CreatePaymentSettingReq {
  network: string;
  address: string;
  label?: string;
  status?: number;
}

// 创建收款钱包响应
export interface CreatePaymentSettingResp {
  base_resp: BaseResp;
  payment_setting: PaymentSettingInfo;
}

// 更新收款钱包请求
export interface UpdatePaymentSettingReq {
  id: number;
  network?: string;
  address?: string;
  label?: string;
  status?: number;
}

// 更新收款钱包响应
export interface UpdatePaymentSettingResp {
  base_resp: BaseResp;
  payment_setting: PaymentSettingInfo;
}

// 删除收款钱包请求
export interface DeletePaymentSettingReq {
  id: number;
}

// 删除收款钱包响应
export interface DeletePaymentSettingResp {
  base_resp: BaseResp;
}

// ========== 用户接口 ==========

// 获取启用的收款钱包请求
export interface GetActivePaymentSettingsReq {
  network?: string;
}

// 获取启用的收款钱包响应
export interface GetActivePaymentSettingsResp {
  base_resp: BaseResp;
  list?: PaymentSettingInfo[]; // 钱包列表
}

// ========== API 函数 ==========

// 管理员接口
export async function getPaymentSettings(req: GetPaymentSettingsReq): Promise<GetPaymentSettingsResp> {
  return apiRequest<GetPaymentSettingsResp>('/api/v1/admin/payment-settings/list', {
    method: 'POST',
    body: JSON.stringify(req),
  });
}

export async function getPaymentSetting(id: number): Promise<GetPaymentSettingResp> {
  return apiRequest<GetPaymentSettingResp>(`/api/v1/admin/payment-settings/${id}`, {
    method: 'POST',
    body: JSON.stringify({ id }),
  });
}

export async function createPaymentSetting(req: CreatePaymentSettingReq): Promise<CreatePaymentSettingResp> {
  return apiRequest<CreatePaymentSettingResp>('/api/v1/admin/payment-settings/create', {
    method: 'POST',
    body: JSON.stringify(req),
  });
}

export async function updatePaymentSetting(req: UpdatePaymentSettingReq): Promise<UpdatePaymentSettingResp> {
  return apiRequest<UpdatePaymentSettingResp>('/api/v1/admin/payment-settings/update', {
    method: 'POST',
    body: JSON.stringify(req),
  });
}

export async function deletePaymentSetting(req: DeletePaymentSettingReq): Promise<DeletePaymentSettingResp> {
  return apiRequest<DeletePaymentSettingResp>('/api/v1/admin/payment-settings/delete', {
    method: 'POST',
    body: JSON.stringify(req),
  });
}

// 用户接口
export async function getActivePaymentSettings(req: GetActivePaymentSettingsReq): Promise<GetActivePaymentSettingsResp> {
  return apiRequest<GetActivePaymentSettingsResp>('/api/v1/payment-settings/active', {
    method: 'POST',
    body: JSON.stringify(req),
  });
}

