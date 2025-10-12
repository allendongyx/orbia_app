"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Loader2 } from 'lucide-react';
import { emailLogin, walletLogin } from '@/lib/api/auth';
import { getProfile } from '@/lib/api/user';
import { saveAuthToken, getSignMessage } from '@/lib/auth';
import { useAuth } from '@/contexts/auth-context';
import { isSuccessResponse, getErrorMessage } from '@/lib/api-client';

interface LoginModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LoginModal({ open, onOpenChange }: LoginModalProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();

  // 邮箱登录
  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!email || !password) {
      setError('Please enter email and password');
      return;
    }

    setIsLoading(true);

    try {
      // 调用登录接口
      const loginResponse = await emailLogin({ email, password });
      
      if (!isSuccessResponse(loginResponse.base_resp)) {
        throw new Error(getErrorMessage(loginResponse.base_resp));
      }

      // 保存 token
      saveAuthToken(loginResponse.token, loginResponse.expires_in);

      // 获取用户信息
      const profileResponse = await getProfile();
      
      if (!isSuccessResponse(profileResponse.base_resp) || !profileResponse.user) {
        throw new Error(getErrorMessage(profileResponse.base_resp) || 'Failed to fetch user profile');
      }

      // 更新用户状态
      login(profileResponse.user);

      // 关闭模态框
      onOpenChange(false);
      
      // 清空表单
      setEmail('');
      setPassword('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  // MetaMask 登录
  const handleMetaMaskLogin = async () => {
    setError('');
    
    // 检查 MetaMask 是否安装
    if (typeof window.ethereum === 'undefined') {
      setError('Please install MetaMask to use wallet login');
      return;
    }

    setIsLoading(true);

    try {
      // 请求账户访问
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });

      if (!accounts || accounts.length === 0) {
        throw new Error('No accounts found');
      }

      const address = accounts[0];
      const message = getSignMessage(address);

      // 请求签名
      const signature = await window.ethereum.request({
        method: 'personal_sign',
        params: [message, address],
      });

      // 调用钱包登录接口
      const loginResponse = await walletLogin({
        wallet_address: address,
        signature,
        message,
      });

      if (!isSuccessResponse(loginResponse.base_resp)) {
        throw new Error(getErrorMessage(loginResponse.base_resp));
      }

      // 保存 token
      saveAuthToken(loginResponse.token, loginResponse.expires_in);

      // 获取用户信息
      const profileResponse = await getProfile();
      
      if (!isSuccessResponse(profileResponse.base_resp) || !profileResponse.user) {
        throw new Error(getErrorMessage(profileResponse.base_resp) || 'Failed to fetch user profile');
      }

      // 更新用户状态
      login(profileResponse.user);

      // 关闭模态框
      onOpenChange(false);
    } catch (err: any) {
      // 处理用户拒绝签名
      if (err.code === 4001) {
        setError('You rejected the signature request');
      } else {
        setError(err instanceof Error ? err.message : 'MetaMask login failed');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Sign in to Orbia</DialogTitle>
          <DialogDescription>
            Choose your preferred sign in method
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* 错误提示 */}
          {error && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
              {error}
            </div>
          )}

          {/* 邮箱登录表单 */}
          <form onSubmit={handleEmailLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-blue-700 hover:bg-blue-800"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign in with Email'
              )}
            </Button>
          </form>

          {/* 分隔线 */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-gray-500">Or continue with</span>
            </div>
          </div>

          {/* MetaMask 登录按钮 */}
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={handleMetaMaskLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Connecting...
              </>
            ) : (
              <>
                <svg
                  className="mr-2 h-5 w-5"
                  viewBox="0 0 40 40"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M36.5 4L22.5 14.5L25 8.5L36.5 4Z"
                    fill="#E17726"
                    stroke="#E17726"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M3.5 4L17.5 14.5L15 8.5L3.5 4Z"
                    fill="#E27625"
                    stroke="#E27625"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M31 28L27 34L35.5 36.5L38 28.5L31 28Z"
                    fill="#E27625"
                    stroke="#E27625"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M2 28.5L4.5 36.5L13 34L9 28L2 28.5Z"
                    fill="#E27625"
                    stroke="#E27625"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                Sign in with MetaMask
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

