"use client";

import React, { useState } from "react";
import { HelpCircle, DollarSign, Calendar, Smartphone, Apple } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
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
import LocationSelector from "@/components/common/location-selector";
import LanguageSelector from "@/components/common/language-selector";

export default function Step2() {
  const [budgetType, setBudgetType] = useState("daily");
  const [budgetAmount, setBudgetAmount] = useState("");
  const [gender, setGender] = useState("all");
  const [device, setDevice] = useState("all");
  const [ageRanges, setAgeRanges] = useState(["all"]);
  const [schedule, setSchedule] = useState("always");
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);

  const ageGroups = [
    { id: "all", label: "All Ages (18+)" },
    { id: "18-24", label: "18-24" },
    { id: "25-34", label: "25-34" },
    { id: "35-44", label: "35-44" },
    { id: "45-54", label: "45-54" },
    { id: "55+", label: "55+" },
  ];

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

        {/* Location - Full Width */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <Label className="text-sm font-medium">地域</Label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>选择目标国家或地区，支持多选。可以选择整个国家或特定的省份/州</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <LocationSelector 
            value={selectedLocations}
            onChange={setSelectedLocations}
            placeholder="搜索或选择地域"
          />
          <p className="text-[11px] text-muted-foreground">
            您可以选择多个国家或地区来定位您的广告受众
          </p>
        </div>

        {/* Language - Full Width */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <Label className="text-sm font-medium">语言</Label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>选择目标受众的语言，支持多选</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <LanguageSelector 
            value={selectedLanguages}
            onChange={setSelectedLanguages}
            placeholder="搜索或选择语言"
          />
          <p className="text-[11px] text-muted-foreground">
            您可以选择多种语言来精确定位您的广告受众
          </p>
        </div>

        {/* Age */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Label className="text-sm font-medium">Age Range</Label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Select one or multiple age groups to target. Choose &quot;All Ages&quot; for maximum reach</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <div className="inline-flex border border-gray-200 overflow-hidden">
            {ageGroups.map((group, index) => {
              const isChecked = ageRanges.includes(group.id);
              return (
                <Label 
                  key={group.id} 
                  htmlFor={group.id}
                  className={`relative cursor-pointer ${index > 0 ? 'border-l border-gray-200' : ''}`}
                >
                  <Checkbox 
                    id={group.id} 
                    checked={isChecked}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setAgeRanges([...ageRanges, group.id]);
                      } else {
                        setAgeRanges(ageRanges.filter(id => id !== group.id));
                      }
                    }}
                    className="sr-only"
                  />
                  <div className={`px-4 py-2.5 text-xs font-medium transition-all whitespace-nowrap ${
                    isChecked 
                      ? 'bg-gray-900 text-white' 
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}>
                    {group.label}
                  </div>
                </Label>
              );
            })}
          </div>
        </div>

        {/* Gender */}
        <div className="space-y-2">
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
          <ToggleGroup type="single" value={gender} onValueChange={(value) => value && setGender(value)}>
            <ToggleGroupItem value="all" className="min-w-[100px] text-center">
              All
            </ToggleGroupItem>
            <ToggleGroupItem value="male" className="min-w-[100px] text-center flex items-center justify-center gap-1.5">
              <span>👨</span>
              <span>Male</span>
            </ToggleGroupItem>
            <ToggleGroupItem value="female" className="min-w-[100px] text-center flex items-center justify-center gap-1.5">
              <span>👩</span>
              <span>Female</span>
            </ToggleGroupItem>
          </ToggleGroup>
        </div>

        {/* Device */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Label className="text-sm font-medium">Device</Label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Select which device types your ads should appear on</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <ToggleGroup type="single" value={device} onValueChange={(value) => value && setDevice(value)}>
            <ToggleGroupItem value="all" className="min-w-[120px] text-center">
              All Devices
            </ToggleGroupItem>
            <ToggleGroupItem value="android" className="min-w-[120px] text-center flex items-center justify-center gap-1.5">
              <Smartphone className="h-3.5 w-3.5" />
              <span>Android</span>
            </ToggleGroupItem>
            <ToggleGroupItem value="ios" className="min-w-[120px] text-center flex items-center justify-center gap-1.5">
              <Apple className="h-3.5 w-3.5" />
              <span>iOS</span>
            </ToggleGroupItem>
          </ToggleGroup>
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
                  <Label htmlFor="budget-type" className="text-sm font-medium flex items-center gap-1.5">
                    <DollarSign className="h-3.5 w-3.5" />
                    Budget Type
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
                <Select value={budgetType} onValueChange={setBudgetType}>
                  <SelectTrigger id="budget-type" className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily Budget</SelectItem>
                    <SelectItem value="lifetime">Lifetime Budget</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-[11px] text-muted-foreground">
                  {budgetType === "daily"
                    ? "Maximum amount to spend per day"
                    : "Total amount to spend over the campaign duration"}
                </p>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <Label htmlFor="budget-amount" className="text-sm font-medium">
                    Budget Amount
                  </Label>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Set how much you want to spend. Minimum $20 for daily budget</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-xs text-muted-foreground">
                    $
                  </span>
                  <Input
                    id="budget-amount"
                    placeholder="0.00"
                    type="number"
                    className="pl-6 h-9"
                    value={budgetAmount}
                    onChange={(e) => setBudgetAmount(e.target.value)}
                  />
                </div>
                {budgetAmount && (
                  <p className="text-[11px] text-emerald-600 font-medium">
                    Estimated reach: {(parseFloat(budgetAmount) * 150).toLocaleString()} - {(parseFloat(budgetAmount) * 200).toLocaleString()} impressions
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Schedule */}
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="start-time" className="text-sm font-medium flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" />
              Start Date & Time
            </Label>
            <Input type="datetime-local" id="start-time" className="max-w-md h-9" />
          </div>

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
                onClick={() => setSchedule("always")}
                className={`cursor-pointer p-3.5 transition-all border-b border-gray-200 ${
                  schedule === "always" 
                    ? "bg-gray-900 text-white" 
                    : "bg-white hover:bg-gray-50"
                }`}
              >
                <div className="text-sm font-medium">Run ads all day</div>
                <p className={`text-[11px] mt-0.5 ${
                  schedule === "always" ? "text-gray-300" : "text-gray-500"
                }`}>
                  Show ads 24/7 for maximum reach
                </p>
              </div>

              <div 
                onClick={() => setSchedule("custom")}
                className={`cursor-pointer p-3.5 transition-all ${
                  schedule === "custom" 
                    ? "bg-gray-900 text-white" 
                    : "bg-white hover:bg-gray-50"
                }`}
              >
                <div className="text-sm font-medium">Custom schedule</div>
                <p className={`text-[11px] mt-0.5 ${
                  schedule === "custom" ? "text-gray-300" : "text-gray-500"
                }`}>
                  Choose specific days and times
                </p>
              </div>
            </div>
          </div>

          <DatePickerTable />
        </div>
      </div>

      {/* Bidding & Optimization */}
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-bold mb-1">Bidding & Optimization</h2>
          <p className="text-xs text-muted-foreground">
            Configure how your campaign optimizes performance
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <Label htmlFor="optimization-goal" className="text-sm font-medium">
                Optimization Goal
              </Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Choose what TikTok should optimize for: clicks, conversions, or impressions</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <Select defaultValue="click">
              <SelectTrigger id="optimization-goal" className="h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="click">Clicks</SelectItem>
                <SelectItem value="conversion">Conversions</SelectItem>
                <SelectItem value="impression">Impressions</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <Label htmlFor="bid-cap" className="text-sm font-medium">
                Bid Cap (Optional)
              </Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Set maximum cost per result. Leave empty for automatic bidding</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <div className="relative">
              <span className="absolute left-3 top-2 text-xs text-muted-foreground">
                $
              </span>
              <Input
                id="bid-cap"
                placeholder="Auto"
                type="number"
                step="0.01"
                className="pl-6 h-9"
              />
            </div>
            <p className="text-[11px] text-muted-foreground">
              Maximum cost per result
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

