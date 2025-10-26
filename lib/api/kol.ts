import { apiRequest, ApiResponse, BaseResp } from '../api-client';

// KOL 语言信息
export interface KolLanguage {
  language_code: string;
  language_name: string;
}

// KOL 标签
export interface KolTag {
  tag: string;
}

// KOL 数据统计
export interface KolStats {
  total_followers: number;
  tiktok_followers: number;
  youtube_subscribers: number;
  x_followers: number;
  discord_members: number;
  tiktok_avg_views: number;
  engagement_rate: number;
}

// KOL 报价 Plan
export interface KolPlan {
  id: number;
  title: string;
  description: string;
  price: number;
  plan_type: 'basic' | 'standard' | 'premium';
  created_at: string;
  updated_at: string;
}

// KOL 视频
export interface KolVideo {
  id: number;
  embed_code: string;
  cover_url?: string;
  created_at: string;
  updated_at: string;
}

// KOL 详细信息
export interface KolInfo {
  id: number;
  user_id: number;
  avatar_url?: string;
  display_name: string;
  description?: string;
  country: string;
  tiktok_url?: string;
  youtube_url?: string;
  x_url?: string;
  discord_url?: string;
  status: 'pending' | 'approved' | 'rejected';
  reject_reason?: string;
  approved_at?: string;
  languages: KolLanguage[];
  tags: KolTag[];
  stats?: KolStats;
  created_at: string;
  updated_at: string;
}

// 申请成为 KOL 请求
export interface ApplyKolReq {
  display_name: string;
  description: string;
  country: string;
  avatar_url?: string;
  tiktok_url?: string;
  youtube_url?: string;
  x_url?: string;
  discord_url?: string;
  language_codes: string[];
  language_names: string[];
  tags: string[];
}

// 申请成为 KOL 响应
export interface ApplyKolResp {
  base_resp: BaseResp;
  kol_id?: number;
}

// 获取 KOL 信息请求
export interface GetKolInfoReq {
  kol_id?: number;
}

// 获取 KOL 信息响应
export interface GetKolInfoResp {
  base_resp: BaseResp;
  kol_info?: KolInfo;
}

// 更新 KOL 信息请求
export interface UpdateKolInfoReq {
  display_name?: string;
  description?: string;
  country?: string;
  avatar_url?: string;
  tiktok_url?: string;
  youtube_url?: string;
  x_url?: string;
  discord_url?: string;
  language_codes?: string[];
  language_names?: string[];
  tags?: string[];
}

// 更新 KOL 信息响应
export interface UpdateKolInfoResp {
  base_resp: BaseResp;
}

// 更新 KOL 统计数据请求
export interface UpdateKolStatsReq {
  total_followers?: number;
  tiktok_followers?: number;
  youtube_subscribers?: number;
  x_followers?: number;
  discord_members?: number;
  tiktok_avg_views?: number;
  engagement_rate?: number;
}

// 更新 KOL 统计数据响应
export interface UpdateKolStatsResp {
  base_resp: BaseResp;
}

// 创建/更新 KOL 报价 Plan 请求
export interface SaveKolPlanReq {
  id?: number;
  title: string;
  description: string;
  price: number;
  plan_type: 'basic' | 'standard' | 'premium';
}

// 创建/更新 KOL 报价 Plan 响应
export interface SaveKolPlanResp {
  base_resp: BaseResp;
  plan_id?: number;
}

// 删除 KOL 报价 Plan 请求
export interface DeleteKolPlanReq {
  plan_id: number;
}

// 删除 KOL 报价 Plan 响应
export interface DeleteKolPlanResp {
  base_resp: BaseResp;
}

// 获取 KOL 报价 Plans 请求
export interface GetKolPlansReq {
  kol_id?: number;
}

// 获取 KOL 报价 Plans 响应
export interface GetKolPlansResp {
  base_resp: BaseResp;
  plans: KolPlan[];
}

// 创建 KOL 视频请求
export interface CreateKolVideoReq {
  embed_code: string;
  cover_url?: string;
}

// 创建 KOL 视频响应
export interface CreateKolVideoResp {
  base_resp: BaseResp;
  video_id?: number;
}

// 更新 KOL 视频请求
export interface UpdateKolVideoReq {
  video_id: number;
  embed_code: string;
  cover_url?: string;
}

// 更新 KOL 视频响应
export interface UpdateKolVideoResp {
  base_resp: BaseResp;
}

// 删除 KOL 视频请求
export interface DeleteKolVideoReq {
  video_id: number;
}

// 删除 KOL 视频响应
export interface DeleteKolVideoResp {
  base_resp: BaseResp;
}

// 获取 KOL 视频列表请求
export interface GetKolVideosReq {
  kol_id?: number;
  page?: number;
  page_size?: number;
}

// 获取 KOL 视频列表响应
export interface GetKolVideosResp {
  base_resp: BaseResp;
  videos: KolVideo[];
  total: number;
}

