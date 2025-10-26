"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  AlertCircle,
  CheckCircle2,
  Clock,
  XCircle,
  Calendar,
  DollarSign,
  User,
  Package,
  FileText,
  Video,
  Users as UsersIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { getIconContainer } from "@/lib/design-system";
import { getKolOrder, KolOrderInfo } from "@/lib/api/kol-order";
import { isSuccessResponse } from "@/lib/api-client";
import { useToast } from "@/hooks/use-toast";

type OrderStatus = "pending_payment" | "pending" | "confirmed" | "in_progress" | "completed" | "cancelled" | "refunded";

export default function OrderDetail() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;
  const { toast } = useToast();

  const [order, setOrder] = useState<KolOrderInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (orderId) {
      loadOrderDetail();
    }
  }, [orderId]);

  const loadOrderDetail = async () => {
    setLoading(true);
    try {
      const result = await getKolOrder({ order_id: orderId });
      
      if (isSuccessResponse(result.base_resp) && result.order) {
        setOrder(result.order);
      } else {
        toast({
          title: "加载失败",
          description: result.base_resp.msg || "加载订单详情失败",
        });
      }
    } catch (err) {
      console.error("Failed to load order detail:", err);
      toast({
        title: "错误",
        description: "加载订单详情失败",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
        <p className="text-gray-600">加载中...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <AlertCircle className="h-16 w-16 text-gray-400 mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">订单不存在</h2>
        <p className="text-gray-600 mb-4">您查找的订单不存在或已被删除</p>
        <Button onClick={() => router.back()}>返回</Button>
      </div>
    );
  }

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

  const StatusIcon = statusConfig[order.status].icon;

  // 构建时间线
  const timeline: Array<{ date: string; event: string; status: "completed" | "in_progress" | "pending" }> = [];
  
  timeline.push({
    date: new Date(order.created_at).toLocaleDateString(),
    event: "订单创建",
    status: "completed",
  });

  if (order.status !== "pending_payment") {
    timeline.push({
      date: order.created_at ? new Date(order.created_at).toLocaleDateString() : "",
      event: "支付完成",
      status: "completed",
    });
  }

  if (order.confirmed_at) {
    timeline.push({
      date: new Date(order.confirmed_at).toLocaleDateString(),
      event: "KOL 确认接单",
      status: "completed",
    });
  } else if (order.status === "pending") {
    timeline.push({
      date: "",
      event: "等待 KOL 确认",
      status: "in_progress",
    });
  }

  if (order.status === "in_progress") {
    timeline.push({
      date: "",
      event: "制作中",
      status: "in_progress",
    });
  } else if (order.completed_at) {
    timeline.push({
      date: new Date(order.completed_at).toLocaleDateString(),
      event: "订单完成",
      status: "completed",
    });
  } else if (order.cancelled_at) {
    timeline.push({
      date: new Date(order.cancelled_at).toLocaleDateString(),
      event: "订单取消",
      status: "completed",
    });
  } else if (["confirmed", "in_progress"].includes(order.status)) {
    timeline.push({
      date: "",
      event: "等待完成",
      status: "pending",
    });
  }

  return (
    <div className="space-y-6">
      {/* 返回按钮 */}
      <Button
        variant="ghost"
        onClick={() => router.back()}
        className="gap-2 hover:bg-gray-100"
      >
        <ArrowLeft className="h-4 w-4" />
        返回
      </Button>

      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={getIconContainer("medium", "blue")}>
            <Package className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">订单详情</h1>
            <p className="text-gray-600">订单ID: {order.order_id}</p>
          </div>
        </div>
        <Badge className={`${statusConfig[order.status].className} text-base px-4 py-2`}>
          <StatusIcon className="h-5 w-5 mr-2" />
          {statusConfig[order.status].label}
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 左侧：订单信息 */}
        <div className="lg:col-span-2 space-y-6">
          {/* 订单基本信息 */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-600" />
                订单信息
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{order.title}</h3>
                <Badge variant="secondary">{order.plan_type}</Badge>
              </div>
              <Separator />
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-gray-500 mb-1">服务方案</p>
                  <p className="text-sm font-medium text-gray-900">{order.plan_title}</p>
                  <p className="text-sm text-gray-600 mt-1">{order.plan_description}</p>
                </div>
                <Separator />
                <div>
                  <p className="text-xs text-gray-500 mb-1">合作需求描述</p>
                  <p className="text-sm text-gray-700 leading-relaxed">{order.requirement_description}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 项目详情 */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Video className="h-5 w-5 text-purple-600" />
                项目详情
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500 mb-1">视频类型</p>
                  <p className="text-sm font-medium text-gray-900">{order.video_type}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">预期时长</p>
                  <p className="text-sm font-medium text-gray-900">{order.video_duration} 秒</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">目标受众</p>
                  <p className="text-sm font-medium text-gray-900">{order.target_audience}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">期望交付日期</p>
                  <p className="text-sm font-medium text-gray-900">
                    {new Date(order.expected_delivery_date).toLocaleDateString()}
                  </p>
                </div>
              </div>
              {order.additional_requirements && (
                <>
                  <Separator />
                  <div>
                    <p className="text-xs text-gray-500 mb-1">额外要求</p>
                    <p className="text-sm text-gray-700 leading-relaxed">{order.additional_requirements}</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* 取消原因 */}
          {order.reject_reason && (
            <Card className="border-0 shadow-sm bg-red-50">
              <CardContent className="p-4">
                <div className="flex gap-3">
                  <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">
                      {order.status === "cancelled" ? "取消原因" : "拒绝原因"}
                    </h4>
                    <p className="text-sm text-gray-700">{order.reject_reason}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* 右侧：KOL信息和其他 */}
        <div className="space-y-6">
          {/* KOL 信息 */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <User className="h-5 w-5 text-blue-600" />
                KOL 信息
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center text-center">
                <Avatar className="h-20 w-20 border-4 border-gray-200 mb-3">
                  <AvatarImage src={order.kol_avatar_url} alt={order.kol_display_name} />
                  <AvatarFallback className="bg-gradient-to-br from-blue-600 to-blue-700 text-white text-2xl font-semibold">
                    {order.kol_display_name.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <h2 className="text-xl font-bold text-gray-900 mb-1">{order.kol_display_name}</h2>
              </div>
            </CardContent>
          </Card>

          {/* 客户信息 */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <UsersIcon className="h-5 w-5 text-purple-600" />
                客户信息
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-xs text-gray-500 mb-1">客户昵称</p>
                <p className="text-sm font-medium text-gray-900">{order.user_nickname}</p>
              </div>
              {order.team_name && (
                <>
                  <Separator />
                  <div>
                    <p className="text-xs text-gray-500 mb-1">所属团队</p>
                    <p className="text-sm font-medium text-gray-900">{order.team_name}</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* 金额信息 */}
          <Card className="border-0 shadow-sm bg-gradient-to-br from-green-50 to-emerald-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <DollarSign className="h-5 w-5 text-green-600" />
                订单金额
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <p className="text-4xl font-bold text-green-600">${order.plan_price}</p>
              </div>
            </CardContent>
          </Card>

          {/* 时间信息 */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Calendar className="h-5 w-5 text-orange-600" />
                时间信息
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-xs text-gray-500 mb-1">创建时间</p>
                <p className="text-sm font-medium text-gray-900">
                  {new Date(order.created_at).toLocaleString()}
                </p>
              </div>
              {order.confirmed_at && (
                <>
                  <Separator />
                  <div>
                    <p className="text-xs text-gray-500 mb-1">确认时间</p>
                    <p className="text-sm font-medium text-gray-900">
                      {new Date(order.confirmed_at).toLocaleString()}
                    </p>
                  </div>
                </>
              )}
              {order.completed_at && (
                <>
                  <Separator />
                  <div>
                    <p className="text-xs text-gray-500 mb-1">完成时间</p>
                    <p className="text-sm font-medium text-gray-900">
                      {new Date(order.completed_at).toLocaleString()}
                    </p>
                  </div>
                </>
              )}
              {order.cancelled_at && (
                <>
                  <Separator />
                  <div>
                    <p className="text-xs text-gray-500 mb-1">取消时间</p>
                    <p className="text-sm font-medium text-gray-900">
                      {new Date(order.cancelled_at).toLocaleString()}
                    </p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* 时间线 */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">订单进度</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {timeline.map((item, idx) => (
                  <div key={idx} className="flex gap-3">
                    <div className="shrink-0">
                      {item.status === "completed" ? (
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                      ) : item.status === "in_progress" ? (
                        <Clock className="h-5 w-5 text-blue-600" />
                      ) : (
                        <div className="h-5 w-5 rounded-full border-2 border-gray-300" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{item.event}</p>
                      {item.date && <p className="text-xs text-gray-500">{item.date}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
