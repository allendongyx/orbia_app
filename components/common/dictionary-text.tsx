"use client";

import React from 'react';
import { useDictionaryName } from '@/hooks/use-dictionary';

interface DictionaryTextProps {
  dictionaryCode: string;
  code: string;
  fallback?: string;
}

/**
 * 字典文本组件 - 根据字典编码显示字典项名称
 * @param dictionaryCode 字典编码（如 COUNTRY、LANGUAGE、KOL_PLAN_TYPE 等）
 * @param code 字典项编码
 * @param fallback 加载失败时的后备文本
 */
export function DictionaryText({ dictionaryCode, code, fallback }: DictionaryTextProps) {
  const { name, loading } = useDictionaryName(dictionaryCode, code);

  if (loading) {
    return <span className="text-gray-400">...</span>;
  }

  return <span>{name || fallback || code}</span>;
}

