"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ShoppingBag,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Eye,
  Package,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getIconContainer } from "@/lib/design-system";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { getUserKolOrderList, cancelKolOrder, KolOrderInfo } from "@/lib/api/kol-order";
import { isSuccessResponse } from "@/lib/api-client";
import { useToast } from "@/hooks/use-toast";

type OrderStatus = "pending_payment" | "pending" | "confirmed" | "in_progress" | "completed" | "cancelled" | "refunded";

export default function UserKOLOrders() {
  const { toast } = useToast();
  const [orders, setOrders] = useState<KolOrderInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "all">("all");
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  
  // 取消订单对话框
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<KolOrderInfo | null>(null);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    loadOrders();
  }, [statusFilter, page]);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const result = await getUserKolOrderList({
        status: statusFilter === "all" ? undefined : statusFilter,
        page,
        page_size: 10,
      });

      if (isSuccessResponse(result.base_resp)) {
        setOrders(result.orders || []);
        setTotal(result.total || 0);
      } else {
        toast({
          title: "加载失败",
          description: result.base_resp.msg || "加载订单列表失败",
          variant: "error",
        });
      }
    } catch (err) {
      console.error("Failed to load orders:", err);
      toast({
        title: "错误",
        description: "加载订单列表失败",
        variant: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = (order: KolOrderInfo) => {
    setSelectedOrder(order);
    setCancelDialogOpen(true);
    setCancelReason("");
  };

  const confirmCancelOrder = async () => {
    if (!selectedOrder) return;
    
    if (!cancelReason.trim()) {
      toast({
        title: "提示",
        description: "请填写取消原因",
        variant: "error",
      });
      return;
    }

    setCancelling(true);
    try {
      const result = await cancelKolOrder({
        order_id: selectedOrder.order_id,
        reason: cancelReason,
      });

      if (isSuccessResponse(result.base_resp)) {
        toast({
          title: "成功",
          description: "订单已取消",
        });
        setCancelDialogOpen(false);
        loadOrders();
      } else {
        toast({
          title: "失败",
          description: result.base_resp.msg || "取消订单失败",
          variant: "error",
        });
      }
    } catch (err) {
      console.error("Failed to cancel order:", err);
      toast({
        title: "错误",
        description: "取消订单失败",
        variant: "error",
      });
    } finally {
      setCancelling(false);
    }
  };

  // 统计数据
  const stats = [
    {
      title: "Total Orders",
      value: orders.length.toString(),
      icon: Package,
      gradient: "blue" as const,
    },
    {
      title: "In Progress",
      value: orders.filter((o) => o.status === "in_progress").length.toString(),
      icon: Clock,
      gradient: "orange" as const,
    },
    {
      title: "Completed",
      value: orders.filter((o) => o.status === "completed").length.toString(),
      icon: CheckCircle2,
      gradient: "green" as const,
    },
    {
      title: "Pending",
      value: orders.filter((o) => o.status === "pending").length.toString(),
      icon: AlertCircle,
      gradient: "purple" as const,
    },
  ];

  // 状态配置
  const statusConfig: Record<
    OrderStatus,
    { label: string; className: string; icon: React.ComponentType<{ className?: string }> }
  > = {
    pending_payment: {
      label: "待支付",
      className: "bg-gray-100 text-gray-700",
      icon: Clock,
    },
    pending: {
      label: "待确认",
      className: "bg-yellow-100 text-yellow-700",
      icon: Clock,
    },
    confirmed: {
      label: "已确认",
      className: "bg-blue-100 text-blue-700",
      icon: CheckCircle2,
    },
    in_progress: {
      label: "进行中",
      className: "bg-blue-100 text-blue-700",
      icon: Clock,
    },
    completed: {
      label: "已完成",
      className: "bg-green-100 text-green-700",
      icon: CheckCircle2,
    },
    cancelled: {
      label: "已取消",
      className: "bg-red-100 text-red-700",
      icon: XCircle,
    },
    refunded: {
      label: "已退款",
      className: "bg-purple-100 text-purple-700",
      icon: XCircle,
    },
  };

  // 空状态
  if (!loading && orders.length === 0 && statusFilter === "all") {
    return (
      <div className="space-y-6">
        <Card className="border-0 shadow-sm">
          <CardContent className="py-32 text-center">
            <div className="flex flex-col items-center">
              <div className={getIconContainer("large", "blue")}>
                <ShoppingBag className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mt-6 mb-2">暂无订单</h2>
              <p className="text-gray-600 mb-6 max-w-md">
                您还没有创建任何 KOL 订单。浏览 KOL 市场，找到适合您的合作伙伴。
              </p>
              <Link href="/kol/marketplace">
                <Button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white border-0 rounded-xl">
                  浏览 KOL 市场
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="border-0 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">{stat.title}</CardTitle>
                <div className={getIconContainer("small", stat.gradient)}>
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

      {/* Orders List with Filters */}
      <Card className="overflow-hidden shadow-sm border-gray-200">
        {/* 筛选区域 */}
        <div className="bg-gradient-to-br from-gray-50 to-gray-100/50 border-b border-gray-200 px-6 py-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-gray-700">状态筛选</label>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={statusFilter === "all" ? "default" : "outline"}
                onClick={() => setStatusFilter("all")}
                size="sm"
                className="h-9"
              >
                全部订单
              </Button>
              <Button
                variant={statusFilter === "pending_payment" ? "default" : "outline"}
                onClick={() => setStatusFilter("pending_payment")}
                size="sm"
                className="h-9"
              >
                待支付
              </Button>
              <Button
                variant={statusFilter === "pending" ? "default" : "outline"}
                onClick={() => setStatusFilter("pending")}
                size="sm"
                className="h-9"
              >
                待确认
              </Button>
              <Button
                variant={statusFilter === "confirmed" ? "default" : "outline"}
                onClick={() => setStatusFilter("confirmed")}
                size="sm"
                className="h-9"
              >
                已确认
              </Button>
              <Button
                variant={statusFilter === "in_progress" ? "default" : "outline"}
                onClick={() => setStatusFilter("in_progress")}
                size="sm"
                className="h-9"
              >
                进行中
              </Button>
              <Button
                variant={statusFilter === "completed" ? "default" : "outline"}
                onClick={() => setStatusFilter("completed")}
                size="sm"
                className="h-9"
              >
                已完成
              </Button>
              <Button
                variant={statusFilter === "cancelled" ? "default" : "outline"}
                onClick={() => setStatusFilter("cancelled")}
                size="sm"
                className="h-9"
              >
                已取消
              </Button>
            </div>
          </div>
        </div>

        {/* 标题栏 */}
        <div className="flex items-center gap-3 border-b border-gray-200 bg-white px-6 py-4">
          <h2 className="text-base font-semibold text-gray-900">我发起的订单</h2>
          <Badge variant="secondary" className="h-6 px-2 text-xs font-medium bg-gray-100 text-gray-700">
            {total} 个订单
          </Badge>
        </div>

        {/* 订单表格 */}
        <div className="bg-white">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
              <p className="text-gray-600">加载中...</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[200px]">订单信息</TableHead>
                  <TableHead>KOL</TableHead>
                  <TableHead>服务内容</TableHead>
                  <TableHead>金额</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead className="text-right w-[180px]">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => {
                  const StatusIcon = statusConfig[order.status].icon;
                  const canCancel = ["pending_payment", "pending", "confirmed", "in_progress"].includes(
                    order.status
                  );

                  return (
                    <TableRow key={order.order_id}>
                      <TableCell>
                        <div>
                          <div className="font-medium text-gray-900">{order.title}</div>
                          <div className="text-xs text-gray-500 mt-1">ID: {order.order_id}</div>
                          <div className="text-xs text-gray-500">
                            创建于: {new Date(order.created_at).toLocaleDateString()}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={order.kol_avatar_url} alt={order.kol_display_name} />
                            <AvatarFallback className="bg-gradient-to-br from-blue-600 to-blue-700 text-white text-xs">
                              {order.kol_display_name.slice(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm font-medium">{order.kol_display_name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-[200px]">
                          <div className="font-medium text-sm">{order.plan_title}</div>
                          <Badge variant="secondary" className="text-xs mt-1">
                            {order.plan_type}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-lg font-bold text-green-600">${order.plan_price}</span>
                      </TableCell>
                      <TableCell>
                        <Badge className={statusConfig[order.status].className}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {statusConfig[order.status].label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-2 justify-end">
                          <Link href={`/kol/orders/${order.order_id}`}>
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4 mr-1" />
                              查看
                            </Button>
                          </Link>
                          {canCancel && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleCancelOrder(order)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <X className="h-4 w-4 mr-1" />
                              取消
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}

          {/* 空筛选结果 */}
          {!loading && orders.length === 0 && statusFilter !== "all" && (
            <div className="py-16 text-center">
              <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">暂无订单</h3>
              <p className="text-gray-600">当前筛选条件下没有找到订单</p>
            </div>
          )}
        </div>
      </Card>

      {/* 取消订单对话框 */}
      <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>取消订单</DialogTitle>
            <DialogDescription>请说明您取消订单的原因，这将有助于我们改进服务。</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="cancelReason">取消原因 *</Label>
              <Textarea
                id="cancelReason"
                placeholder="请输入取消原因..."
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCancelDialogOpen(false)} disabled={cancelling}>
              取消
            </Button>
            <Button onClick={confirmCancelOrder} disabled={cancelling} variant="destructive">
              {cancelling ? "处理中..." : "确认取消"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
