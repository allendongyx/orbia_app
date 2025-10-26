"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tv, AlertCircle } from "lucide-react";

export default function AdminAdOrdersPage() {
  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">广告订单管理</h1>
        <p className="text-gray-600 mt-1">查看和管理所有广告投放订单</p>
      </div>

      {/* 功能待开发提示 */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="p-12 text-center">
          <div className="flex flex-col items-center gap-4">
            <div className="p-4 bg-blue-100 rounded-full">
              <Tv className="h-12 w-12 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-blue-900 mb-2">
                广告订单功能即将上线
              </h3>
              <p className="text-blue-800 mb-4">
                我们正在开发广告订单管理功能，敬请期待
              </p>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-lg border border-blue-200">
                <AlertCircle className="h-4 w-4 text-blue-600" />
                <span className="text-sm text-blue-900">
                  该功能将支持 TikTok 广告订单的创建、审核和管理
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

