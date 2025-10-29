"use client";

import React, { useState, useMemo } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { updateCampaign, Campaign, UpdateCampaignRequest } from "@/lib/api/campaign";
import LocationSelectorDict from "@/components/common/location-selector-dict";
import LanguageSelectorDict from "@/components/common/language-selector-dict";
import DictionarySelector from "@/components/common/dictionary-selector";
import { useDictionaryTree } from "@/hooks/use-dictionary";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface CampaignUpdateModalProps {
  campaign: Campaign;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CampaignUpdateModal({
  campaign,
  onClose,
  onSuccess,
}: CampaignUpdateModalProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // 加载字典数据
  const { tree: locationTree } = useDictionaryTree("COUNTRY");
  const { tree: languageTree } = useDictionaryTree("LANGUAGE");
  const { tree: genderOptions } = useDictionaryTree("GENDER");
  const { tree: ageOptions } = useDictionaryTree("AGE_RANGE");
  
  // 表单数据
  const [formData, setFormData] = useState({
    campaign_name: campaign.campaign_name,
    location: campaign.location || [],
    age: campaign.age || undefined,
    gender: campaign.gender || undefined,
    languages: campaign.languages || [],
    spending_power: campaign.spending_power || undefined,
    operating_system: campaign.operating_system || undefined,
    os_versions: campaign.os_versions || [],
    device_models: campaign.device_models || [],
    connection_type: campaign.connection_type || undefined,
    device_price_type: campaign.device_price_type,
    device_price_min: campaign.device_price_min || undefined,
    device_price_max: campaign.device_price_max || undefined,
    planned_start_time: campaign.planned_start_time.slice(0, 16), // datetime-local format
    planned_end_time: campaign.planned_end_time.slice(0, 16),
    time_zone: campaign.time_zone || undefined,
    budget_type: campaign.budget_type,
    budget_amount: campaign.budget_amount,
    website: campaign.website || undefined,
    ios_download_url: campaign.ios_download_url || undefined,
    android_download_url: campaign.android_download_url || undefined,
  });

  const updateFormData = (data: Partial<typeof formData>) => {
    setFormData(prev => ({ ...prev, ...data }));
  };
  
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

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);

      // 验证
      if (!formData.campaign_name.trim()) {
        toast({
          title: "Validation Error",
          description: "Campaign name is required",
          variant: "error",
        });
        return;
      }

      if (formData.budget_amount <= 0) {
        toast({
          title: "Validation Error",
          description: "Budget amount must be greater than 0",
          variant: "error",
        });
        return;
      }

      const requestData: UpdateCampaignRequest = {
        campaign_id: campaign.campaign_id,
        campaign_name: formData.campaign_name,
        location: formData.location,
        age: formData.age,
        gender: formData.gender,
        languages: formData.languages,
        spending_power: formData.spending_power,
        operating_system: formData.operating_system,
        os_versions: formData.os_versions,
        device_models: formData.device_models,
        connection_type: formData.connection_type,
        device_price_type: formData.device_price_type as 0 | 1 | undefined,
        device_price_min: formData.device_price_min,
        device_price_max: formData.device_price_max,
        planned_start_time: formData.planned_start_time,
        planned_end_time: formData.planned_end_time,
        time_zone: formData.time_zone,
        budget_type: formData.budget_type as 0 | 1 | undefined,
        budget_amount: formData.budget_amount,
        website: formData.website,
        ios_download_url: formData.ios_download_url,
        android_download_url: formData.android_download_url,
      };

      const response = await updateCampaign(requestData);

      if (response.base_resp.code === 0) {
        toast({
          title: "Success",
          description: "Campaign updated successfully",
        });
        onSuccess();
      } else {
        toast({
          title: "Error",
          description: response.base_resp.message || "Failed to update campaign",
          variant: "error",
        });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to update campaign";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Campaign</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Campaign Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Campaign Name</Label>
            <Input
              id="name"
              value={formData.campaign_name}
              onChange={(e) => updateFormData({ campaign_name: e.target.value })}
            />
          </div>

          {/* Location */}
          <div className="space-y-2">
            <Label>Location</Label>
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
            />
          </div>

          {/* Age Range */}
          <div className="space-y-2">
            <Label>Age Range</Label>
            <RadioGroup
              value={formData.age?.toString()}
              onValueChange={(value) => updateFormData({ age: Number(value) })}
              className="flex flex-wrap gap-0 border border-gray-200 overflow-hidden rounded-md"
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

          {/* Gender */}
          <div className="space-y-2">
            <Label>Gender</Label>
            <RadioGroup
              value={formData.gender?.toString()}
              onValueChange={(value) => updateFormData({ gender: Number(value) })}
              className="flex flex-wrap gap-0 border border-gray-200 overflow-hidden rounded-md"
            >
              {genderOptions.map((option, index) => (
                <Label
                  key={option.id}
                  htmlFor={`gender-${option.id}`}
                  className={`cursor-pointer px-4 py-2 transition-all text-center flex-1 ${
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

          {/* Languages */}
          <div className="space-y-2">
            <Label>Languages</Label>
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
            />
          </div>

          {/* Budget */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Budget Type</Label>
              <Select 
                value={formData.budget_type.toString()} 
                onValueChange={(value) => updateFormData({ budget_type: Number(value) as 0 | 1 })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Daily Budget</SelectItem>
                  <SelectItem value="1">Total Budget</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Budget Amount ($)</Label>
              <Input
                type="number"
                step="0.01"
                value={formData.budget_amount}
                onChange={(e) => updateFormData({ budget_amount: Number(e.target.value) })}
              />
            </div>
          </div>

          {/* Schedule */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Start Date & Time</Label>
              <Input
                type="datetime-local"
                value={formData.planned_start_time}
                onChange={(e) => updateFormData({ planned_start_time: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>End Date & Time</Label>
              <Input
                type="datetime-local"
                value={formData.planned_end_time}
                onChange={(e) => updateFormData({ planned_end_time: e.target.value })}
              />
            </div>
          </div>

          {/* URLs (if applicable) */}
          {campaign.optimization_goal === 'website' && (
            <div className="space-y-2">
              <Label>Website URL</Label>
              <Input
                type="url"
                placeholder="https://example.com"
                value={formData.website || ''}
                onChange={(e) => updateFormData({ website: e.target.value })}
              />
            </div>
          )}

          {(campaign.optimization_goal === 'app' || campaign.optimization_goal === 'app_promotion') && (
            <>
              <div className="space-y-2">
                <Label>iOS Download URL</Label>
                <Input
                  type="url"
                  placeholder="https://apps.apple.com/..."
                  value={formData.ios_download_url || ''}
                  onChange={(e) => updateFormData({ ios_download_url: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Android Download URL</Label>
                <Input
                  type="url"
                  placeholder="https://play.google.com/..."
                  value={formData.android_download_url || ''}
                  onChange={(e) => updateFormData({ android_download_url: e.target.value })}
                />
              </div>
            </>
          )}
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Updating...
              </>
            ) : (
              'Update Campaign'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

