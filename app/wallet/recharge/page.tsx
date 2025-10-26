"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Wallet,
  CreditCard,
  Copy,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Loader2,
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { isSuccessResponse } from "@/lib/api-client";
import { getActivePaymentSettings } from "@/lib/api/payment-setting";
import type { PaymentSettingInfo } from "@/lib/api/payment-setting";
import { createCryptoRechargeOrder } from "@/lib/api/wallet";
import {
  parseNetworkFromFullName,
  getNetworkConfig,
  buildExplorerUrl,
  type BlockchainNetwork,
} from "@/types/payment";

export default function Recharge() {
  const router = useRouter();

  // 状态
  const [loading, setLoading] = useState(false);
  const [loadingWallets, setLoadingWallets] = useState(true);
  const [availableWallets, setAvailableWallets] = useState<PaymentSettingInfo[]>([]);
  const [selectedNetwork, setSelectedNetwork] = useState<string>("");
  const [coinType, setCoinType] = useState<"USDT" | "USDC">("USDT");
  const [userWalletAddress, setUserWalletAddress] = useState("");
  const [amount, setAmount] = useState("");
  const [copied, setCopied] = useState(false);
  const [showReceiveAddress, setShowReceiveAddress] = useState(false);

  // 加载可用的充值钱包
  useEffect(() => {
    loadAvailableWallets();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadAvailableWallets = async () => {
    setLoadingWallets(true);
    try {
      const result = await getActivePaymentSettings({});
      
      if (isSuccessResponse(result.base_resp) && result.list) {
        setAvailableWallets(result.list);
        // 默认选择第一个
        if (result.list.length > 0) {
          setSelectedNetwork(result.list[0].network);
        }
      } else {
        toast({
          variant: "error",
          title: "加载失败",
          description: "无法加载充值钱包地址",
        });
      }
    } catch (error) {
      console.error("Load wallets error:", error);
      toast({
        variant: "error",
        title: "加载失败",
        description: error instanceof Error ? error.message : "网络错误",
      });
    } finally {
      setLoadingWallets(false);
    }
  };

  // 获取选中的钱包
  const selectedWallet = availableWallets.find(
    (w) => w.network === selectedNetwork
  );

  // 获取网络配置
  const getNetworkInfo = (networkFullName: string) => {
    const network = parseNetworkFromFullName(networkFullName);
    if (!network) return null;
    return getNetworkConfig(network);
  };

  // 复制地址
  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast({
        title: "已复制",
        description: "地址已复制到剪贴板",
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

  // 验证表单
  const validateForm = () => {
    if (!selectedNetwork) {
      toast({
        variant: "error",
        title: "验证失败",
        description: "请选择充值网络",
      });
      return false;
    }

    if (!userWalletAddress.trim()) {
      toast({
        variant: "error",
        title: "验证失败",
        description: "请输入您的钱包地址",
      });
      return false;
    }

    if (!amount || parseFloat(amount) <= 0) {
      toast({
        variant: "error",
        title: "验证失败",
        description: "请输入有效的充值金额",
      });
      return false;
    }

    const amountNum = parseFloat(amount);
    if (amountNum < 10) {
      toast({
        variant: "error",
        title: "验证失败",
        description: "最小充值金额为 $10",
      });
      return false;
    }

    return true;
  };

  // 获取收款地址
  const handleGetReceiveAddress = () => {
    if (!validateForm()) return;
    setShowReceiveAddress(true);
  };

  // 确认充值
  const handleConfirmRecharge = async () => {
    if (!validateForm()) return;
    if (!selectedWallet) return;

    setLoading(true);
    try {
      const result = await createCryptoRechargeOrder({
        amount: amount,
        payment_setting_id: selectedWallet.id,
        user_crypto_address: userWalletAddress,
        remark: `${coinType} 充值`,
      });

      if (isSuccessResponse(result.base_resp) && result.order) {
        // 跳转到成功页面，传递订单信息
        router.push(`/wallet/recharge/success?order_id=${result.order.order_id}`);
      } else {
        toast({
          variant: "error",
          title: "创建订单失败",
          description: result.base_resp.status_msg || "创建充值订单失败",
        });
      }
    } catch (error) {
      toast({
        variant: "error",
        title: "提交失败",
        description: error instanceof Error ? error.message : "网络错误",
      });
    } finally {
      setLoading(false);
    }
  };

  // 打开区块链浏览器
  const handleOpenExplorer = () => {
    if (!selectedWallet) return;
    const network = parseNetworkFromFullName(selectedWallet.network);
    if (!network) return;
    const url = buildExplorerUrl(network as BlockchainNetwork, selectedWallet.address);
    window.open(url, "_blank", "noopener,noreferrer");
  };

  if (loadingWallets) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <span className="ml-3 text-gray-600">加载中...</span>
        </div>
      </div>
    );
  }

  if (availableWallets.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-orange-600 mt-0.5" />
              <div>
                <h3 className="font-medium text-orange-900 mb-1">暂无可用充值方式</h3>
                <p className="text-sm text-orange-800">
                  当前没有可用的充值钱包地址，请联系管理员或稍后再试。
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      {/* 头部 */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">钱包充值</h1>
        <p className="text-sm text-gray-600 mt-1">选择充值方式，安全、快速到账</p>
      </div>

      {/* Tab 切换 */}
      <Tabs defaultValue="crypto" className="space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="crypto" className="gap-2">
            <Wallet className="h-4 w-4" />
            加密货币
          </TabsTrigger>
          <TabsTrigger value="online" className="gap-2">
            <CreditCard className="h-4 w-4" />
            在线支付
          </TabsTrigger>
        </TabsList>

        {/* 加密货币充值 */}
        <TabsContent value="crypto" className="space-y-0">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 左侧：充值表单 */}
            <div className="space-y-5">
              {/* 币种选择 */}
              <div className="space-y-3">
                <div>
                  <h2 className="text-base font-semibold mb-1">选择币种</h2>
                  <p className="text-xs text-gray-600">
                    选择您要充值的稳定币类型
                  </p>
                </div>

                <RadioGroup
                  value={coinType}
                  onValueChange={(value) => setCoinType(value as "USDT" | "USDC")}
                  className="grid grid-cols-2 gap-0 border border-gray-200 overflow-hidden rounded-lg"
                >
                  <Label
                    htmlFor="usdt"
                    className={`h-full cursor-pointer p-3 transition-all border-r border-gray-200 ${
                      coinType === "USDT"
                        ? "bg-gray-900 text-white"
                        : "bg-white hover:bg-gray-50"
                    }`}
                  >
                    <RadioGroupItem value="USDT" id="usdt" className="sr-only" />
                    <div className="text-center">
                      <div className="text-xl mb-1">₮</div>
                      <div className="font-semibold text-sm">USDT</div>
                      <div className="text-xs opacity-70 mt-0.5">Tether USD</div>
                    </div>
                  </Label>

                  <Label
                    htmlFor="usdc"
                    className={`h-full cursor-pointer p-3 transition-all ${
                      coinType === "USDC"
                        ? "bg-gray-900 text-white"
                        : "bg-white hover:bg-gray-50"
                    }`}
                  >
                    <RadioGroupItem value="USDC" id="usdc" className="sr-only" />
                    <div className="text-center">
                      <div className="text-xl mb-1">$</div>
                      <div className="font-semibold text-sm">USDC</div>
                      <div className="text-xs opacity-70 mt-0.5">USD Coin</div>
                    </div>
                  </Label>
                </RadioGroup>
              </div>

              {/* 网络选择 */}
              <div className="space-y-3">
                <div>
                  <h2 className="text-base font-semibold mb-1">选择网络</h2>
                  <p className="text-xs text-gray-600">
                    不同网络手续费和到账时间不同
                  </p>
                </div>

                <div className="space-y-2">
                  <Select value={selectedNetwork} onValueChange={setSelectedNetwork}>
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="选择区块链网络" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableWallets.map((wallet) => {
                        const networkInfo = getNetworkInfo(wallet.network);
                        return (
                          <SelectItem key={wallet.id} value={wallet.network}>
                            <div className="flex items-center gap-2">
                              {networkInfo && (
                                <div
                                  className="w-3 h-3 rounded-full"
                                  style={{ backgroundColor: networkInfo.color }}
                                />
                              )}
                              <span className="font-medium">
                                {networkInfo?.name || wallet.network}
                              </span>
                              {wallet.label && (
                                <span className="text-xs text-gray-500">
                                  ({wallet.label})
                                </span>
                              )}
                              {networkInfo?.estimatedTime && (
                                <span className="text-xs text-gray-500">
                                  - {networkInfo.estimatedTime}
                                </span>
                              )}
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* 充值金额 */}
              <div className="space-y-3">
                <div>
                  <h2 className="text-base font-semibold mb-1">充值金额</h2>
                  <p className="text-xs text-gray-600">最小充值金额为 $10</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="amount" className="text-sm font-medium">
                    金额 (USD)
                  </Label>
                  <Input
                    id="amount"
                    type="number"
                    min="10"
                    step="0.01"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="请输入充值金额"
                    className="h-11 text-lg"
                  />
                </div>

                {/* 快捷金额 */}
                <div className="grid grid-cols-4 gap-2">
                  {[100, 500, 1000, 5000].map((preset) => (
                    <Button
                      key={preset}
                      variant="outline"
                      size="sm"
                      onClick={() => setAmount(preset.toString())}
                      className="h-9"
                    >
                      ${preset}
                    </Button>
                  ))}
                </div>
              </div>

              {/* 您的钱包地址 */}
              <div className="space-y-3">
                <div>
                  <h2 className="text-base font-semibold mb-1">您的钱包地址</h2>
                  <p className="text-xs text-gray-600">
                    输入您将用于转账的钱包地址，方便系统自动验证
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="user-wallet" className="text-sm font-medium">
                    钱包地址
                  </Label>
                  <Input
                    id="user-wallet"
                    value={userWalletAddress}
                    onChange={(e) => setUserWalletAddress(e.target.value)}
                    placeholder="请输入您的钱包地址"
                    className="font-mono text-sm"
                  />
                  <p className="text-xs text-gray-500">
                    请确保地址与选择的网络匹配
                  </p>
                </div>
              </div>

              {/* 操作按钮 */}
              <Button
                onClick={handleGetReceiveAddress}
                disabled={loading}
                className="w-full h-11 bg-blue-600 hover:bg-blue-700"
              >
                获取收款地址
              </Button>
            </div>

            {/* 右侧：收款地址和二维码 */}
            <div className="space-y-5">
              {showReceiveAddress && selectedWallet ? (
                <>
                  {/* 收款信息 */}
                  <Card className="border-blue-200 bg-blue-50">
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                        <div className="flex-1 space-y-1">
                          <h3 className="font-medium text-blue-900 text-sm">重要提示</h3>
                          <ul className="text-xs text-blue-800 space-y-0.5">
                            <li>• 请确认网络选择正确，错误网络可能导致资金丢失</li>
                            <li>• 只发送 {coinType} 到此地址</li>
                            <li>• 最小充值金额为 $10</li>
                            <li>• 充值到账需要区块确认时间</li>
                          </ul>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* 二维码 */}
                  <Card>
                    <CardContent className="p-5">
                      <div className="text-center space-y-4">
                        <div className="flex justify-center">
                          <div className="p-4 bg-white border-4 border-gray-200 rounded-lg">
                            <QRCodeSVG
                              value={selectedWallet.address}
                              size={180}
                              level="H"
                              includeMargin={false}
                            />
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-600 mb-2">
                            扫描二维码或复制地址转账
                          </div>
                          <Badge variant="secondary" className="text-xs">
                            {getNetworkInfo(selectedWallet.network)?.name} 网络
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* 收款地址 */}
                  <Card>
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm font-medium">收款地址</Label>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleOpenExplorer}
                          className="h-7 text-xs"
                        >
                          <ExternalLink className="h-3 w-3 mr-1" />
                          区块链浏览器
                        </Button>
                      </div>

                      <div className="bg-gray-50 rounded-lg p-3">
                        <code className="text-xs font-mono break-all text-gray-900">
                          {selectedWallet.address}
                        </code>
                      </div>

                      <Button
                        variant="outline"
                        onClick={() => handleCopy(selectedWallet.address)}
                        className="w-full"
                      >
                        {copied ? (
                          <>
                            <CheckCircle2 className="h-4 w-4 mr-2 text-green-600" />
                            已复制
                          </>
                        ) : (
                          <>
                            <Copy className="h-4 w-4 mr-2" />
                            复制地址
                          </>
                        )}
                      </Button>
                    </CardContent>
                  </Card>

                  {/* 充值信息汇总 */}
                  <Card>
                    <CardContent className="p-4 space-y-3">
                      <h3 className="font-medium text-sm mb-2">充值信息</h3>
                      
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">币种:</span>
                          <span className="font-medium">{coinType}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">网络:</span>
                          <span className="font-medium">
                            {getNetworkInfo(selectedWallet.network)?.name}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">充值金额:</span>
                          <span className="font-medium text-lg text-blue-600">
                            ${amount}
                          </span>
                        </div>
                        <div className="flex justify-between items-start">
                          <span className="text-gray-600">您的地址:</span>
                          <span className="font-mono text-xs text-right max-w-[180px] break-all">
                            {userWalletAddress || "-"}
                          </span>
                        </div>
                      </div>

                      <div className="pt-3 border-t">
                        <Button
                          onClick={handleConfirmRecharge}
                          disabled={loading}
                          className="w-full bg-green-600 hover:bg-green-700"
                        >
                          {loading ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              创建订单中...
                            </>
                          ) : (
                            <>
                              <Wallet className="h-4 w-4 mr-2" />
                              确认充值
                            </>
                          )}
                        </Button>
                        <p className="text-xs text-gray-500 text-center mt-2">
                          点击后将创建充值订单，然后您可以进行转账操作
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </>
              ) : (
                <Card className="border-gray-200">
                  <CardContent className="p-12 text-center">
                    <Wallet className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                    <p className="text-gray-500 mb-2">请先填写充值信息</p>
                    <p className="text-xs text-gray-400">
                      完成左侧表单后，点击&quot;获取收款地址&quot;查看充值信息
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        {/* 在线支付 */}
        <TabsContent value="online" className="space-y-0">
          <Card className="border-gray-200">
            <CardContent className="p-12 text-center">
              <CreditCard className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                在线支付功能即将开放
              </h3>
              <p className="text-gray-500 mb-4">
                我们正在接入 PayPal、Stripe 等第三方支付平台
              </p>
              <div className="max-w-md mx-auto space-y-3">
                <div className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg bg-gray-50">
                  <div className="text-2xl">🔵</div>
                  <div className="flex-1 text-left">
                    <div className="font-medium text-sm">PayPal</div>
                    <div className="text-xs text-gray-600">支持信用卡、借记卡</div>
                  </div>
                  <Badge variant="secondary" className="text-xs">即将开放</Badge>
                </div>
                <div className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg bg-gray-50">
                  <div className="text-2xl">💳</div>
                  <div className="flex-1 text-left">
                    <div className="font-medium text-sm">Stripe</div>
                    <div className="text-xs text-gray-600">全球主流信用卡</div>
                  </div>
                  <Badge variant="secondary" className="text-xs">即将开放</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
