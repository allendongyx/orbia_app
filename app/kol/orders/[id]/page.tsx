"use client";

import React, { useState, useRef, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Send,
  Paperclip,
  Image as ImageIcon,
  File,
  Download,
  CheckCircle2,
  Clock,
  AlertCircle,
  XCircle,
  Calendar,
  DollarSign,
  User,
  Package,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { getIconContainer } from "@/lib/design-system";

// 模拟订单数据
const mockOrderData: Record<string, any> = {
  "ORD-2024-001": {
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
    description: "Create an engaging 45-second video explaining DeFi yield farming strategies for beginners.",
    deliverables: [
      "1x 45-second video",
      "Script approval",
      "2 rounds of revisions",
      "Final video in 4K",
    ],
    timeline: [
      { date: "2024-01-15", event: "Order Created", status: "completed" },
      { date: "2024-01-16", event: "Payment Confirmed", status: "completed" },
      { date: "2024-01-18", event: "Script Submitted", status: "completed" },
      { date: "2024-01-22", event: "Script Approved", status: "completed" },
      { date: "2024-01-25", event: "Filming in Progress", status: "in_progress" },
      { date: "2024-01-30", event: "Draft Review", status: "pending" },
      { date: "2024-02-01", event: "Final Delivery", status: "pending" },
    ],
  },
};

// 模拟聊天消息
const mockMessages = [
  {
    id: "1",
    sender: "kol",
    content: "Hi! Thanks for booking my service. I've received your brief and it looks great. I'll start working on the script tomorrow.",
    timestamp: "2024-01-15 14:30",
    attachments: [],
  },
  {
    id: "2",
    sender: "user",
    content: "That's wonderful! Looking forward to seeing the script. Please make sure to emphasize the security aspects of DeFi.",
    timestamp: "2024-01-15 15:45",
    attachments: [],
  },
  {
    id: "3",
    sender: "kol",
    content: "Absolutely! I've attached the first draft of the script for your review.",
    timestamp: "2024-01-18 10:20",
    attachments: [
      { name: "DeFi_Script_v1.pdf", type: "pdf", size: "245 KB" },
    ],
  },
  {
    id: "4",
    sender: "user",
    content: "Looks great! Just a few minor tweaks needed on page 2. Can you adjust the intro section?",
    timestamp: "2024-01-19 09:15",
    attachments: [],
  },
  {
    id: "5",
    sender: "kol",
    content: "Done! Here's the updated version. Please let me know if this works better.",
    timestamp: "2024-01-20 16:40",
    attachments: [
      { name: "DeFi_Script_v2.pdf", type: "pdf", size: "248 KB" },
    ],
  },
  {
    id: "6",
    sender: "user",
    content: "Perfect! Approved. Looking forward to the video.",
    timestamp: "2024-01-22 11:00",
    attachments: [],
  },
  {
    id: "7",
    sender: "kol",
    content: "Great! I'm starting the filming today. Will send you a draft by early next week.",
    timestamp: "2024-01-25 08:30",
    attachments: [],
  },
];

export default function OrderDetail() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState(mockMessages);
  const [newMessage, setNewMessage] = useState("");

  const order = mockOrderData[orderId];

  // 自动滚动到最新消息
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 发送消息
  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    const message = {
      id: Date.now().toString(),
      sender: "user",
      content: newMessage,
      timestamp: new Date().toLocaleString("en-US", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      }),
      attachments: [],
    };

    setMessages([...messages, message]);
    setNewMessage("");
  };

  if (!order) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <AlertCircle className="h-16 w-16 text-gray-400 mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Not Found</h2>
        <p className="text-gray-600 mb-4">The order you're looking for doesn't exist.</p>
        <Button onClick={() => router.push("/kol/orders")}>Back to Orders</Button>
      </div>
    );
  }

  // 状态配置
  const statusConfig: Record<string, { label: string; className: string; icon: any }> = {
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

  const StatusIcon = statusConfig[order.status].icon;

  return (
    <div className="h-full">
      {/* 主要内容区 - 左右布局 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
        {/* 左侧：聊天区域 */}
        <div className="lg:col-span-2">
          <Card className="border-0 shadow-sm h-[calc(100vh-6rem)] flex flex-col">
            <CardHeader className="border-b">
              <CardTitle className="flex items-center gap-2">
                <div className={getIconContainer("small", "blue")}>
                  <User className="h-4 w-4 text-white" />
                </div>
                Messages with {order.kol.name}
              </CardTitle>
            </CardHeader>

            {/* 消息列表 */}
            <CardContent className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div className={`max-w-[70%] ${message.sender === "user" ? "order-2" : "order-1"}`}>
                    <div
                      className={`rounded-2xl px-4 py-3 ${
                        message.sender === "user"
                          ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white"
                          : "bg-gray-100 text-gray-900"
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                      
                      {/* 附件 */}
                      {message.attachments.length > 0 && (
                        <div className="mt-2 space-y-2">
                          {message.attachments.map((attachment, idx) => (
                            <div
                              key={idx}
                              className={`flex items-center gap-2 p-2 rounded-lg ${
                                message.sender === "user"
                                  ? "bg-white/20"
                                  : "bg-white"
                              }`}
                            >
                              <File className="h-4 w-4" />
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-medium truncate">{attachment.name}</p>
                                <p className="text-xs opacity-70">{attachment.size}</p>
                              </div>
                              <Download className="h-4 w-4 cursor-pointer" />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <p className={`text-xs text-gray-500 mt-1 ${message.sender === "user" ? "text-right" : "text-left"}`}>
                      {message.timestamp}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </CardContent>

            {/* 消息输入框 */}
            <div className="border-t p-4">
              <div className="flex gap-2">
                <Button variant="outline" size="icon" className="rounded-xl shrink-0">
                  <Paperclip className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" className="rounded-xl shrink-0">
                  <ImageIcon className="h-4 w-4" />
                </Button>
                <Input
                  placeholder="Type your message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                  className="flex-1 rounded-xl"
                />
                <Button
                  onClick={handleSendMessage}
                  className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white border-0 rounded-xl"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>
        </div>

        {/* 右侧：订单信息 */}
        <div className="space-y-6">
          {/* KOL 信息 */}
          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex flex-col items-center text-center">
                <Avatar className="h-20 w-20 border-4 border-gray-200 mb-3">
                  <AvatarImage
                    src={`https://randomuser.me/api/portraits/men/${order.kol.id}.jpg`}
                    alt={order.kol.name}
                  />
                  <AvatarFallback className="bg-gradient-to-br from-blue-600 to-blue-700 text-white text-2xl font-semibold">
                    {order.kol.avatar}
                  </AvatarFallback>
                </Avatar>
                <h2 className="text-xl font-bold text-gray-900 mb-1">{order.kol.name}</h2>
                <p className="text-sm text-gray-600 mb-3">{order.service}</p>
                <Badge className={`${statusConfig[order.status].className} text-sm px-3 py-1`}>
                  <StatusIcon className="h-4 w-4 mr-1" />
                  {statusConfig[order.status].label}
                </Badge>
                <Separator className="my-4" />
                <p className="text-xs text-gray-500 w-full text-left">Order ID</p>
                <p className="text-sm font-medium text-gray-900 w-full text-left">{order.id}</p>
              </div>
            </CardContent>
          </Card>

          {/* 订单详情 */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Package className="h-5 w-5 text-purple-600" />
                Order Info
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">Price</span>
                  <span className="text-xl font-bold text-green-600">{order.price}</span>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">Created</span>
                  <span className="text-sm font-medium text-gray-900">{order.createdAt}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">Deadline</span>
                  <span className="text-sm font-medium text-gray-900">{order.deadline}</span>
                </div>
                <Separator />
                <div>
                  <p className="text-xs text-gray-500 mb-2">Description</p>
                  <p className="text-sm text-gray-700 leading-relaxed">{order.description}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 交付物 */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">Deliverables</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {order.deliverables.map((item: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* 时间线 */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {order.timeline.map((item: any, idx: number) => (
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
                      <p className="text-xs text-gray-500">{item.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 操作按钮 */}
          <Card className="border-0 shadow-sm bg-gradient-to-br from-gray-900 to-gray-800 text-white">
            <CardContent className="p-6 space-y-3">
              <Button
                variant="outline"
                className="w-full bg-white text-gray-900 hover:bg-gray-100 rounded-xl"
              >
                Request Revision
              </Button>
              <Button
                variant="outline"
                className="w-full bg-white/10 text-white hover:bg-white/20 rounded-xl border-white/20"
              >
                Cancel Order
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

