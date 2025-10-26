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

// 发送验证码请求
export interface SendVerificationCodeReq {
  email: string;
  code_type?: 'login' | 'register' | 'reset_password';
}

// 发送验证码响应
export interface SendVerificationCodeResp {
  base_resp: BaseResp;
}

// 邮箱验证码登录请求
export interface EmailCodeLoginReq {
  email: string;
  code: string;
}

// 邮箱验证码登录响应
export interface EmailCodeLoginResp {
  token: string;
  expires_in: number;
  base_resp: BaseResp;
}

// 发送验证码
export async function sendVerificationCode(req: SendVerificationCodeReq): Promise<SendVerificationCodeResp> {
  return apiRequest<SendVerificationCodeResp>('/api/v1/auth/send-verification-code', {
    method: 'POST',
    body: JSON.stringify({
      email: req.email,
      code_type: req.code_type || 'login',
    }),
  });
}

// 邮箱验证码登录
export async function emailCodeLogin(req: EmailCodeLoginReq): Promise<EmailCodeLoginResp> {
  return apiRequest<EmailCodeLoginResp>('/api/v1/auth/email-login', {
    method: 'POST',
    body: JSON.stringify(req),
  });
}
