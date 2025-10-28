"use client";

import React, { useMemo, useEffect } from "react";
import { HelpCircle, DollarSign, Calendar } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import DatePickerTable from "@/app/components/time_selector";
import LocationSelectorDict from "@/components/common/location-selector-dict";
import LanguageSelectorDict from "@/components/common/language-selector-dict";
import DictionarySelector from "@/components/common/dictionary-selector";
import { useDictionaryTree } from "@/hooks/use-dictionary";
import { CampaignFormData } from "./page";

interface Step2Props {
  formData: CampaignFormData;
  updateFormData: (data: Partial<CampaignFormData>) => void;
}

export default function Step2({ formData, updateFormData }: Step2Props) {
  // 加载字典数据用于 label 样式选择器
  const { tree: genderOptions } = useDictionaryTree("GENDER");
  const { tree: ageOptions } = useDictionaryTree("AGE_RANGE");
  const { tree: osOptions } = useDictionaryTree("OS");
  const { tree: locationTree } = useDictionaryTree("COUNTRY");
  const { tree: languageTree } = useDictionaryTree("LANGUAGE");
  
  // 根据选择的操作系统确定版本字典
  const osVersionDictCode = useMemo(() => {
    if (!formData.operating_system || !osOptions.length) return null;
    
    const selectedOs = osOptions.find(os => os.id === formData.operating_system);
    if (!selectedOs) return null;
    
    // 根据 OS 名称或 code 判断
    const osName = selectedOs.name.toLowerCase();
    const osCode = (selectedOs.code || '').toLowerCase();
    
    if (osName.includes('ios') || osCode.includes('ios')) {
      return 'IOS_VERSION';
    } else if (osName.includes('android') || osCode.includes('android')) {
      return 'ANDROID_VERSION';
    }
    
    return null;
  }, [formData.operating_system, osOptions]);
  
  // 将 location IDs 转换为 codes
  const locationCodes = useMemo(() => {
    if (!formData.location || !locationTree.length) return [];
    return formData.location
      .map(id => {
        // 在国家中查找
        const country = locationTree.find(c => c.id === id);
        if (country) return country.code;
        
        // 在地区中查找
        for (const country of locationTree) {
          const region = (country.children || []).find(r => r.id === id);
          if (region) return region.code;
        }
        return null;
      })
      .filter((code): code is string => code !== null);
  }, [formData.location, locationTree]);
  
  // 将 language IDs 转换为 codes
  const languageCodes = useMemo(() => {
    if (!formData.languages || !languageTree.length) return [];
    return formData.languages
      .map(id => {
        const lang = languageTree.find(l => l.id === id);
        return lang ? lang.code : null;
      })
      .filter((code): code is string => code !== null);
  }, [formData.languages, languageTree]);
  
  // 当 OS 改变时，清空 OS 版本选择
  useEffect(() => {
    if (formData.operating_system) {
      updateFormData({ os_versions: [] });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.operating_system]);
  return (
    <div className="max-w-5xl space-y-5">
      {/* Audience Targeting */}
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-bold mb-1">Audience Targeting</h2>
          <p className="text-xs text-muted-foreground">
            Define who will see your campaign
          </p>
        </div>

        {/* Location - 支持多选 */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <Label className="text-sm font-medium">Location</Label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Select one or more target countries or regions</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <LocationSelectorDict 
            value={locationCodes}
            onChange={(codes) => {
              // 将 code 字符串数组转换回 id 数字数组
              const ids = codes.map(code => {
                // 在国家中查找
                const country = locationTree.find(c => c.code === code);
                if (country) return country.id;
                
                // 在地区中查找
                for (const country of locationTree) {
                  const region = (country.children || []).find(r => r.code === code);
                  if (region) return region.id;
                }
                return null;
              }).filter((id): id is number => id !== null);
              updateFormData({ location: ids });
            }}
            placeholder="Select locations (multiple allowed)"
            multiple={true}
          />
        </div>

        {/* Age Range - Label 样式选择 */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <Label className="text-sm font-medium">Age Range</Label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Select target age group</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <RadioGroup
            value={formData.age?.toString()}
            onValueChange={(value) => updateFormData({ age: Number(value) })}
            className="flex flex-wrap gap-0 border border-gray-200 overflow-hidden"
          >
            {ageOptions.map((option, index) => (
              <Label
                key={option.id}
                htmlFor={`age-${option.id}`}
                className={`cursor-pointer px-3 py-2 transition-all text-center ${
                  index < ageOptions.length - 1 ? 'border-r border-gray-200' : ''
                } ${
                  formData.age === option.id
                    ? "bg-gray-900 text-white"
                    : "bg-white hover:bg-gray-50"
                }`}
              >
                <RadioGroupItem
                  value={option.id.toString()}
                  id={`age-${option.id}`}
                  className="sr-only"
                />
                <span className="text-xs font-medium whitespace-nowrap">{option.name}</span>
              </Label>
            ))}
          </RadioGroup>
        </div>

        {/* Gender - Label 样式选择 */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <Label className="text-sm font-medium">Gender</Label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Choose to target all genders or focus on a specific gender</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <RadioGroup
            value={formData.gender?.toString()}
            onValueChange={(value) => updateFormData({ gender: Number(value) })}
            className="flex flex-wrap gap-0 border border-gray-200 overflow-hidden"
          >
            {genderOptions.map((option, index) => (
              <Label
                key={option.id}
                htmlFor={`gender-${option.id}`}
                className={`cursor-pointer px-3 py-2 transition-all text-center ${
                  index < genderOptions.length - 1 ? 'border-r border-gray-200' : ''
                } ${
                  formData.gender === option.id
                    ? "bg-gray-900 text-white"
                    : "bg-white hover:bg-gray-50"
                }`}
              >
                <RadioGroupItem
                  value={option.id.toString()}
                  id={`gender-${option.id}`}
                  className="sr-only"
                />
                <span className="text-xs font-medium whitespace-nowrap">{option.name}</span>
              </Label>
            ))}
          </RadioGroup>
        </div>

        {/* Languages - 支持多选 */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <Label className="text-sm font-medium">Languages</Label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Select one or more target languages</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <LanguageSelectorDict 
            value={languageCodes}
            onChange={(codes) => {
              // 将 code 字符串数组转换回 id 数字数组
              const ids = codes.map(code => {
                const lang = languageTree.find(l => l.code === code);
                return lang ? lang.id : null;
              }).filter((id): id is number => id !== null);
              updateFormData({ languages: ids });
            }}
            placeholder="Select languages (multiple allowed)"
            multiple={true}
          />
        </div>

        <div className="space-y-4">
          {/* Spending Power */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <Label className="text-sm font-medium">Spending Power</Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Target users by their spending capacity</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <DictionarySelector
              dictionaryCode="SPENDING_POWER"
              value={formData.spending_power}
              onChange={(value) => updateFormData({ spending_power: value as number })}
              placeholder="Select spending power"
              multiple={false}
            />
          </div>

          {/* Connection Type - Label 样式选择，支持多选 */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <Label className="text-sm font-medium">Connection Type</Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Select network types (WiFi, 4G, 5G, etc.)</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <DictionarySelector
              dictionaryCode="CONNECTION_TYPE"
              value={formData.connection_types || []}
              onChange={(value) => updateFormData({ connection_types: value as number[] })}
              placeholder="Select connection types"
              multiple={true}
            />
          </div>
        </div>

        {/* Operating System & Versions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <Label className="text-sm font-medium">Operating System</Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Select device operating system (Android/iOS)</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <DictionarySelector
              dictionaryCode="OS"
              value={formData.operating_system}
              onChange={(value) => updateFormData({ operating_system: value as number, os_versions: [] })}
              placeholder="Select OS"
              multiple={false}
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <Label className="text-sm font-medium">OS Versions</Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Select specific OS versions to target (select OS first)</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            {osVersionDictCode ? (
              <DictionarySelector
                dictionaryCode={osVersionDictCode}
                value={formData.os_versions || []}
                onChange={(value) => updateFormData({ os_versions: value as number[] })}
                placeholder="Select OS versions"
                multiple={true}
              />
            ) : (
              <div className="min-h-[38px] w-full border border-gray-200 rounded-md bg-gray-50 px-3 py-2 text-sm flex items-center">
                <span className="text-muted-foreground">Please select an operating system first</span>
              </div>
            )}
          </div>
        </div>

        {/* Device Brand */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <Label className="text-sm font-medium">Device Brand</Label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Select specific device brands (iPhone, Samsung, etc.)</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <DictionarySelector
            dictionaryCode="DEVICE_BRAND"
            value={formData.device_models || []}
            onChange={(value) => updateFormData({ device_models: value as number[] })}
            placeholder="Select device brands"
            multiple={true}
          />
        </div>

        {/* Device Price */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Label className="text-sm font-medium">Device Price</Label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Target users by device price range</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          <RadioGroup 
            value={formData.device_price_type.toString()} 
            onValueChange={(value) => updateFormData({ device_price_type: Number(value) as 0 | 1 })}
            className="space-y-2"
          >
            <Label htmlFor="price-any" className="flex items-center gap-2 cursor-pointer">
              <RadioGroupItem value="0" id="price-any" />
              <span className="text-sm">Any price range</span>
            </Label>

            <Label htmlFor="price-specific" className="flex items-center gap-2 cursor-pointer">
              <RadioGroupItem value="1" id="price-specific" />
              <span className="text-sm">Specific range</span>
            </Label>
          </RadioGroup>

          {formData.device_price_type === 1 && (
            <div className="grid grid-cols-2 gap-3 pl-6">
              <div className="space-y-1.5">
                <Label htmlFor="price-min" className="text-xs">Minimum ($)</Label>
                <Input
                  id="price-min"
                  type="number"
                  placeholder="0"
                  className="h-9"
                  value={formData.device_price_min || ''}
                  onChange={(e) => updateFormData({ device_price_min: Number(e.target.value) })}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="price-max" className="text-xs">Maximum ($)</Label>
                <Input
                  id="price-max"
                  type="number"
                  placeholder="0"
                  className="h-9"
                  value={formData.device_price_max || ''}
                  onChange={(e) => updateFormData({ device_price_max: Number(e.target.value) })}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Budget & Schedule */}
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-bold mb-1">Budget & Schedule</h2>
          <p className="text-xs text-muted-foreground">
            Set your spending limits and campaign duration
          </p>
        </div>

        <Card className="border border-blue-700/30 bg-blue-50/30 rounded-md">
          <CardContent className="p-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <Label className="text-sm font-medium flex items-center gap-1.5">
                    <DollarSign className="h-3.5 w-3.5" />
                    Budget Type <span className="text-red-500">*</span>
                  </Label>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Daily budget controls spending per day; lifetime budget is total spend for entire campaign</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <Select 
                  value={formData.budget_type.toString()} 
                  onValueChange={(value) => updateFormData({ budget_type: Number(value) as 0 | 1 })}
                >
                  <SelectTrigger className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">Daily Budget</SelectItem>
                    <SelectItem value="1">Total Budget</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-[11px] text-muted-foreground">
                  {formData.budget_type === 0
                    ? "Maximum amount to spend per day"
                    : "Total amount to spend over the campaign duration"}
                </p>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <Label className="text-sm font-medium">
                    Budget Amount <span className="text-red-500">*</span>
                  </Label>
                </div>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-xs text-muted-foreground">
                    $
                  </span>
                  <Input
                    placeholder="0.00"
                    type="number"
                    step="0.01"
                    className="pl-6 h-9"
                    value={formData.budget_amount || ''}
                    onChange={(e) => updateFormData({ budget_amount: Number(e.target.value) })}
                  />
                </div>
                {formData.budget_amount > 0 && (
                  <p className="text-[11px] text-emerald-600 font-medium">
                    Estimated reach: {(formData.budget_amount * 150).toLocaleString()} - {(formData.budget_amount * 200).toLocaleString()} impressions
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Schedule */}
        <div className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="start-time" className="text-sm font-medium flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" />
                Start Date & Time <span className="text-red-500">*</span>
              </Label>
              <Input 
                type="datetime-local" 
                id="start-time" 
                className="h-9"
                value={formData.planned_start_time}
                onChange={(e) => updateFormData({ planned_start_time: e.target.value })}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="end-time" className="text-sm font-medium flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" />
                End Date & Time <span className="text-red-500">*</span>
            </Label>
              <Input 
                type="datetime-local" 
                id="end-time" 
                className="h-9"
                value={formData.planned_end_time}
                onChange={(e) => updateFormData({ planned_end_time: e.target.value })}
              />
            </div>
          </div>

          {/* Time Zone */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <Label className="text-sm font-medium">Time Zone</Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Select the time zone for your campaign schedule</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <DictionarySelector
              dictionaryCode="TIMEZONE"
              value={formData.time_zone}
              onChange={(value) => updateFormData({ time_zone: value as number })}
              placeholder="Select time zone"
              multiple={false}
            />
          </div>

          {/* Dayparting */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label className="text-sm font-medium">Ad Scheduling</Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Control when your ads appear. Run 24/7 or set specific times for better targeting</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <div className="border border-gray-200 overflow-hidden max-w-2xl">
              <div 
                onClick={() => updateFormData({ dayparting_type: 0 })}
                className={`cursor-pointer p-3.5 transition-all border-b border-gray-200 ${
                  formData.dayparting_type === 0 
                    ? "bg-gray-900 text-white" 
                    : "bg-white hover:bg-gray-50"
                }`}
              >
                <div className="text-sm font-medium">Run ads all day</div>
                <p className={`text-[11px] mt-0.5 ${
                  formData.dayparting_type === 0 ? "text-gray-300" : "text-gray-500"
                }`}>
                  Show ads 24/7 for maximum reach
                </p>
              </div>

              <div 
                onClick={() => updateFormData({ dayparting_type: 1 })}
                className={`cursor-pointer p-3.5 transition-all ${
                  formData.dayparting_type === 1 
                    ? "bg-gray-900 text-white" 
                    : "bg-white hover:bg-gray-50"
                }`}
              >
                <div className="text-sm font-medium">Custom schedule</div>
                <p className={`text-[11px] mt-0.5 ${
                  formData.dayparting_type === 1 ? "text-gray-300" : "text-gray-500"
                }`}>
                  Choose specific days and times
                </p>
              </div>
            </div>
          </div>

          {formData.dayparting_type === 1 && (
          <DatePickerTable />
          )}
        </div>

        {/* Frequency Cap */}
        <div className="space-y-3">
            <div className="flex items-center gap-2">
            <Label className="text-sm font-medium">Frequency Cap</Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent>
                  <p>Limit how often users see your ads</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

          <RadioGroup 
            value={formData.frequency_cap_type.toString()} 
            onValueChange={(value) => updateFormData({ frequency_cap_type: Number(value) as 0 | 1 | 2 })}
            className="space-y-2"
          >
            <Label htmlFor="freq-0" className="flex items-center gap-2 cursor-pointer">
              <RadioGroupItem value="0" id="freq-0" />
              <span className="text-sm">No more than 3 times every 7 days</span>
            </Label>

            <Label htmlFor="freq-1" className="flex items-center gap-2 cursor-pointer">
              <RadioGroupItem value="1" id="freq-1" />
              <span className="text-sm">No more than once per day</span>
            </Label>

            <Label htmlFor="freq-2" className="flex items-center gap-2 cursor-pointer">
              <RadioGroupItem value="2" id="freq-2" />
              <span className="text-sm">Custom frequency</span>
            </Label>
          </RadioGroup>

          {formData.frequency_cap_type === 2 && (
            <div className="grid grid-cols-2 gap-3 pl-6">
          <div className="space-y-1.5">
                <Label htmlFor="freq-times" className="text-xs">Times</Label>
                <Input
                  id="freq-times"
                  type="number"
                  placeholder="0"
                  className="h-9"
                  value={formData.frequency_cap_times || ''}
                  onChange={(e) => updateFormData({ frequency_cap_times: Number(e.target.value) })}
                />
            </div>
              <div className="space-y-1.5">
                <Label htmlFor="freq-days" className="text-xs">Days</Label>
              <Input
                  id="freq-days"
                type="number"
                  placeholder="0"
                  className="h-9"
                  value={formData.frequency_cap_days || ''}
                  onChange={(e) => updateFormData({ frequency_cap_days: Number(e.target.value) })}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
