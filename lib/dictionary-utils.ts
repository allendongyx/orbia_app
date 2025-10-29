/**
 * 字典工具函数
 * 
 * 使用方法：
 * 1. 从 DictionaryProvider 获取缓存数据
 * 2. 使用 getDictionaryName/getDictionaryNames 同步获取字典项名称
 * 3. 使用 DictionaryText 组件展示字典项
 * 4. 使用 useDictionaryName/useDictionaryNames Hook 在组件中使用
 * 
 * 注意：所有字典数据在应用启动时已加载到 localStorage，无需网络请求
 */

// 本地存储的键名
const DICTIONARY_CACHE_KEY = 'orbia_dictionary_cache';

/**
 * 从 localStorage 获取字典缓存
 */
function getDictionaryCacheFromStorage() {
  if (typeof window === 'undefined') return null;
  
  try {
    const cachedData = localStorage.getItem(DICTIONARY_CACHE_KEY);
    return cachedData ? JSON.parse(cachedData) : null;
  } catch (error) {
    console.error('Failed to load dictionary cache from localStorage:', error);
    return null;
  }
}

/**
 * 批量获取字典项名称（同步方法，从缓存读取）
 * @param dictionaryCode 字典编码
 * @param codes 字典项编码列表
 * @returns 字典项编码到名称的映射
 */
export function getDictionaryNames(
  dictionaryCode: string,
  codes: string[]
): Record<string, string> {
  const result: Record<string, string> = {};
  
  if (codes.length === 0) {
    return result;
  }

  const cache = getDictionaryCacheFromStorage();
  
  if (!cache || !cache[dictionaryCode]) {
    // 如果没有缓存，返回原编码
    codes.forEach(code => {
      result[code] = code;
    });
    return result;
  }

  codes.forEach((code) => {
    const item = cache[dictionaryCode].items[code];
    result[code] = item ? item.name : code; // 如果找不到，返回原编码
  });

  return result;
}

/**
 * 获取单个字典项名称（同步方法，从缓存读取）
 * @param dictionaryCode 字典编码
 * @param code 字典项编码
 * @returns 字典项名称
 */
export function getDictionaryName(
  dictionaryCode: string,
  code: string
): string {
  const result = getDictionaryNames(dictionaryCode, [code]);
  return result[code] || code;
}

/**
 * 获取字典项详细信息（包括图标等）
 * @param dictionaryCode 字典编码
 * @param code 字典项编码
 * @returns 字典项信息
 */
export function getDictionaryItem(
  dictionaryCode: string,
  code: string
): { name: string; icon_url?: string } | null {
  const cache = getDictionaryCacheFromStorage();
  
  if (!cache || !cache[dictionaryCode]) {
    return null;
  }

  const item = cache[dictionaryCode].items[code];
  return item ? { name: item.name, icon_url: item.icon_url } : null;
}

/**
 * 获取字典树形结构
 * @param dictionaryCode 字典编码
 * @returns 字典项树形结构
 */
export function getDictionaryTree(dictionaryCode: string) {
  const cache = getDictionaryCacheFromStorage();
  
  if (!cache || !cache[dictionaryCode]) {
    return [];
  }

  return cache[dictionaryCode].tree || [];
}

/**
 * 清除字典缓存（仅清除 localStorage）
 */
export function clearDictionaryCache() {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.removeItem(DICTIONARY_CACHE_KEY);
    localStorage.removeItem('orbia_dictionary_cache_timestamp');
  } catch (error) {
    console.error('Failed to clear dictionary cache:', error);
  }
}

