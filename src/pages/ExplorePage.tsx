import { useState } from "react";
import { Filter, Store as StoreIcon } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { CategorySlider } from "@/components/ui/CategorySlider";
import { ShopCard } from "@/components/ui/ShopCard";
import { useVendors } from "@/hooks/useVendors";
import { Skeleton } from "@/components/ui/skeleton";

const ExplorePage = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>();
  const { data: vendors, isLoading } = useVendors();

  const filteredShops = selectedCategory && selectedCategory !== 'all'
    ? vendors?.filter(shop => 
        shop.category?.slug === selectedCategory
      )
    : vendors;

  return (
    <AppLayout headerTitle="Local Gems">
      <div className="px-4 py-4 space-y-4">
        {/* Header with filter */}
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold">Explore Local Shops</h1>
          <button className="w-10 h-10 flex items-center justify-center rounded-full bg-secondary">
            <Filter className="w-5 h-5 text-secondary-foreground" />
          </button>
        </div>

        {/* Categories */}
        <CategorySlider
          selected={selectedCategory}
          onSelect={(slug) => setSelectedCategory(slug === selectedCategory ? undefined : slug)}
        />

        {/* Results count */}
        <p className="text-sm text-muted-foreground">
          {filteredShops?.length || 0} shops found
        </p>

        {/* Shop grid */}
        {isLoading ? (
          <div className="grid grid-cols-2 gap-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="aspect-[4/3] rounded-xl" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            ))}
          </div>
        ) : filteredShops && filteredShops.length > 0 ? (
          <div className="grid grid-cols-2 gap-3">
            {filteredShops.map((shop) => (
              <ShopCard
                key={shop.id}
                id={shop.id}
                name={shop.business_name}
                image={shop.shop_image_url || "https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=400&h=300&fit=crop"}
                rating={shop.avg_rating || 4.5}
                category={shop.category?.name || "Shop"}
                location={shop.city || undefined}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <StoreIcon className="w-12 h-12 mx-auto mb-2 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground">No shops found in this category</p>
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default ExplorePage;
