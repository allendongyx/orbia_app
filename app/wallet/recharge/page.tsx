"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Wallet,
  CreditCard,
  Copy,
  CheckCircle2,
  AlertCircle,
  Bitcoin,
  DollarSign,
  ExternalLink,
  QrCode,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

const cryptoOptions = [
  {
    value: "usdt-trc20",
    label: "USDT (TRC20)",
    network: "Tron",
    icon: "₮",
    fee: "0 USDT",
  },
  {
    value: "usdt-erc20",
    label: "USDT (ERC20)",
    network: "Ethereum",
    icon: "₮",
    fee: "~5-15 USDT",
  },
  {
    value: "usdc-erc20",
    label: "USDC (ERC20)",
    network: "Ethereum",
    icon: "$",
    fee: "~5-15 USDC",
  },
  {
    value: "usdc-trc20",
    label: "USDC (TRC20)",
    network: "Tron",
    icon: "$",
    fee: "0 USDC",
  },
  {
    value: "usdc-polygon",
    label: "USDC (Polygon)",
    network: "Polygon",
    icon: "$",
    fee: "~0.01 USDC",
  },
];

const thirdPartyOptions = [
  {
    value: "paypal",
    label: "PayPal",
    description: "支持信用卡、借记卡和PayPal余额",
    fee: "3.5%",
    icon: "🔵",
  },
  {
    value: "stripe",
    label: "Stripe",
    description: "支持全球主流信用卡和借记卡",
    fee: "2.9% + $0.30",
    icon: "💳",
  },
  {
    value: "coinbase",
    label: "Coinbase Commerce",
    description: "支持多种加密货币支付",
    fee: "1%",
    icon: "🔷",
  },
  {
    value: "moonpay",
    label: "MoonPay",
    description: "信用卡购买加密货币",
    fee: "3.5-4.5%",
    icon: "🌙",
  },
];

