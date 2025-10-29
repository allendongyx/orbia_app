"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { 
  getAllDictionariesWithItems, 
  DictionaryWithTree,
  DictionaryItemTreeNode,
} from '@/lib/api/dictionary';
import { isSuccessResponse } from '@/lib/api-client';

// 本地存储的键名
const DICTIONARY_CACHE_KEY = 'orbia_dictionary_cache';
const DICTIONARY_CACHE_TIMESTAMP_KEY = 'orbia_dictionary_cache_timestamp';

// 缓存有效期（24小时）
const CACHE_EXPIRY_MS = 24 * 60 * 60 * 1000;

// 字典缓存数据结构
export interface DictionaryCacheData {
  [dictionaryCode: string]: {
    id: number;
    name: string;
    items: {
      [code: string]: {
        id: number;
        name: string;
        description?: string;
        icon_url?: string;
        sort_order: number;
        level: number;
        parent_id: number;
      };
    };
    tree: DictionaryItemTreeNode[];
  };
}

interface DictionaryContextType {
  cache: DictionaryCacheData | null;
  loading: boolean;
  refreshCache: () => Promise<void>;
  getDictionaryItem: (dictionaryCode: string, code: string) => { name: string; icon_url?: string } | null;
  getDictionaryItems: (dictionaryCode: string, codes: string[]) => Record<string, string>;
  getDictionaryTree: (dictionaryCode: string) => DictionaryItemTreeNode[];
}

const DictionaryContext = createContext<DictionaryContextType | undefined>(undefined);

export function DictionaryProvider({ children }: { children: ReactNode }) {
  const [cache, setCache] = useState<DictionaryCacheData | null>(null);
  const [loading, setLoading] = useState(true);

  // 从 localStorage 加载缓存
  const loadCacheFromStorage = (): DictionaryCacheData | null => {
    if (typeof window === 'undefined') return null;

    try {
      const cachedData = localStorage.getItem(DICTIONARY_CACHE_KEY);
      const cachedTimestamp = localStorage.getItem(DICTIONARY_CACHE_TIMESTAMP_KEY);

      if (!cachedData || !cachedTimestamp) return null;

      const timestamp = parseInt(cachedTimestamp, 10);
      const now = Date.now();

      // 检查缓存是否过期
      if (now - timestamp > CACHE_EXPIRY_MS) {
        localStorage.removeItem(DICTIONARY_CACHE_KEY);
        localStorage.removeItem(DICTIONARY_CACHE_TIMESTAMP_KEY);
        return null;
      }

      return JSON.parse(cachedData);
    } catch (error) {
      console.error('Failed to load dictionary cache from localStorage:', error);
      return null;
    }
  };

  // 保存缓存到 localStorage
  const saveCacheToStorage = (data: DictionaryCacheData) => {
    if (typeof window === 'undefined') return;

    try {
      localStorage.setItem(DICTIONARY_CACHE_KEY, JSON.stringify(data));
      localStorage.setItem(DICTIONARY_CACHE_TIMESTAMP_KEY, Date.now().toString());
    } catch (error) {
      console.error('Failed to save dictionary cache to localStorage:', error);
    }
  };

  // 将树形结构展平为字典项映射
  const flattenTree = (tree: DictionaryItemTreeNode[]): Record<string, any> => {
    const items: Record<string, any> = {};

    const traverse = (nodes: DictionaryItemTreeNode[]) => {
      nodes.forEach((node) => {
        items[node.code] = {
          id: node.id,
          name: node.name,
          description: node.description,
          icon_url: node.icon_url,
          sort_order: node.sort_order,
          level: node.level,
          parent_id: 0, // 可以根据需要添加父级信息
        };

        if (node.children && node.children.length > 0) {
          traverse(node.children);
        }
      });
    };

    traverse(tree);
    return items;
  };

  // 从服务器加载所有字典数据
  const loadAllDictionaries = async (): Promise<DictionaryCacheData | null> => {
    try {
      const allDictionaries: DictionaryWithTree[] = [];
      let currentPage = 1;
      let hasMore = true;

      // 分页加载所有字典
      while (hasMore) {
        const result = await getAllDictionariesWithItems({
          page: currentPage,
          page_size: 20,
        });

        if (!isSuccessResponse(result.base_resp) || !result.dictionaries) {
          break;
        }

        allDictionaries.push(...result.dictionaries);

        // 检查是否还有更多数据
        if (result.page_info && result.page_info.total_pages > currentPage) {
          currentPage++;
        } else {
          hasMore = false;
        }
      }

      // 构建缓存数据结构
      const cacheData: DictionaryCacheData = {};

      allDictionaries.forEach((dict) => {
        const items = flattenTree(dict.tree);
        cacheData[dict.dictionary.code] = {
          id: dict.dictionary.id,
          name: dict.dictionary.name,
          items,
          tree: dict.tree,
        };
      });

      return cacheData;
    } catch (error) {
      console.error('Failed to load dictionaries from server:', error);
      return null;
    }
  };

  // 刷新缓存
  const refreshCache = async () => {
    setLoading(true);
    const newCache = await loadAllDictionaries();
    if (newCache) {
      setCache(newCache);
      saveCacheToStorage(newCache);
    }
    setLoading(false);
  };

  // 初始化：尝试从本地加载，如果没有则从服务器加载
  useEffect(() => {
    const initCache = async () => {
      // 先尝试从 localStorage 加载
      const localCache = loadCacheFromStorage();

      if (localCache) {
        // 有本地缓存，直接使用
        setCache(localCache);
        setLoading(false);
      } else {
        // 没有本地缓存，从服务器加载
        await refreshCache();
      }
    };

    initCache();
  }, []);

  // 获取单个字典项
  const getDictionaryItem = (dictionaryCode: string, code: string) => {
    if (!cache || !cache[dictionaryCode]) return null;
    const item = cache[dictionaryCode].items[code];
    return item ? { name: item.name, icon_url: item.icon_url } : null;
  };

  // 批量获取字典项名称
  const getDictionaryItems = (dictionaryCode: string, codes: string[]): Record<string, string> => {
    const result: Record<string, string> = {};
    
    if (!cache || !cache[dictionaryCode]) {
      // 如果没有缓存，返回原编码
      codes.forEach(code => {
        result[code] = code;
      });
      return result;
    }

    codes.forEach((code) => {
      const item = cache[dictionaryCode].items[code];
      result[code] = item ? item.name : code;
    });

    return result;
  };

  // 获取字典树
  const getDictionaryTree = (dictionaryCode: string): DictionaryItemTreeNode[] => {
    if (!cache || !cache[dictionaryCode]) return [];
    return cache[dictionaryCode].tree || [];
  };

  return (
    <DictionaryContext.Provider
      value={{
        cache,
        loading,
        refreshCache,
        getDictionaryItem,
        getDictionaryItems,
        getDictionaryTree,
      }}
    >
      {children}
    </DictionaryContext.Provider>
  );
}

// 使用字典缓存的 Hook
export function useDictionaryCache() {
  const context = useContext(DictionaryContext);
  if (!context) {
    throw new Error('useDictionaryCache must be used within a DictionaryProvider');
  }
  return context;
}

