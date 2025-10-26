"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Mail, ArrowRight } from 'lucide-react';
import { sendVerificationCode, emailCodeLogin, walletLogin } from '@/lib/api/auth';
import { getProfile } from '@/lib/api/user';
import { saveAuthToken, getSignMessage } from '@/lib/auth';
import { useAuth } from '@/contexts/auth-context';
import { isSuccessResponse, getErrorMessage } from '@/lib/api-client';
import { useToast } from '@/hooks/use-toast';

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoggedIn } = useAuth();
  const { toast } = useToast();
  
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [error, setError] = useState('');
  const [step, setStep] = useState<'email' | 'code'>('email');

  // 如果已登录，跳转到首页
  useEffect(() => {
    if (isLoggedIn) {
      router.push('/dashboard');
    }
  }, [isLoggedIn, router]);

  // 倒计时
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // 发送验证码
  const handleSendCode = async () => {
    setError('');
    
    if (!email) {
      setError('Please enter your email address');
      return;
    }

    // 简单的邮箱格式验证
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setIsSendingCode(true);

    try {
      const response = await sendVerificationCode({ email, code_type: 'login' });
      
      if (!isSuccessResponse(response.base_resp)) {
        throw new Error(getErrorMessage(response.base_resp));
      }

      toast({
        title: 'Verification code sent',
        description: 'Please check your email inbox',
      });
      
      setStep('code');
      setCountdown(60);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send verification code');
    } finally {
      setIsSendingCode(false);
    }
  };

  // 邮箱验证码登录
  const handleEmailCodeLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!email || !code) {
      setError('Please enter email and verification code');
      return;
    }

    setIsLoading(true);

    try {
      // 调用登录接口
      const loginResponse = await emailCodeLogin({ email, code });
      
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

      toast({
        title: 'Login successful',
        description: 'Welcome back!',
      });

      // 跳转到首页
      router.push('/dashboard');
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

      toast({
        title: 'Login successful',
        description: 'Welcome back!',
      });

      // 跳转到首页
      router.push('/dashboard');
    } catch (err: unknown) {
      // 处理用户拒绝签名
      if ((err as { code?: number }).code === 4001) {
        setError('You rejected the signature request');
      } else {
        setError(err instanceof Error ? err.message : 'MetaMask login failed');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-blue-50 p-4">
      <div className="w-full max-w-md">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Image
              src="/logo.png"
              alt="Orbia Logo"
              width={120}
              height={40}
              className="object-contain"
              priority
            />
          </div>
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">
            Welcome to Orbia
          </h1>
          <p className="text-sm text-gray-600">
            Web3 Marketing Platform for TikTok
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          {/* Error Message */}
          {error && (
            <div className="mb-6 rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-600">
              {error}
            </div>
          )}

          {/* Email Verification Form */}
          <form onSubmit={handleEmailCodeLogin} className="space-y-5 mb-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                Email Address
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && step === 'email') {
                      e.preventDefault();
                      handleSendCode();
                    }
                  }}
                  disabled={isLoading || step === 'code'}
                  className="pl-10 h-11"
                />
              </div>
            </div>

            {step === 'code' && (
              <div className="space-y-2">
                <Label htmlFor="code" className="text-sm font-medium text-gray-700">
                  Verification Code
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="code"
                    type="text"
                    placeholder="Enter 6-digit code"
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    disabled={isLoading}
                    className="h-11"
                    maxLength={6}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleSendCode}
                    disabled={countdown > 0 || isSendingCode}
                    className="shrink-0 min-w-[100px]"
                  >
                    {isSendingCode ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : countdown > 0 ? (
                      `${countdown}s`
                    ) : (
                      'Resend'
                    )}
                  </Button>
                </div>
                <p className="text-xs text-gray-500">
                  Code sent to {email}
                </p>
              </div>
            )}

            {step === 'email' ? (
              <Button
                type="button"
                onClick={handleSendCode}
                disabled={isSendingCode || !email}
                className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-medium"
              >
                {isSendingCode ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending Code...
                  </>
                ) : (
                  <>
                    Continue with Email
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            ) : (
              <Button
                type="submit"
                disabled={isLoading || !code || code.length !== 6}
                className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-medium"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  'Sign in'
                )}
              </Button>
            )}
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-gray-500 font-medium">Or continue with</span>
            </div>
          </div>

          {/* MetaMask Login Button */}
          <Button
            type="button"
            variant="outline"
            className="w-full h-11 border-gray-300 hover:bg-gray-50 font-medium"
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
                MetaMask
              </>
            )}
          </Button>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center text-xs text-gray-500">
          <p>
            By signing in, you agree to our{' '}
            <a href="#" className="text-blue-600 hover:underline">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="#" className="text-blue-600 hover:underline">
              Privacy Policy
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

