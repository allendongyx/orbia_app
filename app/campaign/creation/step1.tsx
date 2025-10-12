"use client";

import React from "react";
import { HelpCircle, Globe, Smartphone } from "lucide-react";
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

export default function Step1() {
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

        <RadioGroup defaultValue="website" className="gap-3">
          <Label htmlFor="website">
            <Card className="cursor-pointer transition-all hover:border-blue-700 hover:shadow-sm border rounded-md has-[:checked]:border-blue-700 has-[:checked]:bg-blue-50/50 has-[:checked]:shadow-sm">
              <CardContent className="p-3">
                <div className="flex items-start gap-2.5">
                  <RadioGroupItem value="website" id="website" className="mt-0.5" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1.5">
                      <Globe className="h-4 w-4 text-blue-700" />
                      <span className="font-semibold text-sm">
                        Promote Your Website
                      </span>
                    </div>
                    <div className="space-y-1 text-xs text-muted-foreground">
                      <div className="flex items-start gap-2">
                        <span className="text-emerald-600">✓</span>
                        <span>Drive more traffic to your landing pages</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-emerald-600">✓</span>
                        <span>Encourage valuable actions on your website</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-emerald-600">✓</span>
                        <span>Track conversions and ROI effectively</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Label>

          <Label htmlFor="app">
            <Card className="cursor-pointer transition-all hover:border-blue-700 hover:shadow-sm border rounded-md has-[:checked]:border-blue-700 has-[:checked]:bg-blue-50/50 has-[:checked]:shadow-sm">
              <CardContent className="p-3">
                <div className="flex items-start gap-2.5">
                  <RadioGroupItem value="app" id="app" className="mt-0.5" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1.5">
                      <Smartphone className="h-4 w-4 text-blue-700" />
                      <span className="font-semibold text-sm">
                        Promote Your App
                      </span>
                    </div>
                    <div className="space-y-1 text-xs text-muted-foreground">
                      <div className="flex items-start gap-2">
                        <span className="text-emerald-600">✓</span>
                        <span>Increase app installs cost-effectively</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-emerald-600">✓</span>
                        <span>Drive in-app actions and engagement</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-emerald-600">✓</span>
                        <span>Target mobile-first audiences</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
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

        <RadioGroup defaultValue="traffic" className="gap-1.5">
          <Label htmlFor="traffic">
            <Card className="cursor-pointer transition-all hover:border-blue-700 hover:bg-gray-50/50 border rounded-md has-[:checked]:border-blue-700 has-[:checked]:bg-blue-50/50">
              <CardContent className="p-2.5">
                <div className="flex items-center gap-2.5">
                  <RadioGroupItem value="traffic" id="traffic" />
                  <div className="flex-1">
                    <div className="text-sm font-medium">Traffic</div>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      Maximize clicks to your website
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Label>

          <Label htmlFor="conversion">
            <Card className="cursor-pointer transition-all hover:border-blue-700 hover:bg-gray-50/50 border rounded-md has-[:checked]:border-blue-700 has-[:checked]:bg-blue-50/50">
              <CardContent className="p-2.5">
                <div className="flex items-center gap-2.5">
                  <RadioGroupItem value="conversion" id="conversion" />
                  <div className="flex-1">
                    <div className="text-sm font-medium">Website Conversions</div>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      Optimize for specific actions on your site
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Label>

          <Label htmlFor="form">
            <Card className="cursor-pointer transition-all hover:border-blue-700 hover:bg-gray-50/50 border rounded-md has-[:checked]:border-blue-700 has-[:checked]:bg-blue-50/50">
              <CardContent className="p-2.5">
                <div className="flex items-center gap-2.5">
                  <RadioGroupItem value="form" id="form" />
                  <div className="flex-1">
                    <div className="text-sm font-medium">Lead Generation</div>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      Collect leads through forms
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Label>
        </RadioGroup>
      </div>
    </div>
  );
}

