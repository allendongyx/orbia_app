"use client";

import React, { useState, useMemo } from "react";
import { ChevronDown, ChevronRight, Search, X, Loader2, Check, Minus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { DictionaryItemInfo } from "@/lib/api/dictionary";
import { useDictionaryTree } from "@/hooks/use-dictionary";

interface LocationSelectorDictProps {
  value?: string[];
  onChange?: (value: string[]) => void;
  placeholder?: string;
  multiple?: boolean;
}

// 自定义复选框组件，避免 Radix UI 的问题
const CustomCheckbox = ({ 
  checked, 
  partial, 
  disabled 
}: { 
  checked: boolean; 
  partial?: boolean; 
  disabled?: boolean;
}) => (
  <div 
    className={`
      h-4 w-4 shrink-0 rounded-sm border transition-colors
      ${disabled ? 'cursor-not-allowed opacity-50 bg-gray-100' : ''}
      ${checked ? 'bg-blue-600 border-blue-600' : 'border-gray-300'}
      ${partial && !checked ? 'bg-gray-300 border-gray-300' : ''}
      flex items-center justify-center
    `}
  >
    {checked && <Check className="h-3 w-3 text-white" />}
    {partial && !checked && <Minus className="h-3 w-3 text-white" />}
  </div>
);

export default function LocationSelectorDict({
  value = [],
  onChange,
  placeholder = "搜索或选择地域",
  multiple = true,
}: LocationSelectorDictProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const valueArray = Array.isArray(value) ? value : [];
  
  const { tree: countries, loading } = useDictionaryTree("COUNTRY");

  const { filteredCountries, autoExpandedItems } = useMemo(() => {
    if (!searchQuery) {
      return { filteredCountries: countries, autoExpandedItems: new Set<string>() };
    }
    
    const query = searchQuery.toLowerCase();
    const autoExpanded = new Set<string>();
    
    const filtered = countries
      .map(country => {
        const countryMatch = 
          country.name.toLowerCase().includes(query) ||
          (country.code && country.code.toLowerCase().includes(query));
        
        const matchedChildren = (country.children || []).filter(region =>
          region.name.toLowerCase().includes(query) ||
          (region.code && region.code.toLowerCase().includes(query))
        );

        if (matchedChildren.length > 0) {
          autoExpanded.add(country.code);
        }

        if (countryMatch || matchedChildren.length > 0) {
          return {
            ...country,
            children: countryMatch ? country.children : matchedChildren
          };
        }
        return null;
      })
      .filter(Boolean) as DictionaryItemInfo[];
      
    return { filteredCountries: filtered, autoExpandedItems: autoExpanded };
  }, [searchQuery, countries]);

  const effectiveExpandedItems = useMemo(() => {
    const combined = new Set(expandedItems);
    autoExpandedItems.forEach(code => combined.add(code));
    return combined;
  }, [expandedItems, autoExpandedItems]);

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
      const isSelected = valueArray.includes(code);
      onChange?.(isSelected ? [] : [code]);
      return;
    }

    const newValue = [...valueArray];
    const index = newValue.indexOf(code);

    if (isCountry) {
      const country = countries.find(c => c.code === code);
      if (!country) return;

      const allRegionCodes = (country.children || []).map(r => r.code);
      const hasCountry = newValue.includes(code);
      
      if (hasCountry) {
        onChange?.(newValue.filter(v => v !== code && !allRegionCodes.includes(v)));
      } else {
        const filtered = newValue.filter(v => !allRegionCodes.includes(v));
        onChange?.([...filtered, code]);
      }
    } else {
      const regionCountry = countries.find(c => 
        (c.children || []).some(r => r.code === code)
      );
      
      if (!regionCountry) return;

      if (index > -1) {
        newValue.splice(index, 1);
        onChange?.(newValue);
      } else {
        const filtered = newValue.filter(v => v !== regionCountry.code);
        onChange?.([...filtered, code]);
      }
    }
  };

  const isCountrySelected = (code: string) => valueArray.includes(code);
  const isRegionSelected = (code: string) => valueArray.includes(code);

  const isCountryPartiallySelected = (code: string) => {
    const country = countries.find(c => c.code === code);
    if (!country || !country.children) return false;
    
    const selectedRegions = country.children.filter(r => valueArray.includes(r.code));
    return selectedRegions.length > 0 && selectedRegions.length < country.children.length;
  };

  const getSelectedLabels = () => {
    return valueArray.map(code => {
      const country = countries.find(c => c.code === code);
      if (country) {
        return { code, label: country.name, icon: country.icon_url };
      }
      
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

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value;
    setSearchQuery(newQuery);
    if (!newQuery) {
      setExpandedItems(new Set());
    }
  };

  return (
    <div className="relative">
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
                onClick={(e) => e.stopPropagation()}
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

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-[9999] max-h-[400px] flex flex-col">
          <div className="p-3 border-b border-gray-200">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="输入目标地域"
                value={searchQuery}
                onChange={handleSearchChange}
                className="pl-9 h-9"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          </div>

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
                    const isExpanded = effectiveExpandedItems.has(country.code);
                    const isSelected = isCountrySelected(country.code);
                    const isPartial = isCountryPartiallySelected(country.code);
                    const hasChildren = (country.children || []).length > 0;

                    return (
                      <div key={country.code} className="mb-1">
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
                            <CustomCheckbox 
                              checked={isSelected} 
                              partial={isPartial}
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
                                    <CustomCheckbox 
                                      checked={isRegionSel || isCountrySel}
                                      disabled={isDisabled}
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

      {isOpen && (
        <div
          className="fixed inset-0 z-[9998]"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}
