import { useState } from "react";
import { Filter, Store as StoreIcon, X } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { CategorySlider } from "@/components/ui/CategorySlider";
import { ShopCard } from "@/components/ui/ShopCard";
import { useVendors } from "@/hooks/useVendors";
import { Skeleton } from "@/components/ui/skeleton";
import CategoryFilter from "@/components/ui/CategoryFilter";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";

const ExplorePage = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const { data: vendors, isLoading } = useVendors();
  const isMobile = useIsMobile();

  const filteredShops = selectedCategory && selectedCategory !== 'all'
    ? vendors?.filter(shop => 
        shop.category?.slug === selectedCategory
      )
    : vendors;

  const handleCategorySelect = (slug: string) => {
    setSelectedCategory(slug);
    setIsFilterOpen(false);
  };

  return (
    <AppLayout headerTitle="Local Gems">
      <div className="flex">
        {/* Desktop Sidebar Filter */}
        {!isMobile && (
          <aside className="hidden md:block w-72 shrink-0 p-4 border-r border-border min-h-[calc(100vh-4rem)]">
            <CategoryFilter
              selectedCategory={selectedCategory}
              onSelectCategory={handleCategorySelect}
              type="product"
            />
          </aside>
        )}

        {/* Main Content */}
        <div className="flex-1 px-4 py-4 space-y-4">
          {/* Header with filter */}
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold">Explore Local Shops</h1>
            
            {/* Mobile Filter Button */}
            {isMobile && (
              <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
                <SheetTrigger asChild>
                  <Button variant="secondary" size="icon" className="relative">
                    <Filter className="w-5 h-5" />
                    {selectedCategory !== 'all' && (
                      <span className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full" />
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-80 p-0">
                  <SheetHeader className="p-4 border-b border-border">
                    <SheetTitle className="flex items-center justify-between">
                      Filter by Category
                      {selectedCategory !== 'all' && (
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleCategorySelect('all')}
                          className="text-xs"
                        >
                          Clear filter
                        </Button>
                      )}
                    </SheetTitle>
                  </SheetHeader>
                  <div className="p-4">
                    <CategoryFilter
                      selectedCategory={selectedCategory}
                      onSelectCategory={handleCategorySelect}
                      type="product"
                      showCard={false}
                    />
                  </div>
                </SheetContent>
              </Sheet>
            )}
          </div>

          {/* Mobile Category Slider */}
          {isMobile && (
            <CategorySlider
              selected={selectedCategory}
              onSelect={handleCategorySelect}
            />
          )}

          {/* Results count with active filter indicator */}
          <div className="flex items-center gap-2">
            <p className="text-sm text-muted-foreground">
              {filteredShops?.length || 0} shops found
            </p>
            {selectedCategory !== 'all' && (
              <Button
                variant="outline"
                size="sm"
                className="h-6 text-xs gap-1"
                onClick={() => setSelectedCategory('all')}
              >
                {selectedCategory}
                <X className="w-3 h-3" />
              </Button>
            )}
          </div>

          {/* Shop grid */}
          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="aspect-[4/3] rounded-xl" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              ))}
            </div>
          ) : filteredShops && filteredShops.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
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
              {selectedCategory !== 'all' && (
                <Button 
                  variant="link" 
                  className="mt-2"
                  onClick={() => setSelectedCategory('all')}
                >
                  View all shops
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default ExplorePage;
