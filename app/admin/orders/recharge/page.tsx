"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  FileText, 
  CheckCircle, 
  Clock, 
  XCircle,
  DollarSign,
  ExternalLink,
  AlertCircle,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { SearchBar } from "@/components/admin/search-bar";
import { Pagination } from "@/components/admin/pagination";
import { getIconContainer } from "@/lib/design-system";
import { isSuccessResponse } from "@/lib/api-client";
import {
  getAllRechargeOrders,
  confirmRechargeOrder,
  rejectRechargeOrder,
  formatAmount,
  type RechargeOrder,
} from "@/lib/api/wallet";
import {
  parseNetworkFromFullName,
  getNetworkConfig,
  buildExplorerUrl,
  type BlockchainNetwork,
} from "@/types/payment";

export default function AdminRechargeOrdersPage() {
  const { toast } = useToast();
  const [orders, setOrders] = useState<RechargeOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [paymentTypeFilter, setPaymentTypeFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [total, setTotal] = useState(0);

  // 确认对话框
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [confirmOrder, setConfirmOrder] = useState<RechargeOrder | null>(null);
  const [confirmTxHash, setConfirmTxHash] = useState("");
  const [confirmRemark, setConfirmRemark] = useState("");
  const [confirming, setConfirming] = useState(false);

  // 拒绝对话框
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectOrder, setRejectOrder] = useState<RechargeOrder | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [rejecting, setRejecting] = useState(false);

  useEffect(() => {
    loadOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, statusFilter, paymentTypeFilter]);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const result = await getAllRechargeOrders({
        status: statusFilter === "all" ? undefined : (statusFilter as 'pending' | 'confirmed' | 'failed' | 'cancelled'),
        payment_type: paymentTypeFilter === "all" ? undefined : (paymentTypeFilter as 'crypto' | 'online'),
        page,
        page_size: pageSize,
      });

      if (isSuccessResponse(result.base_resp)) {
        setOrders(result.orders);
        setTotal(result.total);
      } else {
        toast({
          variant: "error",
          title: "加载失败",
          description: result.base_resp.status_msg,
        });
      }
    } catch (error) {
      toast({
        variant: "error",
        title: "加载失败",
        description: error instanceof Error ? error.message : "网络错误",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setPage(1);
    loadOrders();
  };

  const handleOpenConfirmDialog = (order: RechargeOrder) => {
    setConfirmOrder(order);
    setConfirmTxHash(order.crypto_tx_hash || "");
    setConfirmRemark("");
    setShowConfirmDialog(true);
  };

  const handleOpenRejectDialog = (order: RechargeOrder) => {
    setRejectOrder(order);
    setRejectReason("");
    setShowRejectDialog(true);
  };

  const handleConfirm = async () => {
    if (!confirmOrder) return;

    setConfirming(true);
    try {
      const result = await confirmRechargeOrder({
        order_id: confirmOrder.order_id,
        crypto_tx_hash: confirmTxHash || undefined,
        remark: confirmRemark || undefined,
      });

      if (isSuccessResponse(result.base_resp)) {
        toast({
          title: "确认成功",
          description: "充值订单已确认，用户余额已增加",
        });
        setShowConfirmDialog(false);
        loadOrders();
      } else {
        toast({
          variant: "error",
          title: "确认失败",
          description: result.base_resp.status_msg,
        });
      }
    } catch (error) {
      toast({
        variant: "error",
        title: "确认失败",
        description: error instanceof Error ? error.message : "网络错误",
      });
    } finally {
      setConfirming(false);
    }
  };

  const handleReject = async () => {
    if (!rejectOrder || !rejectReason.trim()) {
      toast({
        variant: "error",
        title: "验证失败",
        description: "请输入拒绝原因",
      });
      return;
    }

    setRejecting(true);
    try {
      const result = await rejectRechargeOrder({
        order_id: rejectOrder.order_id,
        failed_reason: rejectReason,
      });

      if (isSuccessResponse(result.base_resp)) {
        toast({
          title: "拒绝成功",
          description: "充值订单已拒绝",
        });
        setShowRejectDialog(false);
        loadOrders();
      } else {
        toast({
          variant: "error",
          title: "拒绝失败",
          description: result.base_resp.status_msg,
        });
      }
    } catch (error) {
      toast({
        variant: "error",
        title: "拒绝失败",
        description: error instanceof Error ? error.message : "网络错误",
      });
    } finally {
      setRejecting(false);
    }
  };

  const handleOpenExplorer = (order: RechargeOrder) => {
    if (!order.payment_address || !order.payment_network) return;
    const network = parseNetworkFromFullName(order.payment_network);
    if (!network) return;
    const url = buildExplorerUrl(network as BlockchainNetwork, order.payment_address);
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "confirmed":
        return (
          <Badge className="bg-green-100 text-green-700 border-0">
            <CheckCircle className="h-3 w-3 mr-1" />
            已确认
          </Badge>
        );
      case "pending":
        return (
          <Badge className="bg-yellow-100 text-yellow-700 border-0">
            <Clock className="h-3 w-3 mr-1" />
            待确认
          </Badge>
        );
      case "failed":
        return (
          <Badge className="bg-red-100 text-red-700 border-0">
            <XCircle className="h-3 w-3 mr-1" />
            失败
          </Badge>
        );
      case "cancelled":
        return (
          <Badge className="bg-gray-100 text-gray-700 border-0">
            <XCircle className="h-3 w-3 mr-1" />
            已取消
          </Badge>
        );
      default:
        return null;
    }
  };

  const getNetworkInfo = (networkFullName?: string) => {
    if (!networkFullName) return null;
    const network = parseNetworkFromFullName(networkFullName);
    if (!network) return null;
    return getNetworkConfig(network);
  };

  const stats = [
    {
      title: "总订单数",
      value: total.toString(),
      icon: FileText,
      gradient: "blue",
    },
    {
      title: "待确认",
      value: orders.filter((o) => o.status === "pending").length.toString(),
      icon: Clock,
      gradient: "yellow",
    },
    {
      title: "已确认",
      value: orders.filter((o) => o.status === "confirmed").length.toString(),
      icon: CheckCircle,
      gradient: "green",
    },
    {
      title: "总金额",
      value: `$${orders.filter(o => o.status === 'confirmed').reduce((sum, order) => sum + parseFloat(order.amount), 0).toFixed(2)}`,
      icon: DollarSign,
      gradient: "purple",
    },
  ];

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">充值订单管理</h1>
        <p className="text-gray-600 mt-1">查看和管理所有充值订单</p>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="border-0 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {stat.title}
                </CardTitle>
                <div className={getIconContainer("small", stat.gradient as 'blue' | 'yellow' | 'green' | 'purple' | 'orange' | 'red')}>
                  <Icon className="h-4 w-4 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-900">{stat.value}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* 搜索和筛选 */}
      <Card className="border-gray-200 shadow-sm">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <SearchBar
                value={searchKeyword}
                onChange={setSearchKeyword}
                onSearch={handleSearch}
                placeholder="搜索订单号、用户信息..."
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="状态" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">所有状态</SelectItem>
                <SelectItem value="pending">待确认</SelectItem>
                <SelectItem value="confirmed">已确认</SelectItem>
                <SelectItem value="failed">失败</SelectItem>
                <SelectItem value="cancelled">已取消</SelectItem>
              </SelectContent>
            </Select>
            <Select value={paymentTypeFilter} onValueChange={setPaymentTypeFilter}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="支付方式" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">所有方式</SelectItem>
                <SelectItem value="crypto">加密货币</SelectItem>
                <SelectItem value="online">在线支付</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* 订单列表 */}
      <Card className="border-gray-200 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  订单号
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  用户
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  金额
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  支付方式
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  用户钱包
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  状态
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  创建时间
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center">
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                      <span className="ml-3 text-gray-600">加载中...</span>
                    </div>
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                    没有找到充值订单
                  </td>
                </tr>
              ) : (
                orders.map((order) => {
                  const networkInfo = getNetworkInfo(order.payment_network);
                  return (
                    <tr key={order.order_id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-mono text-gray-900">
                          {order.order_id}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">用户 ID: {order.user_id}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-green-600">
                          {formatAmount(order.amount)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col gap-1">
                          <Badge variant="outline" className="w-fit">
                            {order.payment_type === 'crypto' ? '加密货币' : '在线支付'}
                          </Badge>
                          {order.payment_network && networkInfo && (
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                              <div
                                className="w-2 h-2 rounded-full"
                                style={{ backgroundColor: networkInfo.color }}
                              />
                              <span>{networkInfo.name}</span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-xs font-mono text-gray-500 max-w-[150px] truncate">
                          {order.user_crypto_address || '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(order.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {new Date(order.created_at).toLocaleDateString("zh-CN")}
                        </div>
                        <div className="text-xs text-gray-400">
                          {new Date(order.created_at).toLocaleTimeString("zh-CN")}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          {order.payment_type === 'crypto' && order.payment_address && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleOpenExplorer(order)}
                              title="在区块链浏览器中查看"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                          )}
                          {order.status === "pending" && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleOpenConfirmDialog(order)}
                                className="text-green-600 hover:text-green-700"
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                确认
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleOpenRejectDialog(order)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <XCircle className="h-4 w-4 mr-1" />
                                拒绝
                              </Button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* 分页 */}
        {!loading && orders.length > 0 && (
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
            pageSize={pageSize}
            total={total}
          />
        )}
      </Card>

      {/* 确认对话框 */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>确认充值订单</DialogTitle>
            <DialogDescription>
              请核实链上交易后确认充值，确认后用户余额将自动增加
            </DialogDescription>
          </DialogHeader>

          {confirmOrder && (
            <div className="space-y-4">
              <Card className="bg-gray-50 border-gray-200">
                <CardContent className="p-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">订单号:</span>
                    <span className="font-mono font-medium">{confirmOrder.order_id}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">充值金额:</span>
                    <span className="font-semibold text-green-600">
                      {formatAmount(confirmOrder.amount)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">用户钱包:</span>
                    <span className="font-mono text-xs">
                      {confirmOrder.user_crypto_address?.slice(0, 10)}...
                      {confirmOrder.user_crypto_address?.slice(-10)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">收款地址:</span>
                    <span className="font-mono text-xs">
                      {confirmOrder.payment_address?.slice(0, 10)}...
                      {confirmOrder.payment_address?.slice(-10)}
                    </span>
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-2">
                <Label htmlFor="confirm-tx-hash">交易哈希（可选）</Label>
                <Input
                  id="confirm-tx-hash"
                  value={confirmTxHash}
                  onChange={(e) => setConfirmTxHash(e.target.value)}
                  placeholder="输入区块链交易哈希"
                  className="font-mono text-sm"
                />
                <p className="text-xs text-gray-500">
                  如果已知交易哈希，请填入以便后续核对
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm-remark">备注（可选）</Label>
                <Textarea
                  id="confirm-remark"
                  value={confirmRemark}
                  onChange={(e) => setConfirmRemark(e.target.value)}
                  placeholder="填写确认备注"
                  rows={3}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowConfirmDialog(false)}
              disabled={confirming}
            >
              取消
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={confirming}
              className="bg-green-600 hover:bg-green-700"
            >
              {confirming ? "确认中..." : "确认充值"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 拒绝对话框 */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>拒绝充值订单</DialogTitle>
            <DialogDescription>
              请说明拒绝原因，用户将收到此原因的通知
            </DialogDescription>
          </DialogHeader>

          {rejectOrder && (
            <div className="space-y-4">
              <Card className="bg-red-50 border-red-200">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">订单号:</span>
                        <span className="font-mono font-medium">{rejectOrder.order_id}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">充值金额:</span>
                        <span className="font-semibold">{formatAmount(rejectOrder.amount)}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-2">
                <Label htmlFor="reject-reason">拒绝原因 *</Label>
                <Textarea
                  id="reject-reason"
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="例如：交易哈希无效、未找到对应交易、金额不匹配等"
                  rows={4}
                  className="resize-none"
                />
                <p className="text-xs text-gray-500">
                  请详细说明拒绝原因，帮助用户了解问题所在
                </p>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowRejectDialog(false)}
              disabled={rejecting}
            >
              取消
            </Button>
            <Button
              onClick={handleReject}
              disabled={rejecting || !rejectReason.trim()}
              variant="destructive"
            >
              {rejecting ? "拒绝中..." : "确认拒绝"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

