"use client";

import React, { useState } from "react";
import { Upload, Image as ImageIcon, Video, FileText, Globe, CheckCircle, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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

export default function Step3() {
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);
  const [adCopy, setAdCopy] = useState("");

  const ctaOptions = [
    { value: "learn-more", label: "Learn More" },
    { value: "sign-up", label: "Sign Up" },
    { value: "get-started", label: "Get Started" },
    { value: "play-now", label: "Play Now" },
    { value: "join-now", label: "Join Now" },
    { value: "explore", label: "Explore" },
  ];

  return (
    <div className="max-w-5xl space-y-5">
      {/* Creative Assets */}
      <div className="space-y-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-lg font-bold">Creative Assets</h2>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Upload eye-catching images or videos. Quality creatives perform 2-3x better</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <p className="text-xs text-muted-foreground">
            Upload compelling visuals that capture attention
          </p>
        </div>

        {/* Upload Area */}
        <Card className="border-2 border-dashed border-gray-300 hover:border-blue-700 transition-colors rounded-md">
          <CardContent className="p-4">
            <div className="flex flex-col items-center justify-center py-6 text-center">
              <div className="rounded-full bg-blue-50 p-3 mb-3">
                <Upload className="h-6 w-6 text-blue-700" />
              </div>
              <h3 className="text-base font-semibold mb-1">Upload Your Creative</h3>
              <p className="text-xs text-muted-foreground mb-3 max-w-md">
                Drag and drop your files here, or click to browse
              </p>
              <div className="flex gap-2 mb-3">
                <Button variant="outline" size="sm" className="gap-1.5 h-8 text-xs">
                  <ImageIcon className="h-3.5 w-3.5" />
                  Images
                </Button>
                <Button variant="outline" size="sm" className="gap-1.5 h-8 text-xs">
                  <Video className="h-3.5 w-3.5" />
                  Videos
                </Button>
              </div>
              <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                <span>• Images: JPG, PNG (Max 10MB)</span>
                <span>• Videos: MP4, MOV (Max 50MB)</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Uploaded Files Preview */}
        {uploadedFiles.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {uploadedFiles.map((file, index) => (
              <Card key={index}>
                <CardContent className="p-3">
                  <div className="aspect-square bg-gray-100 rounded-md flex items-center justify-center mb-2">
                    <ImageIcon className="h-8 w-8 text-gray-400" />
                  </div>
                  <p className="text-xs text-center truncate">{file}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Ad Copy */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <Label htmlFor="ad-copy" className="text-sm font-medium flex items-center gap-1.5">
              <FileText className="h-3.5 w-3.5" />
              Ad Copy
            </Label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Write compelling text that highlights your value proposition. Keep it concise and action-oriented</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <Textarea
            id="ad-copy"
            placeholder="Write compelling ad copy that resonates with your target audience..."
            className="min-h-24 resize-none text-sm"
            value={adCopy}
            onChange={(e) => setAdCopy(e.target.value)}
            maxLength={500}
          />
          <div className="flex justify-between text-[11px] text-muted-foreground">
            <span>Make it catchy and relevant to your campaign goal</span>
            <span>{adCopy.length}/500</span>
          </div>
        </div>

        {/* Call to Action */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <Label htmlFor="cta" className="text-sm font-medium">
              Call to Action (CTA)
            </Label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Select the action button text. Choose one that matches your campaign goal</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <Select defaultValue="learn-more">
            <SelectTrigger id="cta" className="max-w-md h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ctaOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-[11px] text-muted-foreground">
            Choose a clear action for users to take
          </p>
        </div>
      </div>

      {/* Landing Page */}
      <div className="space-y-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-lg font-bold">Landing Page</h2>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Direct users to a page optimized for conversions. Ensure it matches your ad content</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <p className="text-xs text-muted-foreground">
            Where should users go when they click your ad?
          </p>
        </div>

        <RadioGroup defaultValue="url" className="gap-2">
          <Label htmlFor="landing-url">
            <Card className="cursor-pointer hover:border-blue-700 transition-all has-[:checked]:border-blue-700 has-[:checked]:bg-blue-50/50">
              <CardContent className="p-3">
                <div className="flex items-start gap-2.5">
                  <RadioGroupItem value="url" id="landing-url" className="mt-0.5" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Globe className="h-4 w-4 text-blue-700" />
                      <span className="font-semibold text-sm">
                        Website URL
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mb-3">
                      Direct users to an existing website or landing page
                    </p>
                    
                    <div className="space-y-2">
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2">
                          <Label htmlFor="target-url" className="text-xs font-medium">
                            Destination URL
                          </Label>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <HelpCircle className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Enter the full URL where users will land. Must start with https://</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                        <Input
                          id="target-url"
                          placeholder="https://example.com/landing-page"
                          className="font-mono text-xs h-8"
                        />
                      </div>
                      
                      <div className="rounded-md bg-blue-50 border border-blue-200 p-2">
                        <div className="flex gap-1.5">
                          <CheckCircle className="h-3.5 w-3.5 text-blue-600 shrink-0 mt-0.5" />
                          <p className="text-[11px] text-blue-900">
                            <strong>Pro tip:</strong> Use UTM parameters to track campaign performance in your analytics
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Label>

          <Label htmlFor="landing-custom">
            <Card className="cursor-pointer hover:border-blue-700 transition-all opacity-60 has-[:checked]:border-blue-700 has-[:checked]:bg-blue-50/50">
              <CardContent className="p-3">
                <div className="flex items-start gap-2.5">
                  <RadioGroupItem value="custom" id="landing-custom" disabled className="mt-0.5" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1.5">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span className="font-semibold text-sm text-muted-foreground">
                        Orbia Custom Page
                      </span>
                      <span className="px-1.5 py-0.5 bg-gray-200 text-gray-600 text-[10px] rounded-full font-medium">
                        Coming Soon
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Create a custom landing page within Orbia platform
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Label>
        </RadioGroup>

        {/* Preview */}
        <Card className="bg-gradient-to-br from-gray-50 to-gray-100">
          <CardContent className="p-4">
            <h3 className="text-sm font-semibold mb-3">Ad Preview</h3>
            <div className="bg-white rounded-md border border-gray-200 p-3 space-y-2.5">
              <div className="aspect-video bg-gray-200 rounded-md flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <ImageIcon className="h-10 w-10 mx-auto mb-2" />
                  <p className="text-xs">Your creative will appear here</p>
                </div>
              </div>
              <div className="space-y-1.5">
                <p className="text-xs font-medium line-clamp-2">
                  {adCopy || "Your ad copy will appear here"}
                </p>
                <Button size="sm" className="w-full h-8 text-xs">
                  Learn More
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

