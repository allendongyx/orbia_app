"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Users,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Eye,
  Package,
  ThumbsUp,
  ThumbsDown,
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
import { getKolReceivedOrderList, updateKolOrderStatus, KolOrderInfo } from "@/lib/api/kol-order";
import { isSuccessResponse } from "@/lib/api-client";
import { useToast } from "@/hooks/use-toast";

type OrderStatus = "pending_payment" | "pending" | "confirmed" | "in_progress" | "completed" | "cancelled" | "refunded";

export default function KOLReceivedOrders() {
  const { toast } = useToast();
  const [orders, setOrders] = useState<KolOrderInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "all">("all");
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  
  // 确认/拒绝订单对话框
  const [actionDialogOpen, setActionDialogOpen] = useState(false);
  const [actionType, setActionType] = useState<"confirm" | "reject" | "start" | "complete">("confirm");
  const [selectedOrder, setSelectedOrder] = useState<KolOrderInfo | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadOrders();
  }, [statusFilter, page]);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const result = await getKolReceivedOrderList({
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
          variant: "destructive",
        });
      }
    } catch (err) {
      console.error("Failed to load orders:", err);
      toast({
        title: "错误",
        description: "加载订单列表失败",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOrderAction = (order: KolOrderInfo, action: "confirm" | "reject" | "start" | "complete") => {
    setSelectedOrder(order);
    setActionType(action);
    setActionDialogOpen(true);
    setRejectReason("");
  };

  const confirmAction = async () => {
    if (!selectedOrder) return;

    if (actionType === "reject" && !rejectReason.trim()) {
      toast({
        title: "提示",
        description: "请填写拒绝原因",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    try {
      let newStatus: "confirmed" | "in_progress" | "completed" | "cancelled";
      
      switch (actionType) {
        case "confirm":
          newStatus = "confirmed";
          break;
        case "reject":
          newStatus = "cancelled";
          break;
        case "start":
          newStatus = "in_progress";
          break;
        case "complete":
          newStatus = "completed";
          break;
      }

      const result = await updateKolOrderStatus({
        order_id: selectedOrder.order_id,
        status: newStatus,
        reject_reason: actionType === "reject" ? rejectReason : undefined,
      });

      if (isSuccessResponse(result.base_resp)) {
        const actionTexts = {
          confirm: "已确认",
          reject: "已拒绝",
          start: "已开始",
          complete: "已完成",
        };
        toast({
          title: "成功",
          description: `订单${actionTexts[actionType]}`,
        });
        setActionDialogOpen(false);
        loadOrders();
      } else {
        toast({
          title: "失败",
          description: result.base_resp.msg || "操作失败",
          variant: "destructive",
        });
      }
    } catch (err) {
      console.error("Failed to update order status:", err);
      toast({
        title: "错误",
        description: "操作失败",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
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
      title: "Pending",
      value: orders.filter((o) => o.status === "pending").length.toString(),
      icon: AlertCircle,
      gradient: "yellow" as const,
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
                <Users className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mt-6 mb-2">暂无订单</h2>
              <p className="text-gray-600 mb-6 max-w-md">
                您还没有收到任何订单。完善您的 KOL 资料和报价方案，吸引更多客户。
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const actionDialogConfig = {
    confirm: {
      title: "确认接单",
      description: "确认接受此订单后，将自动创建与客户的沟通会话。",
      confirmText: "确认接单",
      confirmVariant: "default" as const,
    },
    reject: {
      title: "拒绝订单",
      description: "请说明您拒绝此订单的原因，这将通知客户。",
      confirmText: "确认拒绝",
      confirmVariant: "destructive" as const,
    },
    start: {
      title: "开始制作",
      description: "标记此订单为进行中状态，客户将收到通知。",
      confirmText: "开始制作",
      confirmVariant: "default" as const,
    },
    complete: {
      title: "完成交付",
      description: "标记此订单为已完成状态，客户将收到通知。",
      confirmText: "确认完成",
      confirmVariant: "default" as const,
    },
  };

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
          <h2 className="text-base font-semibold text-gray-900">我接收的订单</h2>
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
                  <TableHead>客户</TableHead>
                  <TableHead>服务内容</TableHead>
                  <TableHead>金额</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead className="text-right w-[250px]">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => {
                  const StatusIcon = statusConfig[order.status].icon;

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
                        <div>
                          <div className="font-medium text-sm">{order.user_nickname}</div>
                          {order.team_name && (
                            <div className="text-xs text-gray-500">团队: {order.team_name}</div>
                          )}
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
                          
                          {order.status === "pending" && (
                            <>
                              <Button
                                variant="default"
                                size="sm"
                                onClick={() => handleOrderAction(order, "confirm")}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                <ThumbsUp className="h-4 w-4 mr-1" />
                                接单
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleOrderAction(order, "reject")}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <ThumbsDown className="h-4 w-4 mr-1" />
                                拒绝
                              </Button>
                            </>
                          )}
                          
                          {order.status === "confirmed" && (
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => handleOrderAction(order, "start")}
                            >
                              开始制作
                            </Button>
                          )}
                          
                          {order.status === "in_progress" && (
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => handleOrderAction(order, "complete")}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              完成交付
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

      {/* 操作确认对话框 */}
      <Dialog open={actionDialogOpen} onOpenChange={setActionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{actionDialogConfig[actionType].title}</DialogTitle>
            <DialogDescription>{actionDialogConfig[actionType].description}</DialogDescription>
          </DialogHeader>
          {actionType === "reject" && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="rejectReason">拒绝原因 *</Label>
                <Textarea
                  id="rejectReason"
                  placeholder="请输入拒绝原因..."
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  rows={4}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setActionDialogOpen(false)} disabled={submitting}>
              取消
            </Button>
            <Button
              onClick={confirmAction}
              disabled={submitting}
              variant={actionDialogConfig[actionType].confirmVariant}
            >
              {submitting ? "处理中..." : actionDialogConfig[actionType].confirmText}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

