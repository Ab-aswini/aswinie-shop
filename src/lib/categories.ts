import {
  ShoppingBag, Leaf, Shirt, Footprints, Smartphone, Zap, UtensilsCrossed, Sofa,
  Pill, BookOpen, Sparkles, Wheat, Bird, Sprout, Gift, Recycle, Car, PawPrint, Wallet,
  Wrench, Plug, Hammer, PaintBucket, Building, Tv, Wind, Construction,
  Scissors, Heart, Brush, ChefHat, Droplets, Bug, Bus,
  GraduationCap, Monitor, Stethoscope, Dumbbell, FileText, LayoutGrid, MoreHorizontal,
  Store, Apple, Carrot, ShoppingCart, Package, Gem, Watch, Headphones, Camera,
  Home, Bed, Utensils, Baby, Flower2, Palette, Music, Gamepad2, Trophy,
  Dog, Cat, Fish, Tractor, TreeDeciduous, Sun, CloudRain, Truck,
  CreditCard, Banknote, QrCode, LucideIcon
} from 'lucide-react';

// Interface for category groups
export interface CategoryGroup {
  id: string;
  name: string;
  icon: LucideIcon;
  categories: {
    name: string;
    slug: string;
    icon: LucideIcon;
  }[];
}

// Icon mapping for categories by slug
export const CATEGORY_ICON_MAP: Record<string, LucideIcon> = {
  // Food & Groceries
  'food-groceries': ShoppingBag,
  'kirana-store': Store,
  'general-store': ShoppingCart,
  'packaged-foods': Package,
  
  // Fresh Produce
  'fresh-produce': Leaf,
  'fruits': Apple,
  'vegetables': Carrot,
  'local-produce': Sprout,
  
  // Fashion & Textiles
  'fashion-textiles': Shirt,
  'clothing': Shirt,
  'handloom': Palette,
  'kidswear': Baby,
  'sarees-ethnic': Sparkles,
  'tailoring': Scissors,
  
  // Footwear & Accessories
  'footwear-accessories': Footprints,
  'bags-wallets': Wallet,
  'jewelry-watches': Watch,
  'footwear': Footprints,
  
  // Electronics & Gadgets
  'electronics-gadgets': Smartphone,
  'mobile-accessories': Headphones,
  'computer-repair': Monitor,
  'electronics-repair': Zap,
  'camera-equipment': Camera,
  
  // Home & Living
  'home-living': Home,
  'furniture': Sofa,
  'bedding-linen': Bed,
  'kitchen-dining': Utensils,
  'home-decor': Flower2,
  
  // Health & Pharmacy
  'health-pharmacy': Pill,
  'pharmacy': Pill,
  'wellness': Heart,
  'medical-equipment': Stethoscope,
  'fitness': Dumbbell,
  
  // Education & Stationery
  'education-stationery': BookOpen,
  'books': BookOpen,
  'stationery': FileText,
  'educational-toys': Gamepad2,
  
  // Beauty & Cosmetics
  'beauty-cosmetics': Sparkles,
  'cosmetics': Sparkles,
  'skincare': Droplets,
  'haircare': Brush,
  'salon-products': Scissors,
  
  // Agriculture & Farming
  'agriculture-farming': Wheat,
  'seeds-fertilizers': Sprout,
  'farming-equipment': Tractor,
  'dairy-products': TreeDeciduous,
  
  // Pets & Animals
  'pets-animals': PawPrint,
  'pet-food': Dog,
  'pet-accessories': Cat,
  'aquarium': Fish,
  
  // Handicrafts & Gifts
  'handicrafts-gifts': Gift,
  'handmade': Palette,
  'gift-items': Gift,
  'decorative': Flower2,
  
  // Automotive
  'automotive': Car,
  'car-accessories': Car,
  'bike-accessories': Truck,
  'spare-parts': Wrench,
  
  // Fintech & Digital
  'fintech-digital': CreditCard,
  'digital-payments': QrCode,
  'banking-services': Banknote,
  
  // Services
  'plumbing': Droplets,
  'electrical': Zap,
  'carpentry': Hammer,
  'painting': PaintBucket,
  'construction': Construction,
  'cleaning': Sparkles,
  'pest-control': Bug,
  'transport': Bus,
  'tutoring': GraduationCap,
  'catering': ChefHat,
  'ac-repair': Wind,
  
  // Default
  'all': LayoutGrid,
};

// Helper function to get icon with fallback
export const getCategoryIcon = (slug: string): LucideIcon => {
  return CATEGORY_ICON_MAP[slug] || MoreHorizontal;
};

// Get icon by category name (fallback for categories without slug)
export const getCategoryIconByName = (name: string): LucideIcon => {
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
  return getCategoryIcon(slug);
};

// Animation variants for framer-motion
export const categoryAnimations = {
  container: {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  },
  item: {
    hidden: { opacity: 0, y: 10 },
    show: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.2,
        ease: [0.4, 0, 0.2, 1] as const,
      },
    },
  },
  collapse: {
    open: { 
      height: 'auto', 
      opacity: 1,
      transition: {
        height: { duration: 0.3, ease: [0.4, 0, 0.2, 1] as const },
        opacity: { duration: 0.2, delay: 0.1 },
      },
    },
    closed: { 
      height: 0, 
      opacity: 0,
      transition: {
        height: { duration: 0.3, ease: [0.4, 0, 1, 1] as const },
        opacity: { duration: 0.15 },
      },
    },
  },
};
