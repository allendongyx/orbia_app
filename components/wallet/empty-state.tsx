"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FileX, Wallet, CreditCard } from "lucide-react";

interface EmptyStateProps {
  type: "transactions" | "recharge" | "expense";
}

export function EmptyState({ type }: EmptyStateProps) {
  const config = {
    transactions: {
      icon: FileX,
      title: "暂无交易记录",
      description: "您还没有任何交易记录。开始使用平台服务后，交易记录将显示在这里。",
      action: {
        label: "立即充值",
        href: "/wallet/recharge",
      },
    },
    recharge: {
      icon: Wallet,
      title: "暂无充值记录",
      description: "您还没有进行过充值。点击下方按钮开始充值。",
      action: {
        label: "立即充值",
        href: "/wallet/recharge",
      },
    },
    expense: {
      icon: CreditCard,
      title: "暂无消费记录",
      description: "您还没有任何消费记录。开始投放广告或与KOL合作后，消费记录将显示在这里。",
      action: {
        label: "创建广告",
        href: "/campaign/creation",
      },
    },
  };

  const { icon: Icon, title, description, action } = config[type];

  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-12">
        <div className="p-4 bg-muted rounded-full mb-4">
          <Icon className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        <p className="text-sm text-muted-foreground text-center max-w-md mb-6">
          {description}
        </p>
        <Link href={action.href}>
          <Button>{action.label}</Button>
        </Link>
      </CardContent>
    </Card>
  );
}

