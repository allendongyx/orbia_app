"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronLeft, Check } from "lucide-react";
import Step1 from "./step1";
import Step2 from "./step2";
import Step3 from "./step3";

export default function CampaignCreation() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    { title: "Basic Information", component: Step1 },
    { title: "Targeting & Budget", component: Step2 },
    { title: "Creative Assets", component: Step3 },
  ];

  const CurrentStepComponent = steps[currentStep].component;

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Handle submit
      router.push("/campaign");
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const progressPercentage = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className="relative flex flex-col h-full">
      <div className="flex flex-1 gap-5 overflow-hidden pb-20">
        {/* Left Sidebar */}
        <div className="w-56 flex-shrink-0">
          {/* Combined Progress & Estimate Card */}
          <Card className="h-full overflow-auto">
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
        <div className="flex-1 flex flex-col rounded-md border border-gray-100 bg-white overflow-hidden shadow-sm">
          {/* Header */}
          <div className="border-b border-gray-100 bg-gray-50/50 px-4 py-2.5">
            <h1 className="text-sm font-semibold">
              {steps[currentStep].title}
            </h1>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-auto p-4">
            <CurrentStepComponent />
          </div>
        </div>
      </div>

      {/* Bottom Navigation - Fixed to entire page */}
      <div className="fixed bottom-0 left-64 right-0 border-t border-gray-100 bg-white/95 backdrop-blur-sm px-5 py-3 shadow-lg z-50">
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={handlePrev}
            disabled={currentStep === 0}
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

          <Button onClick={handleNext} className="gap-2 min-w-[120px]">
            {currentStep === steps.length - 1 ? "Create Campaign" : "Next Step"}
          </Button>
        </div>
      </div>
    </div>
  );
}

