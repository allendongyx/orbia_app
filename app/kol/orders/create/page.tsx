"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Sparkles, FileText, Clock, Video, DollarSign, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getKolInfo, getKolPlans, KolInfo, KolPlan } from "@/lib/api/kol";
import { createKolOrder } from "@/lib/api/kol-order";
import { isSuccessResponse } from "@/lib/api-client";
import { useToast } from "@/hooks/use-toast";
import { DictionaryText } from "@/components/common/dictionary-text";

export default function CreateOrderPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const kolId = searchParams.get("kol_id");
  const planId = searchParams.get("plan_id");
  const { toast } = useToast();

  const [kolInfo, setKolInfo] = useState<KolInfo | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<KolPlan | null>(null);
  const [loading, setLoading] = useState(true);
  
  // 表单数据
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    videoType: "",
    expectedDuration: "",
    targetAudience: "",
    deliveryDate: "",
    additionalRequirements: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (kolId) {
      loadKolData();
      loadSelectedPlan();
    }
  }, [kolId, planId]);

  const loadKolData = async () => {
    try {
      const result = await getKolInfo({ kol_id: parseInt(kolId!) });
      if (isSuccessResponse(result.base_resp) && result.kol_info) {
        setKolInfo(result.kol_info);
      }
    } catch (err) {
      console.error("Failed to load KOL info:", err);
    }
  };

  const loadSelectedPlan = async () => {
    setLoading(true);
    try {
      const result = await getKolPlans({ kol_id: parseInt(kolId!) });
      if (isSuccessResponse(result.base_resp) && result.plans) {
        const plan = result.plans.find(p => p.id === parseInt(planId!));
        if (plan) {
          setSelectedPlan(plan);
        }
      }
    } catch (err) {
      console.error("Failed to load plan:", err);
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = "请输入订单标题";
    }
    if (!formData.description.trim()) {
      newErrors.description = "请描述您的合作需求";
    }
    if (!formData.videoType.trim()) {
      newErrors.videoType = "请说明视频类型";
    }
    if (!formData.expectedDuration.trim() || parseInt(formData.expectedDuration) <= 0) {
      newErrors.expectedDuration = "请输入有效的预期时长";
    }
    if (!formData.targetAudience.trim()) {
      newErrors.targetAudience = "请输入目标受众";
    }
    if (!formData.deliveryDate.trim()) {
      newErrors.deliveryDate = "请选择期望交付日期";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    if (!kolId || !planId) {
      toast({
        variant: "error",
        title: "错误",
        description: "缺少必要参数",
      });
      return;
    }

    setSubmitting(true);

    try {
      const result = await createKolOrder({
        kol_id: parseInt(kolId),
        plan_id: parseInt(planId),
        title: formData.title,
        requirement_description: formData.description,
        video_type: formData.videoType,
        video_duration: parseInt(formData.expectedDuration),
        target_audience: formData.targetAudience,
        expected_delivery_date: formData.deliveryDate,
        additional_requirements: formData.additionalRequirements || undefined,
      });

      if (isSuccessResponse(result.base_resp)) {
        toast({
          title: "成功",
          description: "订单创建成功！",
        });
        // 成功后跳转到订单列表
        router.push("/kol/orders/placed");
      } else {
        toast({
          variant: "error",
          title: "失败",
          description: result.base_resp.msg || "创建订单失败",
        });
      }
    } catch (err) {
      console.error("Failed to create order:", err);
      toast({
        variant: "error",
        title: "错误",
        description: "创建订单失败，请重试",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
        <p className="text-gray-600">加载中...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 返回按钮 */}
      <Button
        variant="ghost"
        onClick={() => router.back()}
        className="gap-2 hover:bg-gray-100"
      >
        <ArrowLeft className="h-4 w-4" />
        返回
      </Button>

      {/* 页面标题 */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-lg">
          <Sparkles className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">创建订单</h1>
          <p className="text-gray-600">填写您的合作需求和订单详情</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 左侧：订单表单 */}
        <div className="lg:col-span-2">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-600" />
                订单详情
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* 订单标题 */}
                <div className="space-y-2">
                  <Label htmlFor="title">订单标题 *</Label>
                  <Input
                    id="title"
                    placeholder="例如：区块链项目推广视频"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className={errors.title ? "border-red-500" : ""}
                  />
                  {errors.title && (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.title}
                    </p>
                  )}
                </div>

                {/* 合作需求描述 */}
                <div className="space-y-2">
                  <Label htmlFor="description">合作需求描述 *</Label>
                  <Textarea
                    id="description"
                    placeholder="请详细描述您希望与 KOL 达成的合作内容，包括推广目标、核心信息等..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={4}
                    className={errors.description ? "border-red-500" : ""}
                  />
                  {errors.description && (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.description}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* 视频类型 */}
                  <div className="space-y-2">
                    <Label htmlFor="videoType">视频类型 *</Label>
                    <Input
                      id="videoType"
                      placeholder="例如：产品评测、教程、推广"
                      value={formData.videoType}
                      onChange={(e) => setFormData({ ...formData, videoType: e.target.value })}
                      className={errors.videoType ? "border-red-500" : ""}
                    />
                    {errors.videoType && (
                      <p className="text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {errors.videoType}
                      </p>
                    )}
                  </div>

                  {/* 预期时长 */}
                  <div className="space-y-2">
                    <Label htmlFor="expectedDuration">预期时长（秒）*</Label>
                    <Input
                      id="expectedDuration"
                      type="number"
                      placeholder="例如：60"
                      value={formData.expectedDuration}
                      onChange={(e) => setFormData({ ...formData, expectedDuration: e.target.value })}
                      className={errors.expectedDuration ? "border-red-500" : ""}
                    />
                    {errors.expectedDuration && (
                      <p className="text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {errors.expectedDuration}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* 目标受众 */}
                  <div className="space-y-2">
                    <Label htmlFor="targetAudience">目标受众 *</Label>
                    <Input
                      id="targetAudience"
                      placeholder="例如：18-35岁加密货币爱好者"
                      value={formData.targetAudience}
                      onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
                      className={errors.targetAudience ? "border-red-500" : ""}
                    />
                    {errors.targetAudience && (
                      <p className="text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {errors.targetAudience}
                      </p>
                    )}
                  </div>

                  {/* 期望交付日期 */}
                  <div className="space-y-2">
                    <Label htmlFor="deliveryDate">期望交付日期 *</Label>
                    <Input
                      id="deliveryDate"
                      type="date"
                      value={formData.deliveryDate}
                      onChange={(e) => setFormData({ ...formData, deliveryDate: e.target.value })}
                      className={errors.deliveryDate ? "border-red-500" : ""}
                    />
                    {errors.deliveryDate && (
                      <p className="text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {errors.deliveryDate}
                      </p>
                    )}
                  </div>
                </div>

                {/* 额外要求 */}
                <div className="space-y-2">
                  <Label htmlFor="additionalRequirements">额外要求</Label>
                  <Textarea
                    id="additionalRequirements"
                    placeholder="其他特殊要求或注意事项..."
                    value={formData.additionalRequirements}
                    onChange={(e) => setFormData({ ...formData, additionalRequirements: e.target.value })}
                    rows={3}
                  />
                </div>

                {/* 提交按钮 */}
                <div className="flex gap-3 pt-4 border-t">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.back()}
                    className="flex-1"
                  >
                    取消
                  </Button>
                  <Button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0"
                  >
                    {submitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        提交中...
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-2 h-4 w-4" />
                        提交订单
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* 右侧：订单摘要 */}
        <div className="space-y-6">
          {/* KOL 信息 */}
          {kolInfo && (
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">KOL 信息</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Avatar className="w-12 h-12 rounded-xl">
                    <AvatarImage 
                      src={kolInfo.avatar_url} 
                      alt={kolInfo.display_name}
                    />
                    <AvatarFallback className="rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 text-white font-bold text-lg">
                      {kolInfo.display_name.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold text-gray-900">{kolInfo.display_name}</h3>
                    <p className="text-sm text-gray-600">
                      <DictionaryText 
                        dictionaryCode="COUNTRY" 
                        code={kolInfo.country} 
                        fallback={kolInfo.country} 
                      />
                    </p>
                  </div>
                </div>
                {kolInfo.tags && kolInfo.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {kolInfo.tags.slice(0, 3).map((tag, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs">
                        {tag.tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* 选择的报价方案 */}
          {selectedPlan && (
            <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-50 to-purple-50">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-blue-600" />
                  选择的方案
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-4 bg-white rounded-xl">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">{selectedPlan.title}</h3>
                      <Badge variant="secondary" className="text-xs">
                        <DictionaryText 
                          dictionaryCode="KOL_PLAN_TYPE" 
                          code={selectedPlan.plan_type} 
                          fallback={selectedPlan.plan_type} 
                        />
                      </Badge>
                    </div>
                    {selectedPlan.plan_type === 'standard' && (
                      <Badge className="bg-blue-600 text-white">推荐</Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{selectedPlan.description}</p>
                  <div className="pt-3 border-t">
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-bold text-gray-900">${selectedPlan.price}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* 温馨提示 */}
          <Card className="border-0 shadow-sm bg-gradient-to-br from-amber-50 to-orange-50">
            <CardContent className="p-4">
              <div className="flex gap-3">
                <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">温馨提示</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• 请详细描述您的合作需求</li>
                    <li>• 提交后 KOL 会在 24 小时内响应</li>
                    <li>• 您可以在订单页面追踪进度</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

