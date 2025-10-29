"use client";

import React, { useState, useMemo } from "react";
import { ChevronDown, Search, X, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useDictionaryTree } from "@/hooks/use-dictionary";

interface DictionarySelectorProps {
  dictionaryCode: string; // 字典编码
  value?: number | number[]; // 支持单选(number)和多选(number[])
  onChange?: (value: number | number[]) => void;
  placeholder?: string;
  multiple?: boolean; // 是否多选，默认 false
}

export default function DictionarySelector({
  dictionaryCode,
  value,
  onChange,
  placeholder = "请选择",
  multiple = false,
}: DictionarySelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // 使用缓存加载字典数据
  const { tree: items, loading } = useDictionaryTree(dictionaryCode);

  // 标准化 value 为数组形式方便处理
  const valueArray = useMemo(() => {
    if (value === undefined || value === null) return [];
    return Array.isArray(value) ? value : [value];
  }, [value]);

  // 过滤字典项
  const filteredItems = useMemo(() => {
    if (!searchQuery) return items;
    
    const query = searchQuery.toLowerCase();
    return items.filter(item => 
      item.name.toLowerCase().includes(query) ||
      (item.code && item.code.toLowerCase().includes(query))
    );
  }, [searchQuery, items]);

  const handleSelect = (id: number) => {
    if (!multiple) {
      // 单选模式
      onChange?.(id);
      setIsOpen(false);
    } else {
      // 多选模式
      const newValue = [...valueArray];
      const index = newValue.indexOf(id);
      
      if (index > -1) {
        newValue.splice(index, 1);
      } else {
        newValue.push(id);
      }
      onChange?.(newValue);
    }
  };

  const getSelectedLabels = () => {
    return valueArray
      .map(id => items.find(item => item.id === id))
      .filter(Boolean)
      .map(item => ({ id: item!.id, label: item!.name }));
  };

  const removeSelection = (id: number) => {
    if (!multiple) {
      onChange?.(0);
    } else {
      onChange?.(valueArray.filter(v => v !== id));
    }
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
        ) : multiple ? (
          <div className="flex flex-wrap gap-1.5">
            {getSelectedLabels().map(({ id, label }) => (
              <Badge
                key={id}
                variant="secondary"
                className="pl-2 pr-1.5 py-0.5 gap-1 text-xs"
                onClick={(e) => e.stopPropagation()}
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
        ) : (
          <span>{getSelectedLabels()[0]?.label}</span>
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
                placeholder="搜索..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          </div>

          {/* 选项列表 */}
          <div className="overflow-y-auto max-h-[320px]">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
              </div>
            ) : (
              <div className="p-2">
                {filteredItems.length === 0 ? (
                  <div className="py-6 text-center text-sm text-muted-foreground">
                    未找到匹配项
                  </div>
                ) : multiple ? (
                  // 多选模式
                  filteredItems.map(item => {
                    const isSelected = valueArray.includes(item.id);
                    return (
                      <div
                        key={item.id}
                        className={`flex items-center gap-2 px-3 py-2 rounded-md hover:bg-gray-100 cursor-pointer transition-colors ${
                          isSelected ? "bg-blue-50" : ""
                        }`}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelect(item.id);
                        }}
                      >
                        <Checkbox
                          checked={isSelected}
                          onClick={(e) => e.stopPropagation()}
                        />
                        <span className="text-sm flex-1">{item.name}</span>
                      </div>
                    );
                  })
                ) : (
                  // 单选模式
                  <RadioGroup 
                    value={valueArray.length > 0 ? valueArray[0].toString() : undefined} 
                    onValueChange={(val) => handleSelect(Number(val))}
                  >
                    {filteredItems.map(item => (
                      <Label
                        key={item.id}
                        htmlFor={`option-${item.id}`}
                        className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-gray-100 cursor-pointer transition-colors"
                      >
                        <RadioGroupItem value={item.id.toString()} id={`option-${item.id}`} />
                        <span className="text-sm flex-1">{item.name}</span>
                      </Label>
                    ))}
                  </RadioGroup>
                )}
              </div>
            )}
          </div>

          {/* 底部操作栏 */}
          {multiple && valueArray.length > 0 && (
            <div className="p-3 border-t border-gray-200 flex items-center justify-between bg-gray-50">
              <span className="text-xs text-muted-foreground">
                已选择 {valueArray.length} 项
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


