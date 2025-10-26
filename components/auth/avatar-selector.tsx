"use client";

import { ImgsSelector, EmojiItem } from "@/components/common/imgs-selector";
import { updateProfile } from "@/lib/api/user";
import { isSuccessResponse } from "@/lib/api-client";
import avatarEmojis from "@/data/avatar-emojis.json";
import { toast } from "@/hooks/use-toast";

interface AvatarSelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentAvatar?: string;
  onAvatarChange: (avatarUrl: string) => void;
}

export function AvatarSelector({
  open,
  onOpenChange,
  currentAvatar,
  onAvatarChange,
}: AvatarSelectorProps) {
  const handleAvatarChange = async (avatarUrl: string) => {
    try {
      // Update profile with new avatar
      const response = await updateProfile({
        avatar_url: avatarUrl,
      });

      if (isSuccessResponse(response.base_resp)) {
        onAvatarChange(avatarUrl);
        toast({
          title: "更新成功",
          description: "头像已更新",
        });
      } else {
        console.error("Failed to update avatar:", response.base_resp);
        toast({
          variant: "error",
          title: "更新失败",
          description: "请重试",
        });
      }
    } catch (error) {
      console.error("Failed to update avatar:", error);
      toast({
        variant: "error",
        title: "更新失败",
        description: "请重试",
      });
    }
  };

  return (
    <ImgsSelector
      open={open}
      onOpenChange={onOpenChange}
      currentImage={currentAvatar}
      onImageChange={handleAvatarChange}
      title="Change Avatar"
      description="Choose an emoji or upload your own image"
      emojiList={avatarEmojis as EmojiItem[]}
      avatarShape="circle"
      gridCols={6}
      allowUpload={true}
    />
  );
}