export default function Recharge() {
  const router = useRouter();
  const [selectedCrypto, setSelectedCrypto] = useState("usdt-trc20");
  const [selectedThirdParty, setSelectedThirdParty] = useState("paypal");
  const [amount, setAmount] = useState("");
  const [cryptoAmount, setCryptoAmount] = useState("");
  const [copied, setCopied] = useState(false);
  const [paymentCreated, setPaymentCreated] = useState(false);

  // 模拟的收款地址
  const walletAddress = "TQn9Y2khEsLJW1ChVWFMSMeRDow5KcbLSE";
  const paymentId = "PAY-" + Math.random().toString(36).substr(2, 9).toUpperCase();

  const handleCopy = () => {
    navigator.clipboard.writeText(walletAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCryptoPayment = () => {
    setPaymentCreated(true);
  };

  const handleThirdPartyPayment = () => {
    // 模拟跳转到第三方支付平台
    alert(`正在跳转到 ${thirdPartyOptions.find((o) => o.value === selectedThirdParty)?.label} 支付页面...`);
  };

  const selectedCryptoOption = cryptoOptions.find(
    (o) => o.value === selectedCrypto
  );

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* 页面头部 */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">充值钱包</h1>
          <p className="text-muted-foreground mt-1">
            选择合适的支付方式为您的账户充值
          </p>
        </div>
      </div>

      {/* 当前余额卡片 */}
      <Card className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white border-0">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-indigo-100 mb-1">当前余额</p>
              <p className="text-3xl font-bold">$148,000.00</p>
            </div>
            <div className="p-3 bg-white/20 rounded-full">
              <Wallet className="h-8 w-8" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 充值方式选择 */}
      <Tabs defaultValue="crypto" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="crypto" className="gap-2">
            <Bitcoin className="h-4 w-4" />
            加密货币支付
          </TabsTrigger>
          <TabsTrigger value="thirdparty" className="gap-2">
            <CreditCard className="h-4 w-4" />
            在线支付
          </TabsTrigger>
        </TabsList>

        {/* 加密货币支付 */}
        <TabsContent value="crypto" className="mt-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* 左侧：输入表单 */}
            <Card>
              <CardHeader>
                <CardTitle>加密货币转账支付</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="crypto-currency">选择币种和网络</Label>
                  <Select
                    value={selectedCrypto}
                    onValueChange={setSelectedCrypto}
                  >
                    <SelectTrigger id="crypto-currency">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {cryptoOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          <div className="flex items-center justify-between w-full">
                            <span>
                              {option.icon} {option.label}
                            </span>
                            <Badge variant="outline" className="ml-2">
                              {option.network}
                            </Badge>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {selectedCryptoOption && (
                    <p className="text-xs text-muted-foreground">
                      网络手续费: {selectedCryptoOption.fee}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="crypto-amount">充值金额 (USD)</Label>
                  <Input
                    id="crypto-amount"
                    type="number"
                    placeholder="1000.00"
                    value={cryptoAmount}
                    onChange={(e) => setCryptoAmount(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    最小充值金额: $100.00
                  </p>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => setCryptoAmount("1000")}
                  >
                    $1,000
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => setCryptoAmount("5000")}
                  >
                    $5,000
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => setCryptoAmount("10000")}
                  >
                    $10,000
                  </Button>
                </div>

                <Separator />

                <Button
                  className="w-full"
                  size="lg"
                  onClick={handleCryptoPayment}
                  disabled={!cryptoAmount || parseFloat(cryptoAmount) < 100}
                >
                  生成收款地址
                </Button>
              </CardContent>
            </Card>

            {/* 右侧：支付信息 */}
            <Card>
              <CardHeader>
                <CardTitle>支付信息</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {!paymentCreated ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <QrCode className="h-16 w-16 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">
                      请先选择币种并输入充值金额
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="space-y-2">
                      <Label>支付ID</Label>
                      <div className="flex gap-2">
                        <Input value={paymentId} readOnly className="font-mono" />
                        <Button variant="outline" size="icon" onClick={handleCopy}>
                          {copied ? (
                            <CheckCircle2 className="h-4 w-4" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>收款地址</Label>
                      <div className="flex gap-2">
                        <Input
                          value={walletAddress}
                          readOnly
                          className="font-mono text-sm"
                        />
                        <Button variant="outline" size="icon" onClick={handleCopy}>
                          {copied ? (
                            <CheckCircle2 className="h-4 w-4" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>网络</Label>
                      <Input
                        value={selectedCryptoOption?.network}
                        readOnly
                        className="bg-muted"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>充值金额</Label>
                      <Input
                        value={`$${cryptoAmount}`}
                        readOnly
                        className="bg-muted font-semibold text-lg"
                      />
                    </div>

                    <Separator />

                    <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4 space-y-2">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                        <div className="space-y-1 text-sm">
                          <p className="font-medium text-blue-900 dark:text-blue-100">
                            重要提示
                          </p>
                          <ul className="text-blue-700 dark:text-blue-300 space-y-1 ml-4 list-disc">
                            <li>请务必使用正确的网络进行转账</li>
                            <li>转账完成后，请保存交易哈希</li>
                            <li>资金将在1-3个区块确认后到账</li>
                            <li>如有问题，请联系客服并提供支付ID</li>
                          </ul>
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 space-y-2">
                      <div className="flex items-center justify-center gap-2 text-sm text-green-600">
                        <CheckCircle2 className="h-4 w-4" />
                        <span>收款地址已生成，等待支付</span>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* 第三方支付 */}
        <TabsContent value="thirdparty" className="mt-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* 左侧：支付方式选择 */}
            <Card>
              <CardHeader>
                <CardTitle>选择支付方式</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {thirdPartyOptions.map((option) => (
                  <div
                    key={option.value}
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      selectedThirdParty === option.value
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    }`}
                    onClick={() => setSelectedThirdParty(option.value)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex gap-3">
                        <div className="text-2xl">{option.icon}</div>
                        <div>
                          <p className="font-semibold">{option.label}</p>
                          <p className="text-sm text-muted-foreground mt-1">
                            {option.description}
                          </p>
                          <p className="text-xs text-muted-foreground mt-2">
                            手续费: {option.fee}
                          </p>
                        </div>
                      </div>
                      {selectedThirdParty === option.value && (
                        <CheckCircle2 className="h-5 w-5 text-primary" />
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* 右侧：金额输入 */}
            <Card>
              <CardHeader>
                <CardTitle>充值金额</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="amount">输入金额 (USD)</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                    <Input
                      id="amount"
                      type="number"
                      placeholder="1000.00"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="pl-10 text-lg"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    最小充值金额: $50.00
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setAmount("500")}
                  >
                    $500
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setAmount("1000")}
                  >
                    $1,000
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setAmount("2000")}
                  >
                    $2,000
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setAmount("5000")}
                  >
                    $5,000
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setAmount("10000")}
                  >
                    $10,000
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setAmount("20000")}
                  >
                    $20,000
                  </Button>
                </div>

                <Separator />

                {amount && parseFloat(amount) >= 50 && (
                  <div className="space-y-3 p-4 bg-muted rounded-lg">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">充值金额</span>
                      <span className="font-medium">${parseFloat(amount).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">手续费</span>
                      <span className="font-medium">
                        {thirdPartyOptions.find(
                          (o) => o.value === selectedThirdParty
                        )?.fee}
                      </span>
                    </div>
                    <Separator />
                    <div className="flex justify-between">
                      <span className="font-semibold">预计到账</span>
                      <span className="font-bold text-lg">
                        ${parseFloat(amount).toFixed(2)}
                      </span>
                    </div>
                  </div>
                )}

                <Button
                  className="w-full"
                  size="lg"
                  onClick={handleThirdPartyPayment}
                  disabled={!amount || parseFloat(amount) < 50}
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  前往支付
                </Button>

                <div className="bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
                    <div className="space-y-1 text-sm">
                      <p className="font-medium text-amber-900 dark:text-amber-100">
                        注意事项
                      </p>
                      <ul className="text-amber-700 dark:text-amber-300 space-y-1 ml-4 list-disc">
                        <li>支付将跳转到第三方支付平台</li>
                        <li>资金通常在5-15分钟内到账</li>
                        <li>请确保支付信息准确无误</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* 支付说明 */}
      <Card>
        <CardHeader>
          <CardTitle>充值说明</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <h4 className="font-semibold flex items-center gap-2">
                <Bitcoin className="h-5 w-5 text-orange-500" />
                加密货币支付
              </h4>
              <ul className="text-sm text-muted-foreground space-y-1 ml-7">
                <li>• 支持USDT、USDC等主流稳定币</li>
                <li>• 多链支持：Ethereum、Tron、Polygon等</li>
                <li>• 转账完成后1-3个区块确认到账</li>
                <li>• 最低充值金额$100</li>
              </ul>
            </div>

            <div className="space-y-2">
              <h4 className="font-semibold flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-blue-500" />
                在线支付
              </h4>
              <ul className="text-sm text-muted-foreground space-y-1 ml-7">
                <li>• 支持PayPal、信用卡、借记卡</li>
                <li>• 即时到账，无需等待确认</li>
                <li>• 安全可靠，由第三方平台保障</li>
                <li>• 最低充值金额$50</li>
              </ul>
            </div>
          </div>

          <Separator />

          <div className="space-y-2">
            <h4 className="font-semibold">常见问题</h4>
            <div className="space-y-3 text-sm">
              <div>
                <p className="font-medium mb-1">Q: 充值多久能到账？</p>
                <p className="text-muted-foreground">
                  加密货币支付通常需要1-3个区块确认，约5-30分钟；在线支付即时到账。
                </p>
              </div>
              <div>
                <p className="font-medium mb-1">Q: 转账失败了怎么办？</p>
                <p className="text-muted-foreground">
                  请保存好交易哈希或支付凭证，联系客服为您处理。
                </p>
              </div>
              <div>
                <p className="font-medium mb-1">Q: 是否有充值优惠？</p>
                <p className="text-muted-foreground">
                  首次充值可享受5%奖励，充值满$10,000可享受额外优惠。
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
