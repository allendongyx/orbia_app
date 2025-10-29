import { apiClient, BaseResp } from '../api-client';

// 消息类型
export type MessageType = 'text' | 'image' | 'file' | 'video' | 'audio' | 'system';

// 会话类型
export type ConversationType = 'kol_order' | 'ad_order' | 'general' | 'support';

// 会话状态
export type ConversationStatus = 'active' | 'archived' | 'closed';

// 消息状态
export type MessageStatus = 'sent' | 'delivered' | 'read' | 'failed';

// 消息接口
export interface Message {
  message_id: string;
  conversation_id: number;
  sender_id: number;
  sender_nickname: string;
  sender_avatar_url: string;
  message_type: MessageType;
  content: string;
  file_name?: string;
  file_size?: number;
  file_type?: string;
  status: MessageStatus;
  created_at: number; // 毫秒时间戳
}

// 会话成员
export interface ConversationMember {
  user_id: number;
  nickname: string;
  avatar_url: string;
  role: string;
  joined_at: string;
}

// 会话信息
export interface Conversation {
  conversation_id: string;
  title: string;
  type: ConversationType;
  related_order_type?: string;
  related_order_id?: string;
  status: ConversationStatus;
  last_message_at?: number;
  members: ConversationMember[];
  unread_count: number;
  created_at: string;
  last_message?: {
    message_id: string;
    sender_nickname: string;
    message_type: MessageType;
    content: string;
    created_at: number;
  };
}

// ============ 发送消息 ============
export interface SendMessageRequest {
  conversation_id: string;
  message_type: MessageType;
  content: string;
  file_name?: string;
  file_size?: number;
  file_type?: string;
}

export interface SendMessageResponse {
  message: Message;
  base_resp: BaseResp;
}

export async function sendMessage(params: SendMessageRequest): Promise<SendMessageResponse> {
  return apiClient.post<SendMessageResponse>('/api/v1/conversation/send_message', params);
}

// ============ 获取消息列表 ============
export interface GetMessagesRequest {
  conversation_id: string;
  before_timestamp?: number; // 毫秒时间戳，获取此时间之前的消息
  limit?: number; // 默认20
}

export interface GetMessagesResponse {
  messages: Message[];
  has_more: boolean;
  base_resp: BaseResp;
}

export async function getMessages(params: GetMessagesRequest): Promise<GetMessagesResponse> {
  return apiClient.post<GetMessagesResponse>('/api/v1/conversation/get_messages', params);
}

// ============ 获取会话详情 ============
export interface GetConversationRequest {
  conversation_id: string;
}

export interface GetConversationResponse {
  conversation: Conversation;
  base_resp: BaseResp;
}

export async function getConversation(params: GetConversationRequest): Promise<GetConversationResponse> {
  return apiClient.post<GetConversationResponse>('/api/v1/conversation/get_conversation', params);
}

// ============ 获取会话列表 ============
export interface GetConversationsRequest {
  type?: ConversationType;
  page?: number;
  page_size?: number;
}

export interface GetConversationsResponse {
  conversations: Conversation[];
  page_info: {
    page: number;
    page_size: number;
    total: number;
    total_pages: number;
  };
  base_resp: BaseResp;
}

export async function getConversations(params?: GetConversationsRequest): Promise<GetConversationsResponse> {
  return apiClient.post<GetConversationsResponse>('/api/v1/conversation/get_conversations', params || {});
}

// ============ 标记消息已读 ============
export interface MarkReadRequest {
  conversation_id: string;
}

export interface MarkReadResponse {
  base_resp: BaseResp;
}

export async function markRead(params: MarkReadRequest): Promise<MarkReadResponse> {
  return apiClient.post<MarkReadResponse>('/api/v1/conversation/mark_read', params);
}

