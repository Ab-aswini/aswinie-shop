import { useState, useCallback, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import useEmblaCarousel from "embla-carousel-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

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

  useEffect(() => {
    if (emblaApi) {
      emblaApi.on("select", onSelect);
      onSelect();
    }
  }, [emblaApi, onSelect]);

  if (!images.length) {
    return (
      <div className={cn("w-full aspect-[4/5] bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center", className)}>
        <span className="text-muted-foreground">No images</span>
      </div>
    );
  }

  if (images.length === 1) {
    return (
      <div className={cn("relative w-full aspect-[4/5] overflow-hidden", className)}>
        <img
          src={images[0]}
          alt={productName}
          className="w-full h-full object-cover"
        />
        {/* Premium gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-black/20 pointer-events-none" />
      </div>
    );
  }

  return (
    <div className={cn("relative w-full aspect-[4/5] overflow-hidden", className)}>
      {/* Main Carousel */}
      <div ref={emblaRef} className="overflow-hidden h-full">
        <div className="flex h-full">
          {images.map((image, index) => (
            <div key={index} className="flex-[0_0_100%] min-w-0 h-full">
              <img
                src={image}
                alt={`${productName} - Image ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Premium gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-black/20 pointer-events-none" />

      {/* Premium Navigation Buttons */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={scrollPrev}
        className="absolute left-3 top-1/2 -translate-y-1/2 w-11 h-11 flex items-center justify-center rounded-full bg-background/90 backdrop-blur-md shadow-xl border border-border/20 hover:bg-background transition-all duration-300"
        aria-label="Previous image"
      >
        <ChevronLeft className="w-5 h-5 text-foreground" />
      </motion.button>
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={scrollNext}
        className="absolute right-3 top-1/2 -translate-y-1/2 w-11 h-11 flex items-center justify-center rounded-full bg-background/90 backdrop-blur-md shadow-xl border border-border/20 hover:bg-background transition-all duration-300"
        aria-label="Next image"
      >
        <ChevronRight className="w-5 h-5 text-foreground" />
      </motion.button>

      {/* Premium Dot Indicators */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-2 px-3 py-2 rounded-full bg-background/70 backdrop-blur-md shadow-lg">
        {images.map((_, index) => (
          <motion.button
            key={index}
            onClick={() => emblaApi?.scrollTo(index)}
            className={cn(
              "rounded-full transition-all duration-300",
              index === selectedIndex
                ? "w-6 h-2.5 bg-primary"
                : "w-2.5 h-2.5 bg-muted-foreground/40 hover:bg-muted-foreground/60"
            )}
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.9 }}
            aria-label={`Go to image ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
