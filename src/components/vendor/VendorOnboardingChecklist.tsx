import { useMemo } from "react";
import { Link } from "react-router-dom";
import { 
  CheckCircle2, 
  Circle, 
  Store, 
  Image, 
  Package, 
  FileText,
  ChevronRight,
  Sparkles
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Vendor {
  id: string;
  business_name: string;
  description: string | null;
  logo_url: string | null;
  shop_image_url: string | null;
  location: string | null;
  gst_number: string | null;
  udyam_number: string | null;
  is_approved: boolean;
}

interface Product {
  id: string;
}

interface VendorOnboardingChecklistProps {
  vendor: Vendor | null;
  products: Product[];
  onDismiss?: () => void;
}

interface ChecklistItem {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  isComplete: boolean;
  link: string;
  priority: 'required' | 'recommended';
}

export function VendorOnboardingChecklist({ 
  vendor, 
  products,
  onDismiss 
}: VendorOnboardingChecklistProps) {
  const checklistItems: ChecklistItem[] = useMemo(() => {
    if (!vendor) return [];

    return [
      {
        id: 'description',
        title: 'Add shop description',
        description: 'Tell customers about your business',
        icon: FileText,
        isComplete: !!vendor.description && vendor.description.length > 20,
        link: '/vendor/dashboard',
        priority: 'required',
      },
      {
        id: 'logo',
        title: 'Upload shop logo',
        description: 'Help customers recognize your brand',
        icon: Store,
        isComplete: !!vendor.logo_url,
        link: '/vendor/dashboard',
        priority: 'required',
      },
      {
        id: 'shop_image',
        title: 'Add shop cover image',
        description: 'Showcase your storefront or products',
        icon: Image,
        isComplete: !!vendor.shop_image_url,
        link: '/vendor/dashboard',
        priority: 'recommended',
      },
      {
        id: 'first_product',
        title: 'Add your first product',
        description: 'Start selling to customers',
        icon: Package,
        isComplete: products.length > 0,
        link: '/vendor/products/new',
        priority: 'required',
      },
      {
        id: 'more_products',
        title: 'Add 3+ products',
        description: 'More products = more visibility',
        icon: Sparkles,
        isComplete: products.length >= 3,
        link: '/vendor/products/new',
        priority: 'recommended',
      },
      {
        id: 'location',
        title: 'Set your location',
        description: 'Help nearby customers find you',
        icon: Store,
        isComplete: !!vendor.location,
        link: '/vendor/dashboard',
        priority: 'recommended',
      },
    ];
  }, [vendor, products]);

  const completedCount = checklistItems.filter(item => item.isComplete).length;
  const totalCount = checklistItems.length;
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;
  const isComplete = completedCount === totalCount;

  if (!vendor || isComplete) {
    return null;
  }

  const requiredItems = checklistItems.filter(item => item.priority === 'required');
  const recommendedItems = checklistItems.filter(item => item.priority === 'recommended');
  const incompleteRequired = requiredItems.filter(item => !item.isComplete);

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      {/* Header */}
      <div className="p-4 bg-gradient-to-r from-primary/10 to-primary/5 border-b border-border">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            Complete Your Shop Setup
          </h3>
          <span className="text-sm text-muted-foreground">
            {completedCount}/{totalCount}
          </span>
        </div>
        <Progress value={progress} className="h-2" />
        {incompleteRequired.length > 0 && (
          <p className="text-xs text-muted-foreground mt-2">
            {incompleteRequired.length} required step{incompleteRequired.length > 1 ? 's' : ''} remaining
          </p>
        )}
      </div>

      {/* Checklist Items */}
      <div className="divide-y divide-border">
        {/* Required Items */}
        {requiredItems.some(item => !item.isComplete) && (
          <div className="p-3">
            <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">
              Required
            </p>
            <div className="space-y-1">
              {requiredItems.map((item) => (
                <ChecklistItemRow key={item.id} item={item} />
              ))}
            </div>
          </div>
        )}

        {/* Recommended Items */}
        {recommendedItems.some(item => !item.isComplete) && (
          <div className="p-3">
            <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">
              Recommended
            </p>
            <div className="space-y-1">
              {recommendedItems.map((item) => (
                <ChecklistItemRow key={item.id} item={item} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Dismiss */}
      {onDismiss && progress >= 66 && (
        <div className="p-3 border-t border-border bg-muted/30">
          <Button
            variant="ghost"
            size="sm"
            onClick={onDismiss}
            className="w-full text-xs"
          >
            Dismiss checklist
          </Button>
        </div>
      )}
    </div>
  );
}

function ChecklistItemRow({ item }: { item: ChecklistItem }) {
  const Icon = item.icon;
  
  return (
    <Link
      to={item.link}
      className={cn(
        "flex items-center gap-3 p-2 rounded-lg transition-colors",
        item.isComplete 
          ? "opacity-60" 
          : "hover:bg-muted/50"
      )}
    >
      {item.isComplete ? (
        <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
      ) : (
        <Circle className="w-5 h-5 text-muted-foreground shrink-0" />
      )}
      <div className="flex-1 min-w-0">
        <p className={cn(
          "text-sm",
          item.isComplete && "line-through text-muted-foreground"
        )}>
          {item.title}
        </p>
        {!item.isComplete && (
          <p className="text-xs text-muted-foreground">{item.description}</p>
        )}
      </div>
      {!item.isComplete && (
        <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
      )}
    </Link>
  );
}