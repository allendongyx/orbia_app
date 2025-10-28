"use client";

import React, { useState, useMemo } from "react";
import { ChevronDown, ChevronRight, Search, X, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { DictionaryItemInfo } from "@/lib/api/dictionary";
import { useDictionaryTree } from "@/hooks/use-dictionary";

interface LocationSelectorDictProps {
  value?: string[];
  onChange?: (value: string[]) => void;
  placeholder?: string;
  multiple?: boolean; // 是否支持多选，默认 true
}

export default function LocationSelectorDict({
  value = [],
  onChange,
  placeholder = "搜索或选择地域",
  multiple = true,
}: LocationSelectorDictProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  // 确保 value 始终是数组
  const valueArray = Array.isArray(value) ? value : [];

  // 使用缓存加载字典数据
  const { tree: countries, loading } = useDictionaryTree("COUNTRY");

  // 过滤国家和地区
  const filteredCountries = useMemo(() => {
    if (!searchQuery) return countries;
    
    const query = searchQuery.toLowerCase();
    return countries
      .map(country => {
        const countryMatch = 
          country.name.toLowerCase().includes(query) ||
          (country.code && country.code.toLowerCase().includes(query));
        
        const matchedChildren = (country.children || []).filter(region =>
          region.name.toLowerCase().includes(query) ||
          (region.code && region.code.toLowerCase().includes(query))
        );

        if (countryMatch || matchedChildren.length > 0) {
          return {
            ...country,
            children: countryMatch ? country.children : matchedChildren
          };
        }
        return null;
      })
      .filter(Boolean) as DictionaryItemInfo[];
  }, [searchQuery, countries]);

  // 自动展开搜索结果中的国家
  useMemo(() => {
    if (searchQuery) {
      const newExpanded = new Set<string>();
      filteredCountries.forEach(country => {
        if ((country.children || []).some(r => 
          r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (r.code && r.code.toLowerCase().includes(searchQuery.toLowerCase()))
        )) {
          newExpanded.add(country.code);
        }
      });
      setExpandedItems(newExpanded);
    }
  }, [searchQuery, filteredCountries]);

  const toggleItem = (code: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(code)) {
      newExpanded.delete(code);
    } else {
      newExpanded.add(code);
    }
    setExpandedItems(newExpanded);
  };

  const handleSelect = (code: string, isCountry: boolean = false) => {
    if (!multiple) {
      // 单选模式：直接设置为选中的项
      const isSelected = valueArray.includes(code);
      if (isSelected) {
        // 如果已经选中，则取消选中
        onChange?.([]);
      } else {
        // 否则选中新项（替换之前的选中）
        onChange?.([code]);
      }
      return;
    }

    // 多选模式：原有逻辑
    const newValue = [...valueArray];
    const index = newValue.indexOf(code);

    if (isCountry) {
      const country = countries.find(c => c.code === code);
      if (!country) return;

      const allRegionCodes = (country.children || []).map(r => r.code);
      const hasCountry = newValue.includes(code);
      
      if (hasCountry) {
        // 取消选择国家和所有地区
        onChange?.(newValue.filter(v => v !== code && !allRegionCodes.includes(v)));
      } else {
        // 选择国家（移除该国家的所有地区，只保留国家）
        const filtered = newValue.filter(v => !allRegionCodes.includes(v));
        onChange?.([...filtered, code]);
      }
    } else {
      // 选择地区
      const regionCountry = countries.find(c => 
        (c.children || []).some(r => r.code === code)
      );
      
      if (!regionCountry) return;

      if (index > -1) {
        // 取消选择地区
        newValue.splice(index, 1);
      } else {
        // 选择地区：移除国家选择（如果有），添加地区
        const filtered = newValue.filter(v => v !== regionCountry.code);
        filtered.push(code);
        onChange?.(filtered);
        return;
      }
      onChange?.(newValue);
    }
  };

  const isCountrySelected = (code: string) => {
    return valueArray.includes(code);
  };

  const isRegionSelected = (code: string) => {
    return valueArray.includes(code);
  };

  const isCountryPartiallySelected = (code: string) => {
    const country = countries.find(c => c.code === code);
    if (!country || !country.children) return false;
    
    const selectedRegions = country.children.filter(r => valueArray.includes(r.code));
    return selectedRegions.length > 0 && selectedRegions.length < country.children.length;
  };

  const getSelectedLabels = () => {
    return valueArray.map(code => {
      // 检查是否是国家
      const country = countries.find(c => c.code === code);
      if (country) {
        return { code, label: country.name, icon: country.icon_url };
      }
      
      // 检查是否是地区
      for (const c of countries) {
        const region = (c.children || []).find(r => r.code === code);
        if (region) {
          return { code, label: `${c.name} - ${region.name}`, icon: c.icon_url };
        }
      }
      
      return null;
    }).filter(Boolean) as Array<{ code: string; label: string; icon?: string }>;
  };

  const removeSelection = (code: string) => {
    onChange?.(valueArray.filter(v => v !== code));
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
            {getSelectedLabels().map(({ code, label, icon }) => (
              <Badge
                key={code}
                variant="secondary"
                className="pl-2 pr-1.5 py-0.5 gap-1 text-xs"
                onClick={(e) => {
                  e.stopPropagation();
                }}
              >
                {icon && <span>{icon}</span>}
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
                placeholder="输入目标地域"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          </div>

          {/* 国家和地区列表 */}
          <div className="overflow-y-auto max-h-[320px]">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
              </div>
            ) : (
              <div className="p-2">
                {filteredCountries.length === 0 ? (
                  <div className="py-6 text-center text-sm text-muted-foreground">
                    未找到匹配的地域
                  </div>
                ) : (
                  filteredCountries.map(country => {
                    const isExpanded = expandedItems.has(country.code);
                    const isSelected = isCountrySelected(country.code);
                    const isPartial = isCountryPartiallySelected(country.code);
                    const hasChildren = (country.children || []).length > 0;

                    return (
                      <div key={country.code} className="mb-1">
                        {/* 国家行 */}
                        <div
                          className={`flex items-center gap-2 px-3 py-2 rounded-md hover:bg-gray-100 cursor-pointer transition-colors ${
                            isSelected ? "bg-blue-50" : ""
                          }`}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelect(country.code, true);
                          }}
                        >
                          {multiple && (
                            <Checkbox
                              checked={isSelected}
                              className={isPartial && !isSelected ? "data-[state=unchecked]:bg-gray-300" : ""}
                              onClick={(e) => e.stopPropagation()}
                            />
                          )}
                          {country.icon_url && <span className="text-base">{country.icon_url}</span>}
                          <span className="text-sm font-medium flex-1">{country.name}</span>
                          
                          {hasChildren && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleItem(country.code);
                              }}
                              className="p-1 hover:bg-gray-200 rounded transition-colors"
                            >
                              {isExpanded ? (
                                <ChevronDown className="h-4 w-4 text-muted-foreground" />
                              ) : (
                                <ChevronRight className="h-4 w-4 text-muted-foreground" />
                              )}
                            </button>
                          )}
                        </div>

                        {/* 地区列表 */}
                        {hasChildren && isExpanded && (
                          <div className="ml-9 mt-1 space-y-1">
                            {(country.children || []).map(region => {
                              const isRegionSel = isRegionSelected(region.code);
                              const isCountrySel = isCountrySelected(country.code);
                              const isDisabled = isCountrySel;

                              return (
                                <div
                                  key={region.code}
                                  className={`flex items-center gap-2 px-3 py-1.5 rounded-md transition-colors ${
                                    isDisabled
                                      ? "opacity-50 cursor-not-allowed"
                                      : "hover:bg-gray-100 cursor-pointer"
                                  } ${isRegionSel ? "bg-blue-50" : ""}`}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (!isDisabled) {
                                      handleSelect(region.code);
                                    }
                                  }}
                                >
                                  {multiple && (
                                    <Checkbox
                                      checked={isRegionSel || isCountrySel}
                                      disabled={isDisabled}
                                      onClick={(e) => e.stopPropagation()}
                                    />
                                  )}
                                  <span className="text-sm flex-1">{region.name}</span>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>

          {/* 底部操作栏 */}
          {valueArray.length > 0 && (
            <div className="p-3 border-t border-gray-200 flex items-center justify-between bg-gray-50">
              <span className="text-xs text-muted-foreground">
                已选择 {valueArray.length} 个地域
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

