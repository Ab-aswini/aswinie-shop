import { useState, useMemo } from "react";
import { Filter, Store as StoreIcon, X, ArrowUpDown, Clock, Star, TrendingUp } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { CategorySlider } from "@/components/ui/CategorySlider";
import { ShopCard } from "@/components/ui/ShopCard";
import { useVendors } from "@/hooks/useVendors";
import { Skeleton } from "@/components/ui/skeleton";
import CategoryFilter from "@/components/ui/CategoryFilter";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type SortOption = 'newest' | 'rating' | 'popular';

const ExplorePage = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const { data: vendors, isLoading } = useVendors();
  const isMobile = useIsMobile();

  // Filter and sort shops
  const filteredAndSortedShops = useMemo(() => {
    let filtered = selectedCategory && selectedCategory !== 'all'
      ? vendors?.filter(shop => shop.category?.slug === selectedCategory)
      : vendors;

    if (!filtered) return [];

    // Sort based on selected option
    return [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return (b.avg_rating || 0) - (a.avg_rating || 0);
        case 'newest':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'popular':
          return (b.years_active || 0) - (a.years_active || 0);
        default:
          return 0;
      }
    });
  }, [vendors, selectedCategory, sortBy]);

  const handleCategorySelect = (slug: string) => {
    setSelectedCategory(slug);
    setIsFilterOpen(false);
  };

  const getSortIcon = () => {
    switch (sortBy) {
      case 'rating': return <Star className="w-4 h-4" />;
      case 'newest': return <Clock className="w-4 h-4" />;
      case 'popular': return <TrendingUp className="w-4 h-4" />;
      default: return <ArrowUpDown className="w-4 h-4" />;
    }
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
          {/* Header with filter and sort */}
          <div className="flex items-center justify-between gap-2">
            <h1 className="text-xl font-bold">Explore Local Shops</h1>
            
            <div className="flex items-center gap-2">
              {/* Sort Dropdown */}
              <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
                <SelectTrigger className="w-[130px] h-9">
                  <div className="flex items-center gap-2">
                    {getSortIcon()}
                    <SelectValue />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Newest
                    </div>
                  </SelectItem>
                  <SelectItem value="rating">
                    <div className="flex items-center gap-2">
                      <Star className="w-4 h-4" />
                      Top Rated
                    </div>
                  </SelectItem>
                  <SelectItem value="popular">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4" />
                      Popular
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>

              {/* Mobile Filter Button */}
              {isMobile && (
                <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
                  <SheetTrigger asChild>
                    <Button variant="outline" size="icon" className="relative h-9 w-9">
                      <Filter className="w-4 h-4" />
                      {selectedCategory !== 'all' && (
                        <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-primary rounded-full" />
                      )}
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="right" className="w-[85vw] max-w-sm p-0">
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
                            Clear
                          </Button>
                        )}
                      </SheetTitle>
                    </SheetHeader>
                    <div className="p-4 overflow-y-auto max-h-[calc(100vh-80px)]">
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
          </div>

          {/* Mobile Category Slider */}
          {isMobile && (
            <CategorySlider
              selected={selectedCategory}
              onSelect={handleCategorySelect}
              type="product"
            />
          )}

          {/* Results count with active filter indicator */}
          <div className="flex items-center flex-wrap gap-2">
            <p className="text-sm text-muted-foreground">
              {filteredAndSortedShops.length} shops found
            </p>
            {selectedCategory !== 'all' && (
              <Button
                variant="secondary"
                size="sm"
                className="h-6 text-xs gap-1 rounded-full"
                onClick={() => setSelectedCategory('all')}
              >
                {selectedCategory.replace(/-/g, ' ')}
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
          ) : filteredAndSortedShops.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {filteredAndSortedShops.map((shop) => (
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
