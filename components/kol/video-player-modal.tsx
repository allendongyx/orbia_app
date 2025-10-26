"use client";

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { TikTokEmbed } from './tiktok-embed';
import { Badge } from '@/components/ui/badge';
import { Calendar } from 'lucide-react';

interface VideoPlayerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  embedCode: string;
  createdAt?: string;
}

/**
 * 视频播放模态框组件
 * 用于在弹窗中播放 TikTok 视频（简化版，不限制宽高）
 */
export function VideoPlayerModal({
  open,
  onOpenChange,
  embedCode,
  createdAt,
}: VideoPlayerModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-fit max-h-[90vh] overflow-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>TikTok 视频</DialogTitle>
            {createdAt && (
              <Badge variant="secondary" className="gap-1">
                <Calendar className="h-3 w-3" />
                {new Date(createdAt).toLocaleDateString('zh-CN', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })}
              </Badge>
            )}
          </div>
        </DialogHeader>

        {/* 视频容器 - 让 TikTok 自己处理大小 */}
        <div className="flex items-center justify-center">
          <TikTokEmbed embedCode={embedCode} />
        </div>
      </DialogContent>
    </Dialog>
  );
}

