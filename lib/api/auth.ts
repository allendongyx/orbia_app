import { apiRequest, type BaseResp } from '../api-client';

// 钱包登录请求
export interface WalletLoginReq {
  wallet_address: string;
  signature: string;
  message?: string;
}

// 钱包登录响应
export interface WalletLoginResp {
  token: string;
  expires_in: number;
  base_resp: BaseResp;
}

// 邮箱登录请求
export interface EmailLoginReq {
  email: string;
  password: string;
}

// 邮箱登录响应
export interface EmailLoginResp {
  token: string;
  expires_in: number;
  base_resp: BaseResp;
}

// 钱包登录
export async function walletLogin(req: WalletLoginReq): Promise<WalletLoginResp> {
  return apiRequest<WalletLoginResp>('/api/v1/auth/wallet-login', {
    method: 'POST',
    body: JSON.stringify(req),
  });
}

// 邮箱登录
export async function emailLogin(req: EmailLoginReq): Promise<EmailLoginResp> {
  return apiRequest<EmailLoginResp>('/api/v1/auth/email-login', {
    method: 'POST',
    body: JSON.stringify(req),
  });
}

