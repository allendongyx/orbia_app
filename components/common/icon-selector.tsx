"use client";

import { ImgsSelector, EmojiItem } from "@/components/common/imgs-selector";
import teamIcons from "@/data/team-icons.json";

interface IconSelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentIcon?: string;
  onIconChange: (iconUrl: string) => void;
}

export function IconSelector({
  open,
  onOpenChange,
  currentIcon,
  onIconChange,
}: IconSelectorProps) {
  return (
    <ImgsSelector
      open={open}
      onOpenChange={onOpenChange}
      currentImage={currentIcon}
      onImageChange={onIconChange}
      title="Change Team Icon"
      description="Choose an icon for your team"
      emojiList={teamIcons as EmojiItem[]}
      avatarShape="rounded"
      gridCols={5}
      allowUpload={true}
    />
  );
}

