"use client";

import React, { useState, useMemo } from "react";
import { ChevronDown, Search, X, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { useDictionaryTree } from "@/hooks/use-dictionary";

interface LanguageSelectorDictProps {
  value?: string[];
  onChange?: (value: string[]) => void;
  placeholder?: string;
  multiple?: boolean; // 是否支持多选，默认 true
}

export default function LanguageSelectorDict({
  value = [],
  onChange,
  placeholder = "选择语言",
  multiple = true,
}: LanguageSelectorDictProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // 使用缓存加载字典数据
  const { tree: languages, loading } = useDictionaryTree("LANGUAGE");

  // 过滤语言
  const filteredLanguages = useMemo(() => {
    if (!searchQuery) return languages;
    
    const query = searchQuery.toLowerCase();
    return languages.filter(lang =>
      lang.name.toLowerCase().includes(query) ||
      (lang.code && lang.code.toLowerCase().includes(query))
    );
  }, [searchQuery, languages]);

  const handleSelect = (languageCode: string) => {
    if (!multiple) {
      // 单选模式：直接设置为选中的项
      const isSelected = value.includes(languageCode);
      if (isSelected) {
        // 如果已经选中，则取消选中
        onChange?.([]);
      } else {
        // 否则选中新项（替换之前的选中）
        onChange?.([languageCode]);
      }
      return;
    }

    // 多选模式：原有逻辑
    const newValue = [...value];
    const index = newValue.indexOf(languageCode);

    if (index > -1) {
      newValue.splice(index, 1);
    } else {
      newValue.push(languageCode);
    }
    
    onChange?.(newValue);
  };

  const getSelectedLabels = () => {
    return value.map(code => {
      const language = languages.find(l => l.code === code);
      return language ? { code, label: language.name } : null;
    }).filter(Boolean) as Array<{ code: string; label: string }>;
  };

  const removeSelection = (code: string) => {
    onChange?.(value.filter(v => v !== code));
  };

  return (
    <div className="relative">
      {/* 触发器 */}
      <div
        className="min-h-[38px] w-full border border-gray-200 rounded-md bg-white px-3 py-2 text-sm cursor-pointer hover:border-gray-300 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        {getSelectedLabels().length === 0 ? (
          <span className="text-muted-foreground">{placeholder}</span>
        ) : (
          <div className="flex flex-wrap gap-1.5">
            {getSelectedLabels().map(({ code, label }) => (
              <Badge
                key={code}
                variant="secondary"
                className="pl-2 pr-1.5 py-0.5 gap-1 text-xs"
                onClick={(e) => {
                  e.stopPropagation();
                }}
              >
                <span>{label}</span>
                <X
                  className="h-3 w-3 cursor-pointer hover:text-red-600"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeSelection(code);
                  }}
                />
              </Badge>
            ))}
          </div>
        )}
        <ChevronDown
          className={`absolute right-3 top-3 h-4 w-4 text-muted-foreground transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </div>

      {/* 下拉面板 */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-[9999] max-h-[400px] flex flex-col">
          {/* 搜索框 */}
          <div className="p-3 border-b border-gray-200">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="搜索语言"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          </div>

          {/* 语言列表 */}
          <div className="overflow-y-auto max-h-[280px]">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
              </div>
            ) : (
              <div className="p-2">
                {filteredLanguages.length === 0 ? (
                  <div className="py-6 text-center text-sm text-muted-foreground">
                    未找到匹配的语言
                  </div>
                ) : (
                  filteredLanguages.map(language => {
                    const isSelected = value.includes(language.code);

                    return (
                      <div
                        key={language.code}
                        className={`flex items-center gap-2 px-3 py-2 rounded-md hover:bg-gray-100 cursor-pointer transition-colors ${
                          isSelected ? "bg-blue-50" : ""
                        }`}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelect(language.code);
                        }}
                      >
                        {multiple && (
                          <Checkbox
                            checked={isSelected}
                            onClick={(e) => e.stopPropagation()}
                          />
                        )}
                        <span className="text-sm font-medium flex-1">{language.name}</span>
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>

          {/* 底部操作栏 */}
          {value.length > 0 && (
            <div className="p-3 border-t border-gray-200 flex items-center justify-between bg-gray-50">
              <span className="text-xs text-muted-foreground">
                已选择 {value.length} 种语言
              </span>
              <button
                className="text-xs text-blue-700 hover:text-blue-800 font-medium"
                onClick={(e) => {
                  e.stopPropagation();
                  onChange?.([]);
                }}
              >
                清空选择
              </button>
            </div>
          )}
        </div>
      )}

      {/* 点击外部关闭 */}
      {isOpen && (
        <div
          className="fixed inset-0 z-[9998]"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}

