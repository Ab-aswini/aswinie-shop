import { Star, Bookmark, MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";

interface ShopCardProps {
  id: string;
  name: string;
  image: string;
  rating: number;
  category: string;
  location?: string;
  isSaved?: boolean;
}

export function ShopCard({ 
  id, 
  name, 
  image, 
  rating, 
  category, 
  location,
  isSaved = false 
}: ShopCardProps) {
  const [saved, setSaved] = useState(isSaved);

  return (
    <Link to={`/shop/${id}`} className="shop-card block h-full">
      <div className="flex flex-col h-full bg-card rounded-xl overflow-hidden border border-border/50 shadow-sm hover:shadow-md transition-shadow">
        {/* Fixed aspect ratio image container */}
        <div className="relative aspect-[4/3] overflow-hidden shrink-0">
          <img 
            src={image} 
            alt={name}
            className="w-full h-full object-cover"
            loading="lazy"
          />
          <button
            onClick={(e) => {
              e.preventDefault();
              setSaved(!saved);
            }}
            className="absolute top-2 right-2 w-8 h-8 flex items-center justify-center rounded-full bg-card/80 backdrop-blur-sm shadow-sm"
          >
            <Bookmark 
              className={`w-4 h-4 transition-colors ${
                saved ? "fill-primary text-primary" : "text-muted-foreground"
              }`} 
            />
          </button>
        </div>
        {/* Content - flexible height with consistent padding */}
        <div className="p-2.5 sm:p-3 flex flex-col flex-1 min-h-0">
          <h3 className="font-semibold text-foreground text-sm sm:text-base line-clamp-1">{name}</h3>
          <div className="flex items-center justify-between mt-1 gap-1">
            <span className="text-xs sm:text-sm text-muted-foreground truncate">{category}</span>
            <div className="flex items-center gap-0.5 shrink-0">
              <Star className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-accent text-accent" />
              <span className="text-xs sm:text-sm font-medium">{rating.toFixed(1)}</span>
            </div>
          </div>
          {location && (
            <div className="flex items-center gap-1 mt-1.5 text-xs text-muted-foreground">
              <MapPin className="w-3 h-3 shrink-0" />
              <span className="truncate">{location}</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
