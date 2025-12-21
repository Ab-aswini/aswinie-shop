import { useState } from "react";
import { Upload, X, GripVertical, Loader2, Crop, Sparkles, Plus, ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { ImageCropper } from "@/components/ui/ImageCropper";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ImageItem {
  id: string;
  url: string;
  file?: File;
  isNew?: boolean;
}

interface MultiImageUploadProps {
  images: ImageItem[];
  onImagesChange: (images: ImageItem[]) => void;
  maxImages?: number;
  isUploading?: boolean;
  enableCropping?: boolean;
  aspectRatio?: number;
  enableAIEnhancement?: boolean;
}

export function MultiImageUpload({
  images,
  onImagesChange,
  maxImages = 5,
  isUploading = false,
  enableCropping = false,
  aspectRatio = 1,
  enableAIEnhancement = false,
}: MultiImageUploadProps) {
  const { toast } = useToast();
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [cropperOpen, setCropperOpen] = useState(false);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [editingImageId, setEditingImageId] = useState<string | null>(null);
  const [enhancingImageId, setEnhancingImageId] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    if (enableCropping) {
      setPendingFile(files[0]);
      setCropperOpen(true);
    } else {
      const remainingSlots = maxImages - images.length;
      const filesToAdd = files.slice(0, remainingSlots);

      const newImages: ImageItem[] = filesToAdd.map((file) => ({
        id: `new-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        url: URL.createObjectURL(file),
        file,
        isNew: true,
      }));

      onImagesChange([...images, ...newImages]);
    }
    e.target.value = "";
  };

  const handleCropComplete = (croppedBlob: Blob) => {
    const file = new File([croppedBlob], `cropped-${Date.now()}.jpg`, { type: "image/jpeg" });
    const url = URL.createObjectURL(croppedBlob);

    if (editingImageId) {
      const updatedImages = images.map((img) =>
        img.id === editingImageId ? { ...img, url, file, isNew: true } : img
      );
      onImagesChange(updatedImages);
      setEditingImageId(null);
    } else {
      const newImage: ImageItem = {
        id: `new-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        url,
        file,
        isNew: true,
      };
      onImagesChange([...images, newImage]);
    }

    setPendingFile(null);
    setCropperOpen(false);
  };

  const handleEditImage = (image: ImageItem) => {
    setEditingImageId(image.id);
    setPendingFile(null);
    setCropperOpen(true);
  };

  const handleEnhanceImage = async (image: ImageItem, enhancementType: 'clean-background' | 'professional' | 'bright-lighting') => {
    setEnhancingImageId(image.id);
    
    try {
      let imageBase64: string;
      
      if (image.file) {
        imageBase64 = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(image.file!);
        });
      } else {
        const response = await fetch(image.url);
        const blob = await response.blob();
        imageBase64 = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
      }

      toast({ title: "Enhancing image...", description: "AI is improving your photo" });

      const { data, error } = await supabase.functions.invoke('ai-assist', {
        body: {
          type: 'enhance-product-photo',
          imageBase64,
          enhancementType,
        },
      });

      if (error) throw error;
      
      if (data?.enhancedImageUrl) {
        const base64Response = await fetch(data.enhancedImageUrl);
        const blob = await base64Response.blob();
        const file = new File([blob], `enhanced-${Date.now()}.jpg`, { type: "image/jpeg" });
        const url = URL.createObjectURL(blob);

        const updatedImages = images.map((img) =>
          img.id === image.id ? { ...img, url, file, isNew: true } : img
        );
        onImagesChange(updatedImages);
        
        toast({ title: "Image enhanced!", description: "Your product photo has been improved" });
      } else {
        throw new Error("No enhanced image returned");
      }
    } catch (error: any) {
      console.error("Enhancement error:", error);
      toast({ 
        title: "Enhancement failed", 
        description: error.message || "Could not enhance image",
        variant: "destructive" 
      });
    } finally {
      setEnhancingImageId(null);
    }
  };

  const removeImage = (id: string) => {
    const image = images.find((img) => img.id === id);
    if (image?.url.startsWith("blob:")) {
      URL.revokeObjectURL(image.url);
    }
    onImagesChange(images.filter((img) => img.id !== id));
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const newImages = [...images];
    const [draggedItem] = newImages.splice(draggedIndex, 1);
    newImages.splice(index, 0, draggedItem);
    onImagesChange(newImages);
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const cropperImageSrc = pendingFile 
    ? URL.createObjectURL(pendingFile) 
    : editingImageId 
      ? images.find(img => img.id === editingImageId)?.url || ""
      : "";

  // Calculate empty slots to show
  const emptySlots = Math.max(0, Math.min(maxImages - images.length - 1, 2));

  return (
    <div className="space-y-4">
      {/* Main Grid */}
      <div className="grid grid-cols-3 gap-2">
        {/* Uploaded Images */}
        {images.map((image, index) => (
          <div
            key={image.id}
            draggable={enhancingImageId !== image.id}
            onDragStart={() => handleDragStart(index)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDragEnd={handleDragEnd}
            className={cn(
              "relative aspect-square rounded-lg overflow-hidden group",
              "bg-muted border transition-all duration-200",
              index === 0 ? "border-primary" : "border-border",
              draggedIndex === index && "opacity-50 scale-95",
              enhancingImageId === image.id ? "cursor-wait" : "cursor-grab active:cursor-grabbing"
            )}
          >
            {/* Image */}
            <img
              src={image.url}
              alt={`Product ${index + 1}`}
              className={cn(
                "w-full h-full object-cover",
                enhancingImageId === image.id && "opacity-30 blur-sm"
              )}
              draggable={false}
            />
            
            {/* Main Badge - Smaller */}
            {index === 0 && enhancingImageId !== image.id && (
              <div className="absolute top-1 left-1 px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wide bg-primary text-primary-foreground rounded">
                Main
              </div>
            )}

            {/* Enhancing State - Compact */}
            {enhancingImageId === image.id && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-background/90 rounded-lg px-2 py-1.5 flex flex-col items-center gap-1">
                  <Loader2 className="w-4 h-4 animate-spin text-primary" />
                  <span className="text-[9px] font-medium">Enhancing...</span>
                </div>
              </div>
            )}

            {/* Hover Controls */}
            {enhancingImageId !== image.id && (
              <>
                {/* Delete Button - Small, top right */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeImage(image.id);
                  }}
                  className="absolute top-1 right-1 w-5 h-5 flex items-center justify-center rounded-full bg-black/70 text-white opacity-0 group-hover:opacity-100 hover:bg-destructive transition-all"
                  title="Remove"
                >
                  <X className="w-3 h-3" />
                </button>

                {/* Bottom Actions - Compact */}
                <div className="absolute bottom-0 left-0 right-0 p-1.5 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="flex items-center justify-center gap-1">
                    <button
                      type="button"
                      className="w-6 h-6 flex items-center justify-center rounded bg-white/25 text-white hover:bg-white/40 transition-colors"
                      title="Drag to reorder"
                    >
                      <GripVertical className="w-3 h-3" />
                    </button>
                    
                    {enableCropping && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditImage(image);
                        }}
                        className="w-6 h-6 flex items-center justify-center rounded bg-white/25 text-white hover:bg-white/40 transition-colors"
                        title="Crop"
                      >
                        <Crop className="w-3 h-3" />
                      </button>
                    )}
                    
                    {enableAIEnhancement && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button
                            type="button"
                            className="w-6 h-6 flex items-center justify-center rounded bg-primary text-primary-foreground hover:bg-primary/80 transition-colors"
                            title="AI Enhance"
                          >
                            <Sparkles className="w-3 h-3" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent 
                          align="center" 
                          side="top" 
                          sideOffset={4}
                          className="min-w-[150px] bg-popover border shadow-xl z-50"
                        >
                          <DropdownMenuItem 
                            onClick={() => handleEnhanceImage(image, 'clean-background')}
                            className="text-xs gap-2 cursor-pointer py-1.5"
                          >
                            🎨 Clean Background
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleEnhanceImage(image, 'professional')}
                            className="text-xs gap-2 cursor-pointer py-1.5"
                          >
                            ✨ Professional Look
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleEnhanceImage(image, 'bright-lighting')}
                            className="text-xs gap-2 cursor-pointer py-1.5"
                          >
                            💡 Bright Lighting
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        ))}

        {/* Add More Button - Same size as images */}
        {images.length < maxImages && (
          <label className="aspect-square rounded-lg border-2 border-dashed border-border cursor-pointer hover:border-primary hover:bg-primary/5 transition-all flex flex-col items-center justify-center gap-1">
            {isUploading ? (
              <Loader2 className="w-5 h-5 text-muted-foreground animate-spin" />
            ) : (
              <>
                <Plus className="w-5 h-5 text-muted-foreground" />
                <span className="text-[10px] text-muted-foreground">Add</span>
              </>
            )}
            <input
              type="file"
              accept="image/*"
              multiple={!enableCropping}
              className="hidden"
              onChange={handleFileChange}
              disabled={isUploading}
            />
          </label>
        )}
      </div>

      {/* Helper Text - Minimal */}
      <p className="text-[10px] text-muted-foreground text-center">
        {images.length}/{maxImages} photos • First is main • Drag to reorder
        {enableAIEnhancement && " • Hover for AI ✨"}
      </p>

      {/* Image Cropper Dialog */}
      {enableCropping && cropperImageSrc && (
        <ImageCropper
          open={cropperOpen}
          onOpenChange={(open) => {
            setCropperOpen(open);
            if (!open) {
              setPendingFile(null);
              setEditingImageId(null);
            }
          }}
          imageSrc={cropperImageSrc}
          aspectRatio={aspectRatio}
          onCropComplete={handleCropComplete}
        />
      )}
    </div>
  );
}