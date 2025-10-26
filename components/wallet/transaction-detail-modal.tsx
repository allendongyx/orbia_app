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
import {
  type Transaction,
  formatAmount,
  getTransactionTypeText,
  getTransactionStatusText,
  mapTransactionStatus,
  getPaymentMethodText,
} from "@/lib/api/wallet";

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

  const getStatusBadge = (status: string) => {
    const mappedStatus = mapTransactionStatus(status);
    const statusText = getTransactionStatusText(status);
    
    switch (mappedStatus) {
      case "completed":
        return (
          <Badge className="bg-green-500/10 text-green-600 hover:bg-green-500/20">
            <CheckCircle2 className="mr-1 h-3 w-3" />
            {statusText}
          </Badge>
        );
      case "pending":
        return (
          <Badge className="bg-yellow-500/10 text-yellow-600 hover:bg-yellow-500/20">
            <Clock className="mr-1 h-3 w-3" />
            {statusText}
          </Badge>
        );
      case "failed":
        return (
          <Badge className="bg-red-500/10 text-red-600 hover:bg-red-500/20">
            <AlertCircle className="mr-1 h-3 w-3" />
            {statusText}
          </Badge>
        );
      case "cancelled":
        return (
          <Badge className="bg-gray-500/10 text-gray-600 hover:bg-gray-500/20">
            <AlertCircle className="mr-1 h-3 w-3" />
            {statusText}
          </Badge>
        );
      default:
        return <Badge variant="outline">{statusText}</Badge>;
    }
  };

  const isRecharge = transaction.type === 'RECHARGE' || transaction.type === 'REFUND' || transaction.type === 'UNFREEZE';
  const isExpense = transaction.type === 'CONSUME' || transaction.type === 'FREEZE';

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
              {getTransactionTypeText(transaction.type)}
            </p>
            <p
              className={`text-4xl font-bold ${
                isExpense ? "text-red-600" : "text-green-600"
              }`}
            >
              {isExpense ? "-" : "+"}
              {formatAmount(transaction.amount)}
            </p>
          </div>

          <Separator />

          {/* 交易信息 */}
          <div className="space-y-3">
            <div className="flex justify-between items-start">
              <span className="text-sm text-muted-foreground">交易ID</span>
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm">{transaction.transaction_id}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => handleCopy(transaction.transaction_id)}
                >
                  {copied ? (
                    <CheckCircle2 className="h-3 w-3" />
                  ) : (
                    <Copy className="h-3 w-3" />
                  )}
                </Button>
              </div>
            </div>

            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">类型</span>
              <Badge variant="outline">{getTransactionTypeText(transaction.type)}</Badge>
            </div>

            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">余额变化</span>
              <span className="font-mono text-xs">
                {formatAmount(transaction.balance_before)} → {formatAmount(transaction.balance_after)}
              </span>
            </div>

            {transaction.payment_method && (
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">支付方式</span>
                <Badge variant="outline">
                  {getPaymentMethodText(
                    transaction.payment_method,
                    transaction.crypto_currency,
                    transaction.crypto_chain,
                    transaction.online_payment_platform
                  )}
                </Badge>
              </div>
            )}

            {transaction.crypto_tx_hash && (
              <div className="flex justify-between items-start">
                <span className="text-sm text-muted-foreground">交易哈希</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs text-right max-w-[200px] truncate">
                    {transaction.crypto_tx_hash}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => handleCopy(transaction.crypto_tx_hash || "")}
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
                      href={`https://etherscan.io/tx/${transaction.crypto_tx_hash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </Button>
                </div>
              </div>
            )}

            {transaction.online_payment_order_id && (
              <div className="flex justify-between items-start">
                <span className="text-sm text-muted-foreground">订单号</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs text-right max-w-[200px] truncate">
                    {transaction.online_payment_order_id}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => handleCopy(transaction.online_payment_order_id || "")}
                  >
                    {copied ? (
                      <CheckCircle2 className="h-3 w-3" />
                    ) : (
                      <Copy className="h-3 w-3" />
                    )}
                  </Button>
                </div>
              </div>
            )}

            {transaction.related_order_id && (
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">关联订单</span>
                <span className="font-mono text-xs">{transaction.related_order_id}</span>
              </div>
            )}

            {transaction.remark && (
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">备注</span>
                <span className="text-sm">{transaction.remark}</span>
              </div>
            )}

            {transaction.failed_reason && (
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">失败原因</span>
                <span className="text-sm text-red-600">{transaction.failed_reason}</span>
              </div>
            )}

            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">状态</span>
              {getStatusBadge(transaction.status)}
            </div>

            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">创建时间</span>
              <span className="text-sm">
                {new Date(transaction.created_at).toLocaleString('zh-CN')}
              </span>
            </div>

            {transaction.completed_at && (
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">完成时间</span>
                <span className="text-sm">
                  {new Date(transaction.completed_at).toLocaleString('zh-CN')}
                </span>
              </div>
            )}
          </div>

          <Separator />

          {/* 操作按钮 */}
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" asChild>
              <a href={`/support?transaction=${transaction.transaction_id}`}>
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

