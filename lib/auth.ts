// 认证相关工具函数

const AUTH_TOKEN_KEY = 'auth_token';
const TOKEN_EXPIRY_KEY = 'token_expiry';

// 保存 token 到本地
export function saveAuthToken(token: string, expiresIn: number) {
  if (typeof window === 'undefined') return;
  
  localStorage.setItem(AUTH_TOKEN_KEY, token);
  
  // 计算过期时间（当前时间 + expiresIn 秒）
  const expiryTime = Date.now() + expiresIn * 1000;
  localStorage.setItem(TOKEN_EXPIRY_KEY, expiryTime.toString());
}

// 获取 token
export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  
  const token = localStorage.getItem(AUTH_TOKEN_KEY);
  const expiry = localStorage.getItem(TOKEN_EXPIRY_KEY);
  
  // 检查 token 是否过期
  if (token && expiry) {
    const expiryTime = parseInt(expiry, 10);
    if (Date.now() > expiryTime) {
      // Token 已过期，清除
      clearAuthToken();
      return null;
    }
  }
  
  return token;
}

// 清除 token
export function clearAuthToken() {
  if (typeof window === 'undefined') return;
  
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(TOKEN_EXPIRY_KEY);
}

// 检查是否已登录
export function isAuthenticated(): boolean {
  return getAuthToken() !== null;
}

// MetaMask 签名消息
export function getSignMessage(address: string): string {
  return `Welcome to Orbia!\n\nClick to sign in and accept the Orbia Terms of Service.\n\nThis request will not trigger a blockchain transaction or cost any gas fees.\n\nWallet address:\n${address}`;
}

