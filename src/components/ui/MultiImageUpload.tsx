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
      {/* Main Grid - Always show consistent layout */}
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
        {/* Uploaded Images */}
        {images.map((image, index) => (
          <div
            key={image.id}
            draggable={enhancingImageId !== image.id}
            onDragStart={() => handleDragStart(index)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDragEnd={handleDragEnd}
            className={cn(
              "relative aspect-square rounded-xl overflow-hidden group",
              "bg-muted border-2 transition-all duration-200",
              index === 0 ? "border-primary ring-2 ring-primary/20" : "border-border hover:border-muted-foreground/30",
              draggedIndex === index && "opacity-50 scale-95",
              enhancingImageId === image.id ? "cursor-wait" : "cursor-grab active:cursor-grabbing"
            )}
          >
            {/* Image */}
            <img
              src={image.url}
              alt={`Product ${index + 1}`}
              className={cn(
                "w-full h-full object-cover transition-all duration-300",
                enhancingImageId === image.id && "opacity-30 blur-sm scale-110"
              )}
              draggable={false}
            />
            
            {/* Main Badge */}
            {index === 0 && enhancingImageId !== image.id && (
              <div className="absolute top-2 left-2 px-2 py-1 text-[10px] font-bold uppercase tracking-wider bg-primary text-primary-foreground rounded-md shadow-lg">
                Main
              </div>
            )}

            {/* Enhancing State */}
            {enhancingImageId === image.id && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-background/95 backdrop-blur-sm rounded-xl px-4 py-3 shadow-lg border border-border flex flex-col items-center gap-2">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  <span className="text-xs font-medium text-foreground">Enhancing...</span>
                </div>
              </div>
            )}

            {/* Hover Controls */}
            {enhancingImageId !== image.id && (
              <>
                {/* Delete Button - Always visible on hover, top right */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeImage(image.id);
                  }}
                  className="absolute top-2 right-2 w-7 h-7 flex items-center justify-center rounded-full bg-black/60 text-white opacity-0 group-hover:opacity-100 hover:bg-destructive transition-all duration-200 shadow-lg"
                  title="Remove"
                >
                  <X className="w-4 h-4" />
                </button>

                {/* Bottom Actions Bar */}
                <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/70 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-200">
                  <div className="flex items-center justify-center gap-1.5">
                    <button
                      type="button"
                      className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 transition-colors"
                      title="Drag to reorder"
                    >
                      <GripVertical className="w-4 h-4" />
                    </button>
                    
                    {enableCropping && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditImage(image);
                        }}
                        className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 transition-colors"
                        title="Crop"
                      >
                        <Crop className="w-4 h-4" />
                      </button>
                    )}
                    
                    {enableAIEnhancement && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button
                            type="button"
                            className="w-8 h-8 flex items-center justify-center rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm"
                            title="AI Enhance"
                          >
                            <Sparkles className="w-4 h-4" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent 
                          align="center" 
                          side="top" 
                          sideOffset={8}
                          className="min-w-[180px] bg-popover border border-border shadow-xl z-50"
                        >
                          <DropdownMenuItem 
                            onClick={() => handleEnhanceImage(image, 'clean-background')}
                            className="gap-2 cursor-pointer"
                          >
                            <span>🎨</span> Clean Background
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleEnhanceImage(image, 'professional')}
                            className="gap-2 cursor-pointer"
                          >
                            <span>✨</span> Professional Look
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleEnhanceImage(image, 'bright-lighting')}
                            className="gap-2 cursor-pointer"
                          >
                            <span>💡</span> Bright Lighting
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

        {/* Add More Button */}
        {images.length < maxImages && (
          <label
            className={cn(
              "aspect-square rounded-xl border-2 border-dashed cursor-pointer transition-all duration-200",
              "flex flex-col items-center justify-center gap-2",
              "border-border hover:border-primary hover:bg-primary/5",
              "group"
            )}
          >
            {isUploading ? (
              <Loader2 className="w-6 h-6 text-muted-foreground animate-spin" />
            ) : (
              <>
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                  <Plus className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
                <span className="text-xs text-muted-foreground group-hover:text-primary transition-colors">
                  Add Photo
                </span>
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

        {/* Empty Placeholder Slots */}
        {images.length === 0 && [...Array(emptySlots)].map((_, i) => (
          <div
            key={`empty-${i}`}
            className="aspect-square rounded-xl border-2 border-dashed border-border/50 flex items-center justify-center"
          >
            <ImageIcon className="w-6 h-6 text-muted-foreground/30" />
          </div>
        ))}
      </div>

      {/* Helper Text */}
      <div className="text-center space-y-1">
        <p className="text-xs text-muted-foreground">
          {images.length === 0 
            ? `Upload up to ${maxImages} product photos` 
            : `${images.length}/${maxImages} photos • Drag to reorder`}
        </p>
        {enableAIEnhancement && images.length > 0 && (
          <p className="text-xs text-primary/80 flex items-center justify-center gap-1">
            <Sparkles className="w-3 h-3" />
            Hover image for AI enhancement options
          </p>
        )}
      </div>

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