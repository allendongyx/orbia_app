"use client";

import React, { useState } from "react";
import { HelpCircle, DollarSign, Calendar } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
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

export default function Step2() {
  const [budgetType, setBudgetType] = useState("daily");
  const [budgetAmount, setBudgetAmount] = useState("");

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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Location */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <Label className="text-sm font-medium">Location</Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Target specific countries or regions where your ads will be shown</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <Select defaultValue="usa">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="usa">🇺🇸 United States</SelectItem>
                <SelectItem value="uk">🇬🇧 United Kingdom</SelectItem>
                <SelectItem value="canada">🇨🇦 Canada</SelectItem>
                <SelectItem value="australia">🇦🇺 Australia</SelectItem>
                <SelectItem value="singapore">🇸🇬 Singapore</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Language */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <Label className="text-sm font-medium">Language</Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Select the primary language of your target audience</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <Select defaultValue="english">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="english">English</SelectItem>
                <SelectItem value="spanish">Spanish</SelectItem>
                <SelectItem value="french">French</SelectItem>
                <SelectItem value="german">German</SelectItem>
                <SelectItem value="mandarin">Mandarin</SelectItem>
              </SelectContent>
            </Select>
          </div>
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
                  <p>Select one or multiple age groups to target. Choose "All Ages" for maximum reach</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-1.5">
            {ageGroups.map((group) => (
              <Label key={group.id} htmlFor={group.id}>
                <Card className="cursor-pointer transition-all hover:border-blue-700 hover:bg-gray-50/50 border rounded-md has-[:checked]:border-blue-700 has-[:checked]:bg-blue-50">
                  <CardContent className="p-2">
                    <div className="flex items-center space-x-1.5">
                      <Checkbox id={group.id} defaultChecked={group.id === "all"} className="h-3.5 w-3.5" />
                      <span className="text-xs font-medium">{group.label}</span>
                    </div>
                  </CardContent>
                </Card>
              </Label>
            ))}
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
          <RadioGroup defaultValue="all" className="grid grid-cols-3 gap-1.5">
            <Label htmlFor="gender-all">
              <Card className="cursor-pointer transition-all hover:border-blue-700 hover:bg-gray-50/50 border rounded-md has-[:checked]:border-blue-700 has-[:checked]:bg-blue-50">
                <CardContent className="p-2">
                  <div className="flex items-center space-x-1.5">
                    <RadioGroupItem value="all" id="gender-all" />
                    <span className="text-xs font-medium">All</span>
                  </div>
                </CardContent>
              </Card>
            </Label>
            <Label htmlFor="gender-male">
              <Card className="cursor-pointer transition-all hover:border-blue-700 hover:bg-gray-50/50 border rounded-md has-[:checked]:border-blue-700 has-[:checked]:bg-blue-50">
                <CardContent className="p-2">
                  <div className="flex items-center space-x-1.5">
                    <RadioGroupItem value="male" id="gender-male" />
                    <span className="text-xs font-medium">Male</span>
                  </div>
                </CardContent>
              </Card>
            </Label>
            <Label htmlFor="gender-female">
              <Card className="cursor-pointer transition-all hover:border-blue-700 hover:bg-gray-50/50 border rounded-md has-[:checked]:border-blue-700 has-[:checked]:bg-blue-50">
                <CardContent className="p-2">
                  <div className="flex items-center space-x-1.5">
                    <RadioGroupItem value="female" id="gender-female" />
                    <span className="text-xs font-medium">Female</span>
                  </div>
                </CardContent>
              </Card>
            </Label>
          </RadioGroup>
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
          <RadioGroup defaultValue="all" className="grid grid-cols-3 gap-1.5">
            <Label htmlFor="device-all">
              <Card className="cursor-pointer transition-all hover:border-blue-700 hover:bg-gray-50/50 border rounded-md has-[:checked]:border-blue-700 has-[:checked]:bg-blue-50">
                <CardContent className="p-2">
                  <div className="flex items-center space-x-1.5">
                    <RadioGroupItem value="all" id="device-all" />
                    <span className="text-xs font-medium">All Devices</span>
                  </div>
                </CardContent>
              </Card>
            </Label>
            <Label htmlFor="device-android">
              <Card className="cursor-pointer transition-all hover:border-blue-700 hover:bg-gray-50/50 border rounded-md has-[:checked]:border-blue-700 has-[:checked]:bg-blue-50">
                <CardContent className="p-2">
                  <div className="flex items-center space-x-1.5">
                    <RadioGroupItem value="android" id="device-android" />
                    <span className="text-xs font-medium">Android</span>
                  </div>
                </CardContent>
              </Card>
            </Label>
            <Label htmlFor="device-ios">
              <Card className="cursor-pointer transition-all hover:border-blue-700 hover:bg-gray-50/50 border rounded-md has-[:checked]:border-blue-700 has-[:checked]:bg-blue-50">
                <CardContent className="p-2">
                  <div className="flex items-center space-x-1.5">
                    <RadioGroupItem value="ios" id="device-ios" />
                    <span className="text-xs font-medium">iOS</span>
                  </div>
                </CardContent>
              </Card>
            </Label>
          </RadioGroup>
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
            <RadioGroup defaultValue="always" className="gap-1.5">
              <Label htmlFor="schedule-always">
                <Card className="cursor-pointer transition-all hover:border-blue-700 hover:bg-gray-50/50 border rounded-md has-[:checked]:border-blue-700 has-[:checked]:bg-blue-50/50">
                  <CardContent className="p-2.5">
                    <div className="flex items-center space-x-2.5">
                      <RadioGroupItem value="always" id="schedule-always" />
                      <div className="flex-1">
                        <div className="text-sm font-medium">Run ads all day</div>
                        <p className="text-[11px] text-muted-foreground mt-0.5">
                          Show ads 24/7 for maximum reach
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Label>

              <Label htmlFor="schedule-custom">
                <Card className="cursor-pointer transition-all hover:border-blue-700 hover:bg-gray-50/50 border rounded-md has-[:checked]:border-blue-700 has-[:checked]:bg-blue-50/50">
                  <CardContent className="p-2.5">
                    <div className="flex items-center space-x-2.5">
                      <RadioGroupItem value="custom" id="schedule-custom" />
                      <div className="flex-1">
                        <div className="text-sm font-medium">Custom schedule</div>
                        <p className="text-[11px] text-muted-foreground mt-0.5">
                          Choose specific days and times
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Label>
            </RadioGroup>
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

