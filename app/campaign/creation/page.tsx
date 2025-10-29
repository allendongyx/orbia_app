"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronLeft, Check, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { createCampaign, CreateCampaignRequest } from "@/lib/api/campaign";
import Step1 from "./step1";
import Step2 from "./step2";
import Step3 from "./step3";

// Campaign 表单数据类型
export interface CampaignFormData {
  // Step 1
  campaign_name: string;
  promotion_objective: 'awareness' | 'consideration' | 'conversion';
  optimization_goal: string;
  
  // Step 2
  location?: number[];
  age?: number;
  gender?: number;
  languages?: number[];
  spending_power?: number;
  operating_system?: number;
  os_versions?: number[];
  device_models?: number[];
  connection_types?: number[];
  device_price_type: 0 | 1;
  device_price_min?: number;
  device_price_max?: number;
  planned_start_time: string;
  planned_end_time: string;
  time_zone?: number;
  dayparting_type: 0 | 1;
  dayparting_schedule?: string;
  frequency_cap_type: 0 | 1 | 2;
  frequency_cap_times?: number;
  frequency_cap_days?: number;
  budget_type: 0 | 1;
  budget_amount: number;
  
  // Step 3
  website?: string;
  ios_download_url?: string;
  android_download_url?: string;
  attachment_urls?: string[];
}

