import { 
  ShoppingBag, 
  Utensils, 
  Sparkles, 
  Smartphone, 
  Home as HomeIcon,
  Gift,
  Flower2,
  MoreHorizontal
} from "lucide-react";

const categories = [
  { id: "clothing", name: "Clothing", icon: ShoppingBag },
  { id: "food", name: "Food", icon: Utensils },
  { id: "beauty", name: "Beauty", icon: Sparkles },
  { id: "electronics", name: "Electronics", icon: Smartphone },
  { id: "home", name: "Home", icon: HomeIcon },
  { id: "gifts", name: "Gifts", icon: Gift },
  { id: "flowers", name: "Flowers", icon: Flower2 },
  { id: "more", name: "More", icon: MoreHorizontal },
];

interface CategorySliderProps {
  onSelect?: (categoryId: string) => void;
  selected?: string;
}

export function CategorySlider({ onSelect, selected }: CategorySliderProps) {
  return (
    <div className="overflow-x-auto no-scrollbar -mx-4 px-4">
      <div className="flex gap-3 pb-1">
        {categories.map(({ id, name, icon: Icon }) => (
          <button
            key={id}
            onClick={() => onSelect?.(id)}
            className={`flex flex-col items-center gap-1.5 min-w-[64px] py-2 transition-all ${
              selected === id 
                ? "text-primary" 
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${
              selected === id
                ? "bg-primary text-primary-foreground"
                : "bg-secondary"
            }`}>
              <Icon className="w-5 h-5" />
            </div>
            <span className="text-xs font-medium">{name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
