"use client";

import { useEffect, useState } from "react";
import { Loader2, AlertCircle, RefreshCw } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";

export function GlobalLoading() {
  const { isLoading, loadError, retryLoad } = useAuth();
  const [showLoading, setShowLoading] = useState(false);

  useEffect(() => {
    // 只有在有 JWT 时才显示全局 loading
    if (isLoading && typeof window !== 'undefined' && localStorage.getItem('auth_token')) {
      setShowLoading(true);
    } else {
      setShowLoading(false);
    }
  }, [isLoading]);

  // 如果有加载错误，显示错误页面
  if (loadError && typeof window !== 'undefined' && localStorage.getItem('auth_token')) {
    return (
      <div className="fixed inset-0 bg-white z-50 flex items-center justify-center">
        <div className="max-w-md w-full px-6 text-center">
          <div className="flex justify-center mb-6">
            <div className="h-16 w-16 rounded-full bg-red-50 flex items-center justify-center">
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            Failed to Load
          </h2>
          
          <p className="text-gray-600 mb-6">
            {loadError}
          </p>
          
          <div className="flex flex-col gap-3">
            <Button 
              onClick={retryLoad}
              className="w-full gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Retry
            </Button>
            
            <p className="text-xs text-gray-500">
              If the problem persists, please check your internet connection or contact support.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // 如果正在加载，显示加载页面
  if (showLoading) {
    return (
      <div className="fixed inset-0 bg-white z-50 flex items-center justify-center">
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <Loader2 className="h-12 w-12 text-blue-600 animate-spin" />
          </div>
          
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Loading...
          </h2>
          
          <p className="text-sm text-gray-500">
            Please wait while we load your data
          </p>
        </div>
      </div>
    );
  }

  return null;
}

