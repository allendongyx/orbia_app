import { getAuthToken } from './auth';

// API 基础配置
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8888';

// 通用响应类型
export interface BaseResp {
  code: number;
  message: string;
  msg?: string; // 兼容旧字段
}

// API 响应包装类型
export interface ApiResponse<T> {
  data?: T;
  base_resp: BaseResp;
}

// 检查响应是否成功
export function isSuccessResponse(baseResp: BaseResp): boolean {
  // 支持 code 为 0 或 200 都表示成功
  return baseResp.code === 0 || baseResp.code === 200;
}

// 获取错误消息
export function getErrorMessage(baseResp: BaseResp): string {
  return baseResp.message || baseResp.msg || 'Request failed';
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

    // 检查 HTTP 状态码 - 401/403 表示认证失败
    if (response.status === 401 || response.status === 403) {
      const errorMsg = data.base_resp 
        ? getErrorMessage(data.base_resp) 
        : 'Authentication failed';
      
      // 触发认证错误处理（清除登录状态）
      handleAuthError();
      
      throw new AuthError(errorMsg);
    }

    // 如果 HTTP 状态码不是 2xx，但有响应体，检查 base_resp
    if (!response.ok) {
      if (data.base_resp) {
        throw new Error(getErrorMessage(data.base_resp));
      }
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    // 检查业务逻辑层的成功状态
    if (data.base_resp && !isSuccessResponse(data.base_resp)) {
      const errorMsg = getErrorMessage(data.base_resp);
      
      // 检查业务错误码，某些错误码也表示认证失败
      // 例如：401, 403 或者自定义的认证错误码
      if (data.base_resp.code === 401 || data.base_resp.code === 403) {
        handleAuthError();
        throw new AuthError(errorMsg);
      }
      
      throw new Error(errorMsg);
    }

    return data;
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
