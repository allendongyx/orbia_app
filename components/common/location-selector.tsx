"use client";

import React, { useState, useMemo } from "react";
import { ChevronDown, ChevronRight, Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import countriesData from "@/data/countries-regions.json";

interface Region {
  id: string;
  name: string;
  name_en: string;
  type: string;
}

interface Country {
  id: string;
  name: string;
  name_en: string;
  emoji: string;
  regions: Region[];
}

interface LocationSelectorProps {
  value?: string[];
  onChange?: (value: string[]) => void;
  placeholder?: string;
}

export default function LocationSelector({
  value = [],
  onChange,
  placeholder = "搜索或选择地域"
}: LocationSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedCountries, setExpandedCountries] = useState<Set<string>>(new Set());

  const countries = countriesData as Country[];

  // 过滤国家和地区
  const filteredCountries = useMemo(() => {
    if (!searchQuery) return countries;
    
    const query = searchQuery.toLowerCase();
    return countries
      .map(country => {
        const countryMatch = 
          country.name.toLowerCase().includes(query) ||
          country.name_en.toLowerCase().includes(query);
        
        const matchedRegions = country.regions.filter(region =>
          region.name.toLowerCase().includes(query) ||
          region.name_en.toLowerCase().includes(query)
        );

        if (countryMatch || matchedRegions.length > 0) {
          return {
            ...country,
            regions: countryMatch ? country.regions : matchedRegions
          };
        }
        return null;
      })
      .filter(Boolean) as Country[];
  }, [searchQuery, countries]);

  // 自动展开搜索结果中的国家
  useMemo(() => {
    if (searchQuery) {
      const newExpanded = new Set<string>();
      filteredCountries.forEach(country => {
        if (country.regions.some(r => 
          r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          r.name_en.toLowerCase().includes(searchQuery.toLowerCase())
        )) {
          newExpanded.add(country.id);
        }
      });
      setExpandedCountries(newExpanded);
    }
  }, [searchQuery, filteredCountries]);

  const toggleCountry = (countryId: string) => {
    const newExpanded = new Set(expandedCountries);
    if (newExpanded.has(countryId)) {
      newExpanded.delete(countryId);
    } else {
      newExpanded.add(countryId);
    }
    setExpandedCountries(newExpanded);
  };

  const handleSelect = (id: string, isCountry: boolean = false) => {
    const newValue = [...value];
    const index = newValue.indexOf(id);

    if (isCountry) {
      const country = countries.find(c => c.id === id);
      if (!country) return;

      const allRegionIds = country.regions.map(r => r.id);
      const hasCountry = newValue.includes(id);
      
      if (hasCountry) {
        // 取消选择国家和所有地区
        onChange?.(newValue.filter(v => v !== id && !allRegionIds.includes(v)));
      } else {
        // 选择国家（移除该国家的所有地区，只保留国家）
        const filtered = newValue.filter(v => !allRegionIds.includes(v));
        onChange?.([...filtered, id]);
      }
    } else {
      // 选择地区
      const regionCountry = countries.find(c => 
        c.regions.some(r => r.id === id)
      );
      
      if (!regionCountry) return;

      if (index > -1) {
        // 取消选择地区
        newValue.splice(index, 1);
      } else {
        // 选择地区：移除国家选择（如果有），添加地区
        const filtered = newValue.filter(v => v !== regionCountry.id);
        filtered.push(id);
        onChange?.(filtered);
        return;
      }
      onChange?.(newValue);
    }
  };

  const isCountrySelected = (countryId: string) => {
    return value.includes(countryId);
  };

  const isRegionSelected = (regionId: string) => {
    return value.includes(regionId);
  };

  const isCountryPartiallySelected = (countryId: string) => {
    const country = countries.find(c => c.id === countryId);
    if (!country) return false;
    
    const selectedRegions = country.regions.filter(r => value.includes(r.id));
    return selectedRegions.length > 0 && selectedRegions.length < country.regions.length;
  };

  const getSelectedLabels = () => {
    return value.map(id => {
      // 检查是否是国家
      const country = countries.find(c => c.id === id);
      if (country) {
        return { id, label: country.name, emoji: country.emoji };
      }
      
      // 检查是否是地区
      for (const c of countries) {
        const region = c.regions.find(r => r.id === id);
        if (region) {
          return { id, label: `${c.name} - ${region.name}`, emoji: c.emoji };
        }
      }
      
      return null;
    }).filter(Boolean) as Array<{ id: string; label: string; emoji: string }>;
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
            {getSelectedLabels().map(({ id, label, emoji }) => (
              <Badge
                key={id}
                variant="secondary"
                className="pl-2 pr-1.5 py-0.5 gap-1 text-xs"
                onClick={(e) => {
                  e.stopPropagation();
                }}
              >
                <span>{emoji}</span>
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
            <div className="p-2">
              {filteredCountries.length === 0 ? (
                <div className="py-6 text-center text-sm text-muted-foreground">
                  未找到匹配的地域
                </div>
              ) : (
                filteredCountries.map(country => {
                  const isExpanded = expandedCountries.has(country.id);
                  const isSelected = isCountrySelected(country.id);
                  const isPartial = isCountryPartiallySelected(country.id);

                  return (
                    <div key={country.id} className="mb-1">
                      {/* 国家行 */}
                      <div
                        className={`flex items-center gap-2 px-3 py-2 rounded-md hover:bg-gray-100 cursor-pointer transition-colors ${
                          isSelected ? "bg-blue-50" : ""
                        }`}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelect(country.id, true);
                        }}
                      >
                        <Checkbox
                          checked={isSelected}
                          className={isPartial && !isSelected ? "data-[state=unchecked]:bg-gray-300" : ""}
                          onClick={(e) => e.stopPropagation()}
                        />
                        <span className="text-base">{country.emoji}</span>
                        <span className="text-sm font-medium flex-1">{country.name}</span>
                        
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleCountry(country.id);
                          }}
                          className="p-1 hover:bg-gray-200 rounded transition-colors"
                        >
                          {isExpanded ? (
                            <ChevronDown className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <ChevronRight className="h-4 w-4 text-muted-foreground" />
                          )}
                        </button>
                      </div>

                      {/* 地区列表 */}
                      {isExpanded && (
                        <div className="ml-9 mt-1 space-y-1">
                          {country.regions.map(region => {
                            const isRegionSel = isRegionSelected(region.id);
                            const isCountrySel = isCountrySelected(country.id);
                            const isDisabled = isCountrySel;

                            return (
                              <div
                                key={region.id}
                                className={`flex items-center gap-2 px-3 py-1.5 rounded-md transition-colors ${
                                  isDisabled
                                    ? "opacity-50 cursor-not-allowed"
                                    : "hover:bg-gray-100 cursor-pointer"
                                } ${isRegionSel ? "bg-blue-50" : ""}`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (!isDisabled) {
                                    handleSelect(region.id);
                                  }
                                }}
                              >
                                <Checkbox
                                  checked={isRegionSel || isCountrySel}
                                  disabled={isDisabled}
                                  onClick={(e) => e.stopPropagation()}
                                />
                                <span className="text-sm flex-1">{region.name}</span>
                                <span className="text-xs text-muted-foreground">
                                  {region.type}
                                </span>
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
          </div>

          {/* 底部操作栏 */}
          {value.length > 0 && (
            <div className="p-3 border-t border-gray-200 flex items-center justify-between bg-gray-50">
              <span className="text-xs text-muted-foreground">
                已选择 {value.length} 个地域
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

