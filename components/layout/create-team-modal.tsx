"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Camera, Loader2 } from "lucide-react";
import { IconSelector } from "@/components/common/icon-selector";
import { createTeam } from "@/lib/api/team";
import { isSuccessResponse, getErrorMessage } from "@/lib/api-client";

interface CreateTeamModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTeamCreated?: () => void;
}

export function CreateTeamModal({ open, onOpenChange, onTeamCreated }: CreateTeamModalProps) {
  const [teamName, setTeamName] = useState("");
  const [iconUrl, setIconUrl] = useState<string>("");
  const [iconSelectorOpen, setIconSelectorOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>("");

  const getTeamInitials = (name: string) => {
    if (!name.trim()) return "";
    return name
      .trim()
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const handleCreate = async () => {
    if (!teamName.trim()) {
      setError("Team name is required");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await createTeam({
        name: teamName.trim(),
        icon_url: iconUrl || undefined,
      });

      if (isSuccessResponse(response.base_resp)) {
        // 成功创建团队
        setTeamName("");
        setIconUrl("");
        onOpenChange(false);
        onTeamCreated?.();
      } else {
        setError(getErrorMessage(response.base_resp));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create team");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setTeamName("");
      setIconUrl("");
      setError("");
      onOpenChange(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Create New Team</DialogTitle>
            <DialogDescription>
              Create a new team to collaborate with others on your campaigns.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Team Icon */}
            <div className="flex flex-col items-center gap-3">
              <div className="relative group/icon">
                <Avatar className="h-24 w-24 rounded-2xl">
                  {iconUrl ? (
                    <img
                      src={iconUrl}
                      alt="Team icon"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <AvatarFallback className="bg-gradient-to-br from-blue-600 to-purple-600 text-white text-2xl font-bold rounded-2xl">
                      {getTeamInitials(teamName) || "T"}
                    </AvatarFallback>
                  )}
                </Avatar>
                <button
                  type="button"
                  onClick={() => setIconSelectorOpen(true)}
                  disabled={isLoading}
                  className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-2xl opacity-0 group-hover/icon:opacity-100 transition-opacity disabled:cursor-not-allowed"
                >
                  <Camera className="h-8 w-8 text-white" />
                </button>
              </div>
              <p className="text-xs text-gray-500">
                Click to choose team icon
              </p>
            </div>

            {/* Team Name */}
            <div className="space-y-2">
              <Label htmlFor="team-name">Team Name</Label>
              <Input
                id="team-name"
                placeholder="e.g. Marketing Team"
                value={teamName}
                onChange={(e) => {
                  setTeamName(e.target.value);
                  setError("");
                }}
                disabled={isLoading}
                maxLength={50}
              />
              <p className="text-xs text-gray-500">
                {teamName.length}/50 characters
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 rounded-md bg-red-50 border border-red-200">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleCreate}
              disabled={isLoading || !teamName.trim()}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Team"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <IconSelector
        open={iconSelectorOpen}
        onOpenChange={setIconSelectorOpen}
        currentIcon={iconUrl}
        onIconChange={(url) => {
          setIconUrl(url);
          setIconSelectorOpen(false);
        }}
      />
    </>
  );
}

