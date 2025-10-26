"use client";

import React, { useEffect, useRef } from 'react';

interface TikTokEmbedProps {
  embedCode: string;
  className?: string;
}

/**
 * TikTok 视频嵌入组件
 * 
 * 插入 blockquote 后重新加载 TikTok 脚本，让脚本自己检测和渲染
 * 
 * @param embedCode - 完整的 TikTok 嵌入代码（包括 blockquote 和 script）
 * @param className - 额外的 CSS 类名
 */
export function TikTokEmbed({ embedCode, className = '' }: TikTokEmbedProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!embedCode || !containerRef.current) return;

    console.log('TikTok: 开始加载视频');

    // 清空容器
    containerRef.current.innerHTML = '';

    // 从嵌入代码中提取 blockquote
    const match = embedCode.match(/<blockquote[\s\S]*?<\/blockquote>/i);
    if (!match) {
      console.error('TikTok: 无法提取 blockquote');
      return;
    }

    // 插入 blockquote
    containerRef.current.innerHTML = match[0];
    console.log('TikTok: blockquote 已插入');

    // 创建一个新的 script 标签来触发 TikTok 的自动检测
    // 这是让 TikTok 渲染的关键！
    const script = document.createElement('script');
    script.src = 'https://www.tiktok.com/embed.js';
    script.async = true;
    
    script.onload = () => {
      console.log('TikTok: 脚本加载完成');
    };
    
    script.onerror = () => {
      console.error('TikTok: 脚本加载失败');
    };

    // 将 script 插入到容器中，而不是 body
    containerRef.current.appendChild(script);

    // 清理函数
    return () => {
      // 移除这个特定的 script 标签
      if (containerRef.current && script.parentNode === containerRef.current) {
        containerRef.current.removeChild(script);
      }
    };
  }, [embedCode]);

  return (
    <div 
      ref={containerRef}
      className={className}
      style={{ minHeight: '500px' }}
    />
  );
}

/**
 * TikTok 视频预览组件（简化版）
 */
export function TikTokVideoPreview({ embedCode }: { embedCode: string }) {
  return (
    <div className="border rounded-lg p-4 bg-gray-50">
      <div className="text-sm font-medium text-gray-700 mb-3">预览</div>
      <TikTokEmbed embedCode={embedCode} />
    </div>
  );
}