// KOL 列表请求
export interface GetKolListReq {
  status?: 'pending' | 'approved' | 'rejected';
  country?: string;
  tag?: string;
  page?: number;
  page_size?: number;
}

// KOL 列表响应
export interface GetKolListResp {
  base_resp: BaseResp;
  kol_list: KolInfo[];
  total: number;
}

// ============ API 函数 ============

/**
 * 申请成为 KOL
 */
export async function applyKol(req: ApplyKolReq): Promise<ApplyKolResp> {
  return apiRequest<ApplyKolResp>('/api/v1/kol/apply', {
    method: 'POST',
    body: JSON.stringify(req),
  });
}

/**
 * 获取 KOL 信息
 * @param req - 不传 kol_id 则获取当前登录用户的 KOL 信息
 */
export async function getKolInfo(req: GetKolInfoReq = {}): Promise<GetKolInfoResp> {
  const query = req.kol_id ? `?kol_id=${req.kol_id}` : '';
  return apiRequest<GetKolInfoResp>(`/api/v1/kol/info${query}`, {
    method: 'POST',
  });
}

/**
 * 更新 KOL 信息
 */
export async function updateKolInfo(req: UpdateKolInfoReq): Promise<UpdateKolInfoResp> {
  return apiRequest<UpdateKolInfoResp>('/api/v1/kol/update', {
    method: 'POST',
    body: JSON.stringify(req),
  });
}

/**
 * 更新 KOL 统计数据
 */
export async function updateKolStats(req: UpdateKolStatsReq): Promise<UpdateKolStatsResp> {
  return apiRequest<UpdateKolStatsResp>('/api/v1/kol/stats/update', {
    method: 'POST',
    body: JSON.stringify(req),
  });
}

/**
 * 创建或更新 KOL 报价 Plan
 */
export async function saveKolPlan(req: SaveKolPlanReq): Promise<SaveKolPlanResp> {
  return apiRequest<SaveKolPlanResp>('/api/v1/kol/plan/save', {
    method: 'POST',
    body: JSON.stringify(req),
  });
}

/**
 * 删除 KOL 报价 Plan
 */
export async function deleteKolPlan(req: DeleteKolPlanReq): Promise<DeleteKolPlanResp> {
  return apiRequest<DeleteKolPlanResp>('/api/v1/kol/plan/delete', {
    method: 'POST',
    body: JSON.stringify(req),
  });
}

/**
 * 获取 KOL 报价 Plans
 * @param req - 不传 kol_id 则获取当前登录用户的 Plans
 */
export async function getKolPlans(req: GetKolPlansReq = {}): Promise<GetKolPlansResp> {
  const query = req.kol_id ? `?kol_id=${req.kol_id}` : '';
  return apiRequest<GetKolPlansResp>(`/api/v1/kol/plans${query}`, {
    method: 'POST',
  });
}

/**
 * 创建 KOL 视频
 */
export async function createKolVideo(req: CreateKolVideoReq): Promise<CreateKolVideoResp> {
  return apiRequest<CreateKolVideoResp>('/api/v1/kol/video/create', {
    method: 'POST',
    body: JSON.stringify(req),
  });
}

/**
 * 更新 KOL 视频
 */
export async function updateKolVideo(req: UpdateKolVideoReq): Promise<UpdateKolVideoResp> {
  return apiRequest<UpdateKolVideoResp>('/api/v1/kol/video/update', {
    method: 'POST',
    body: JSON.stringify(req),
  });
}

/**
 * 删除 KOL 视频
 */
export async function deleteKolVideo(req: DeleteKolVideoReq): Promise<DeleteKolVideoResp> {
  return apiRequest<DeleteKolVideoResp>('/api/v1/kol/video/delete', {
    method: 'POST',
    body: JSON.stringify(req),
  });
}

/**
 * 获取 KOL 视频列表
 * @param req - 不传 kol_id 则获取当前登录用户的视频
 */
export async function getKolVideos(req: GetKolVideosReq = {}): Promise<GetKolVideosResp> {
  const params = new URLSearchParams();
  if (req.kol_id) params.append('kol_id', req.kol_id.toString());
  if (req.page) params.append('page', req.page.toString());
  if (req.page_size) params.append('page_size', req.page_size.toString());
  
  const query = params.toString() ? `?${params.toString()}` : '';
  return apiRequest<GetKolVideosResp>(`/api/v1/kol/videos${query}`, {
    method: 'POST',
  });
}

/**
 * 获取 KOL 列表
 */
export async function getKolList(req: GetKolListReq = {}): Promise<GetKolListResp> {
  const params = new URLSearchParams();
  if (req.status) params.append('status', req.status);
  if (req.country) params.append('country', req.country);
  if (req.tag) params.append('tag', req.tag);
  if (req.page) params.append('page', req.page.toString());
  if (req.page_size) params.append('page_size', req.page_size.toString());
  
  const query = params.toString() ? `?${params.toString()}` : '';
  return apiRequest<GetKolListResp>(`/api/v1/kol/list${query}`, {
    method: 'POST',
  });
}

