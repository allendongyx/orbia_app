"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Copy,
  CheckCircle2,
  ExternalLink,
  Download,
  Clock,
  AlertCircle,
} from "lucide-react";

interface Transaction {
  id: string;
  name?: string;
  type: string;
  category?: string;
  amount: number;
  status: string;
  updateTime?: string;
  date?: string;
  payType?: string;
  txHash?: string;
}

interface TransactionDetailModalProps {
  transaction: Transaction | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TransactionDetailModal({
  transaction,
  open,
  onOpenChange,
}: TransactionDetailModalProps) {
  const [copied, setCopied] = React.useState(false);

  if (!transaction) return null;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(value);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return (
          <Badge className="bg-green-500/10 text-green-600 hover:bg-green-500/20">
            <CheckCircle2 className="mr-1 h-3 w-3" />
            已完成
          </Badge>
        );
      case "pending":
        return (
          <Badge className="bg-yellow-500/10 text-yellow-600 hover:bg-yellow-500/20">
            <Clock className="mr-1 h-3 w-3" />
            处理中
          </Badge>
        );
      case "failed":
        return (
          <Badge className="bg-red-500/10 text-red-600 hover:bg-red-500/20">
            <AlertCircle className="mr-1 h-3 w-3" />
            失败
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const isExpense = "category" in transaction;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>交易详情</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* 金额显示 */}
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 rounded-lg p-6 text-center">
            <p className="text-sm text-muted-foreground mb-2">
              {isExpense ? "消费金额" : "充值金额"}
            </p>
            <p
              className={`text-4xl font-bold ${
                isExpense ? "text-red-600" : "text-green-600"
              }`}
            >
              {isExpense ? "-" : "+"}
              {formatCurrency(transaction.amount)}
            </p>
          </div>

          <Separator />

          {/* 交易信息 */}
          <div className="space-y-3">
            <div className="flex justify-between items-start">
              <span className="text-sm text-muted-foreground">交易ID</span>
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm">{transaction.id}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => handleCopy(transaction.id)}
                >
                  {copied ? (
                    <CheckCircle2 className="h-3 w-3" />
                  ) : (
                    <Copy className="h-3 w-3" />
                  )}
                </Button>
              </div>
            </div>

            {isExpense && (
              <>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">消费名称</span>
                  <span className="text-sm font-medium">{transaction.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">消费类型</span>
                  <Badge variant="outline">{transaction.type}</Badge>
                </div>
              </>
            )}

            {!isExpense && (
              <>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">支付方式</span>
                  <Badge variant="outline">{transaction.payType}</Badge>
                </div>
                {transaction.txHash && transaction.txHash !== "-" && (
                  <div className="flex justify-between items-start">
                    <span className="text-sm text-muted-foreground">交易哈希</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-right max-w-[200px] truncate">
                        {transaction.txHash}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => handleCopy(transaction.txHash || "")}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        asChild
                      >
                        <a
                          href={`https://etherscan.io/tx/${transaction.txHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}

            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">状态</span>
              {getStatusBadge(transaction.status)}
            </div>

            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">时间</span>
              <span className="text-sm">
                {transaction.updateTime || transaction.date}
              </span>
            </div>
          </div>

          <Separator />

          {/* 操作按钮 */}
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" asChild>
              <a href={`/support?transaction=${transaction.id}`}>
                联系客服
              </a>
            </Button>
            <Button variant="outline" className="flex-1">
              <Download className="mr-2 h-4 w-4" />
              下载凭证
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

