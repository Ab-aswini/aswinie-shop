import { useState, useEffect } from "react";
import { ArrowLeft, Clock, Sparkles, Loader2, Filter, X } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { SearchBar } from "@/components/ui/SearchBar";
import { ShopCard } from "@/components/ui/ShopCard";
import { supabase } from "@/integrations/supabase/client";
import CategoryFilter from "@/components/ui/CategoryFilter";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";

const SearchPage = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
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
          .limit(10);

        if (query.trim()) {
          vendorQuery = vendorQuery.or(`business_name.ilike.%${query}%,description.ilike.%${query}%`);
        }

        if (selectedCategory !== 'all') {
          vendorQuery = vendorQuery.eq('category.slug', selectedCategory);
        }

        // Build product query
        let productQuery = supabase
          .from('products')
          .select('*, vendor:vendors(business_name)')
          .eq('is_active', true)
          .limit(10);

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

        // Filter vendors by category slug if needed (since eq on nested field may not work)
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

  return (
    <AppLayout showHeader={false}>
      <div className="flex min-h-[calc(100vh-4rem)]">
        {/* Desktop Sidebar Filter */}
        {!isMobile && (
          <aside className="hidden md:block w-72 shrink-0 p-4 border-r border-border">
            <CategoryFilter
              selectedCategory={selectedCategory}
              onSelectCategory={handleCategorySelect}
              type="product"
            />
          </aside>
        )}

        {/* Main Content */}
        <div className="flex-1 px-4 py-4 space-y-4">
          {/* Search header */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-muted transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex-1">
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
                  <Button variant="secondary" size="icon" className="relative shrink-0">
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

          {/* Active filter indicator */}
          {selectedCategory !== 'all' && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Filtering:</span>
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-xs gap-1"
                onClick={() => setSelectedCategory('all')}
              >
                {selectedCategory.replace(/-/g, ' ')}
                <X className="w-3 h-3" />
              </Button>
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
              {/* Results count */}
              <p className="text-sm text-muted-foreground">
                {shops.length + products.length} results found
              </p>

              {shops.length > 0 && (
                <section>
                  <h3 className="text-sm font-medium text-muted-foreground mb-3">
                    Shops ({shops.length})
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {shops.map((shop) => (
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

              {products.length > 0 && (
                <section>
                  <h3 className="text-sm font-medium text-muted-foreground mb-3">
                    Products ({products.length})
                  </h3>
                  <div className="grid gap-2 md:grid-cols-2">
                    {products.map((product) => (
                      <Link
                        key={product.id}
                        to={`/product/${product.id}`}
                        className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border/50 hover:border-primary/50 transition-colors"
                      >
                        <img
                          src={product.enhanced_image_url || product.original_image_url || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100"}
                          alt={product.name}
                          className="w-16 h-16 rounded-lg object-cover"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium truncate">{product.name}</h4>
                          <p className="text-xs text-muted-foreground">{product.vendor?.business_name}</p>
                          {product.price && (
                            <p className="text-primary font-semibold">
                              ₹{product.price.toLocaleString()}
                            </p>
                          )}
                        </div>
                      </Link>
                    ))}
                  </div>
                </section>
              )}

              {shops.length === 0 && products.length === 0 && (
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
    </AppLayout>
  );
};

export default SearchPage;
