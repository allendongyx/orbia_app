"use client";

import { ImgsSelector, EmojiItem } from "@/components/common/imgs-selector";
import { updateProfile } from "@/lib/api/user";
import { isSuccessResponse } from "@/lib/api-client";
import avatarEmojis from "@/data/avatar-emojis.json";

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
      } else {
        console.error("Failed to update avatar:", response.base_resp);
        alert("Failed to update avatar. Please try again.");
      }
    } catch (error) {
      console.error("Failed to update avatar:", error);
      alert("Failed to update avatar. Please try again.");
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
