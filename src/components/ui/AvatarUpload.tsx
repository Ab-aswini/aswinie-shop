import { useState, useRef } from "react";
import { Camera, Loader2, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface AvatarUploadProps {
  userId: string;
  currentAvatarUrl?: string | null;
  userName?: string;
  onUploadComplete?: (url: string) => void;
  size?: "sm" | "md" | "lg";
}

export function AvatarUpload({
  userId,
  currentAvatarUrl,
  userName,
  onUploadComplete,
  size = "lg",
}: AvatarUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(currentAvatarUrl);
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const sizeClasses = {
    sm: "w-14 h-14",
    md: "w-16 h-16",
    lg: "w-20 h-20",
  };

  const iconSizes = {
    sm: "w-6 h-6",
    md: "w-8 h-8",
    lg: "w-10 h-10",
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file.",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload an image smaller than 5MB.",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);

    try {
      // Create unique file name
      const fileExt = file.name.split(".").pop();
      const fileName = `${userId}/avatar-${Date.now()}.${fileExt}`;

      // Delete old avatar if exists
      if (avatarUrl) {
        const oldPath = avatarUrl.split("/avatars/")[1];
        if (oldPath) {
          await supabase.storage.from("avatars").remove([oldPath]);
        }
      }

      // Upload new avatar
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from("avatars")
        .getPublicUrl(fileName);

      // Update profile with new avatar URL
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: publicUrl })
        .eq("id", userId);

      if (updateError) throw updateError;

      setAvatarUrl(publicUrl);
      onUploadComplete?.(publicUrl);

      toast({
        title: "Avatar updated",
        description: "Your profile picture has been updated.",
      });
    } catch (error: any) {
      console.error("Upload error:", error);
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload avatar.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    }
  };

  return (
    <div className="relative group">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={isUploading}
        className={cn(
          sizeClasses[size],
          "relative rounded-full overflow-hidden",
          "bg-secondary flex items-center justify-center",
          "ring-2 ring-background shadow-lg",
          "transition-all duration-300",
          "hover:ring-primary/50 group-hover:shadow-xl",
          isUploading && "opacity-70"
        )}
      >
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={userName || "User avatar"}
            className="w-full h-full object-cover"
          />
        ) : (
          <User className={cn(iconSizes[size], "text-muted-foreground")} />
        )}

        {/* Overlay on hover */}
        <div className={cn(
          "absolute inset-0 bg-black/50 flex items-center justify-center",
          "opacity-0 group-hover:opacity-100 transition-opacity duration-200",
          isUploading && "opacity-100"
        )}>
          {isUploading ? (
            <Loader2 className="w-5 h-5 text-white animate-spin" />
          ) : (
            <Camera className="w-5 h-5 text-white" />
          )}
        </div>
      </button>

      {/* Hidden file input */}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
        disabled={isUploading}
      />

      {/* Edit badge */}
      <div className={cn(
        "absolute -bottom-1 -right-1",
        "w-7 h-7 rounded-full",
        "bg-primary text-primary-foreground",
        "flex items-center justify-center",
        "shadow-md border-2 border-background",
        "transition-transform group-hover:scale-110"
      )}>
        <Camera className="w-3.5 h-3.5" />
      </div>
    </div>
  );
}