export default function CampaignCreation() {
  const router = useRouter();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 表单数据
  const [formData, setFormData] = useState<CampaignFormData>({
    campaign_name: '',
    promotion_objective: 'awareness',
    optimization_goal: 'reach',
    device_price_type: 0,
    planned_start_time: '',
    planned_end_time: '',
    dayparting_type: 0,
    frequency_cap_type: 0,
    budget_type: 0,
    budget_amount: 0,
  });

  const steps = [
    { title: "Basic Information", component: Step1 },
    { title: "Targeting & Budget", component: Step2 },
    { title: "Creative Assets", component: Step3 },
  ];

  const CurrentStepComponent = steps[currentStep].component;

  // 更新表单数据
  const updateFormData = (data: Partial<CampaignFormData>) => {
    setFormData(prev => ({ ...prev, ...data }));
  };

  // 验证 Step 1
  const validateStep1 = (): boolean => {
    if (!formData.campaign_name.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter a campaign name",
        variant: "error",
      });
      return false;
    }

    if (!formData.promotion_objective || !formData.optimization_goal) {
      toast({
        title: "Validation Error",
        description: "Please select promotion objective and optimization goal",
        variant: "error",
      });
      return false;
    }

    return true;
  };

  // 验证 Step 2
  const validateStep2 = (): boolean => {
    if (!formData.planned_start_time || !formData.planned_end_time) {
      toast({
        title: "Validation Error",
        description: "Please select start and end time",
        variant: "error",
      });
      return false;
    }

    if (formData.budget_amount <= 0) {
      toast({
        title: "Validation Error",
        description: "Please enter a valid budget amount",
        variant: "error",
      });
      return false;
    }

    if (formData.device_price_type === 1) {
      if (!formData.device_price_min || !formData.device_price_max) {
        toast({
          title: "Validation Error",
          description: "Please enter device price range",
          variant: "error",
        });
        return false;
      }
      if (formData.device_price_min >= formData.device_price_max) {
        toast({
          title: "Validation Error",
          description: "Minimum price must be less than maximum price",
          variant: "error",
        });
        return false;
      }
    }

    if (formData.frequency_cap_type === 2) {
      if (!formData.frequency_cap_times || !formData.frequency_cap_days) {
        toast({
          title: "Validation Error",
          description: "Please enter frequency cap times and days",
          variant: "error",
        });
        return false;
      }
    }

    return true;
  };

  // 验证 Step 3
  const validateStep3 = (): boolean => {
    // 根据 optimization_goal 检查必填字段
    if (formData.optimization_goal === 'website' && !formData.website) {
      toast({
        title: "Validation Error",
        description: "Please enter website URL for website promotion",
        variant: "error",
      });
      return false;
    }

    if (formData.optimization_goal === 'app') {
      if (!formData.ios_download_url && !formData.android_download_url) {
        toast({
          title: "Validation Error",
          description: "Please enter at least one app download URL",
          variant: "error",
        });
        return false;
      }
    }

    return true;
  };

  const handleNext = async () => {
    // 验证当前步骤
    if (currentStep === 0 && !validateStep1()) {
      return;
    }
    if (currentStep === 1 && !validateStep2()) {
      return;
    }

    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // 最后一步，验证并提交
      if (!validateStep3()) {
        return;
      }
      await handleSubmit();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  // 提交表单
  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);

      // 转换时间格式为 RFC3339（后端期望的格式）
      const formatToRFC3339 = (datetimeLocal: string): string => {
        if (!datetimeLocal) return '';
        // datetime-local 格式: 2025-10-09T02:26
        // 需要转换为: 2025-10-09T02:26:00+08:00 (带秒和时区)
        const date = new Date(datetimeLocal);
        return date.toISOString(); // 转换为 UTC 时间: 2025-10-08T18:26:00.000Z
      };

      const requestData: CreateCampaignRequest = {
        ...formData,
        planned_start_time: formatToRFC3339(formData.planned_start_time),
        planned_end_time: formatToRFC3339(formData.planned_end_time),
      };

      const response = await createCampaign(requestData);

      if (response.base_resp.code === 0) {
        toast({
          title: "Success",
          description: "Campaign created successfully",
        });
        router.push("/campaign");
      } else {
        toast({
          title: "Error",
          description: response.base_resp.message || "Failed to create campaign",
          variant: "error",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create campaign",
        variant: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const progressPercentage = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className="flex h-full flex-col p-4">
      <div className="flex flex-1 gap-5 pb-16 min-h-0">
        {/* Left Sidebar */}
        <div className="w-56 flex-shrink-0 min-h-0">
          {/* Combined Progress & Estimate Card */}
          <Card className="h-full overflow-y-auto">
            <CardContent className="p-3 space-y-3">
              {/* Progress */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-muted-foreground">Step {currentStep + 1} of {steps.length}</span>
                  <span className="font-semibold">{Math.round(progressPercentage)}%</span>
                </div>
                <Progress value={progressPercentage} className="h-1" />
              </div>

              {/* Steps */}
              <div className="space-y-1">
                {steps.map((step, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentStep(index)}
                    disabled={index > currentStep}
                    className={`flex items-center gap-2 w-full p-1.5 rounded-md text-left transition-colors ${
                      index === currentStep
                        ? "bg-blue-50 text-blue-700"
                        : index < currentStep
                        ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                        : "bg-gray-50 text-gray-400 cursor-not-allowed"
                    }`}
                  >
                    <div
                      className={`flex h-5 w-5 items-center justify-center rounded-full border shrink-0 ${
                        index === currentStep
                          ? "border-blue-700 bg-blue-700 text-white"
                          : index < currentStep
                          ? "border-emerald-600 bg-emerald-600 text-white"
                          : "border-gray-300 bg-white"
                      }`}
                    >
                      {index < currentStep ? (
                        <Check className="h-2.5 w-2.5" />
                      ) : (
                        <span className="text-[10px] font-medium">{index + 1}</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-medium truncate">{step.title}</p>
                    </div>
                  </button>
                ))}
              </div>

              {/* Divider */}
              <div className="border-t border-gray-100"></div>

              {/* Estimated Reach */}
              <div className="space-y-1.5">
                <h4 className="text-[11px] font-semibold text-gray-900">Estimated Reach</h4>
                <Progress value={35} className="h-1" />
                <div className="flex items-center justify-between">
                  <Badge variant="secondary" className="text-[10px] px-1.5 py-0.5 h-auto">
                    Moderately Broad
                  </Badge>
                  <span className="text-[10px] text-muted-foreground">
                    8.5M - 10.2M
                  </span>
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-gray-100"></div>

              {/* Pro Tips */}
              <div className="space-y-1.5">
                <h4 className="text-[11px] font-semibold text-gray-900 flex items-center gap-1">
                  <span>💡</span>
                  Pro Tips
                </h4>
                <div className="space-y-1 text-[10px] text-gray-600">
                  <div className="flex items-start gap-1.5">
                    <span className="text-purple-600 mt-0.5">•</span>
                    <span>Use compelling visuals that resonate with Web3 audiences</span>
                  </div>
                  <div className="flex items-start gap-1.5">
                    <span className="text-purple-600 mt-0.5">•</span>
                    <span>Test multiple ad variations to optimize performance</span>
                  </div>
                  <div className="flex items-start gap-1.5">
                    <span className="text-purple-600 mt-0.5">•</span>
                    <span>Start with a moderate budget and scale based on results</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="flex flex-1 flex-col rounded-md border border-gray-100 bg-white shadow-sm min-h-0">
          {/* Header */}
          <div className="flex-shrink-0 border-b border-gray-100 bg-gray-50/50 px-4 py-2.5">
            <h1 className="text-sm font-semibold">
              {steps[currentStep].title}
            </h1>
          </div>

          {/* Content - Only this area scrolls */}
          <div className="flex-1 overflow-y-auto p-4 min-h-0">
            <CurrentStepComponent formData={formData} updateFormData={updateFormData} />
          </div>
        </div>
      </div>

      {/* Bottom Navigation - Fixed to entire page */}
      <div className="fixed bottom-0 left-64 right-0 border-t border-gray-100 bg-white/95 backdrop-blur-sm px-5 py-3 shadow-lg z-50">
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={handlePrev}
            disabled={currentStep === 0 || isSubmitting}
            className="gap-2"
          >
            Previous
          </Button>

          <div className="flex items-center gap-1.5">
            {steps.map((step, index) => (
              <div
                key={index}
                className={`h-1.5 w-16 rounded-full transition-colors ${
                  index === currentStep
                    ? "bg-blue-700"
                    : index < currentStep
                    ? "bg-emerald-500"
                    : "bg-gray-200"
                }`}
              />
            ))}
          </div>

          <Button 
            onClick={handleNext} 
            className="gap-2 min-w-[120px]"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              currentStep === steps.length - 1 ? "Create Campaign" : "Next Step"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

