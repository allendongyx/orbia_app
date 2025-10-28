import { apiRequest, type BaseResp } from '../api-client';
import { PageInfo } from './admin';

// ========== 字典类型 ==========

// 字典信息
export interface DictionaryInfo {
  id: number;
  code: string;
  name: string;
  description?: string;
  status: number; // 1-启用, 0-禁用
  created_at: string;
  updated_at: string;
}

// 字典项信息
export interface DictionaryItemInfo {
  id: number;
  dictionary_id: number;
  parent_id: number;
  code: string;
  name: string;
  description?: string;
  icon_url?: string;
  sort_order: number;
  level: number;
  path: string;
  status: number; // 1-启用, 0-禁用
  created_at: string;
  updated_at: string;
  children?: DictionaryItemInfo[]; // 用于树形结构
}

// ========== 字典管理接口 ==========

// 创建字典
export interface CreateDictionaryReq {
  code: string;
  name: string;
  description?: string;
}

export interface CreateDictionaryResp {
  base_resp: BaseResp;
  dictionary: DictionaryInfo;
}

// 更新字典
export interface UpdateDictionaryReq {
  id: number;
  name: string;
  description?: string;
  status?: number;
}

export interface UpdateDictionaryResp {
  base_resp: BaseResp;
  dictionary: DictionaryInfo;
}

// 删除字典
export interface DeleteDictionaryReq {
  id: number;
}

export interface DeleteDictionaryResp {
  base_resp: BaseResp;
}

// 获取字典列表
export interface GetDictionaryListReq {
  keyword?: string;
  status?: number;
  page?: number;
  page_size?: number;
}

export interface GetDictionaryListResp {
  base_resp: BaseResp;
  dictionaries: DictionaryInfo[];
  page_info: PageInfo;
}

// 获取字典详情
export interface GetDictionaryReq {
  id: number;
}

export interface GetDictionaryResp {
  base_resp: BaseResp;
  dictionary: DictionaryInfo;
}

// 根据编码获取字典
export interface GetDictionaryByCodeReq {
  code: string;
}

export interface GetDictionaryByCodeResp {
  base_resp: BaseResp;
  dictionary: DictionaryInfo;
}

// ========== 字典项管理接口 ==========

// 创建字典项
export interface CreateDictionaryItemReq {
  dictionary_id: number;
  parent_id: number;
  code: string;
  name: string;
  description?: string;
  icon_url?: string;
  sort_order?: number;
}

export interface CreateDictionaryItemResp {
  base_resp: BaseResp;
  item: DictionaryItemInfo;
}

// 更新字典项
export interface UpdateDictionaryItemReq {
  id: number;
  name?: string;
  description?: string;
  icon_url?: string;
  sort_order?: number;
  status?: number;
}

export interface UpdateDictionaryItemResp {
  base_resp: BaseResp;
  item: DictionaryItemInfo;
}

// 删除字典项
export interface DeleteDictionaryItemReq {
  id: number;
}

export interface DeleteDictionaryItemResp {
  base_resp: BaseResp;
}

// 获取字典项列表
export interface GetDictionaryItemListReq {
  dictionary_id: number;
  parent_id?: number;
  status?: number;
  page?: number;
  page_size?: number;
}

export interface GetDictionaryItemListResp {
  base_resp: BaseResp;
  items: DictionaryItemInfo[];
  page_info: PageInfo;
}

// 获取字典树形结构（公开接口）
export interface GetDictionaryTreeReq {
  dictionary_code: string;
  only_enabled?: number;
}

export interface GetDictionaryTreeResp {
  base_resp: BaseResp;
  tree: DictionaryItemInfo[];
}

// 批量获取字典项（根据编码列表）
export interface BatchGetDictionaryItemsByCodesReq {
  dictionary_code: string;
  codes: string[];
}

export interface BatchGetDictionaryItemsByCodesResp {
  base_resp: BaseResp;
  items: DictionaryItemInfo[];
}

// 字典项树形节点
export interface DictionaryItemTreeNode {
  id: number;
  code: string;
  name: string;
  description?: string;
  icon_url?: string;
  sort_order: number;
  level: number;
  status: number;
  children?: DictionaryItemTreeNode[]; // 子节点
}

// 字典及其字典项树形结构
export interface DictionaryWithTree {
  dictionary: DictionaryInfo; // 字典基本信息
  tree: DictionaryItemTreeNode[]; // 字典项树形结构
}

