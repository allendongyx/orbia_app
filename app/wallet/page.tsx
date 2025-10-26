"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Wallet as WalletIcon,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  DollarSign,
  CreditCard,
  Activity,
  Clock,
  CheckCircle2,
  AlertCircle,
  Download,
  Filter,
  Loader2,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { TransactionDetailModal } from "@/components/wallet/transaction-detail-modal";
import {
  getWalletInfo,
  getTransactionList,
  getMyRechargeOrders,
  formatAmount,
  getTransactionTypeText,
  getTransactionStatusText,
  mapTransactionStatus,
  getPaymentMethodText,
  getRechargeOrderStatusText,
  mapRechargeOrderStatus,
  type WalletInfo,
  type Transaction,
  type RechargeOrder,
} from "@/lib/api/wallet";

interface DailySpending {
  date: string;
  amount: number;
  ads: number;
  kol: number;
}

const COLORS = {
  ads: "#3b82f6", // blue
  kol: "#8b5cf6", // purple
  primary: "#6366f1",
  success: "#10b981",
  warning: "#f59e0b",
};

export default function Wallet() {
  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "90d">("7d");
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [walletInfo, setWalletInfo] = useState<WalletInfo | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [rechargeOrders, setRechargeOrders] = useState<RechargeOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [transactionsLoading, setTransactionsLoading] = useState(true);
  const [rechargeOrdersLoading, setRechargeOrdersLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [rechargeCurrentPage, setRechargeCurrentPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [rechargeTotal, setRechargeTotal] = useState(0);
  const pageSize = 10;

  // Mock data for charts - will be replaced with real data in future
  const dailySpending: DailySpending[] = [
    { date: '10-20', amount: 12500, ads: 8000, kol: 4500 },
    { date: '10-21', amount: 15000, ads: 9500, kol: 5500 },
    { date: '10-22', amount: 11000, ads: 7000, kol: 4000 },
    { date: '10-23', amount: 18000, ads: 11000, kol: 7000 },
    { date: '10-24', amount: 14500, ads: 9000, kol: 5500 },
    { date: '10-25', amount: 16000, ads: 10000, kol: 6000 },
    { date: '10-26', amount: 13500, ads: 8500, kol: 5000 },
  ];

  // 加载钱包信息
  useEffect(() => {
    loadWalletInfo();
  }, []);

  // 加载交易记录（消费账单）
  useEffect(() => {
    loadTransactions();
  }, [currentPage]);

  // 加载充值订单
  useEffect(() => {
    loadRechargeOrders();
  }, [rechargeCurrentPage]);

  const loadWalletInfo = async () => {
    try {
      setLoading(true);
      const response = await getWalletInfo();
      if (response.wallet) {
        setWalletInfo(response.wallet);
      }
    } catch (error) {
      console.error('Failed to load wallet info:', error);
      toast({
        title: "加载失败",
        description: error instanceof Error ? error.message : "获取钱包信息失败",
        variant: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadTransactions = async (type?: string, status?: string) => {
    try {
      setTransactionsLoading(true);
      const response = await getTransactionList({
        type: type || 'consume', // 默认只加载消费类型
        status,
        page: currentPage,
        page_size: pageSize,
      });
      setTransactions(response.transactions || []);
      setTotal(response.total || 0);
    } catch (error) {
      console.error('Failed to load transactions:', error);
      toast({
        title: "加载失败",
        description: error instanceof Error ? error.message : "获取交易记录失败",
        variant: "error",
      });
    } finally {
      setTransactionsLoading(false);
    }
  };

  const loadRechargeOrders = async (status?: string) => {
    try {
      setRechargeOrdersLoading(true);
      const response = await getMyRechargeOrders({
        status: status as any,
        page: rechargeCurrentPage,
        page_size: pageSize,
      });
      setRechargeOrders(response.orders || []);
      setRechargeTotal(response.total || 0);
    } catch (error) {
      console.error('Failed to load recharge orders:', error);
      toast({
        title: "加载失败",
        description: error instanceof Error ? error.message : "获取充值记录失败",
        variant: "error",
      });
    } finally {
      setRechargeOrdersLoading(false);
    }
  };

  // 计算统计数据
  const currentBalance = walletInfo ? parseFloat(walletInfo.balance) : 0;
  const totalRecharge = walletInfo ? parseFloat(walletInfo.total_recharge) : 0;
  const totalSpending = walletInfo ? parseFloat(walletInfo.total_consume) : 0;
  
  // 今日消费（从交易记录中计算）
  const today = new Date().toISOString().split('T')[0];
  const todaySpending = transactions
    .filter((t) => t.type === 'CONSUME' && t.created_at?.startsWith(today))
    .reduce((sum, t) => sum + parseFloat(t.amount || '0'), 0);

  // 计算分类消费（从交易记录中统计 - 需要后端提供分类信息）
  const categorySpending = [
    {
      name: "广告投放",
      value: totalSpending * 0.6, // 临时估算
      color: COLORS.ads,
    },
    {
      name: "KOL营销",
      value: totalSpending * 0.4, // 临时估算
      color: COLORS.kol,
    },
  ];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(value);
  };

  const handleViewTransaction = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setIsDetailModalOpen(true);
  };

  const handleExportTransactions = () => {
    toast({
      title: "导出中",
      description: "正在导出交易记录...",
    });
  };

  const handleTabChange = (value: string) => {
    if (value === 'expense') {
      setCurrentPage(1);
      loadTransactions('consume');
    } else if (value === 'recharge') {
      setRechargeCurrentPage(1);
      loadRechargeOrders();
    }
  };

  const getRechargeOrderStatusBadge = (status: string) => {
    const mappedStatus = mapRechargeOrderStatus(status);
    const statusText = getRechargeOrderStatusText(status);
    
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

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 border rounded-lg shadow-lg p-3">
          <p className="font-medium mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {formatCurrency(entry.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 顶部余额卡片 */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-white/20 rounded-lg">
                <WalletIcon className="h-6 w-6" />
              </div>
              <Link href="/wallet/recharge">
                <Button
                  size="sm"
                  className="bg-white text-blue-600 hover:bg-white/90"
                >
                  <ArrowUpRight className="mr-1 h-4 w-4" />
                  充值
                </Button>
              </Link>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-blue-100">当前余额</p>
              <p className="text-3xl font-bold">{formatCurrency(currentBalance)}</p>
              {walletInfo && parseFloat(walletInfo.frozen_balance) > 0 && (
                <p className="text-xs text-blue-100">
                  冻结: {formatCurrency(parseFloat(walletInfo.frozen_balance))}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-orange-500/10 rounded-lg">
                <Activity className="h-6 w-6 text-orange-600" />
              </div>
              <TrendingUp className="h-5 w-5 text-orange-600" />
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">今日消费</p>
              <p className="text-2xl font-bold">{formatCurrency(todaySpending)}</p>
              <p className="text-xs text-orange-600">较昨日 +12.5%</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-purple-500/10 rounded-lg">
                <TrendingDown className="h-6 w-6 text-purple-600" />
              </div>
              <DollarSign className="h-5 w-5 text-purple-600" />
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">总消费</p>
              <p className="text-2xl font-bold">{formatCurrency(totalSpending)}</p>
              <p className="text-xs text-muted-foreground">过去7天</p>
          </div>
        </CardContent>
      </Card>

      <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-green-500/10 rounded-lg">
                <CreditCard className="h-6 w-6 text-green-600" />
              </div>
              <TrendingUp className="h-5 w-5 text-green-600" />
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">总充值</p>
              <p className="text-2xl font-bold">{formatCurrency(totalRecharge)}</p>
              <p className="text-xs text-muted-foreground">累计充值金额</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 图表区域 */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* 每日消费趋势图 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>消费趋势</span>
              <div className="flex gap-2">
                <Button
                  variant={timeRange === "7d" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setTimeRange("7d")}
                >
                  7天
                </Button>
                <Button
                  variant={timeRange === "30d" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setTimeRange("30d")}
                >
                  30天
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dailySpending}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="date" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar dataKey="ads" name="广告投放" fill={COLORS.ads} radius={[8, 8, 0, 0]} />
                <Bar dataKey="kol" name="KOL营销" fill={COLORS.kol} radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* 消费分类饼图 */}
        <Card>
          <CardHeader>
            <CardTitle>消费分类</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categorySpending}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(props: any) =>
                    `${props.name} ${(props.percent * 100).toFixed(0)}%`
                  }
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categorySpending.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) => formatCurrency(value)}
                  contentStyle={{
                    backgroundColor: "hsl(var(--background))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-2">
              {categorySpending.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-sm">{item.name}</span>
                  </div>
                  <span className="text-sm font-medium">
                    {formatCurrency(item.value)}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 交易记录 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>交易记录</CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Filter className="mr-2 h-4 w-4" />
                筛选
              </Button>
              <Button variant="outline" size="sm" onClick={handleExportTransactions}>
                <Download className="mr-2 h-4 w-4" />
                导出
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="expense" className="w-full" onValueChange={handleTabChange}>
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="expense">消费账单</TabsTrigger>
              <TabsTrigger value="recharge">充值记录</TabsTrigger>
            </TabsList>

            {/* 消费记录 */}
            <TabsContent value="expense" className="mt-6">
              {transactionsLoading ? (
                <div className="flex items-center justify-center h-48">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>交易ID</TableHead>
                        <TableHead>类型</TableHead>
                        <TableHead>金额</TableHead>
                        <TableHead>余额变化</TableHead>
                        <TableHead>状态</TableHead>
                        <TableHead>时间</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {transactions.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                            暂无消费记录
                          </TableCell>
                        </TableRow>
                      ) : (
                        transactions.map((record) => (
                          <TableRow 
                            key={record.id}
                            className="cursor-pointer hover:bg-muted/50"
                            onClick={() => handleViewTransaction(record)}
                          >
                            <TableCell className="font-mono text-sm">
                              {record.transaction_id}
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">{getTransactionTypeText(record.type)}</Badge>
                            </TableCell>
                            <TableCell className="font-mono">
                              <span className="text-red-600">
                                -{formatAmount(record.amount)}
                              </span>
                            </TableCell>
                            <TableCell className="font-mono text-xs text-muted-foreground">
                              {formatAmount(record.balance_before)} → {formatAmount(record.balance_after)}
                            </TableCell>
                            <TableCell>{getStatusBadge(record.status)}</TableCell>
                            <TableCell className="text-muted-foreground text-sm">
                              {new Date(record.created_at).toLocaleString('zh-CN')}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}
            </TabsContent>

            {/* 充值记录 */}
            <TabsContent value="recharge" className="mt-6">
              {rechargeOrdersLoading ? (
                <div className="flex items-center justify-center h-48">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>订单号</TableHead>
                        <TableHead>时间</TableHead>
                        <TableHead>金额</TableHead>
                        <TableHead>支付方式</TableHead>
                        <TableHead>状态</TableHead>
                        <TableHead>收款地址/交易哈希</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {rechargeOrders.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                            暂无充值记录
                          </TableCell>
                        </TableRow>
                      ) : (
                        rechargeOrders.map((order) => (
                          <TableRow 
                            key={order.id}
                            className="cursor-pointer hover:bg-muted/50"
                          >
                            <TableCell className="font-mono text-sm">
                              {order.order_id}
                            </TableCell>
                            <TableCell className="text-muted-foreground text-sm">
                              {new Date(order.created_at).toLocaleString('zh-CN')}
                            </TableCell>
                            <TableCell className="font-mono">
                              <span className="text-green-600">
                                +{formatAmount(order.amount)}
                              </span>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">
                                {order.payment_type === 'crypto' 
                                  ? order.payment_network || '加密货币' 
                                  : order.online_payment_platform || '在线支付'}
                              </Badge>
                            </TableCell>
                            <TableCell>{getRechargeOrderStatusBadge(order.status)}</TableCell>
                            <TableCell className="font-mono text-xs text-muted-foreground max-w-[200px] truncate">
                              {order.payment_type === 'crypto' 
                                ? (order.crypto_tx_hash || order.payment_address || '-')
                                : (order.online_payment_order_id || '-')}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}
            </TabsContent>

          </Tabs>
        </CardContent>
      </Card>

      {/* 交易详情模态框 */}
      <TransactionDetailModal
        transaction={selectedTransaction}
        open={isDetailModalOpen}
        onOpenChange={setIsDetailModalOpen}
      />
    </div>
  );
}
