"use client";

import React from "react";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface TruncatedTextProps {
  text: string;
  maxLength?: number;
  className?: string;
  showTooltip?: boolean;
}

export function TruncatedText({ 
  text, 
  maxLength = 16, 
  className,
  showTooltip = true 
}: TruncatedTextProps) {
  const truncatedText = text.length > maxLength 
    ? `${text.slice(0, maxLength)}...` 
    : text;

  const handleClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "已复制",
        description: text,
        duration: 2000,
      });
    } catch (error) {
      toast({
        title: "复制失败",
        description: "请手动复制",
        variant: "error",
      });
    }
  };

  if (text.length <= maxLength) {
    return <span className={cn("font-mono text-xs", className)}>{text}</span>;
  }

  return (
    <span
      onClick={handleClick}
      className={cn(
        "font-mono text-xs cursor-pointer hover:text-blue-600 transition-colors",
        className
      )}
      title={showTooltip ? `点击复制: ${text}` : undefined}
    >
      {truncatedText}
    </span>
  );
}

