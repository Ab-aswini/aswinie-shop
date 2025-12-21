import { useState } from "react";
import { Upload, X, GripVertical, Loader2, Crop } from "lucide-react";
import { Button } from "@/components/ui/button";
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
  enableCropping = false,
  aspectRatio = 1,
}: MultiImageUploadProps) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [cropperOpen, setCropperOpen] = useState(false);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [editingImageId, setEditingImageId] = useState<string | null>(null);

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
    // For existing images, we'll use the URL directly
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
      {/* Image Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {images.map((image, index) => (
            <div
              key={image.id}
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragEnd={handleDragEnd}
              className={cn(
                "relative aspect-square rounded-lg overflow-hidden border-2 cursor-move group",
                index === 0 ? "border-primary" : "border-transparent",
                draggedIndex === index && "opacity-50"
              )}
            >
              <img
                src={image.url}
                alt={`Product image ${index + 1}`}
                className="w-full h-full object-cover"
              />
              
              {/* Primary Badge */}
              {index === 0 && (
                <span className="absolute top-1 left-1 px-1.5 py-0.5 text-[10px] font-medium bg-primary text-primary-foreground rounded">
                  Main
                </span>
              )}

              {/* Controls Overlay */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <div className="text-white">
                  <GripVertical className="w-5 h-5" />
                </div>
                {enableCropping && (
                  <button
                    type="button"
                    onClick={() => handleEditImage(image)}
                    className="w-7 h-7 flex items-center justify-center rounded-full bg-white/20 text-white hover:bg-white/30 transition-colors"
                  >
                    <Crop className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Remove Button */}
              <button
                type="button"
                onClick={() => removeImage(image.id)}
                className="absolute top-1 right-1 w-6 h-6 flex items-center justify-center rounded-full bg-destructive text-destructive-foreground opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-4 h-4" />
              </button>
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