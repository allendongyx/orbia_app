"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ShoppingBag,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Eye,
  MessageSquare,
  ArrowUpRight,
  Package,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getIconContainer } from "@/lib/design-system";

// 模拟订单数据
const mockOrders = [
  {
    id: "ORD-2024-001",
    kol: {
      id: "1",
      name: "Vitalik Buterin",
      avatar: "VB",
    },
    service: "21-60s Video Campaign",
    price: "$32,000",
    status: "in_progress",
    createdAt: "2024-01-15",
    deadline: "2024-02-01",
    unreadMessages: 3,
  },
  {
    id: "ORD-2024-002",
    kol: {
      id: "2",
      name: "Andreas M. Antonopoulos",
      avatar: "AMA",
    },
    service: "15-20s Short Video",
    price: "$7,000",
    status: "completed",
    createdAt: "2024-01-10",
    deadline: "2024-01-25",
    unreadMessages: 0,
  },
  {
    id: "ORD-2024-003",
    kol: {
      id: "3",
      name: "Charles Hoskinson",
      avatar: "CH",
    },
    service: "60s+ Long Form Content",
    price: "$105,000",
    status: "pending",
    createdAt: "2024-01-20",
    deadline: "2024-02-15",
    unreadMessages: 1,
  },
  {
    id: "ORD-2024-004",
    kol: {
      id: "6",
      name: "Brian Armstrong",
      avatar: "BA",
    },
    service: "21-60s Video Campaign",
    price: "$92,000",
    status: "cancelled",
    createdAt: "2024-01-05",
    deadline: "2024-01-20",
    unreadMessages: 0,
  },
];

type OrderStatus = "pending" | "in_progress" | "completed" | "cancelled";

interface Order {
  id: string;
  kol: {
    id: string;
    name: string;
    avatar: string;
  };
  service: string;
  price: string;
  status: OrderStatus;
  createdAt: string;
  deadline: string;
  unreadMessages: number;
}

