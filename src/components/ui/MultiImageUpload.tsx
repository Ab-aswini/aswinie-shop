import { useState } from "react";
import { X, Loader2, Crop, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { ImageCropper } from "@/components/ui/ImageCropper";

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
}

export function MultiImageUpload({
  images,
  onImagesChange,
  maxImages = 5,
  isUploading = false,
  enableCropping = true,
  aspectRatio = 1,
}: MultiImageUploadProps) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [cropperOpen, setCropperOpen] = useState(false);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [editingImageId, setEditingImageId] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Always open cropper for new images when cropping is enabled
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
      {/* Main Grid - Responsive with touch-friendly sizes */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        {/* Uploaded Images */}
        {images.map((image, index) => (
          <div
            key={image.id}
            draggable
            onDragStart={() => handleDragStart(index)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDragEnd={handleDragEnd}
            className={cn(
              "relative aspect-square rounded-xl overflow-hidden",
              "bg-muted border-2 transition-all duration-200",
              index === 0 ? "border-primary ring-1 ring-primary/30" : "border-border",
              draggedIndex === index && "opacity-50 scale-95",
              "cursor-grab active:cursor-grabbing"
            )}
          >
            {/* Image */}
            <img
              src={image.url}
              alt={`Product ${index + 1}`}
              className="w-full h-full object-cover"
              draggable={false}
            />
            
            {/* Main Badge */}
            {index === 0 && (
              <div className="absolute top-1.5 left-1.5 sm:top-2 sm:left-2 px-1.5 sm:px-2 py-0.5 text-[9px] sm:text-[10px] font-bold uppercase tracking-wide bg-primary text-primary-foreground rounded-md shadow-sm">
                Main
              </div>
            )}

            {/* Delete Button - Touch friendly, always visible on mobile */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                removeImage(image.id);
              }}
              className={cn(
                "absolute top-1.5 right-1.5 sm:top-2 sm:right-2",
                "w-7 h-7 sm:w-6 sm:h-6", // Larger on mobile for touch
                "flex items-center justify-center rounded-full",
                "bg-black/60 text-white",
                "hover:bg-destructive active:bg-destructive",
                "transition-colors touch-manipulation"
              )}
              title="Remove"
            >
              <X className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
            </button>

            {/* Crop Button - Touch friendly, always visible */}
            {enableCropping && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleEditImage(image);
                }}
                className={cn(
                  "absolute bottom-1.5 right-1.5 sm:bottom-2 sm:right-2",
                  "w-8 h-8 sm:w-7 sm:h-7", // Larger on mobile for touch
                  "flex items-center justify-center rounded-lg",
                  "bg-primary text-primary-foreground",
                  "hover:bg-primary/90 active:bg-primary/80",
                  "shadow-lg transition-colors touch-manipulation"
                )}
                title="Crop image"
              >
                <Crop className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
              </button>
            )}
          </div>
        ))}

        {/* Add More Button - Touch friendly */}
        {images.length < maxImages && (
          <label 
            className={cn(
              "aspect-square rounded-xl border-2 border-dashed",
              "cursor-pointer transition-all duration-200",
              "flex flex-col items-center justify-center gap-1.5",
              "border-muted-foreground/30 hover:border-primary hover:bg-primary/5",
              "active:bg-primary/10 touch-manipulation"
            )}
          >
            {isUploading ? (
              <Loader2 className="w-6 h-6 text-muted-foreground animate-spin" />
            ) : (
              <>
                <div className="w-10 h-10 sm:w-8 sm:h-8 rounded-full bg-muted flex items-center justify-center">
                  <Plus className="w-5 h-5 sm:w-4 sm:h-4 text-muted-foreground" />
                </div>
                <span className="text-[11px] sm:text-[10px] text-muted-foreground font-medium">
                  Add Photo
                </span>
              </>
            )}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
              disabled={isUploading}
            />
          </label>
        )}
      </div>

      {/* Helper Text */}
      <p className="text-[11px] sm:text-[10px] text-muted-foreground text-center">
        {images.length}/{maxImages} photos • First image is main • Tap ✂️ to crop
      </p>

      {/* Image Cropper Dialog */}
      {cropperImageSrc && (
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