"use client";

import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Edit,
  Trash2,
  ExternalLink,
  Copy,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import type { PaymentWallet } from "@/types/payment";
import { getNetworkConfig, buildExplorerUrl } from "@/types/payment";

interface WalletCardProps {
  wallet: PaymentWallet;
  onEdit: (wallet: PaymentWallet) => void;
  onDelete: (wallet: PaymentWallet) => void;
}

/**
 * 收款钱包卡片组件
 * 
 * 显示钱包信息，支持复制地址、跳转区块链浏览器、编辑和删除
 */
export function WalletCard({ wallet, onEdit, onDelete }: WalletCardProps) {
  const [copied, setCopied] = useState(false);
  const networkConfig = getNetworkConfig(wallet.network);

  // 复制地址
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(wallet.address);
      setCopied(true);
      toast({
        title: "已复制",
        description: "钱包地址已复制到剪贴板",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        variant: "error",
        title: "复制失败",
        description: "无法复制到剪贴板",
      });
    }
  };

  // 打开区块链浏览器
  const handleOpenExplorer = (explorerIndex: number) => {
    const url = buildExplorerUrl(wallet.network, wallet.address, explorerIndex);
    window.open(url, "_blank", "noopener,noreferrer");
  };

  // 格式化地址显示（前6位...后4位）
  const formatAddress = (address: string) => {
    if (address.length <= 10) return address;
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <Card className="border-gray-200 shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          {/* 网络信息 */}
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge
                style={{ backgroundColor: networkConfig.color }}
                className="text-white border-0 font-medium"
              >
                {networkConfig.name}
              </Badge>
              {wallet.status === "active" ? (
                <Badge className="bg-green-100 text-green-700 border-0">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  启用
                </Badge>
              ) : (
                <Badge className="bg-gray-100 text-gray-700 border-0">
                  <XCircle className="h-3 w-3 mr-1" />
                  禁用
                </Badge>
              )}
            </div>
            <p className="text-sm text-gray-600">{networkConfig.fullName}</p>
            {wallet.label && (
              <p className="text-xs text-gray-500 mt-1">{wallet.label}</p>
            )}
          </div>

          {/* 操作按钮 */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(wallet)}
            >
              <Edit className="h-4 w-4 mr-1" />
              编辑
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDelete(wallet)}
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4 mr-1" />
              删除
            </Button>
          </div>
        </div>

        {/* 地址信息 */}
        <div className="bg-gray-50 rounded-lg p-4 space-y-3">
          {/* 地址显示 */}
          <div>
            <div className="text-xs text-gray-500 mb-1">钱包地址</div>
            <div className="flex items-center gap-2">
              <code className="flex-1 text-sm font-mono bg-white px-3 py-2 rounded border border-gray-200 break-all">
                {wallet.address}
              </code>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopy}
                className="shrink-0"
                title="复制地址"
              >
                {copied ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          {/* 区块链浏览器链接 */}
          <div>
            <div className="text-xs text-gray-500 mb-2">区块链浏览器</div>
            <div className="flex flex-wrap gap-2">
              {networkConfig.explorers.map((explorer, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => handleOpenExplorer(index)}
                  className="text-xs"
                >
                  <ExternalLink className="h-3 w-3 mr-1" />
                  {explorer.name}
                </Button>
              ))}
            </div>
          </div>

          {/* 网络信息 */}
          {(networkConfig.confirmations || networkConfig.estimatedTime) && (
            <div className="flex gap-4 text-xs text-gray-600 pt-2 border-t border-gray-200">
              {networkConfig.confirmations && (
                <div>
                  <span className="text-gray-500">确认数：</span>
                  {networkConfig.confirmations}
                </div>
              )}
              {networkConfig.estimatedTime && (
                <div>
                  <span className="text-gray-500">预计到账：</span>
                  {networkConfig.estimatedTime}
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

