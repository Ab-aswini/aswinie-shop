import { useState, useEffect, useMemo } from "react";
import { ArrowLeft, Clock, Sparkles, Loader2, Filter, X, ArrowUpDown, Star, TrendingUp } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { SearchBar } from "@/components/ui/SearchBar";
import { ShopCard } from "@/components/ui/ShopCard";
import { supabase } from "@/integrations/supabase/client";
import CategoryFilter from "@/components/ui/CategoryFilter";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CategorySlider } from "@/components/ui/CategorySlider";

type SortOption = 'relevance' | 'newest' | 'rating' | 'price_low' | 'price_high';

const SearchPage = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState<SortOption>('relevance');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [shops, setShops] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    const saved = localStorage.getItem('recent-searches');
    return saved ? JSON.parse(saved) : ["Grocery", "Electronics", "Salon", "Tailor"];
  });

  // Search when query or category changes
  useEffect(() => {
    if (!query.trim() && selectedCategory === 'all') {
      setShops([]);
      setProducts([]);
      return;
    }

    const searchTimeout = setTimeout(async () => {
      setIsSearching(true);
      try {
        // Build vendor query
        let vendorQuery = supabase
          .from('vendors')
          .select('*, category:categories(name, slug, icon)')
          .eq('is_approved', true)
          .limit(20);

        if (query.trim()) {
          vendorQuery = vendorQuery.or(`business_name.ilike.%${query}%,description.ilike.%${query}%`);
        }

        // Build product query
        let productQuery = supabase
          .from('products')
          .select('*, vendor:vendors(business_name)')
          .eq('is_active', true)
          .limit(20);

        if (query.trim()) {
          productQuery = productQuery.or(`name.ilike.%${query}%,description.ilike.%${query}%`);
        }

        if (selectedCategory !== 'all') {
          productQuery = productQuery.eq('category', selectedCategory);
        }

        const [{ data: vendorData }, { data: productData }] = await Promise.all([
          vendorQuery,
          productQuery
        ]);

        // Filter vendors by category slug if needed
        const filteredVendors = selectedCategory !== 'all' 
          ? (vendorData || []).filter(v => v.category?.slug === selectedCategory)
          : vendorData || [];

        setShops(filteredVendors);
        setProducts(productData || []);
      } catch (e) {
        console.error("Search error:", e);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(searchTimeout);
  }, [query, selectedCategory]);

  // Sort results
  const sortedShops = useMemo(() => {
    if (!shops.length) return [];
    return [...shops].sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return (b.avg_rating || 0) - (a.avg_rating || 0);
        case 'newest':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        default:
          return 0;
      }
    });
  }, [shops, sortBy]);

  const sortedProducts = useMemo(() => {
    if (!products.length) return [];
    return [...products].sort((a, b) => {
      switch (sortBy) {
        case 'price_low':
          return (a.price || 0) - (b.price || 0);
        case 'price_high':
          return (b.price || 0) - (a.price || 0);
        case 'newest':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        default:
          return 0;
      }
    });
  }, [products, sortBy]);

  // Get AI suggestions when no results
  useEffect(() => {
    if (query && shops.length === 0 && products.length === 0 && !isSearching) {
      const getAISuggestions = async () => {
        setIsLoadingAI(true);
        try {
          const { data } = await supabase.functions.invoke('ai-assist', {
            body: { type: 'search-help', searchQuery: query }
          });
          if (data?.response) {
            setAiSuggestions(data.response.split(',').map((s: string) => s.trim()).filter(Boolean));
          }
        } catch (e) {
          console.error("AI suggestions error:", e);
        } finally {
          setIsLoadingAI(false);
        }
      };
      getAISuggestions();
    } else {
      setAiSuggestions([]);
    }
  }, [query, shops.length, products.length, isSearching]);

  const saveSearch = (term: string) => {
    const updated = [term, ...recentSearches.filter(s => s !== term)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem('recent-searches', JSON.stringify(updated));
  };

  const handleSearch = (term: string) => {
    setQuery(term);
    saveSearch(term);
  };

  const handleCategorySelect = (slug: string) => {
    setSelectedCategory(slug);
    setIsFilterOpen(false);
  };

  const getSortLabel = () => {
    switch (sortBy) {
      case 'rating': return 'Top Rated';
      case 'newest': return 'Newest';
      case 'price_low': return 'Price: Low';
      case 'price_high': return 'Price: High';
      default: return 'Relevance';
    }
  };

  return (
    <AppLayout showHeader={false}>
      <div className="flex min-h-[calc(100vh-4rem)]">
        {/* Desktop Sidebar Filter */}
        {!isMobile && (
          <aside className="hidden md:block w-72 shrink-0 p-4 border-r border-border min-h-full bg-background">
            <CategoryFilter
              selectedCategory={selectedCategory}
              onSelectCategory={handleCategorySelect}
              type="product"
            />
          </aside>
        )}

        {/* Main Content */}
        <div className="flex-1 w-full max-w-full overflow-hidden">
          <div className="px-4 py-4 space-y-4">
            {/* Search header */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate(-1)}
                className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-muted transition-colors shrink-0"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="flex-1 min-w-0">
                <SearchBar
                  value={query}
                  onChange={setQuery}
                  placeholder="Search shops & products..."
                />
              </div>
              
              {/* Mobile Filter Button */}
              {isMobile && (
                <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
                  <SheetTrigger asChild>
                    <Button variant="outline" size="icon" className="relative h-9 w-9 shrink-0">
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

            {/* Mobile Category Slider */}
            {isMobile && (query || selectedCategory !== 'all') && (
              <div className="-mx-4 px-4 overflow-x-auto">
                <CategorySlider
                  selected={selectedCategory}
                  onSelect={handleCategorySelect}
                  type="product"
                />
              </div>
            )}

            {/* Sort + Active filter indicator */}
            {(query || selectedCategory !== 'all') && !isSearching && (
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-sm text-muted-foreground">
                    {sortedShops.length + sortedProducts.length} results
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
                
                <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
                  <SelectTrigger className="w-[120px] h-8 text-xs shrink-0">
                    <ArrowUpDown className="w-3 h-3 mr-1" />
                    <SelectValue>{getSortLabel()}</SelectValue>
                  </SelectTrigger>
                  <SelectContent className="bg-popover z-50">
                    <SelectItem value="relevance">Relevance</SelectItem>
                    <SelectItem value="newest">Newest</SelectItem>
                    <SelectItem value="rating">Top Rated</SelectItem>
                    <SelectItem value="price_low">Price: Low to High</SelectItem>
                    <SelectItem value="price_high">Price: High to Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {!query && selectedCategory === 'all' ? (
              /* Recent searches */
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-3">
                  Recent Searches
                </h3>
                <div className="flex flex-wrap gap-2">
                  {recentSearches.map((term) => (
                    <button
                      key={term}
                      onClick={() => handleSearch(term)}
                      className="flex items-center gap-2 px-3 py-2 rounded-full bg-secondary text-secondary-foreground text-sm"
                    >
                      <Clock className="w-3.5 h-3.5" />
                      {term}
                    </button>
                  ))}
                </div>
              </div>
            ) : isSearching ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : (
              /* Search results */
              <div className="space-y-6">
                {sortedShops.length > 0 && (
                  <section>
                    <h3 className="text-sm font-medium text-muted-foreground mb-3">
                      Shops ({sortedShops.length})
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                      {sortedShops.map((shop) => (
                        <ShopCard
                          key={shop.id}
                          id={shop.id}
                          name={shop.business_name}
                          image={shop.shop_image_url || "https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=400&h=300&fit=crop"}
                          rating={4.5}
                          category={shop.category?.name || "Shop"}
                        />
                      ))}
                    </div>
                  </section>
                )}

                {sortedProducts.length > 0 && (
                  <section>
                    <h3 className="text-sm font-medium text-muted-foreground mb-3">
                      Products ({sortedProducts.length})
                    </h3>
                    <div className="grid gap-2 sm:gap-3 grid-cols-1 sm:grid-cols-2">
                      {sortedProducts.map((product) => (
                        <Link
                          key={product.id}
                          to={`/product/${product.id}`}
                          className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border/50 hover:border-primary/50 transition-colors"
                        >
                          <img
                            src={product.enhanced_image_url || product.original_image_url || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100"}
                            alt={product.name}
                            className="w-14 h-14 sm:w-16 sm:h-16 rounded-lg object-cover shrink-0"
                            loading="lazy"
                          />
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-sm sm:text-base line-clamp-1">{product.name}</h4>
                            <p className="text-xs text-muted-foreground truncate">{product.vendor?.business_name}</p>
                            {product.price && (
                              <p className="text-primary font-semibold text-sm sm:text-base">
                                ₹{product.price.toLocaleString()}
                              </p>
                            )}
                          </div>
                        </Link>
                      ))}
                    </div>
                  </section>
                )}

                {sortedShops.length === 0 && sortedProducts.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground mb-4">
                      No results {query ? `for "${query}"` : 'in this category'}
                    </p>
                    
                    {isLoadingAI ? (
                      <div className="flex items-center justify-center gap-2 text-sm text-primary">
                        <Sparkles className="w-4 h-4" />
                        <span>Getting suggestions...</span>
                      </div>
                    ) : aiSuggestions.length > 0 && (
                      <div>
                        <p className="text-sm text-muted-foreground mb-2 flex items-center justify-center gap-1">
                          <Sparkles className="w-3 h-3" />
                          Try searching for:
                        </p>
                        <div className="flex flex-wrap justify-center gap-2">
                          {aiSuggestions.map((suggestion, i) => (
                            <button
                              key={i}
                              onClick={() => handleSearch(suggestion)}
                              className="px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm"
                            >
                              {suggestion}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {selectedCategory !== 'all' && (
                      <Button 
                        variant="link" 
                        className="mt-2"
                        onClick={() => setSelectedCategory('all')}
                      >
                        Clear category filter
                      </Button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default SearchPage;
