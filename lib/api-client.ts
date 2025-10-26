import { getAuthToken } from './auth';

// API 基础配置
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8888';

// 通用响应类型
export interface BaseResp {
  status_code: number;
  status_msg: string;
  // 兼容旧字段
  code?: number;
  message?: string;
  msg?: string;
}

// API 响应包装类型
export interface ApiResponse<T> {
  data?: T;
  base_resp: BaseResp;
}

// 检查响应是否成功
export function isSuccessResponse(baseResp: BaseResp): boolean {
  // 支持新字段 status_code 和旧字段 code，都为 0 或 200 表示成功
  const statusCode = baseResp.status_code ?? baseResp.code ?? -1;
  return statusCode === 0 || statusCode === 200;
}

// 获取错误消息
export function getErrorMessage(baseResp: BaseResp): string {
  return baseResp.status_msg || baseResp.message || baseResp.msg || 'Request failed';
}

// 认证错误类（用于标识需要清除登录状态的错误）
export class AuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AuthError';
  }
}

// 检查是否是认证错误
export function isAuthError(error: unknown): error is AuthError {
  return error instanceof AuthError;
}

// 清除认证信息的回调函数（由 AuthContext 注册）
let onAuthError: (() => void) | null = null;

export function registerAuthErrorHandler(handler: () => void) {
  onAuthError = handler;
}

// 触发认证错误处理
function handleAuthError() {
  if (onAuthError) {
    onAuthError();
  }
}

// 创建 API 请求函数
export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const { headers, ...restOptions } = options;
  
  // 使用 getAuthToken 获取 token（会自动检查过期时间）
  const token = typeof window !== 'undefined' ? getAuthToken() : null;
  
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...restOptions,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...headers,
      },
    });

    const data = await response.json();

    // 兼容新的返回格式：{ code, message, data }
    // 将其转换为旧格式：{ ...data, base_resp: { status_code, status_msg } }
    let normalizedData = data;
    if (data.code !== undefined && data.data !== undefined) {
      // 新格式，需要转换
      normalizedData = {
        ...(typeof data.data === 'object' ? data.data : {}),
        base_resp: {
          status_code: data.code,
          status_msg: data.message || data.msg || '',
          code: data.code,
          message: data.message || data.msg || '',
        },
      };
    }

    // 检查 HTTP 状态码 - 401/403 表示认证失败
    if (response.status === 401 || response.status === 403) {
      const errorMsg = normalizedData.base_resp 
        ? getErrorMessage(normalizedData.base_resp) 
        : 'Authentication failed';
      
      // 触发认证错误处理（清除登录状态）
      handleAuthError();
      
      throw new AuthError(errorMsg);
    }

    // 如果 HTTP 状态码不是 2xx，但有响应体，检查 base_resp
    if (!response.ok) {
      if (normalizedData.base_resp) {
        throw new Error(getErrorMessage(normalizedData.base_resp));
      }
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    // 检查业务逻辑层的成功状态
    if (normalizedData.base_resp && !isSuccessResponse(normalizedData.base_resp)) {
      const errorMsg = getErrorMessage(normalizedData.base_resp);
      
      // 检查业务错误码，某些错误码也表示认证失败
      // 例如：401, 403 或者自定义的认证错误码
      const statusCode = normalizedData.base_resp.status_code ?? normalizedData.base_resp.code ?? 0;
      if (statusCode === 401 || statusCode === 403) {
        handleAuthError();
        throw new AuthError(errorMsg);
      }
      
      throw new Error(errorMsg);
    }

    return normalizedData;
  } catch (error) {
    // 如果是 AuthError，直接抛出
    if (error instanceof AuthError) {
      throw error;
    }
    
    // 网络错误或其他异常
    if (error instanceof Error) {
      throw error;
    }
    
    throw new Error('Network error or request failed');
  }
}

// API 客户端对象
const apiClient = {
  get: <T>(endpoint: string, options?: RequestInit): Promise<T> => {
    return apiRequest<T>(endpoint, { ...options, method: 'GET' });
  },
  
  post: <T>(endpoint: string, data?: unknown, options?: RequestInit): Promise<T> => {
    return apiRequest<T>(endpoint, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  },
  
  put: <T>(endpoint: string, data?: unknown, options?: RequestInit): Promise<T> => {
    return apiRequest<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  },
  
  delete: <T>(endpoint: string, options?: RequestInit): Promise<T> => {
    return apiRequest<T>(endpoint, { ...options, method: 'DELETE' });
  },
};

export default apiClient;
