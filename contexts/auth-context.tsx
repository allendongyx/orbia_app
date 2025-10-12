"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { UserInfo, switchCurrentTeam } from '@/lib/api/user';
import { getProfile } from '@/lib/api/user';
import { isAuthenticated, clearAuthToken } from '@/lib/auth';
import { isSuccessResponse, registerAuthErrorHandler, isAuthError } from '@/lib/api-client';

interface AuthContextType {
  user: UserInfo | null;
  isLoading: boolean;
  isLoggedIn: boolean;
  loadError: string | null;
  login: (user: UserInfo) => void;
  logout: () => void;
  refreshUser: () => Promise<void>;
  switchTeam: (teamId: number) => Promise<boolean>;
  retryLoad: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  // 统一的登出处理
  const handleLogout = useCallback(() => {
    clearAuthToken();
    setUser(null);
    setIsLoggedIn(false);
    setLoadError(null);
  }, []);

  // 获取用户信息
  const fetchUserProfile = useCallback(async () => {
    // 如果本地没有 token，直接返回
    if (!isAuthenticated()) {
      setUser(null);
      setIsLoggedIn(false);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setLoadError(null);

    // 设置 30 秒超时
    const timeout = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Request timeout after 30 seconds')), 30000);
    });

    try {
      // 使用 Promise.race 来实现超时控制
      const response = await Promise.race([
        getProfile(),
        timeout
      ]);
      
      // 检查响应是否成功
      if (isSuccessResponse(response.base_resp) && response.user) {
        setUser(response.user);
        setIsLoggedIn(true);
        setLoadError(null);
      } else {
        // 业务逻辑返回失败，清除认证信息
        console.warn('Profile request returned error:', response.base_resp);
        handleLogout();
        setLoadError('Failed to load user profile');
      }
    } catch (error) {
      // 任何错误都清除认证信息
      console.error('Failed to fetch user profile:', error);
      
      if (error instanceof Error && error.message.includes('timeout')) {
        setLoadError('Request timeout. Please check your network connection and try again.');
      } else if (isAuthError(error)) {
        console.warn('Authentication expired, please login again');
        setLoadError('Authentication expired');
      } else {
        setLoadError('Failed to load user profile. Please check your network connection.');
      }
      
      // 如果是认证错误或超时，清除认证信息
      handleLogout();
    } finally {
      setIsLoading(false);
    }
  }, [handleLogout]);

  // 初始化时获取用户信息
  useEffect(() => {
    fetchUserProfile();
  }, [fetchUserProfile]);

  // 注册全局认证错误处理器
  useEffect(() => {
    registerAuthErrorHandler(handleLogout);
  }, [handleLogout]);

  // 登录
  const login = useCallback((userData: UserInfo) => {
    setUser(userData);
    setIsLoggedIn(true);
  }, []);

  // 刷新用户信息
  const refreshUser = useCallback(async () => {
    await fetchUserProfile();
  }, [fetchUserProfile]);

  // 切换团队
  const switchTeam = useCallback(async (teamId: number): Promise<boolean> => {
    try {
      const response = await switchCurrentTeam({ team_id: teamId });
      
      if (isSuccessResponse(response.base_resp)) {
        // 切换成功后刷新用户信息
        await fetchUserProfile();
        return true;
      } else {
        console.error('Failed to switch team:', response.base_resp);
        return false;
      }
    } catch (error) {
      console.error('Failed to switch team:', error);
      return false;
    }
  }, [fetchUserProfile]);

  // 重试加载
  const retryLoad = useCallback(() => {
    fetchUserProfile();
  }, [fetchUserProfile]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isLoggedIn,
        loadError,
        login,
        logout: handleLogout,
        refreshUser,
        switchTeam,
        retryLoad,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

