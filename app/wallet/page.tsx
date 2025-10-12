"use client";

import React, { useState } from "react";
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
} from "lucide-react";
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

import xiaofeiData from "./xiaofei.json";
import chongzhiData from "./chongzhi.json";
import dailySpendingData from "./daily-spending.json";

interface XiaofeiRecord {
  id: string;
  name: string;
  type: string;
  category: string;
  amount: number;
  status: string;
  updateTime: string;
}

interface ChongzhiRecord {
  id: string;
  date: string;
  amount: number;
  payType: string;
  status: string;
  txHash: string;
}

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
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const xiaofei = xiaofeiData as XiaofeiRecord[];
  const chongzhi = chongzhiData as ChongzhiRecord[];
  const dailySpending = dailySpendingData as DailySpending[];

  // 计算统计数据
  const currentBalance = 148000.0;
  const todaySpending = xiaofei
    .filter((item) => item.updateTime.startsWith("2025-10-12"))
    .reduce((sum, item) => sum + item.amount, 0);

  const totalSpending = xiaofei.reduce((sum, item) => sum + item.amount, 0);
  const totalRecharge = chongzhi.reduce((sum, item) => sum + item.amount, 0);

  // 计算分类消费
  const categorySpending = [
    {
      name: "广告投放",
      value: xiaofei
        .filter((item) => item.category === "ads")
        .reduce((sum, item) => sum + item.amount, 0),
      color: COLORS.ads,
    },
    {
      name: "KOL营销",
      value: xiaofei
        .filter((item) => item.category === "kol")
        .reduce((sum, item) => sum + item.amount, 0),
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

  const handleViewTransaction = (transaction: any) => {
    setSelectedTransaction(transaction);
    setIsDetailModalOpen(true);
  };

  const handleExportTransactions = () => {
    // 模拟导出功能
    alert("正在导出交易记录...");
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
          <Tabs defaultValue="expense" className="w-full">
            <TabsList className="grid w-full max-w-md grid-cols-3">
              <TabsTrigger value="expense">消费记录</TabsTrigger>
              <TabsTrigger value="recharge">充值记录</TabsTrigger>
              <TabsTrigger value="all">全部交易</TabsTrigger>
            </TabsList>

            {/* 消费记录 */}
            <TabsContent value="expense" className="mt-6">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>交易ID</TableHead>
                      <TableHead>名称</TableHead>
                      <TableHead>类型</TableHead>
                      <TableHead>金额</TableHead>
                      <TableHead>状态</TableHead>
                      <TableHead>时间</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {xiaofei.map((record) => (
                      <TableRow 
                        key={record.id}
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => handleViewTransaction(record)}
                      >
                        <TableCell className="font-mono text-sm">
                          {record.id}
                        </TableCell>
                        <TableCell className="font-medium">{record.name}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{record.type}</Badge>
                        </TableCell>
                        <TableCell className="font-mono">
                          <span className="text-red-600">
                            -{formatCurrency(record.amount)}
                          </span>
                        </TableCell>
                        <TableCell>{getStatusBadge(record.status)}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {record.updateTime}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            {/* 充值记录 */}
            <TabsContent value="recharge" className="mt-6">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>交易ID</TableHead>
                      <TableHead>时间</TableHead>
                      <TableHead>金额</TableHead>
                      <TableHead>支付方式</TableHead>
                      <TableHead>状态</TableHead>
                      <TableHead>交易哈希</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {chongzhi.map((record) => (
                      <TableRow 
                        key={record.id}
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => handleViewTransaction(record)}
                      >
                        <TableCell className="font-mono text-sm">
                          {record.id}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {record.date}
                        </TableCell>
                        <TableCell className="font-mono">
                          <span className="text-green-600">
                            +{formatCurrency(record.amount)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{record.payType}</Badge>
                        </TableCell>
                        <TableCell>{getStatusBadge(record.status)}</TableCell>
                        <TableCell className="font-mono text-xs text-muted-foreground">
                          {record.txHash}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            {/* 全部交易 */}
            <TabsContent value="all" className="mt-6">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>交易ID</TableHead>
                      <TableHead>类型</TableHead>
                      <TableHead>描述</TableHead>
                      <TableHead>金额</TableHead>
                      <TableHead>时间</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {/* 合并充值和消费记录并按时间排序 */}
                    {[
                      ...chongzhi.map((r) => ({
                        ...r,
                        transactionType: "recharge",
                        description: r.payType,
                        time: r.date,
                      })),
                      ...xiaofei.map((r) => ({
                        ...r,
                        transactionType: "expense",
                        description: r.name,
                        time: r.updateTime,
                      })),
                    ]
                      .sort(
                        (a, b) =>
                          new Date(b.time).getTime() - new Date(a.time).getTime()
                      )
                      .slice(0, 10)
                      .map((record: any) => (
                        <TableRow key={record.id}>
                          <TableCell className="font-mono text-sm">
                            {record.id}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                record.transactionType === "recharge"
                                  ? "default"
                                  : "outline"
                              }
                            >
                              {record.transactionType === "recharge"
                                ? "充值"
                                : "消费"}
                            </Badge>
                          </TableCell>
                          <TableCell>{record.description}</TableCell>
                          <TableCell className="font-mono">
                            <span
                              className={
                                record.transactionType === "recharge"
                                  ? "text-green-600"
                                  : "text-red-600"
                              }
                            >
                              {record.transactionType === "recharge" ? "+" : "-"}
                              {formatCurrency(record.amount)}
                            </span>
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {record.time}
                          </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
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
