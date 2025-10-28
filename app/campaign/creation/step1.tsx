"use client";

import React, { useMemo } from "react";
import { HelpCircle, Globe, Smartphone, Target, TrendingUp, Users, ShoppingCart } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { CampaignFormData } from "./page";

interface Step1Props {
  formData: CampaignFormData;
  updateFormData: (data: Partial<CampaignFormData>) => void;
}

export default function Step1({ formData, updateFormData }: Step1Props) {
  // 根据 promotion_objective 显示对应的 optimization_goal 选项
  const optimizationGoals = useMemo(() => {
    switch (formData.promotion_objective) {
      case 'awareness':
        return [
          { 
            value: 'reach', 
            label: 'Reach', 
            description: 'Show your ad to the maximum number of people',
            icon: <Users className="h-4 w-4" />
          }
        ];
      case 'consideration':
        return [
          { 
            value: 'website', 
            label: 'Website', 
            description: 'Drive traffic to your website',
            icon: <Globe className="h-4 w-4" />
          },
          { 
            value: 'app', 
            label: 'App', 
            description: 'Promote your mobile app',
            icon: <Smartphone className="h-4 w-4" />
          }
        ];
      case 'conversion':
        return [
          { 
            value: 'app_promotion', 
            label: 'App Promotion', 
            description: 'Get more installs and in-app actions',
            icon: <Smartphone className="h-4 w-4" />
          },
          { 
            value: 'lead_generation', 
            label: 'Lead Generation', 
            description: 'Collect leads through forms',
            icon: <ShoppingCart className="h-4 w-4" />
          }
        ];
      default:
        return [];
    }
  }, [formData.promotion_objective]);

  // 当 promotion_objective 改变时，重置 optimization_goal
  const handleObjectiveChange = (value: 'awareness' | 'consideration' | 'conversion') => {
    updateFormData({ 
      promotion_objective: value,
      // 设置默认的 optimization_goal
      optimization_goal: value === 'awareness' ? 'reach' : value === 'consideration' ? 'website' : 'app_promotion'
    });
  };

  return (
    <div className="max-w-5xl space-y-5">
      {/* Campaign Name */}
      <div className="space-y-3">
        <div>
          <h2 className="text-lg font-bold mb-1">Campaign Details</h2>
          <p className="text-xs text-muted-foreground">
            Set up the basic information for your campaign
          </p>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <Label htmlFor="campaign-name" className="text-sm font-medium">
              Campaign Name <span className="text-red-500">*</span>
            </Label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Give your campaign a memorable name for easy identification and tracking</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <Input
            id="campaign-name"
            placeholder="e.g., Web3 Gaming Launch Q4"
            className="max-w-2xl h-9"
            value={formData.campaign_name}
            onChange={(e) => updateFormData({ campaign_name: e.target.value })}
          />
          <p className="text-[11px] text-muted-foreground">
            Choose a descriptive name to easily identify this campaign
          </p>
        </div>
      </div>

      {/* Promotion Objective */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <h3 className="text-base font-semibold">
            Promotion Objective <span className="text-red-500">*</span>
          </h3>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p>
                  Select your main advertising goal - what you want to achieve with this campaign
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        <RadioGroup 
          value={formData.promotion_objective} 
          onValueChange={(value) => handleObjectiveChange(value as any)}
          className="grid grid-cols-1 md:grid-cols-3 gap-0 border border-gray-200 overflow-hidden"
        >
          <Label 
            htmlFor="awareness" 
            className={`h-full cursor-pointer p-4 transition-all border-r border-gray-200 ${
              formData.promotion_objective === "awareness" 
                ? "bg-gray-900 text-white" 
                : "bg-white hover:bg-gray-50"
            }`}
          >
            <RadioGroupItem value="awareness" id="awareness" className="sr-only" />
            <div className="flex items-start gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="h-4 w-4 flex-shrink-0" />
                  <span className="font-semibold text-sm">
                    Awareness
                  </span>
                </div>
                <p className="text-xs opacity-70">
                  Build brand awareness and reach the maximum number of people
                </p>
              </div>
            </div>
          </Label>

          <Label 
            htmlFor="consideration" 
            className={`h-full cursor-pointer p-4 transition-all border-r border-gray-200 ${
              formData.promotion_objective === "consideration" 
                ? "bg-gray-900 text-white" 
                : "bg-white hover:bg-gray-50"
            }`}
          >
            <RadioGroupItem value="consideration" id="consideration" className="sr-only" />
            <div className="flex items-start gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-4 w-4 flex-shrink-0" />
                  <span className="font-semibold text-sm">
                    Consideration
                  </span>
                </div>
                <p className="text-xs opacity-70">
                  Drive traffic to your website or app
                </p>
              </div>
            </div>
          </Label>

          <Label 
            htmlFor="conversion" 
            className={`h-full cursor-pointer p-4 transition-all ${
              formData.promotion_objective === "conversion" 
                ? "bg-gray-900 text-white" 
                : "bg-white hover:bg-gray-50"
            }`}
          >
            <RadioGroupItem value="conversion" id="conversion" className="sr-only" />
            <div className="flex items-start gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <ShoppingCart className="h-4 w-4 flex-shrink-0" />
                  <span className="font-semibold text-sm">
                    Conversion
                  </span>
                </div>
                <p className="text-xs opacity-70">
                  Drive specific actions like app installs or lead generation
                </p>
              </div>
            </div>
          </Label>
        </RadioGroup>
      </div>

      {/* Optimization Goal */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <h3 className="text-base font-semibold">
            Optimization Goal <span className="text-red-500">*</span>
          </h3>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p>
                  Choose what you want to optimize for - this affects how TikTok delivers your ads
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        <RadioGroup 
          value={formData.optimization_goal} 
          onValueChange={(value) => updateFormData({ optimization_goal: value })}
          className={`grid grid-cols-1 ${optimizationGoals.length === 2 ? 'md:grid-cols-2' : 'md:grid-cols-1'} gap-0 border border-gray-200 overflow-hidden max-w-3xl`}
        >
          {optimizationGoals.map((goal, index) => (
            <Label 
              key={goal.value}
              htmlFor={goal.value} 
              className={`h-full cursor-pointer p-4 transition-all ${
                index < optimizationGoals.length - 1 ? 'border-r border-gray-200' : ''
              } ${
                formData.optimization_goal === goal.value
                  ? "bg-gray-900 text-white" 
                  : "bg-white hover:bg-gray-50"
              }`}
            >
              <RadioGroupItem value={goal.value} id={goal.value} className="sr-only" />
              <div className="flex items-center gap-3">
                {goal.icon}
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold">{goal.label}</div>
                  <p className="text-xs opacity-70 mt-1">
                    {goal.description}
                  </p>
                </div>
              </div>
            </Label>
          ))}
        </RadioGroup>
      </div>
    </div>
  );
}
