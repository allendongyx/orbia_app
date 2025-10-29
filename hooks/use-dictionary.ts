import { useMemo } from 'react';
import { useDictionaryCache } from '@/contexts/dictionary-context';

/**
 * 批量获取字典项名称的 Hook
 * @param dictionaryCode 字典编码
 * @param codes 字典项编码列表
 * @returns 字典项编码到名称的映射和加载状态
 */
export function useDictionaryNames(
  dictionaryCode: string,
  codes: string[]
): { names: Record<string, string>; loading: boolean } {
  const { getDictionaryItems, loading } = useDictionaryCache();

  const names = useMemo(() => {
    if (loading || codes.length === 0) {
      return {};
    }
    return getDictionaryItems(dictionaryCode, codes);
  }, [dictionaryCode, codes.join(','), loading, getDictionaryItems]);

  return { names, loading };
}

/**
 * 获取单个字典项名称的 Hook
 * @param dictionaryCode 字典编码
 * @param code 字典项编码
 * @returns 字典项名称和加载状态
 */
export function useDictionaryName(
  dictionaryCode: string,
  code: string
): { name: string; loading: boolean } {
  const { getDictionaryItem, loading } = useDictionaryCache();

  const name = useMemo(() => {
    if (loading || !code) {
      return code;
    }
    const item = getDictionaryItem(dictionaryCode, code);
    return item ? item.name : code;
  }, [dictionaryCode, code, loading, getDictionaryItem]);

  return { name, loading };
}

/**
 * 获取字典树形结构的 Hook
 * @param dictionaryCode 字典编码
 * @returns 字典项树形结构和加载状态
 */
export function useDictionaryTree(dictionaryCode: string) {
  const { getDictionaryTree, loading } = useDictionaryCache();

  const tree = useMemo(() => {
    if (loading) {
      return [];
    }
    return getDictionaryTree(dictionaryCode);
  }, [dictionaryCode, loading, getDictionaryTree]);

  return { tree, loading };
}

