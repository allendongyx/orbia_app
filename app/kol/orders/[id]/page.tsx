"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  AlertCircle,
  CheckCircle2,
  Clock,
  XCircle,
  Calendar,
  DollarSign,
  Package,
  Send,
  Paperclip,
  Image as ImageIcon,
  File,
  Download,
  MessageSquare,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { getIconContainer } from "@/lib/design-system";
import {
  getKolOrder, 
  KolOrderInfo,
  cancelKolOrder,
  confirmKolOrderPayment,
  updateKolOrderStatus,
} from "@/lib/api/kol-order";
import { getWalletInfo, WalletInfo } from "@/lib/api/wallet";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  getConversation,
  getMessages,
  sendMessage,
  markRead,
  Message,
  Conversation,
} from "@/lib/api/conversation";
import { uploadToR2 } from "@/lib/r2-upload";
import { isSuccessResponse } from "@/lib/api-client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/auth-context";

type OrderStatus = "pending_payment" | "pending" | "confirmed" | "in_progress" | "completed" | "cancelled" | "refunded";

const POLLING_INTERVAL = 5000; // 5秒轮询一次
const MESSAGE_LIMIT = 15; // 每次加载15条消息

export default function OrderDetail() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;
  const { toast } = useToast();
  const { user } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isFirstLoadRef = useRef<boolean>(true);

  const [order, setOrder] = useState<KolOrderInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  // 支付相关状态
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [walletInfo, setWalletInfo] = useState<WalletInfo | null>(null);
  const [loadingWallet, setLoadingWallet] = useState(false);
  const [paying, setPaying] = useState(false);
  
  // 操作相关状态
  const [cancelling, setCancelling] = useState(false);
  const [confirming, setConfirming] = useState(false);

  // 滚动到底部
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // 加载订单详情
  const loadOrderDetail = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getKolOrder({ order_id: orderId });
      
      if (isSuccessResponse(result.base_resp) && result.order) {
        setOrder(result.order);
        
        // 如果订单包含 conversation_id，则直接获取会话详情
        if (result.order.conversation_id) {
          try {
            const convResult = await getConversation({ conversation_id: result.order.conversation_id });
            if (isSuccessResponse(convResult.base_resp) && convResult.conversation) {
              setConversation(convResult.conversation);
            }
          } catch (err) {
            console.error("Failed to load conversation:", err);
          }
        }
      } else {
        toast({
          title: "加载失败",
          description: result.base_resp.status_msg || "加载订单详情失败",
          variant: "error",
        });
      }
    } catch (err) {
      console.error("Failed to load order detail:", err);
      toast({
        title: "错误",
        description: "加载订单详情失败",
        variant: "error",
      });
    } finally {
      setLoading(false);
    }
  }, [orderId, toast]);

  // 加载钱包信息
  const loadWalletInfo = async () => {
    setLoadingWallet(true);
    try {
      const result = await getWalletInfo();
      if (isSuccessResponse(result.base_resp) && result.wallet) {
        setWalletInfo(result.wallet);
      } else {
        toast({
          title: "加载失败",
          description: result.base_resp.status_msg || "加载钱包信息失败",
          variant: "error",
        });
      }
    } catch (err) {
      console.error("Failed to load wallet info:", err);
      toast({
        title: "错误",
        description: "加载钱包信息失败",
        variant: "error",
      });
    } finally {
      setLoadingWallet(false);
    }
  };

  // 取消订单
  const handleCancelOrder = async () => {
    if (!order) return;
    
    const reason = window.prompt("请输入取消原因：");
    if (!reason) return;
    
    setCancelling(true);
    try {
      const result = await cancelKolOrder({
        order_id: order.order_id,
        reason,
      });
      
      if (isSuccessResponse(result.base_resp)) {
        toast({
          title: "成功",
          description: "订单已取消",
        });
        await loadOrderDetail();
      } else {
        toast({
          title: "取消失败",
          description: result.base_resp.status_msg || "取消订单失败",
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

  // 打开支付对话框
  const handleOpenPayment = async () => {
    setShowPaymentDialog(true);
    await loadWalletInfo();
  };

  // 确认支付
  const handleConfirmPayment = async () => {
    if (!order || !walletInfo) return;
    
    const orderAmount = parseFloat(order.plan_price.toString());
    const walletBalance = parseFloat(walletInfo.balance);
    
    if (walletBalance < orderAmount) {
      toast({
        title: "余额不足",
        description: "您的钱包余额不足，请先充值",
        variant: "error",
      });
      return;
    }
    
    setPaying(true);
    try {
      const result = await confirmKolOrderPayment({
        order_id: order.order_id,
      });
      
      if (isSuccessResponse(result.base_resp)) {
        toast({
          title: "支付成功",
          description: "订单已支付，等待KOL确认",
        });
        setShowPaymentDialog(false);
        await loadOrderDetail();
      } else {
        toast({
          title: "支付失败",
          description: result.base_resp.status_msg || "支付失败",
          variant: "error",
        });
      }
    } catch (err) {
      console.error("Failed to confirm payment:", err);
      toast({
        title: "错误",
        description: "支付失败",
        variant: "error",
      });
    } finally {
      setPaying(false);
    }
  };

  // KOL确认订单
  const handleConfirmOrder = async () => {
    if (!order) return;
    
    setConfirming(true);
    try {
      const result = await updateKolOrderStatus({
        order_id: order.order_id,
        status: 'confirmed',
      });
      
      if (isSuccessResponse(result.base_resp)) {
        toast({
          title: "成功",
          description: "订单已确认",
        });
        await loadOrderDetail();
      } else {
        toast({
          title: "确认失败",
          description: result.base_resp.status_msg || "确认订单失败",
          variant: "error",
        });
      }
    } catch (err) {
      console.error("Failed to confirm order:", err);
      toast({
        title: "错误",
        description: "确认订单失败",
        variant: "error",
      });
    } finally {
      setConfirming(false);
    }
  };

  // KOL开始制作
  const handleStartOrder = async () => {
    if (!order) return;
    
    setConfirming(true);
    try {
      const result = await updateKolOrderStatus({
        order_id: order.order_id,
        status: 'in_progress',
      });
      
      if (isSuccessResponse(result.base_resp)) {
        toast({
          title: "成功",
          description: "开始制作",
        });
        await loadOrderDetail();
      } else {
        toast({
          title: "操作失败",
          description: result.base_resp.status_msg || "开始制作失败",
          variant: "error",
        });
      }
    } catch (err) {
      console.error("Failed to start order:", err);
      toast({
        title: "错误",
        description: "开始制作失败",
        variant: "error",
      });
    } finally {
      setConfirming(false);
    }
  };

  // 加载消息列表
  const loadMessages = useCallback(async (conversationId: string, beforeTimestamp?: number, append = false) => {
    if (!append) {
      setMessagesLoading(true);
    } else {
      setLoadingMore(true);
    }
    
    try {
      const result = await getMessages({
        conversation_id: conversationId,
        before_timestamp: beforeTimestamp,
        limit: MESSAGE_LIMIT,
      });
      
      if (isSuccessResponse(result.base_resp)) {
        const newMessages = result.messages || [];
        setHasMore(result.has_more);
        
        if (append) {
          // 向上翻页，添加到列表前面
          setMessages(prev => [...newMessages, ...prev]);
        } else {
          // 首次加载或刷新，替换列表
          setMessages(newMessages);
          // 首次加载后滚动到底部
          if (isFirstLoadRef.current && newMessages.length > 0) {
            isFirstLoadRef.current = false;
            setTimeout(() => {
              scrollToBottom();
            }, 100);
          }
        }
      }
    } catch (err) {
      console.error("Failed to load messages:", err);
    } finally {
      setMessagesLoading(false);
      setLoadingMore(false);
    }
  }, []);

  // 加载更多历史消息
  const loadMoreMessages = useCallback(async () => {
    if (!conversation || !conversation.conversation_id || !hasMore || loadingMore || messages.length === 0) return;
    
    const oldestMessage = messages[0];
    const scrollHeight = messagesContainerRef.current?.scrollHeight || 0;
    
    await loadMessages(conversation.conversation_id, oldestMessage.created_at, true);
    
    // 保持滚动位置
    requestAnimationFrame(() => {
      if (messagesContainerRef.current) {
        const newScrollHeight = messagesContainerRef.current.scrollHeight;
        messagesContainerRef.current.scrollTop = newScrollHeight - scrollHeight;
      }
    });
  }, [conversation, hasMore, loadingMore, messages, loadMessages]);

  // 轮询获取新消息
  const pollNewMessages = useCallback(async () => {
    if (!conversation || !conversation.conversation_id || messages.length === 0) return;
    
    try {
      const result = await getMessages({
        conversation_id: conversation.conversation_id,
        limit: MESSAGE_LIMIT,
      });
      
      if (isSuccessResponse(result.base_resp) && result.messages) {
        const latestMessage = messages[messages.length - 1];
        const newMessages = result.messages.filter(msg => msg.created_at > latestMessage.created_at);
        
        if (newMessages.length > 0) {
          setMessages(prev => [...prev, ...newMessages]);
          // 新消息到达时滚动到底部
          setTimeout(scrollToBottom, 100);
        }
      }
    } catch (err) {
      console.error("Failed to poll messages:", err);
    }
  }, [conversation, messages]);

  // 初始化加载
  useEffect(() => {
    if (orderId) {
      loadOrderDetail();
    }
  }, [orderId, loadOrderDetail]);

  // 当会话信息加载完成后，加载消息列表
  useEffect(() => {
    if (conversation && conversation.conversation_id) {
      loadMessages(conversation.conversation_id);
      // 标记已读
      markRead({ conversation_id: conversation.conversation_id }).catch(err => {
        console.error("Failed to mark read:", err);
      });
    }
  }, [conversation, loadMessages]);

  // 启动轮询
  useEffect(() => {
    if (conversation && messages.length > 0) {
      pollingIntervalRef.current = setInterval(pollNewMessages, POLLING_INTERVAL);
      
      return () => {
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current);
        }
      };
    }
  }, [conversation, messages.length, pollNewMessages]);

  // 处理滚动事件，检测是否需要加载更多
  const handleScroll = useCallback(() => {
    if (!messagesContainerRef.current || loadingMore || !hasMore) return;
    
    const { scrollTop } = messagesContainerRef.current;
    
    // 滚动到顶部时加载更多
    if (scrollTop < 100) {
      loadMoreMessages();
    }
  }, [loadingMore, hasMore, loadMoreMessages]);

  // 发送文本消息
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !conversation || !conversation.conversation_id) {
      console.error("Cannot send message: missing conversation_id", { conversation });
      return;
    }
    
    setSending(true);
    try {
      const result = await sendMessage({
        conversation_id: conversation.conversation_id,
        message_type: 'text',
        content: newMessage,
      });

      if (isSuccessResponse(result.base_resp) && result.message) {
        setMessages([...messages, result.message]);
        setNewMessage("");
        setTimeout(scrollToBottom, 100);
      } else {
        toast({
          title: "发送失败",
          description: result.base_resp.status_msg || "发送消息失败",
          variant: "error",
        });
      }
    } catch (err) {
      console.error("Failed to send message:", err);
      toast({
        title: "错误",
        description: "发送消息失败",
        variant: "error",
      });
    } finally {
      setSending(false);
    }
  };

  // 上传并发送文件
  const handleFileUpload = async (file: File, messageType: 'image' | 'file') => {
    if (!conversation || !conversation.conversation_id) {
      console.error("Cannot upload file: missing conversation_id", { conversation });
      toast({
        title: "错误",
        description: "会话信息缺失，请刷新页面重试",
        variant: "error",
      });
      return;
    }
    
    setUploading(true);
    try {
      // 上传到 R2
      const uploadUrl = await uploadToR2(file);

      // 发送消息
      const result = await sendMessage({
        conversation_id: conversation.conversation_id,
        message_type: messageType,
        content: uploadUrl,
        file_name: file.name,
        file_size: file.size,
        file_type: file.type,
      });

      if (isSuccessResponse(result.base_resp) && result.message) {
        setMessages([...messages, result.message]);
        setTimeout(scrollToBottom, 100);
        toast({
          title: "发送成功",
          description: `${messageType === 'image' ? '图片' : '文件'}已发送`,
        });
      } else {
        throw new Error(result.base_resp.status_msg || '发送失败');
      }
    } catch (err) {
      console.error("Failed to upload file:", err);
      toast({
        title: "上传失败",
        description: err instanceof Error ? err.message : "上传文件失败",
        variant: "error",
      });
    } finally {
      setUploading(false);
      // 重置 input 值以允许重复上传同一文件
      if (imageInputRef.current) imageInputRef.current.value = '';
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // 处理图片选择
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file, 'image');
    }
    e.target.value = ''; // 重置 input
  };

  // 处理文件选择
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file, 'file');
    }
    e.target.value = ''; // 重置 input
  };

  // 格式化时间
  const formatMessageTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      return date.toLocaleTimeString("zh-CN", {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else if (days === 1) {
      return "昨天 " + date.toLocaleTimeString("zh-CN", {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else {
      return date.toLocaleDateString("zh-CN", {
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      });
    }
  };

  // 格式化文件大小
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  // 渲染消息内容
  const renderMessageContent = (message: Message, isCurrentUser: boolean) => {
    switch (message.message_type) {
      case 'text':
        return <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>;
      
      case 'image':
        return (
          <div className="space-y-2">
            {message.content && (
              <img 
                src={message.content} 
                alt="图片消息" 
                className="max-w-full rounded-lg cursor-pointer hover:opacity-90"
                onClick={() => window.open(message.content, '_blank')}
              />
            )}
            {message.file_name && (
              <p className="text-xs opacity-70">{message.file_name}</p>
            )}
          </div>
        );
      
      case 'file':
      case 'video':
      case 'audio':
        return (
          <a
            href={message.content}
            download={message.file_name}
            target="_blank"
            rel="noopener noreferrer"
            className={`flex items-center gap-2 p-2 rounded-lg ${
              isCurrentUser ? "bg-white/20 hover:bg-white/30" : "bg-white hover:bg-gray-50"
            } transition-colors`}
          >
            <File className="h-4 w-4 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium truncate">{message.file_name || '文件'}</p>
              {message.file_size && (
                <p className="text-xs opacity-70">{formatFileSize(message.file_size)}</p>
              )}
            </div>
            <Download className="h-4 w-4 shrink-0" />
          </a>
        );
      
      case 'system':
        return (
          <p className="text-xs text-center opacity-70 italic">{message.content}</p>
        );
      
      default:
        return <p className="text-sm">{message.content}</p>;
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
    <div className="h-full flex flex-col">
      {/* 隐藏的文件输入 */}
      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleImageSelect}
      />
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        onChange={handleFileSelect}
      />

      {/* 返回按钮和标题 */}
      <div className="mb-6 space-y-4">
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
        <div className="flex items-center gap-3">
          <Badge className={`${statusConfig[order.status].className} text-base px-4 py-2`}>
            <StatusIcon className="h-5 w-5 mr-2" />
            {statusConfig[order.status].label}
          </Badge>
          
          {/* 操作按钮 */}
          {user && (
            <>
              {/* 用户操作 - 待支付状态 */}
              {user.id === order.user_id && order.status === "pending_payment" && (
                <>
                  <Button
                    onClick={handleOpenPayment}
                    className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white"
                    size="lg"
                  >
                    <DollarSign className="h-5 w-5 mr-2" />
                    去支付
                  </Button>
                  <Button
                    onClick={handleCancelOrder}
                    variant="outline"
                    size="lg"
                    disabled={cancelling}
                  >
                    {cancelling ? (
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    ) : (
                      <XCircle className="h-5 w-5 mr-2" />
                    )}
                    取消订单
                  </Button>
                </>
              )}

              {/* KOL操作 - 待确认状态 */}
              {(() => {
                const isKol = user.kol_id && Number(user.kol_id) === Number(order.kol_id);
                console.log('KOL按钮条件检查:', {
                  userId: user.id,
                  userKolId: user.kol_id,
                  orderKolId: order.kol_id,
                  isKol,
                  orderStatus: order.status
                });
                return isKol;
              })() && (
                <>
                  {order.status === "pending" && (
                    <Button
                      onClick={handleConfirmOrder}
                      className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white"
                      size="lg"
                      disabled={confirming}
                    >
                      {confirming ? (
                        <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                      ) : (
                        <CheckCircle2 className="h-5 w-5 mr-2" />
                      )}
                      确认接单
                    </Button>
                  )}
                  
                  {order.status === "confirmed" && (
                    <Button
                      onClick={handleStartOrder}
                      className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white"
                      size="lg"
                      disabled={confirming}
                    >
                      {confirming ? (
                        <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                      ) : (
                        <CheckCircle2 className="h-5 w-5 mr-2" />
                      )}
                      开始制作
                    </Button>
                  )}
                </>
              )}
            </>
          )}
        </div>
      </div>
      </div>

      {/* 主要内容区 - 左右布局 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
        {/* 左侧：聊天区域 */}
        <div className="lg:col-span-2 flex flex-col min-h-0">
          <Card className="border-0 shadow-sm flex-1 flex flex-col min-h-0">
            <CardHeader className="border-b flex-none">
              <CardTitle className="flex items-center gap-2">
                <div className={getIconContainer("small", "blue")}>
                  <MessageSquare className="h-4 w-4 text-white" />
                </div>
                与 {order.kol_display_name} 的对话
              </CardTitle>
            </CardHeader>

            {/* 消息列表 */}
            <CardContent 
              ref={messagesContainerRef}
              className="flex-1 overflow-y-auto p-6 space-y-4 min-h-0"
              onScroll={handleScroll}
            >
              {!conversation ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-500">
                  <MessageSquare className="h-12 w-12 mb-2 opacity-50" />
                  <p>会话尚未创建</p>
                  <p className="text-sm">订单确认后会自动创建会话</p>
                </div>
              ) : messagesLoading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
              ) : (
                <>
                  {/* 加载更多按钮 */}
                  {hasMore && (
                    <div className="flex justify-center py-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={loadMoreMessages}
                        disabled={loadingMore}
                        className="text-xs text-gray-500"
                      >
                        {loadingMore ? (
                          <>
                            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                            加载中...
                          </>
                        ) : (
                          '加载更多消息'
                        )}
                      </Button>
                    </div>
                  )}

                  {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-gray-500">
                      <MessageSquare className="h-12 w-12 mb-2 opacity-50" />
                      <p>暂无消息</p>
                      <p className="text-sm">开始与 KOL 交流吧</p>
                    </div>
                  ) : (
                    <>
                      {messages.map((message) => {
                        const isCurrentUser = !!(user && message.sender_id === user.id);
                        const isSystemMessage = message.message_type === 'system';

                        if (isSystemMessage) {
                          return (
                            <div key={message.message_id} className="flex justify-center">
                              <div className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                                {message.content}
                              </div>
                            </div>
                          );
                        }

                        return (
                          <div
                            key={message.message_id}
                            className={`flex ${isCurrentUser ? "justify-start" : "justify-end"}`}
                          >
                            <div className={`flex gap-2 max-w-[70%] ${isCurrentUser ? "flex-row" : "flex-row-reverse"}`}>
                              {/* 头像 */}
                              <Avatar className="h-8 w-8 shrink-0">
                                <AvatarImage src={message.sender_avatar_url} />
                                <AvatarFallback className="text-xs">
                                  {message.sender_nickname.slice(0, 2)}
                                </AvatarFallback>
                              </Avatar>

                              {/* 消息内容 */}
                              <div className="flex flex-col gap-1">
                                <div
                                  className={`rounded-2xl px-4 py-3 ${
                                    isCurrentUser
                                      ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white"
                                      : "bg-gray-100 text-gray-900"
                                  }`}
                                >
                                  {renderMessageContent(message, isCurrentUser)}
                                </div>
                                <p className={`text-xs text-gray-500 ${isCurrentUser ? "text-left" : "text-right"}`}>
                                  {formatMessageTime(message.created_at)}
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                      <div ref={messagesEndRef} />
                    </>
                  )}
                </>
              )}
            </CardContent>

            {/* 消息输入框 */}
            {conversation && (
              <div className="border-t p-4 flex-none">
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="rounded-xl shrink-0"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                  >
                    <Paperclip className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="rounded-xl shrink-0"
                    onClick={() => imageInputRef.current?.click()}
                    disabled={uploading}
                  >
                    <ImageIcon className="h-4 w-4" />
                  </Button>
                  <Input
                    placeholder={uploading ? "上传中..." : "输入消息..."}
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && !sending && !uploading && handleSendMessage()}
                    className="flex-1 rounded-xl"
                    disabled={sending || uploading}
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={sending || uploading || !newMessage.trim()}
                    className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white border-0 rounded-xl"
                  >
                    {sending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </div>

        {/* 右侧：KOL信息和订单信息 */}
        <div className="space-y-6 overflow-y-auto">
          {/* KOL 信息 */}
          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex flex-col items-center text-center">
                <Avatar className="h-20 w-20 border-4 border-gray-200 mb-3">
                  <AvatarImage src={order.kol_avatar_url} alt={order.kol_display_name} />
                  <AvatarFallback className="bg-gradient-to-br from-blue-600 to-blue-700 text-white text-2xl font-semibold">
                    {order.kol_display_name.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <h2 className="text-xl font-bold text-gray-900 mb-1">{order.kol_display_name}</h2>
                <p className="text-sm text-gray-600 mb-3">{order.plan_title}</p>
                <Badge className={`${statusConfig[order.status].className} text-sm px-3 py-1`}>
                  <StatusIcon className="h-4 w-4 mr-1" />
                  {statusConfig[order.status].label}
                </Badge>
                <Separator className="my-4" />
                <div className="w-full space-y-2 text-left">
                  <div className="flex justify-between">
                    <p className="text-xs text-gray-500">订单ID</p>
                    <p className="text-sm font-medium text-gray-900">{order.order_id}</p>
                  </div>
                  <div className="flex justify-between">
                    <p className="text-xs text-gray-500">服务方案</p>
                    <Badge variant="secondary">{order.plan_type}</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 订单信息 */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Package className="h-5 w-5 text-purple-600" />
                订单详情
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-xs text-gray-500 mb-1">订单标题</p>
                <p className="text-sm font-medium text-gray-900">{order.title}</p>
              </div>
              <Separator />
              <div>
                <p className="text-xs text-gray-500 mb-1">合作需求描述</p>
                <p className="text-sm text-gray-700 leading-relaxed">{order.requirement_description}</p>
              </div>
              <Separator />
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-gray-500 mb-1">视频类型</p>
                  <p className="text-sm font-medium text-gray-900">{order.video_type}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">预期时长</p>
                  <p className="text-sm font-medium text-gray-900">{order.video_duration}秒</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">目标受众</p>
                  <p className="text-sm font-medium text-gray-900">{order.target_audience}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">期望交付</p>
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
              <CardTitle className="text-base flex items-center gap-2">
                <Calendar className="h-5 w-5 text-orange-600" />
                订单进度
              </CardTitle>
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

          {/* 取消/拒绝原因 */}
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
      </div>

      {/* 支付确认对话框 */}
      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>确认支付</DialogTitle>
            <DialogDescription>
              请确认订单信息和支付金额
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {loadingWallet ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              </div>
            ) : walletInfo ? (
              <>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">钱包余额</span>
                    <span className="text-lg font-bold text-gray-900">
                      ${parseFloat(walletInfo.balance).toFixed(2)}
                    </span>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">订单金额</span>
                    <span className="text-lg font-bold text-blue-600">
                      ${order?.plan_price}
                    </span>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">支付后余额</span>
                    <span className="text-lg font-bold text-gray-900">
                      ${(parseFloat(walletInfo.balance) - parseFloat(order?.plan_price.toString() || "0")).toFixed(2)}
                    </span>
                  </div>
                </div>

                {parseFloat(walletInfo.balance) < parseFloat(order?.plan_price.toString() || "0") && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-red-900">余额不足</p>
                        <p className="text-sm text-red-700 mt-1">
                          您的钱包余额不足，请先充值后再进行支付
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center text-gray-500 py-4">
                加载钱包信息失败
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowPaymentDialog(false)}
              disabled={paying}
            >
              取消
            </Button>
            <Button
              onClick={handleConfirmPayment}
              disabled={paying || !walletInfo || parseFloat(walletInfo.balance) < parseFloat(order?.plan_price.toString() || "0")}
              className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white"
            >
              {paying ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  支付中...
                </>
              ) : (
                <>
                  <DollarSign className="h-4 w-4 mr-2" />
                  确认支付
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