// 批量获取字典和字典项请求（用于前端冷启动）
export interface GetAllDictionariesWithItemsReq {
  page?: number; // 页码，默认1
  page_size?: number; // 每页数量，默认20，最大20
}

// 批量获取字典和字典项响应
export interface GetAllDictionariesWithItemsResp {
  base_resp: BaseResp;
  dictionaries: DictionaryWithTree[]; // 字典列表（包含树形字典项）
  page_info: PageInfo; // 分页信息
}

// ========== API 函数 ==========

// 字典管理
export async function createDictionary(req: CreateDictionaryReq): Promise<CreateDictionaryResp> {
  return apiRequest<CreateDictionaryResp>('/api/v1/admin/dictionary/create', {
    method: 'POST',
    body: JSON.stringify(req),
  });
}

export async function updateDictionary(req: UpdateDictionaryReq): Promise<UpdateDictionaryResp> {
  return apiRequest<UpdateDictionaryResp>('/api/v1/admin/dictionary/update', {
    method: 'POST',
    body: JSON.stringify(req),
  });
}

export async function deleteDictionary(req: DeleteDictionaryReq): Promise<DeleteDictionaryResp> {
  return apiRequest<DeleteDictionaryResp>('/api/v1/admin/dictionary/delete', {
    method: 'POST',
    body: JSON.stringify(req),
  });
}

export async function getDictionaryList(req: GetDictionaryListReq): Promise<GetDictionaryListResp> {
  return apiRequest<GetDictionaryListResp>('/api/v1/admin/dictionary/list', {
    method: 'POST',
    body: JSON.stringify(req),
  });
}

export async function getDictionary(id: number): Promise<GetDictionaryResp> {
  return apiRequest<GetDictionaryResp>(`/api/v1/admin/dictionary/${id}`, {
    method: 'POST',
    body: JSON.stringify({ id }),
  });
}

export async function getDictionaryByCode(req: GetDictionaryByCodeReq): Promise<GetDictionaryByCodeResp> {
  return apiRequest<GetDictionaryByCodeResp>('/api/v1/admin/dictionary/by-code', {
    method: 'POST',
    body: JSON.stringify(req),
  });
}

// 字典项管理
export async function createDictionaryItem(req: CreateDictionaryItemReq): Promise<CreateDictionaryItemResp> {
  return apiRequest<CreateDictionaryItemResp>('/api/v1/admin/dictionary/item/create', {
    method: 'POST',
    body: JSON.stringify(req),
  });
}

export async function updateDictionaryItem(req: UpdateDictionaryItemReq): Promise<UpdateDictionaryItemResp> {
  return apiRequest<UpdateDictionaryItemResp>('/api/v1/admin/dictionary/item/update', {
    method: 'POST',
    body: JSON.stringify(req),
  });
}

export async function deleteDictionaryItem(req: DeleteDictionaryItemReq): Promise<DeleteDictionaryItemResp> {
  return apiRequest<DeleteDictionaryItemResp>('/api/v1/admin/dictionary/item/delete', {
    method: 'POST',
    body: JSON.stringify(req),
  });
}

export async function getDictionaryItemList(req: GetDictionaryItemListReq): Promise<GetDictionaryItemListResp> {
  return apiRequest<GetDictionaryItemListResp>('/api/v1/admin/dictionary/item/list', {
    method: 'POST',
    body: JSON.stringify(req),
  });
}

// 获取字典树形结构（公开接口，不需要管理员权限）
export async function getDictionaryTree(req: GetDictionaryTreeReq): Promise<GetDictionaryTreeResp> {
  return apiRequest<GetDictionaryTreeResp>('/api/v1/dictionary/tree', {
    method: 'POST',
    body: JSON.stringify(req),
  });
}

// 批量获取字典项（根据编码列表）
export async function batchGetDictionaryItemsByCodes(req: BatchGetDictionaryItemsByCodesReq): Promise<BatchGetDictionaryItemsByCodesResp> {
  return apiRequest<BatchGetDictionaryItemsByCodesResp>('/api/v1/dictionary/items/batch', {
    method: 'POST',
    body: JSON.stringify(req),
  });
}

// 批量获取所有字典和字典项（用于前端冷启动）
export async function getAllDictionariesWithItems(req: GetAllDictionariesWithItemsReq = {}): Promise<GetAllDictionariesWithItemsResp> {
  return apiRequest<GetAllDictionariesWithItemsResp>('/api/v1/dictionary/all', {
    method: 'POST',
    body: JSON.stringify({
      page: req.page || 1,
      page_size: req.page_size || 20,
    }),
  });
}

