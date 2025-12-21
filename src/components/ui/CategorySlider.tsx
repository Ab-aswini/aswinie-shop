import { useCategories } from "@/hooks/useCategories";
import { 
  ShoppingBag, 
  Utensils, 
  Sparkles, 
  Smartphone, 
  Home as HomeIcon,
  Gift,
  Flower2,
  MoreHorizontal,
  Shirt,
  Pill,
  Stethoscope,
  BookOpen,
  Scissors,
  Wrench,
  Car,
  Bike,
  Paintbrush,
  Hammer,
  Zap,
  Droplets,
  Wind,
  ShoppingCart,
  Store,
  Gem,
  Watch,
  Glasses,
  Baby,
  Dumbbell,
  Music,
  Camera,
  Printer,
  Dog,
  Leaf,
  Building,
  Users,
  Calculator,
  Scale,
  Heart,
  Brain,
  GraduationCap,
  Languages,
  Laptop,
  LucideIcon
} from "lucide-react";
import { Skeleton } from "./skeleton";

// Map icon names from database to Lucide icons
const iconMap: Record<string, LucideIcon> = {
  "shopping-bag": ShoppingBag,
  "utensils": Utensils,
  "sparkles": Sparkles,
  "smartphone": Smartphone,
  "home": HomeIcon,
  "gift": Gift,
  "flower": Flower2,
  "more": MoreHorizontal,
  "shirt": Shirt,
  "pill": Pill,
  "stethoscope": Stethoscope,
  "book-open": BookOpen,
  "scissors": Scissors,
  "wrench": Wrench,
  "car": Car,
  "bike": Bike,
  "paintbrush": Paintbrush,
  "hammer": Hammer,
  "zap": Zap,
  "droplets": Droplets,
  "wind": Wind,
  "shopping-cart": ShoppingCart,
  "store": Store,
  "gem": Gem,
  "watch": Watch,
  "glasses": Glasses,
  "baby": Baby,
  "dumbbell": Dumbbell,
  "music": Music,
  "camera": Camera,
  "printer": Printer,
  "dog": Dog,
  "leaf": Leaf,
  "building": Building,
  "users": Users,
  "calculator": Calculator,
  "scale": Scale,
  "heart": Heart,
  "brain": Brain,
  "graduation-cap": GraduationCap,
  "languages": Languages,
  "laptop": Laptop,
};

interface CategorySliderProps {
  onSelect?: (categorySlug: string) => void;
  selected?: string;
  type?: 'product' | 'service';
}

export function CategorySlider({ onSelect, selected, type }: CategorySliderProps) {
  const { data: categories, isLoading } = useCategories(type);

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
        {categories?.slice(0, 10).map((category) => {
          const Icon = category.icon ? iconMap[category.icon] || Store : Store;
          return (
            <button
              key={category.id}
              onClick={() => onSelect?.(category.slug)}
              className={`flex flex-col items-center gap-1.5 min-w-[64px] py-2 transition-all ${
                selected === category.slug 
                  ? "text-primary" 
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${
                selected === category.slug
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary"
              }`}>
                <Icon className="w-5 h-5" />
              </div>
              <span className="text-xs font-medium text-center leading-tight max-w-[64px] truncate">
                {category.name}
              </span>
            </button>
          );
        })}
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
