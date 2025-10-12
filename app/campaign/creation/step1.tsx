"use client";

import React, { useState } from "react";
import { HelpCircle, Globe, Smartphone } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent } from "@/components/ui/card";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function Step1() {
  const [promotionObjective, setPromotionObjective] = useState("website");
  const [optimizationGoal, setOptimizationGoal] = useState("traffic");

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
              Campaign Name
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
          />
          <p className="text-[11px] text-muted-foreground">
            Choose a descriptive name to easily identify this campaign
          </p>
        </div>
      </div>

      {/* Promotion Objective */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <h3 className="text-base font-semibold">Promotion Objective</h3>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p>
                  Select where you want to drive traffic - your website or mobile app
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        <RadioGroup value={promotionObjective} onValueChange={setPromotionObjective} className="grid grid-cols-1 lg:grid-cols-2 gap-0 border border-gray-200 overflow-hidden">
          <Label 
            htmlFor="website" 
            className={`h-full cursor-pointer p-4 transition-all border-r border-gray-200 ${
              promotionObjective === "website" 
                ? "bg-gray-900 text-white" 
                : "bg-white hover:bg-gray-50"
            }`}
          >
            <RadioGroupItem value="website" id="website" className="sr-only" />
            <div className="flex items-start gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <Globe className="h-4 w-4 flex-shrink-0" />
                  <span className="font-semibold text-sm">
                    Promote Your Website
                  </span>
                </div>
                <div className="space-y-1 text-xs opacity-70">
                  <div className="flex items-start gap-2">
                    <span className="flex-shrink-0">✓</span>
                    <span>Drive more traffic to your landing pages</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="flex-shrink-0">✓</span>
                    <span>Encourage valuable actions on your website</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="flex-shrink-0">✓</span>
                    <span>Track conversions and ROI effectively</span>
                  </div>
                </div>
              </div>
            </div>
          </Label>

          <Label 
            htmlFor="app" 
            className={`h-full cursor-pointer p-4 transition-all ${
              promotionObjective === "app" 
                ? "bg-gray-900 text-white" 
                : "bg-white hover:bg-gray-50"
            }`}
          >
            <RadioGroupItem value="app" id="app" className="sr-only" />
            <div className="flex items-start gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <Smartphone className="h-4 w-4 flex-shrink-0" />
                  <span className="font-semibold text-sm">
                    Promote Your App
                  </span>
                </div>
                <div className="space-y-1 text-xs opacity-70">
                  <div className="flex items-start gap-2">
                    <span className="flex-shrink-0">✓</span>
                    <span>Increase app installs cost-effectively</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="flex-shrink-0">✓</span>
                    <span>Drive in-app actions and engagement</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="flex-shrink-0">✓</span>
                    <span>Target mobile-first audiences</span>
                  </div>
                </div>
              </div>
            </div>
          </Label>
        </RadioGroup>
      </div>

      {/* Optimization Goal */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <h3 className="text-base font-semibold">Optimization Goal</h3>
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

        <RadioGroup value={optimizationGoal} onValueChange={setOptimizationGoal} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-0 border border-gray-200 overflow-hidden">
          <Label 
            htmlFor="traffic" 
            className={`h-full cursor-pointer lg:border-r border-gray-200 p-4 transition-all ${
              optimizationGoal === "traffic" 
                ? "bg-gray-900 text-white" 
                : "bg-white hover:bg-gray-50"
            }`}
          >
            <RadioGroupItem value="traffic" id="traffic" className="sr-only" />
            <div className="flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold">Traffic</div>
                <p className="text-xs opacity-70 mt-1">
                  Maximize clicks to your website
                </p>
              </div>
            </div>
          </Label>

          <Label 
            htmlFor="conversion" 
            className={`h-full cursor-pointer lg:border-r border-gray-200 border-t md:border-t-0 p-4 transition-all ${
              optimizationGoal === "conversion" 
                ? "bg-gray-900 text-white" 
                : "bg-white hover:bg-gray-50"
            }`}
          >
            <RadioGroupItem value="conversion" id="conversion" className="sr-only" />
            <div className="flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold">Website Conversions</div>
                <p className="text-xs opacity-70 mt-1">
                  Optimize for specific actions on your site
                </p>
              </div>
            </div>
          </Label>

          <Label 
            htmlFor="form" 
            className={`h-full cursor-pointer border-t lg:border-t-0 p-4 transition-all ${
              optimizationGoal === "form" 
                ? "bg-gray-900 text-white" 
                : "bg-white hover:bg-gray-50"
            }`}
          >
            <RadioGroupItem value="form" id="form" className="sr-only" />
            <div className="flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold">Lead Generation</div>
                <p className="text-xs opacity-70 mt-1">
                  Collect leads through forms
                </p>
              </div>
            </div>
          </Label>
        </RadioGroup>
      </div>
    </div>
  );
}

