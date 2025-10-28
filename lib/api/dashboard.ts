import apiClient from '../api-client';

// API 响应类型
interface DashboardDataResponse {
  excellent_cases?: ExcellentCase[];
  content_trends?: ContentTrend[];
  platform_stats?: PlatformStats;
}

interface CreateCaseResponse {
  id?: number;
  case_id?: number;
}

interface CaseListResponse {
  cases?: ExcellentCase[];
  page_info?: {
    page: number;
    page_size: number;
    total: number;
    total_pages: number;
  };
}

interface CaseDetailResponse {
  case_detail?: ExcellentCase;
  case?: ExcellentCase;
}

interface CreateTrendResponse {
  id?: number;
  trend_id?: number;
}

interface TrendListResponse {
  trends?: ContentTrend[];
  page_info?: {
    page: number;
    page_size: number;
    total: number;
    total_pages: number;
  };
}

interface TrendDetailResponse {
  trend_detail?: ContentTrend;
  trend?: ContentTrend;
}

interface StatsResponse {
  stats: PlatformStats;
}

// Dashboard 数据类型定义
export interface ExcellentCase {
  id: number;
  video_url: string;
  cover_url: string;
  title: string;
  description: string;
  sort_order: number;
  status: number;
  created_at: string;
  updated_at: string;
}

export interface ContentTrend {
  id: number;
  ranking: number;
  hot_keyword: string;
  value_level: 'low' | 'medium' | 'high';
  heat: number;
  growth_rate: number;
  status: number;
  created_at: string;
  updated_at: string;
}

export interface PlatformStats {
  id: number;
  active_kols: number;
  total_coverage: number;
  total_ad_impressions: number;
  total_transaction_amount: number;
  average_roi: number;
  average_cpm: number;
  web3_brand_count: number;
  created_at: string;
  updated_at: string;
}

export interface DashboardData {
  excellent_cases: ExcellentCase[];
  content_trends: ContentTrend[];
  platform_stats: PlatformStats;
}

// Dashboard 展示接口（无需认证）
export async function getDashboardData(): Promise<DashboardData> {
  const response = await apiClient.post<DashboardDataResponse>('/api/v1/dashboard/data', {});
  return {
    excellent_cases: response.excellent_cases || [],
    content_trends: response.content_trends || [],
    platform_stats: response.platform_stats || {
      id: 0,
      active_kols: 0,
      total_coverage: 0,
      total_ad_impressions: 0,
      total_transaction_amount: 0,
      average_roi: 0,
      average_cpm: 0,
      web3_brand_count: 0,
      created_at: '',
      updated_at: ''
    }
  };
}

// ==================== 优秀广告案例管理 ====================

export interface CreateExcellentCaseRequest {
  video_url: string;
  cover_url: string;
  title: string;
  description?: string;
  sort_order?: number;
}

export interface UpdateExcellentCaseRequest {
  id: number;
  video_url?: string;
  cover_url?: string;
  title?: string;
  description?: string;
  sort_order?: number;
  status?: number;
}

export interface ExcellentCaseListResponse {
  cases: ExcellentCase[];
  page_info: {
    page: number;
    page_size: number;
    total: number;
    total_pages: number;
  };
}

export async function createExcellentCase(data: CreateExcellentCaseRequest): Promise<{ id: number }> {
  const response = await apiClient.post<CreateCaseResponse>('/api/v1/admin/dashboard/excellent-case/create', data);
  return { id: response.id || response.case_id || 0 };
}

export async function updateExcellentCase(data: UpdateExcellentCaseRequest): Promise<void> {
  await apiClient.post('/api/v1/admin/dashboard/excellent-case/update', data);
}

export async function deleteExcellentCase(id: number): Promise<void> {
  await apiClient.post('/api/v1/admin/dashboard/excellent-case/delete', { id });
}

export async function getExcellentCaseList(params: {
  status?: number;
  page?: number;
  page_size?: number;
}): Promise<ExcellentCaseListResponse> {
  const response = await apiClient.post<CaseListResponse>('/api/v1/admin/dashboard/excellent-case/list', params);
  return {
    cases: response.cases || [],
    page_info: response.page_info || { page: 1, page_size: 10, total: 0, total_pages: 0 }
  };
}

export async function getExcellentCaseDetail(id: number): Promise<ExcellentCase> {
  const response = await apiClient.post<CaseDetailResponse>(`/api/v1/admin/dashboard/excellent-case/${id}`, {});
  return (response.case_detail || response.case) as ExcellentCase;
}

// ==================== 内容趋势管理 ====================

export interface CreateContentTrendRequest {
  ranking: number;
  hot_keyword: string;
  value_level: 'low' | 'medium' | 'high';
  heat: number;
  growth_rate: number;
}

export interface UpdateContentTrendRequest {
  id: number;
  ranking?: number;
  hot_keyword?: string;
  value_level?: 'low' | 'medium' | 'high';
  heat?: number;
  growth_rate?: number;
  status?: number;
}

export interface ContentTrendListResponse {
  trends: ContentTrend[];
  page_info: {
    page: number;
    page_size: number;
    total: number;
    total_pages: number;
  };
}

export async function createContentTrend(data: CreateContentTrendRequest): Promise<{ id: number }> {
  const response = await apiClient.post<CreateTrendResponse>('/api/v1/admin/dashboard/content-trend/create', data);
  return { id: response.id || response.trend_id || 0 };
}

export async function updateContentTrend(data: UpdateContentTrendRequest): Promise<void> {
  await apiClient.post('/api/v1/admin/dashboard/content-trend/update', data);
}

export async function deleteContentTrend(id: number): Promise<void> {
  await apiClient.post('/api/v1/admin/dashboard/content-trend/delete', { id });
}

export async function getContentTrendList(params: {
  status?: number;
  page?: number;
  page_size?: number;
}): Promise<ContentTrendListResponse> {
  const response = await apiClient.post<TrendListResponse>('/api/v1/admin/dashboard/content-trend/list', params);
  return {
    trends: response.trends || [],
    page_info: response.page_info || { page: 1, page_size: 10, total: 0, total_pages: 0 }
  };
}

export async function getContentTrendDetail(id: number): Promise<ContentTrend> {
  const response = await apiClient.post<TrendDetailResponse>(`/api/v1/admin/dashboard/content-trend/${id}`, {});
  return (response.trend_detail || response.trend) as ContentTrend;
}

// ==================== 平台数据统计管理 ====================

export interface UpdatePlatformStatsRequest {
  active_kols?: number;
  total_coverage?: number;
  total_ad_impressions?: number;
  total_transaction_amount?: number;
  average_roi?: number;
  average_cpm?: number;
  web3_brand_count?: number;
}

export async function updatePlatformStats(data: UpdatePlatformStatsRequest): Promise<void> {
  await apiClient.post('/api/v1/admin/dashboard/platform-stats/update', data);
}

export async function getPlatformStats(): Promise<PlatformStats> {
  const response = await apiClient.post<StatsResponse>('/api/v1/admin/dashboard/platform-stats', {});
  return response.stats;
}

