import { useState } from "react";
import { Upload, X, GripVertical, Loader2, Crop, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
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
      // Process one file at a time for cropping
      setPendingFile(files[0]);
      setCropperOpen(true);
    } else {
      // Original behavior - add all files
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
      // Replace existing image
      const updatedImages = images.map((img) =>
        img.id === editingImageId
          ? { ...img, url, file, isNew: true }
          : img
      );
      onImagesChange(updatedImages);
      setEditingImageId(null);
    } else {
      // Add new image
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
      // Convert image to base64
      let imageBase64: string;
      
      if (image.file) {
        // If we have a file, read it directly
        imageBase64 = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(image.file!);
        });
      } else {
        // Fetch the image and convert to base64
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
        // Convert base64 to blob/file
        const base64Response = await fetch(data.enhancedImageUrl);
        const blob = await base64Response.blob();
        const file = new File([blob], `enhanced-${Date.now()}.jpg`, { type: "image/jpeg" });
        const url = URL.createObjectURL(blob);

        // Update the image
        const updatedImages = images.map((img) =>
          img.id === image.id
            ? { ...img, url, file, isNew: true }
            : img
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

  return (
    <div className="space-y-3">
      {/* Image Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          {images.map((image, index) => (
            <div
              key={image.id}
              draggable={enhancingImageId !== image.id}
              onDragStart={() => handleDragStart(index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragEnd={handleDragEnd}
              className={cn(
                "relative aspect-square rounded-xl overflow-hidden border-2 group bg-muted",
                index === 0 ? "border-primary" : "border-border",
                draggedIndex === index && "opacity-50 scale-95",
                enhancingImageId === image.id ? "cursor-wait" : "cursor-move",
                "transition-all duration-200"
              )}
            >
              <img
                src={image.url}
                alt={`Product image ${index + 1}`}
                className={cn(
                  "w-full h-full object-cover",
                  enhancingImageId === image.id && "opacity-40 blur-sm scale-105"
                )}
              />
              
              {/* Enhancing overlay */}
              {enhancingImageId === image.id && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="flex flex-col items-center gap-1.5 text-foreground bg-background/80 rounded-lg px-3 py-2">
                    <Loader2 className="w-5 h-5 animate-spin text-primary" />
                    <span className="text-[10px] font-medium">Enhancing...</span>
                  </div>
                </div>
              )}
              
              {/* Primary Badge */}
              {index === 0 && enhancingImageId !== image.id && (
                <span className="absolute top-1.5 left-1.5 px-2 py-0.5 text-[10px] font-semibold bg-primary text-primary-foreground rounded-md shadow-sm">
                  Main
                </span>
              )}

              {/* Controls Overlay */}
              {enhancingImageId !== image.id && (
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-2">
                  <button
                    type="button"
                    className="w-8 h-8 flex items-center justify-center rounded-full bg-white/20 text-white hover:bg-white/30 transition-colors"
                    title="Drag to reorder"
                  >
                    <GripVertical className="w-4 h-4" />
                  </button>
                  {enableCropping && (
                    <button
                      type="button"
                      onClick={() => handleEditImage(image)}
                      className="w-8 h-8 flex items-center justify-center rounded-full bg-white/20 text-white hover:bg-white/30 transition-colors"
                      title="Crop image"
                    >
                      <Crop className="w-4 h-4" />
                    </button>
                  )}
                  {enableAIEnhancement && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button
                          type="button"
                          className="w-8 h-8 flex items-center justify-center rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                          title="AI Enhance"
                        >
                          <Sparkles className="w-4 h-4" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="center" side="top" className="min-w-[160px]">
                        <DropdownMenuItem onClick={() => handleEnhanceImage(image, 'clean-background')}>
                          🎨 Clean Background
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEnhanceImage(image, 'professional')}>
                          ✨ Professional Look
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEnhanceImage(image, 'bright-lighting')}>
                          💡 Bright Lighting
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              )}

              {/* Remove Button */}
              {enhancingImageId !== image.id && (
                <button
                  type="button"
                  onClick={() => removeImage(image.id)}
                  className="absolute top-1.5 right-1.5 w-6 h-6 flex items-center justify-center rounded-full bg-destructive text-destructive-foreground opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                  title="Remove image"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Upload Button */}
      {images.length < maxImages && (
        <div
          className="border-2 border-dashed border-border rounded-xl p-6 text-center cursor-pointer hover:border-primary/50 transition-colors"
          onClick={() => document.getElementById("multi-image-upload")?.click()}
        >
          {isUploading ? (
            <>
              <Loader2 className="w-8 h-8 mx-auto text-muted-foreground mb-2 animate-spin" />
              <p className="text-sm text-muted-foreground">Uploading...</p>
            </>
          ) : (
            <>
              <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">
                {images.length === 0
                  ? "Tap to upload photos"
                  : `Add more (${images.length}/${maxImages})`}
              </p>
              {enableCropping && (
                <p className="text-xs text-muted-foreground mt-1">
                  Images will be cropped to {aspectRatio === 1 ? "square" : `${aspectRatio}:1`} ratio
                </p>
              )}
              {enableAIEnhancement && (
                <p className="text-xs text-primary mt-1 flex items-center justify-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  AI enhancement available
                </p>
              )}
            </>
          )}
          <input
            id="multi-image-upload"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
            disabled={isUploading}
          />
        </div>
      )}

      {images.length > 0 && (
        <p className="text-xs text-muted-foreground text-center">
          Drag to reorder. First image is the main photo.
          {enableAIEnhancement && " Hover and click ✨ to enhance."}
        </p>
      )}

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