export default function KOLOrders() {
  const [orders] = useState<Order[]>(mockOrders);
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "all">("all");

  // 过滤订单
  const filteredOrders = statusFilter === "all" 
    ? orders 
    : orders.filter(order => order.status === statusFilter);

  // 统计数据
  const stats = [
    {
      title: "Total Orders",
      value: orders.length.toString(),
      icon: Package,
      gradient: "blue",
    },
    {
      title: "In Progress",
      value: orders.filter(o => o.status === "in_progress").length.toString(),
      icon: Clock,
      gradient: "orange",
    },
    {
      title: "Completed",
      value: orders.filter(o => o.status === "completed").length.toString(),
      icon: CheckCircle2,
      gradient: "green",
    },
    {
      title: "Pending",
      value: orders.filter(o => o.status === "pending").length.toString(),
      icon: AlertCircle,
      gradient: "purple",
    },
  ];

  // 状态配置
  const statusConfig: Record<OrderStatus, { label: string; className: string; icon: any }> = {
    pending: {
      label: "Pending",
      className: "bg-yellow-100 text-yellow-700",
      icon: Clock,
    },
    in_progress: {
      label: "In Progress",
      className: "bg-blue-100 text-blue-700",
      icon: Clock,
    },
    completed: {
      label: "Completed",
      className: "bg-green-100 text-green-700",
      icon: CheckCircle2,
    },
    cancelled: {
      label: "Cancelled",
      className: "bg-red-100 text-red-700",
      icon: XCircle,
    },
  };

  // 空状态
  if (orders.length === 0) {
    return (
      <div className="space-y-6">
        <Card className="border-0 shadow-sm">
          <CardContent className="py-32 text-center">
            <div className="flex flex-col items-center">
              <div className={getIconContainer("large", "blue")}>
                <ShoppingBag className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mt-6 mb-2">
                No Orders Yet
              </h2>
              <p className="text-gray-600 mb-6 max-w-md">
                You haven't placed any KOL orders yet. Browse our marketplace to find the perfect influencers for your campaign.
              </p>
              <Link href="/kol/marketplace">
                <Button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white border-0 rounded-xl">
                  Browse KOL Marketplace
                  <ArrowUpRight className="ml-2 h-4 w-4" />
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
                <CardTitle className="text-sm font-medium text-gray-600">
                  {stat.title}
                </CardTitle>
                <div className={getIconContainer("small", stat.gradient as any)}>
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
            <label className="text-xs font-medium text-gray-700">Filter by Status</label>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={statusFilter === "all" ? "default" : "outline"}
                onClick={() => setStatusFilter("all")}
                size="sm"
                className="h-9"
              >
                All Orders
              </Button>
              <Button
                variant={statusFilter === "pending" ? "default" : "outline"}
                onClick={() => setStatusFilter("pending")}
                size="sm"
                className="h-9"
              >
                Pending
              </Button>
              <Button
                variant={statusFilter === "in_progress" ? "default" : "outline"}
                onClick={() => setStatusFilter("in_progress")}
                size="sm"
                className="h-9"
              >
                In Progress
              </Button>
              <Button
                variant={statusFilter === "completed" ? "default" : "outline"}
                onClick={() => setStatusFilter("completed")}
                size="sm"
                className="h-9"
              >
                Completed
              </Button>
              <Button
                variant={statusFilter === "cancelled" ? "default" : "outline"}
                onClick={() => setStatusFilter("cancelled")}
                size="sm"
                className="h-9"
              >
                Cancelled
              </Button>
            </div>
          </div>
        </div>

        {/* 标题栏 */}
        <div className="flex items-center gap-3 border-b border-gray-200 bg-white px-6 py-4">
          <h2 className="text-base font-semibold text-gray-900">
            Orders
          </h2>
          <Badge variant="secondary" className="h-6 px-2 text-xs font-medium bg-gray-100 text-gray-700">
            {filteredOrders.length} {filteredOrders.length === 1 ? 'Order' : 'Orders'}
          </Badge>
        </div>

        {/* 订单列表 */}
        <div className="bg-white p-6 space-y-4">
          {filteredOrders.map((order) => {
            const StatusIcon = statusConfig[order.status].icon;
            
            return (
              <Card key={order.id} className="border border-gray-200 shadow-sm hover:shadow-md hover:border-blue-300 transition-all">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center gap-4">
                    {/* 左侧：KOL 信息 */}
                    <div className="flex items-center gap-4 flex-1">
                      <Avatar className="h-14 w-14 border-2 border-gray-200">
                        <AvatarImage
                          src={`https://randomuser.me/api/portraits/men/${order.kol.id}.jpg`}
                          alt={order.kol.name}
                        />
                        <AvatarFallback className="bg-gradient-to-br from-blue-600 to-blue-700 text-white font-semibold">
                          {order.kol.avatar}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-gray-900">{order.kol.name}</h3>
                          <Badge className={statusConfig[order.status].className}>
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {statusConfig[order.status].label}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">{order.service}</p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                          <span>Order ID: {order.id}</span>
                          <span>•</span>
                          <span>Created: {order.createdAt}</span>
                          <span>•</span>
                          <span>Deadline: {order.deadline}</span>
                        </div>
                      </div>
                    </div>

                    {/* 中间：价格 */}
                    <div className="text-center md:text-right">
                      <p className="text-xs text-gray-500 mb-1">Total Price</p>
                      <p className="text-2xl font-bold text-green-600">{order.price}</p>
                    </div>

                    {/* 右侧：操作按钮 */}
                    <div className="flex gap-2">
                      <Link href={`/kol/orders/${order.id}`}>
                        <Button variant="outline" className="h-9">
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </Button>
                      </Link>
                      <Link href={`/kol/orders/${order.id}#messages`}>
                        <Button className="h-9 relative">
                          <MessageSquare className="h-4 w-4 mr-2" />
                          Chat
                          {order.unreadMessages > 0 && (
                            <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-[10px] bg-red-600 text-white">
                              {order.unreadMessages}
                            </Badge>
                          )}
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}

          {/* 空筛选结果 */}
          {filteredOrders.length === 0 && orders.length > 0 && (
            <div className="py-16 text-center">
              <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No orders found
              </h3>
              <p className="text-gray-600">
                Try selecting a different status filter.
              </p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}

