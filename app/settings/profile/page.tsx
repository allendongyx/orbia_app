"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { AvatarSelector } from "@/components/auth/avatar-selector";
import { useAuth } from "@/contexts/auth-context";
import { updateProfile } from "@/lib/api/user";
import { isSuccessResponse } from "@/lib/api-client";
import { toast } from "@/hooks/use-toast";
import { Camera, User } from "lucide-react";

export default function Profile() {
  const { user, refreshUser } = useAuth();
  const [nickname, setNickname] = useState("");
  const [isAvatarSelectorOpen, setIsAvatarSelectorOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // 初始化昵称
  useEffect(() => {
    if (user?.nickname) {
      setNickname(user.nickname);
    }
  }, [user]);

  // 保存昵称
  const handleSaveNickname = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!nickname.trim()) {
      toast({
        variant: "error",
        title: "错误",
        description: "昵称不能为空",
      });
      return;
    }

    setIsSaving(true);
    try {
      const response = await updateProfile({
        nickname: nickname.trim(),
      });

      if (isSuccessResponse(response.base_resp)) {
        toast({
          title: "保存成功",
          description: "昵称已更新",
        });
        // 刷新用户信息
        await refreshUser();
      } else {
        toast({
          variant: "error",
          title: "保存失败",
          description: response.base_resp.message || "请重试",
        });
      }
    } catch (error) {
      console.error("Failed to update nickname:", error);
      toast({
        variant: "error",
        title: "保存失败",
        description: "请重试",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // 头像更新成功回调
  const handleAvatarChange = async () => {
    // 刷新用户信息以显示新头像
    await refreshUser();
    setIsAvatarSelectorOpen(false);
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>基本信息</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* 头像部分 */}
          <div className="space-y-2">
            <Label>头像</Label>
            <div className="flex items-center gap-4">
              <div className="relative">
                <Avatar className="h-20 w-20">
                  {user?.avatar_url ? (
                    <AvatarImage src={user.avatar_url} alt={user.nickname || "用户头像"} />
                  ) : (
                    <AvatarFallback className="bg-gray-200">
                      <User className="h-8 w-8 text-gray-500" />
                    </AvatarFallback>
                  )}
                </Avatar>
                <button
                  type="button"
                  onClick={() => setIsAvatarSelectorOpen(true)}
                  className="absolute bottom-0 right-0 rounded-full bg-blue-600 p-1.5 text-white shadow-md hover:bg-blue-700 transition-colors"
                >
                  <Camera className="h-3.5 w-3.5" />
                </button>
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-600">
                  点击相机图标更换头像
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  支持 JPG, PNG, GIF, WebP 格式，最大 10MB
                </p>
              </div>
            </div>
          </div>

          {/* 昵称部分 */}
          <form onSubmit={handleSaveNickname} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nickname">昵称</Label>
              <Input
                id="nickname"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="请输入昵称"
                className="max-w-md"
                disabled={isSaving}
              />
            </div>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? "保存中..." : "保存"}
            </Button>
          </form>

          {/* 其他信息显示 */}
          {user && (
            <div className="space-y-4 pt-4 border-t">
              <div className="space-y-2">
                <Label className="text-gray-600">邮箱</Label>
                <p className="text-sm">{user.email || "未设置"}</p>
              </div>
              <div className="space-y-2">
                <Label className="text-gray-600">钱包地址</Label>
                <p className="text-sm font-mono break-all">
                  {user.wallet_address || "未绑定"}
                </p>
              </div>
              <div className="space-y-2">
                <Label className="text-gray-600">角色</Label>
                <p className="text-sm">
                  {user.role === "admin" ? "管理员" : "普通用户"}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 头像选择器 */}
      <AvatarSelector
        open={isAvatarSelectorOpen}
        onOpenChange={setIsAvatarSelectorOpen}
        currentAvatar={user?.avatar_url}
        onAvatarChange={handleAvatarChange}
      />
    </>
  );
}

