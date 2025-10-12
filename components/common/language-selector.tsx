"use client";

import React, { useState, useMemo } from "react";
import { ChevronDown, Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";

interface Language {
  id: string;
  name: string;
  name_en: string;
}

interface LanguageSelectorProps {
  value?: string[];
  onChange?: (value: string[]) => void;
  placeholder?: string;
}

const languages: Language[] = [
  { id: "en", name: "英语", name_en: "English" },
  { id: "es", name: "西班牙语", name_en: "Spanish" },
  { id: "fr", name: "法语", name_en: "French" },
  { id: "de", name: "德语", name_en: "German" },
  { id: "zh", name: "中文", name_en: "Mandarin" },
  { id: "ja", name: "日语", name_en: "Japanese" },
  { id: "ko", name: "韩语", name_en: "Korean" },
  { id: "pt", name: "葡萄牙语", name_en: "Portuguese" },
  { id: "ru", name: "俄语", name_en: "Russian" },
  { id: "ar", name: "阿拉伯语", name_en: "Arabic" },
  { id: "hi", name: "印地语", name_en: "Hindi" },
  { id: "it", name: "意大利语", name_en: "Italian" },
  { id: "th", name: "泰语", name_en: "Thai" },
  { id: "vi", name: "越南语", name_en: "Vietnamese" },
  { id: "id", name: "印尼语", name_en: "Indonesian" },
  { id: "tr", name: "土耳其语", name_en: "Turkish" },
];

export default function LanguageSelector({
  value = [],
  onChange,
  placeholder = "选择语言"
}: LanguageSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // 过滤语言
  const filteredLanguages = useMemo(() => {
    if (!searchQuery) return languages;
    
    const query = searchQuery.toLowerCase();
    return languages.filter(lang =>
      lang.name.toLowerCase().includes(query) ||
      lang.name_en.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  const handleSelect = (languageId: string) => {
    const newValue = [...value];
    const index = newValue.indexOf(languageId);

    if (index > -1) {
      newValue.splice(index, 1);
    } else {
      newValue.push(languageId);
    }
    
    onChange?.(newValue);
  };

  const getSelectedLabels = () => {
    return value.map(id => {
      const language = languages.find(l => l.id === id);
      return language ? { id, label: language.name } : null;
    }).filter(Boolean) as Array<{ id: string; label: string }>;
  };

  const removeSelection = (id: string) => {
    onChange?.(value.filter(v => v !== id));
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
            {getSelectedLabels().map(({ id, label }) => (
              <Badge
                key={id}
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
                    removeSelection(id);
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
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-50 max-h-[400px] flex flex-col">
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
            <div className="p-2">
              {filteredLanguages.length === 0 ? (
                <div className="py-6 text-center text-sm text-muted-foreground">
                  未找到匹配的语言
                </div>
              ) : (
                filteredLanguages.map(language => {
                  const isSelected = value.includes(language.id);

                  return (
                    <div
                      key={language.id}
                      className={`flex items-center gap-2 px-3 py-2 rounded-md hover:bg-gray-100 cursor-pointer transition-colors ${
                        isSelected ? "bg-blue-50" : ""
                      }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelect(language.id);
                      }}
                    >
                      <Checkbox
                        checked={isSelected}
                        onClick={(e) => e.stopPropagation()}
                      />
                      <span className="text-sm font-medium flex-1">{language.name}</span>
                      <span className="text-xs text-muted-foreground">{language.name_en}</span>
                    </div>
                  );
                })
              )}
            </div>
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
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}

