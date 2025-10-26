"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  CheckCircle,
  Copy,
  ExternalLink,
  Wallet,
  AlertCircle,
  Loader2,
  Home,
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { isSuccessResponse } from "@/lib/api-client";
import { getRechargeOrderDetail, formatAmount } from "@/lib/api/wallet";
import type { RechargeOrder } from "@/lib/api/wallet";
import {
  parseNetworkFromFullName,
  getNetworkConfig,
  buildExplorerUrl,
  type BlockchainNetwork,
} from "@/types/payment";

export default function RechargeSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get("order_id");

  const [order, setOrder] = useState<RechargeOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    if (orderId) {
      loadOrderDetail();
    } else {
      router.push("/wallet");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId]);

  const loadOrderDetail = async () => {
    if (!orderId) return;

    setLoading(true);
    try {
      const result = await getRechargeOrderDetail(orderId);
      
      if (isSuccessResponse(result.base_resp) && result.order) {
        setOrder(result.order);
      } else {
        toast({
          variant: "error",
          title: "加载失败",
          description: result.base_resp.status_msg || "获取订单详情失败",
        });
        setTimeout(() => router.push("/wallet"), 2000);
      }
    } catch (error) {
      toast({
        variant: "error",
        title: "加载失败",
        description: error instanceof Error ? error.message : "网络错误",
      });
      setTimeout(() => router.push("/wallet"), 2000);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(type);
      toast({
        title: "已复制",
        description: "内容已复制到剪贴板",
      });
      setTimeout(() => setCopied(null), 2000);
    } catch (error) {
      toast({
        variant: "error",
        title: "复制失败",
        description: "无法复制到剪贴板",
      });
    }
  };

  const handleOpenExplorer = () => {
    if (!order || !order.payment_address || !order.payment_network) return;
    const network = parseNetworkFromFullName(order.payment_network);
    if (!network) return;
    const url = buildExplorerUrl(network as BlockchainNetwork, order.payment_address);
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const getNetworkInfo = (networkFullName?: string) => {
    if (!networkFullName) return null;
    const network = parseNetworkFromFullName(networkFullName);
    if (!network) return null;
    return getNetworkConfig(network);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <span className="ml-3 text-gray-600">加载中...</span>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
              <div>
                <h3 className="font-medium text-red-900 mb-1">未找到订单</h3>
                <p className="text-sm text-red-800">
                  无法找到该充值订单，请检查订单号是否正确。
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const networkInfo = getNetworkInfo(order.payment_network);

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      {/* 成功提示 */}
      <div className="mb-6">
        <div className="flex items-center justify-center mb-4">
          <div className="p-4 bg-green-100 rounded-full">
            <CheckCircle className="h-12 w-12 text-green-600" />
          </div>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 text-center">充值订单创建成功</h1>
        <p className="text-gray-600 text-center mt-2">
          请按照以下信息完成转账操作
        </p>
      </div>

      {/* 重要提示 */}
      <Card className="border-blue-200 bg-blue-50 mb-6">
        <CardContent className="p-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="font-medium text-blue-900 mb-2">重要提示</h3>
              <ul className="text-sm text-blue-800 space-y-1.5">
                <li>• 请务必使用订单中显示的<strong>您的转账钱包地址</strong>进行转账</li>
                <li>• 转账时请确认选择正确的<strong>网络</strong>，错误的网络可能导致资金丢失</li>
                <li>• 转账完成后，系统将自动检测区块链交易并确认到账</li>
                <li>• 通常需要等待 {networkInfo?.estimatedTime || "几分钟到几小时"} 完成区块确认</li>
                <li>• 如有任何问题，请联系客服并提供订单号</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 订单信息卡片 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* 左侧：订单详情 */}
        <div className="space-y-6">
          <Card>
            <CardContent className="p-6 space-y-4">
              <h2 className="text-lg font-semibold text-gray-900">订单信息</h2>
              <Separator />
              
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <span className="text-sm text-gray-600">订单号</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-medium text-gray-900">
                      {order.order_id}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={() => handleCopy(order.order_id, "order_id")}
                    >
                      {copied === "order_id" ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">充值金额</span>
                  <span className="text-xl font-bold text-green-600">
                    {formatAmount(order.amount)}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">支付网络</span>
                  <div className="flex items-center gap-2">
                    {networkInfo && (
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: networkInfo.color }}
                      />
                    )}
                    <span className="text-sm font-medium text-gray-900">
                      {networkInfo?.name || order.payment_network}
                    </span>
                  </div>
                </div>

                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">创建时间</span>
                  <span className="text-sm text-gray-900">
                    {new Date(order.created_at).toLocaleString('zh-CN')}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">订单状态</span>
                  <Badge className="bg-yellow-100 text-yellow-700 border-0">
                    待确认
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 您的转账钱包地址 */}
          <Card>
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">您的转账钱包</h2>
                <Badge variant="secondary" className="bg-red-100 text-red-700 border-0">
                  请务必使用此地址
                </Badge>
              </div>
              <Separator />

              <div className="space-y-3">
                <p className="text-sm text-gray-600">
                  请使用以下钱包地址进行转账，系统将根据此地址自动匹配和确认您的充值
                </p>
                
                <div className="bg-gray-50 rounded-lg p-4">
                  <code className="text-sm font-mono break-all text-gray-900">
                    {order.user_crypto_address}
                  </code>
                </div>

                <Button
                  variant="outline"
                  onClick={() => handleCopy(order.user_crypto_address || "", "user_address")}
                  className="w-full"
                >
                  {copied === "user_address" ? (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                      已复制
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 mr-2" />
                      复制您的钱包地址
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 右侧：收款地址和二维码 */}
        <div className="space-y-6">
          <Card>
            <CardContent className="p-6 space-y-4">
              <h2 className="text-lg font-semibold text-gray-900">收款地址</h2>
              <Separator />

              {/* 二维码 */}
              <div className="flex justify-center">
                <div className="p-4 bg-white border-4 border-gray-200 rounded-lg">
                  <QRCodeSVG
                    value={order.payment_address || ""}
                    size={200}
                    level="H"
                    includeMargin={false}
                  />
                </div>
              </div>

              <div className="text-center">
                <p className="text-sm text-gray-600 mb-2">
                  扫描二维码或复制地址转账
                </p>
                <Badge variant="secondary" className="text-xs">
                  {networkInfo?.name} 网络
                </Badge>
              </div>

              {/* 收款地址 */}
              <div className="space-y-3">
                <div className="bg-gray-50 rounded-lg p-4">
                  <code className="text-sm font-mono break-all text-gray-900">
                    {order.payment_address}
                  </code>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    onClick={() => handleCopy(order.payment_address || "", "payment_address")}
                  >
                    {copied === "payment_address" ? (
                      <>
                        <CheckCircle className="h-4 w-4 mr-1 text-green-600" />
                        已复制
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4 mr-1" />
                        复制地址
                      </>
                    )}
                  </Button>

                  <Button
                    variant="outline"
                    onClick={handleOpenExplorer}
                  >
                    <ExternalLink className="h-4 w-4 mr-1" />
                    浏览器
                  </Button>
                </div>
              </div>

              {order.payment_label && (
                <div className="mt-4 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Wallet className="h-4 w-4 text-purple-600" />
                    <span className="text-sm text-purple-900 font-medium">
                      {order.payment_label}
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* 操作按钮 */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link href="/wallet">
          <Button size="lg" className="w-full sm:w-auto min-w-[200px]">
            <Home className="h-5 w-5 mr-2" />
            返回钱包首页
          </Button>
        </Link>
        
        <Link href="/wallet">
          <Button variant="outline" size="lg" className="w-full sm:w-auto min-w-[200px]">
            <Wallet className="h-5 w-5 mr-2" />
            查看充值记录
          </Button>
        </Link>
      </div>

      {/* 底部提示 */}
      <Card className="mt-6 border-gray-200">
        <CardContent className="p-6">
          <h3 className="font-medium text-gray-900 mb-3">后续步骤</h3>
          <ol className="space-y-2 text-sm text-gray-600">
            <li className="flex items-start gap-2">
              <span className="font-bold text-blue-600 min-w-[20px]">1.</span>
              <span>使用您的钱包地址（{order.user_crypto_address?.slice(0, 6)}...{order.user_crypto_address?.slice(-4)}）向收款地址转账</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold text-blue-600 min-w-[20px]">2.</span>
              <span>确认转账金额为 <strong>{formatAmount(order.amount)}</strong></span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold text-blue-600 min-w-[20px]">3.</span>
              <span>等待区块链网络确认交易（通常需要 {networkInfo?.estimatedTime || "几分钟到几小时"}）</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold text-blue-600 min-w-[20px]">4.</span>
              <span>系统自动检测到交易后，管理员会尽快审核并为您入账</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold text-blue-600 min-w-[20px]">5.</span>
              <span>您可以在钱包页面的&ldquo;充值记录&rdquo;中查看订单状态</span>
            </li>
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}

