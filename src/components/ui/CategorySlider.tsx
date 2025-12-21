import { motion } from "framer-motion";
import { useParentCategories } from "@/hooks/useCategories";
import { LayoutGrid } from "lucide-react";
import { Skeleton } from "./skeleton";
import { getCategoryIcon } from "@/lib/categories";
import { cn } from "@/lib/utils";

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
        {/* All Categories Button */}
        <motion.button
          onClick={() => onSelect?.('all')}
          whileTap={{ scale: 0.95 }}
          className={cn(
            "flex flex-col items-center gap-1.5 min-w-[64px] py-2 transition-all",
            selected === 'all' || !selected
              ? "text-primary"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <motion.div
            whileHover={{ scale: 1.05 }}
            className={cn(
              "w-12 h-12 rounded-2xl flex items-center justify-center transition-colors",
              selected === 'all' || !selected
                ? "bg-primary text-primary-foreground"
                : "bg-secondary"
            )}
          >
            <LayoutGrid className="w-5 h-5" />
          </motion.div>
          <span className="text-xs font-medium">All</span>
        </motion.button>

        {/* Category Buttons */}
        {categories?.slice(0, 10).map((category, index) => {
          const Icon = getCategoryIcon(category.slug);
          const isSelected = selected === category.slug;

          return (
            <motion.button
              key={category.id}
              onClick={() => onSelect?.(category.slug)}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              whileTap={{ scale: 0.95 }}
              className={cn(
                "flex flex-col items-center gap-1.5 min-w-[64px] py-2 transition-all",
                isSelected
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                className={cn(
                  "w-12 h-12 rounded-2xl flex items-center justify-center transition-colors",
                  isSelected
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary"
                )}
              >
                {category.icon ? (
                  <span className="text-xl">{category.icon}</span>
                ) : (
                  <Icon className="w-5 h-5" />
                )}
              </motion.div>
              <span className="text-xs font-medium text-center leading-tight max-w-[64px] truncate">
                {category.name}
              </span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}