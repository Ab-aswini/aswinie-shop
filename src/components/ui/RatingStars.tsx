import { Star } from "lucide-react";

interface RatingStarsProps {
  rating: number;
  maxRating?: number;
  size?: "sm" | "md" | "lg";
  interactive?: boolean;
  onChange?: (rating: number) => void;
}

const sizeClasses = {
  sm: "w-3.5 h-3.5",
  md: "w-5 h-5",
  lg: "w-6 h-6",
};

export function RatingStars({ 
  rating, 
  maxRating = 5, 
  size = "sm",
  interactive = false,
  onChange 
}: RatingStarsProps) {
  const handleClick = (index: number) => {
    if (interactive && onChange) {
      onChange(index + 1);
    }
  };

  return (
    <div className="rating-stars">
      {Array.from({ length: maxRating }).map((_, index) => {
        const filled = index < Math.floor(rating);
        const partial = !filled && index < rating;
        
        return (
          <button
            key={index}
            type="button"
            disabled={!interactive}
            onClick={() => handleClick(index)}
            className={`${interactive ? "cursor-pointer hover:scale-110" : "cursor-default"} transition-transform`}
          >
            <Star
              className={`${sizeClasses[size]} ${
                filled 
                  ? "fill-accent text-accent" 
                  : partial 
                    ? "fill-accent/50 text-accent" 
                    : "fill-muted text-muted"
              }`}
            />
          </button>
        );
      })}
    </div>
  );
}
