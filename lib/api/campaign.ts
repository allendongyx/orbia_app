import { apiClient } from '@/lib/api-client';

// Campaign 创建参数
export interface CreateCampaignRequest {
  campaign_name: string;
  promotion_objective: 'awareness' | 'consideration' | 'conversion';
  optimization_goal: string;
  location?: number[];
  age?: number;
  gender?: number;
  languages?: number[];
  spending_power?: number;
  operating_system?: number;
  os_versions?: number[];
  device_models?: number[];
  connection_type?: number;
  device_price_type: 0 | 1; // 0: any, 1: specific range
  device_price_min?: number;
  device_price_max?: number;
  planned_start_time: string;
  planned_end_time: string;
  time_zone?: number;
  dayparting_type: 0 | 1; // 0: 全天, 1: 特定时段
  dayparting_schedule?: string;
  frequency_cap_type: 0 | 1 | 2; // 0: 每七天不超过三次, 1: 每天不超过一次, 2: 自定义
  frequency_cap_times?: number;
  frequency_cap_days?: number;
  budget_type: 0 | 1; // 0: 每日预算, 1: 总预算
  budget_amount: number;
  website?: string;
  ios_download_url?: string;
  android_download_url?: string;
  attachment_urls?: string[];
}

// Campaign 更新参数
export interface UpdateCampaignRequest {
  campaign_id: string;
  campaign_name?: string;
  promotion_objective?: 'awareness' | 'consideration' | 'conversion';
  optimization_goal?: string;
  location?: number[];
  age?: number;
  gender?: number;
  languages?: number[];
  spending_power?: number;
  operating_system?: number;
  os_versions?: number[];
  device_models?: number[];
  connection_type?: number;
  device_price_type?: 0 | 1;
  device_price_min?: number;
  device_price_max?: number;
  planned_start_time?: string;
  planned_end_time?: string;
  time_zone?: number;
  dayparting_type?: 0 | 1;
  dayparting_schedule?: string;
  frequency_cap_type?: 0 | 1 | 2;
  frequency_cap_times?: number;
  frequency_cap_days?: number;
  budget_type?: 0 | 1;
  budget_amount?: number;
  website?: string;
  ios_download_url?: string;
  android_download_url?: string;
  attachment_urls?: string[];
}

// Campaign 状态更新参数
export interface UpdateCampaignStatusRequest {
  campaign_id: string;
  status: 'active' | 'paused';
}

// Admin 状态更新参数
export interface AdminUpdateCampaignStatusRequest {
  campaign_id: string;
  status: 'active' | 'paused' | 'ended';
}

// Campaign 列表查询参数
export interface ListCampaignRequest {
  keyword?: string;
  status?: 'pending' | 'active' | 'paused' | 'ended';
  promotion_objective?: 'awareness' | 'consideration' | 'conversion';
  page?: number;
  page_size?: number;
}

// Admin Campaign 列表查询参数
export interface AdminListCampaignRequest extends ListCampaignRequest {
  user_id?: number;
  team_id?: number;
}

// 附件对象
export interface CampaignAttachment {
  id: number;
  file_url: string;
  file_name: string;
  file_type: string;
  file_size: number;
  created_at: string;
}

// Campaign 对象
export interface Campaign {
  id: number;
  campaign_id: string;
  user_id: number;
  team_id: number;
  campaign_name: string;
  promotion_objective: string;
  optimization_goal: string;
  location?: number[];
  age?: number;
  gender?: number;
  languages?: number[];
  spending_power?: number;
  operating_system?: number;
  os_versions?: number[];
  device_models?: number[];
  connection_type?: number;
  device_price_type: number;
  device_price_min?: number;
  device_price_max?: number;
  planned_start_time: string;
  planned_end_time: string;
  time_zone?: number;
  dayparting_type: number;
  dayparting_schedule?: string;
  frequency_cap_type: number;
  frequency_cap_times?: number;
  frequency_cap_days?: number;
  budget_type: number;
  budget_amount: number;
  website?: string;
  ios_download_url?: string;
  android_download_url?: string;
  status: string;
  attachments?: CampaignAttachment[];
  created_at: string;
  updated_at: string;
}

// 分页信息
export interface PageInfo {
  page: number;
  page_size: number;
  total: number;
  total_pages: number;
}

// 基础响应
export interface BaseResp {
  code: number;
  message: string;
}

// 创建 Campaign 响应
export interface CreateCampaignResponse {
  campaign: Campaign;
  base_resp: BaseResp;
}

// Campaign 列表响应
export interface ListCampaignResponse {
  campaigns: Campaign[];
  page_info: PageInfo;
  base_resp: BaseResp;
}

// Campaign 详情响应
export interface CampaignDetailResponse {
  campaign: Campaign;
  base_resp: BaseResp;
}

// 状态更新响应
export interface UpdateStatusResponse {
  base_resp: BaseResp;
}

/**
 * 创建 Campaign
 */
export async function createCampaign(data: CreateCampaignRequest): Promise<CreateCampaignResponse> {
  return apiClient.post('/api/v1/campaign/create', data);
}

/**
 * 更新 Campaign
 */
export async function updateCampaign(data: UpdateCampaignRequest): Promise<CreateCampaignResponse> {
  return apiClient.post('/api/v1/campaign/update', data);
}

/**
 * 更新 Campaign 状态
 */
export async function updateCampaignStatus(data: UpdateCampaignStatusRequest): Promise<UpdateStatusResponse> {
  return apiClient.post('/api/v1/campaign/status', data);
}

/**
 * 获取 Campaign 列表
 */
export async function listCampaigns(data?: ListCampaignRequest): Promise<ListCampaignResponse> {
  return apiClient.post('/api/v1/campaign/list', data || {});
}

/**
 * 获取 Campaign 详情
 */
export async function getCampaignDetail(campaign_id: string): Promise<CampaignDetailResponse> {
  return apiClient.post('/api/v1/campaign/detail', { campaign_id });
}

/**
 * 管理员获取所有 Campaign
 */
export async function adminListCampaigns(data?: AdminListCampaignRequest): Promise<ListCampaignResponse> {
  return apiClient.post('/api/v1/admin/campaign/list', data || {});
}

/**
 * 管理员更新 Campaign 状态
 */
export async function adminUpdateCampaignStatus(data: AdminUpdateCampaignStatusRequest): Promise<UpdateStatusResponse> {
  return apiClient.post('/api/v1/admin/campaign/status', data);
}




