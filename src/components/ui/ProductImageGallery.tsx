import { useState, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import useEmblaCarousel from "embla-carousel-react";
import { cn } from "@/lib/utils";

interface ProductImageGalleryProps {
  images: string[];
  productName: string;
  className?: string;
}

export function ProductImageGallery({ images, productName, className }: ProductImageGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  // Set up the select callback
  useState(() => {
    if (emblaApi) {
      emblaApi.on("select", onSelect);
      onSelect();
    }
  });

  if (!images.length) {
    return (
      <div className={cn("w-full h-72 bg-muted flex items-center justify-center", className)}>
        <span className="text-muted-foreground">No images</span>
      </div>
    );
  }

  if (images.length === 1) {
    return (
      <img
        src={images[0]}
        alt={productName}
        className={cn("w-full h-72 object-cover", className)}
      />
    );
  }

  return (
    <div className={cn("relative", className)}>
      {/* Main Carousel */}
      <div ref={emblaRef} className="overflow-hidden">
        <div className="flex">
          {images.map((image, index) => (
            <div key={index} className="flex-[0_0_100%] min-w-0">
              <img
                src={image}
                alt={`${productName} - Image ${index + 1}`}
                className="w-full h-72 object-cover"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Buttons */}
      <button
        onClick={scrollPrev}
        className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-full bg-card/80 backdrop-blur-sm shadow-md hover:bg-card transition-colors"
        aria-label="Previous image"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      <button
        onClick={scrollNext}
        className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-full bg-card/80 backdrop-blur-sm shadow-md hover:bg-card transition-colors"
        aria-label="Next image"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* Dot Indicators */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
        {images.map((_, index) => (
          <button
            key={index}
            onClick={() => emblaApi?.scrollTo(index)}
            className={cn(
              "w-2 h-2 rounded-full transition-all",
              index === selectedIndex
                ? "bg-white w-4"
                : "bg-white/50 hover:bg-white/75"
            )}
            aria-label={`Go to image ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}