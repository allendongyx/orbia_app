"use client";

import React from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ArrowUpRight,
  ArrowDownLeft,
  FileText,
  HelpCircle,
  Settings,
  History,
} from "lucide-react";

export function QuickActions() {
  const actions = [
    {
      icon: ArrowUpRight,
      label: "充值",
      description: "为账户充值",
      href: "/wallet/recharge",
      color: "text-green-600 bg-green-50 dark:bg-green-950",
    },
    {
      icon: ArrowDownLeft,
      label: "提现",
      description: "申请提现",
      href: "/wallet/withdraw",
      color: "text-orange-600 bg-orange-50 dark:bg-orange-950",
    },
    {
      icon: FileText,
      label: "对账单",
      description: "查看账单",
      href: "/wallet/statements",
      color: "text-blue-600 bg-blue-50 dark:bg-blue-950",
    },
    {
      icon: History,
      label: "交易历史",
      description: "完整记录",
      href: "/wallet/history",
      color: "text-purple-600 bg-purple-50 dark:bg-purple-950",
    },
    {
      icon: HelpCircle,
      label: "帮助中心",
      description: "获取帮助",
      href: "/support",
      color: "text-gray-600 bg-gray-50 dark:bg-gray-950",
    },
    {
      icon: Settings,
      label: "钱包设置",
      description: "管理钱包",
      href: "/wallet/settings",
      color: "text-indigo-600 bg-indigo-50 dark:bg-indigo-950",
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>快速操作</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {actions.map((action, index) => (
            <Link key={index} href={action.href}>
              <Button
                variant="outline"
                className="w-full h-auto flex flex-col items-center gap-2 p-4 hover:shadow-md transition-shadow"
              >
                <div className={`p-2 rounded-lg ${action.color}`}>
                  <action.icon className="h-5 w-5" />
                </div>
                <div className="text-center">
                  <p className="font-medium text-sm">{action.label}</p>
                  <p className="text-xs text-muted-foreground">
                    {action.description}
                  </p>
                </div>
              </Button>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

