"use client";

import React, { useState, useEffect, useCallback } from "react";
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
import { TruncatedText } from "@/components/ui/truncated-text";
import {
  getWalletInfo,
  getTransactionList,
  getMyRechargeOrders,
  formatAmount,
  getTransactionTypeText,
  getTransactionStatusText,
  mapTransactionStatus,
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

interface CategorySpending {
  name: string;
  value: number;
  percentage: number;
}

export default function Wallet() {
  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "90d">("7d");
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [walletInfo, setWalletInfo] = useState<WalletInfo | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [allTransactions, setAllTransactions] = useState<Transaction[]>([]); // 存储所有交易用于图表
  const [rechargeOrders, setRechargeOrders] = useState<RechargeOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [transactionsLoading, setTransactionsLoading] = useState(true);
  const [chartDataLoading, setChartDataLoading] = useState(true);
  const [rechargeOrdersLoading, setRechargeOrdersLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [rechargeCurrentPage, setRechargeCurrentPage] = useState(1);
  const pageSize = 10;

  const loadWalletInfo = useCallback(async () => {
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
  }, []);

  const loadTransactions = useCallback(async (type?: string, status?: string) => {
    try {
      setTransactionsLoading(true);
      const response = await getTransactionList({
        type: type || 'consume', // 默认只加载消费类型
        status,
        page: currentPage,
        page_size: pageSize,
      });
      setTransactions(response.transactions || []);
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
  }, [currentPage, pageSize]);

  const loadRechargeOrders = useCallback(async (status?: 'pending' | 'confirmed' | 'failed' | 'cancelled') => {
    try {
      setRechargeOrdersLoading(true);
      const response = await getMyRechargeOrders({
        status: status,
        page: rechargeCurrentPage,
        page_size: pageSize,
      });
      setRechargeOrders(response.orders || []);
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
  }, [rechargeCurrentPage, pageSize]);

  // 加载图表数据
  const loadChartData = useCallback(async () => {
    try {
      setChartDataLoading(true);
      // 根据时间范围获取足够多的消费记录
      const chartPageSize = timeRange === '7d' ? 100 : timeRange === '30d' ? 300 : 1000;
      const response = await getTransactionList({
        type: 'consume',
        status: 'COMPLETED', // 只统计已完成的交易
        page: 1,
        page_size: chartPageSize,
      });
      setAllTransactions(response.transactions || []);
    } catch (error) {
      console.error('Failed to load chart data:', error);
      // 不显示错误提示，只是不展示图表
    } finally {
      setChartDataLoading(false);
    }
  }, [timeRange]);

  // 加载钱包信息
  useEffect(() => {
    loadWalletInfo();
  }, [loadWalletInfo]);

  // 加载交易记录（消费账单）
  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  // 加载充值订单
  useEffect(() => {
    loadRechargeOrders();
  }, [loadRechargeOrders]);

  // 加载图表数据（根据时间范围加载所有消费记录）
  useEffect(() => {
    loadChartData();
  }, [loadChartData]);

  // 计算统计数据
  const currentBalance = walletInfo ? parseFloat(walletInfo.balance) : 0;
  const totalRecharge = walletInfo ? parseFloat(walletInfo.total_recharge) : 0;
  const totalSpending = walletInfo ? parseFloat(walletInfo.total_consume) : 0;
  
  // 今日消费（从所有交易记录中计算）
  const today = new Date().toISOString().split('T')[0];
  const todaySpending = allTransactions
    .filter((t) => t.status === 'COMPLETED' && t.created_at?.startsWith(today))
    .reduce((sum, t) => sum + parseFloat(t.amount || '0'), 0);

  // 根据时间范围生成每日消费数据
  const getDaysCount = () => {
    switch (timeRange) {
      case '7d': return 7;
      case '30d': return 30;
      case '90d': return 90;
      default: return 7;
    }
  };

  const generateDailySpending = (): DailySpending[] => {
    const days = getDaysCount();
    const now = new Date();
    const dailyData: Map<string, DailySpending> = new Map();

    // 初始化所有日期为0
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateStr = `${date.getMonth() + 1}-${date.getDate()}`;
      dailyData.set(dateStr, {
        date: dateStr,
        amount: 0,
        ads: 0,
        kol: 0,
      });
    }

    // 统计实际消费数据
    allTransactions
      .filter(t => t.status === 'COMPLETED')
      .forEach(transaction => {
        const transactionDate = new Date(transaction.created_at);
        const daysDiff = Math.floor((now.getTime() - transactionDate.getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysDiff >= 0 && daysDiff < days) {
          const dateStr = `${transactionDate.getMonth() + 1}-${transactionDate.getDate()}`;
          const existing = dailyData.get(dateStr);
          if (existing) {
            const amount = parseFloat(transaction.amount || '0');
            existing.amount += amount;
            
            // 根据 remark 或 related_order_id 判断类型（需要后端提供分类字段）
            // 暂时平均分配，后续可以根据实际业务逻辑调整
            const remark = transaction.remark?.toLowerCase() || '';
            if (remark.includes('ad') || remark.includes('广告')) {
              existing.ads += amount;
            } else if (remark.includes('kol')) {
              existing.kol += amount;
            } else {
              // 如果没有明确标识，平均分配
              existing.ads += amount * 0.6;
              existing.kol += amount * 0.4;
            }
          }
        }
      });

    return Array.from(dailyData.values());
  };

  const dailySpending = generateDailySpending();

  // 计算分类消费（从交易记录中统计）
  const generateCategorySpending = (): CategorySpending[] => {
    let adsTotal = 0;
    let kolTotal = 0;

    allTransactions
      .filter(t => t.status === 'COMPLETED')
      .forEach(transaction => {
        const amount = parseFloat(transaction.amount || '0');
        const remark = transaction.remark?.toLowerCase() || '';
        
        if (remark.includes('ad') || remark.includes('广告')) {
          adsTotal += amount;
        } else if (remark.includes('kol')) {
          kolTotal += amount;
        } else {
          // 如果没有明确标识，平均分配
          adsTotal += amount * 0.6;
          kolTotal += amount * 0.4;
        }
      });

    const total = adsTotal + kolTotal;
    
    return [
      {
        name: "广告投放",
        value: adsTotal,
        percentage: total > 0 ? (adsTotal / total) * 100 : 0,
      },
      {
        name: "KOL营销",
        value: kolTotal,
        percentage: total > 0 ? (kolTotal / total) * 100 : 0,
      },
    ];
  };

  const categorySpending = generateCategorySpending();
  const hasChartData = allTransactions.length > 0;

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

  interface TooltipPayload {
    name: string;
    value: number;
    color: string;
  }

  interface CustomTooltipProps {
    active?: boolean;
    payload?: TooltipPayload[];
    label?: string;
  }

  const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-3">
          <p className="text-xs font-medium text-gray-900 mb-2">{label}</p>
          {payload.map((entry, index: number) => (
            <p key={index} className="text-xs text-gray-600">
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
      {/* 顶部余额和统计卡片 */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {/* 当前余额卡片 - 更突出 */}
        <Card className="md:col-span-2 lg:col-span-1">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <WalletIcon className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">当前余额</p>
              <p className="text-3xl font-bold">{formatCurrency(currentBalance)}</p>
              {walletInfo && parseFloat(walletInfo.frozen_balance) > 0 && (
                <p className="text-xs text-muted-foreground">
                  冻结: {formatCurrency(parseFloat(walletInfo.frozen_balance))}
                </p>
              )}
              <Link href="/wallet/recharge" className="block">
                <Button
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  size="lg"
                >
                  <ArrowUpRight className="mr-2 h-5 w-5" />
                  立即充值
                </Button>
              </Link>
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
              <p className="text-xs text-muted-foreground">基于实际消费账单</p>
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
                <div className="overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-b">
                        <TableHead className="font-medium">交易ID</TableHead>
                        <TableHead className="font-medium">类型</TableHead>
                        <TableHead className="font-medium">金额</TableHead>
                        <TableHead className="font-medium">余额变化</TableHead>
                        <TableHead className="font-medium">状态</TableHead>
                        <TableHead className="font-medium">时间</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {transactions.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center text-muted-foreground py-12">
                            暂无消费记录
                          </TableCell>
                        </TableRow>
                      ) : (
                        transactions.map((record) => (
                          <TableRow 
                            key={record.id}
                            className="cursor-pointer hover:bg-muted/30 transition-colors border-b last:border-0"
                            onClick={() => handleViewTransaction(record)}
                          >
                            <TableCell className="font-mono text-sm py-4">
                              {record.transaction_id}
                            </TableCell>
                            <TableCell className="py-4">
                              <Badge variant="outline" className="font-normal">
                                {getTransactionTypeText(record.type)}
                              </Badge>
                            </TableCell>
                            <TableCell className="font-mono font-medium py-4">
                              <span className="text-red-600">
                                -{formatAmount(record.amount)}
                              </span>
                            </TableCell>
                            <TableCell className="font-mono text-xs text-muted-foreground py-4">
                              {formatAmount(record.balance_before)} → {formatAmount(record.balance_after)}
                            </TableCell>
                            <TableCell className="py-4">{getStatusBadge(record.status)}</TableCell>
                            <TableCell className="text-muted-foreground text-sm py-4">
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
                <div className="overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-b">
                        <TableHead className="font-medium">订单号</TableHead>
                        <TableHead className="font-medium">时间</TableHead>
                        <TableHead className="font-medium">金额</TableHead>
                        <TableHead className="font-medium">支付方式</TableHead>
                        <TableHead className="font-medium">状态</TableHead>
                        <TableHead className="font-medium">收款地址</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {rechargeOrders.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center text-muted-foreground py-12">
                            暂无充值记录
                          </TableCell>
                        </TableRow>
                      ) : (
                        rechargeOrders.map((order) => (
                          <TableRow 
                            key={order.id}
                            className="hover:bg-muted/30 transition-colors border-b last:border-0"
                          >
                            <TableCell className="py-4">
                              <TruncatedText 
                                text={order.order_id} 
                                maxLength={16}
                                className="font-mono text-sm"
                              />
                            </TableCell>
                            <TableCell className="text-muted-foreground text-sm py-4">
                              {new Date(order.created_at).toLocaleString('zh-CN')}
                            </TableCell>
                            <TableCell className="font-mono font-medium py-4">
                              <span className="text-green-600">
                                +{formatAmount(order.amount)}
                              </span>
                            </TableCell>
                            <TableCell className="py-4">
                              <Badge variant="outline" className="font-normal">
                                {order.payment_type === 'crypto' 
                                  ? order.payment_network || '加密货币' 
                                  : order.online_payment_platform || '在线支付'}
                              </Badge>
                            </TableCell>
                            <TableCell className="py-4">{getRechargeOrderStatusBadge(order.status)}</TableCell>
                            <TableCell className="py-4">
                              {order.payment_type === 'crypto' ? (
                                <TruncatedText 
                                  text={order.payment_address || '-'} 
                                  maxLength={20}
                                  className="text-muted-foreground text-sm"
                                />
                              ) : (
                                <TruncatedText 
                                  text={order.online_payment_order_id || '-'} 
                                  maxLength={20}
                                  className="text-muted-foreground text-sm"
                                />
                              )}
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

      {/* 图表区域 - 移到交易记录下方 */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* 每日消费趋势图 */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold">消费趋势</CardTitle>
              <div className="flex gap-1">
                <Button
                  variant={timeRange === "7d" ? "default" : "ghost"}
                  size="sm"
                  className={timeRange === "7d" ? "h-7 px-2 text-xs bg-black text-white hover:bg-gray-800" : "h-7 px-2 text-xs text-gray-600 hover:bg-gray-100"}
                  onClick={() => setTimeRange("7d")}
                >
                  7天
                </Button>
                <Button
                  variant={timeRange === "30d" ? "default" : "ghost"}
                  size="sm"
                  className={timeRange === "30d" ? "h-7 px-2 text-xs bg-black text-white hover:bg-gray-800" : "h-7 px-2 text-xs text-gray-600 hover:bg-gray-100"}
                  onClick={() => setTimeRange("30d")}
                >
                  30天
                </Button>
                <Button
                  variant={timeRange === "90d" ? "default" : "ghost"}
                  size="sm"
                  className={timeRange === "90d" ? "h-7 px-2 text-xs bg-black text-white hover:bg-gray-800" : "h-7 px-2 text-xs text-gray-600 hover:bg-gray-100"}
                  onClick={() => setTimeRange("90d")}
                >
                  90天
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {chartDataLoading ? (
              <div className="flex items-center justify-center h-[280px]">
                <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
              </div>
            ) : !hasChartData ? (
              <div className="flex flex-col items-center justify-center h-[280px] text-center">
                <Activity className="h-8 w-8 text-gray-300 mb-2" />
                <p className="text-sm font-medium text-gray-900 mb-1">暂无消费数据</p>
                <p className="text-xs text-gray-500">开始投放广告或与KOL合作后，消费趋势将显示在这里</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={dailySpending} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 11, fill: '#6B7280' }}
                    axisLine={{ stroke: '#E5E7EB' }}
                    tickLine={{ stroke: '#E5E7EB' }}
                  />
                  <YAxis 
                    tick={{ fontSize: 11, fill: '#6B7280' }}
                    axisLine={{ stroke: '#E5E7EB' }}
                    tickLine={{ stroke: '#E5E7EB' }}
                    tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                  />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: '#F9FAFB' }} />
                  <Legend 
                    wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
                    iconType="circle"
                    iconSize={8}
                  />
                  <Bar dataKey="ads" name="广告投放" fill="#000000" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="kol" name="KOL营销" fill="#6B7280" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* 消费分类饼图 */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">消费分类</CardTitle>
          </CardHeader>
          <CardContent>
            {chartDataLoading ? (
              <div className="flex items-center justify-center h-[280px]">
                <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
              </div>
            ) : !hasChartData ? (
              <div className="flex flex-col items-center justify-center h-[280px] text-center">
                <CreditCard className="h-8 w-8 text-gray-300 mb-2" />
                <p className="text-sm font-medium text-gray-900 mb-1">暂无消费数据</p>
                <p className="text-xs text-gray-500">消费分类统计将在您开始使用服务后显示</p>
              </div>
            ) : (
              <>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={categorySpending as unknown as Record<string, unknown>[]}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      paddingAngle={2}
                    >
                      <Cell fill="#000000" />
                      <Cell fill="#6B7280" />
                    </Pie>
                    <Tooltip
                      formatter={(value: number) => formatCurrency(value)}
                      contentStyle={{
                        backgroundColor: "white",
                        border: "1px solid #E5E7EB",
                        borderRadius: "8px",
                        fontSize: "12px",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="mt-4 space-y-3">
                  {categorySpending.map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: index === 0 ? '#000000' : '#6B7280' }}
                        />
                        <span className="text-xs text-gray-600">{item.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-gray-900">
                          {formatCurrency(item.value)}
                        </span>
                        <span className="text-xs text-gray-500">
                          {item.percentage.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 交易详情模态框 */}
      <TransactionDetailModal
        transaction={selectedTransaction}
        open={isDetailModalOpen}
        onOpenChange={setIsDetailModalOpen}
      />
    </div>
  );
}
