import { useParentCategories } from "@/hooks/useCategories";
import { MoreHorizontal } from "lucide-react";
import { Skeleton } from "./skeleton";

interface CategorySliderProps {
  onSelect?: (categorySlug: string) => void;
  selected?: string;
  type?: 'product' | 'service';
}

export function CategorySlider({ onSelect, selected, type }: CategorySliderProps) {
  const { data: categories, isLoading } = useParentCategories(type);

  if (isLoading) {
    return (
      <div className="overflow-x-auto no-scrollbar -mx-4 px-4">
        <div className="flex gap-3 pb-1">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="flex flex-col items-center gap-1.5 min-w-[64px]">
              <Skeleton className="w-12 h-12 rounded-2xl" />
              <Skeleton className="w-10 h-3" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto no-scrollbar -mx-4 px-4">
      <div className="flex gap-3 pb-1">
        {categories?.slice(0, 10).map((category) => (
          <button
            key={category.id}
            onClick={() => onSelect?.(category.slug)}
            className={`flex flex-col items-center gap-1.5 min-w-[64px] py-2 transition-all ${
              selected === category.slug 
                ? "text-primary" 
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors text-xl ${
              selected === category.slug
                ? "bg-primary text-primary-foreground"
                : "bg-secondary"
            }`}>
              {category.icon || '🏪'}
            </div>
            <span className="text-xs font-medium text-center leading-tight max-w-[64px] truncate">
              {category.name}
            </span>
          </button>
        ))}
        <button
          onClick={() => onSelect?.('all')}
          className={`flex flex-col items-center gap-1.5 min-w-[64px] py-2 transition-all ${
            selected === 'all' 
              ? "text-primary" 
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${
            selected === 'all'
              ? "bg-primary text-primary-foreground"
              : "bg-secondary"
          }`}>
            <MoreHorizontal className="w-5 h-5" />
          </div>
          <span className="text-xs font-medium">All</span>
        </button>
      </div>
    </div>
  );
}