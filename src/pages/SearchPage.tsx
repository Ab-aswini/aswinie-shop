import { useState, useEffect } from "react";
import { ArrowLeft, Clock, Sparkles, Loader2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { SearchBar } from "@/components/ui/SearchBar";
import { ShopCard } from "@/components/ui/ShopCard";
import { supabase } from "@/integrations/supabase/client";

const SearchPage = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [shops, setShops] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    const saved = localStorage.getItem('recent-searches');
    return saved ? JSON.parse(saved) : ["Grocery", "Electronics", "Salon", "Tailor"];
  });

  // Search when query changes
  useEffect(() => {
    if (!query.trim()) {
      setShops([]);
      setProducts([]);
      return;
    }

    const searchTimeout = setTimeout(async () => {
      setIsSearching(true);
      try {
        // Search vendors
        const { data: vendorData } = await supabase
          .from('vendors')
          .select('*, category:categories(name, icon)')
          .or(`business_name.ilike.%${query}%,description.ilike.%${query}%`)
          .eq('is_approved', true)
          .limit(10);

        // Search products
        const { data: productData } = await supabase
          .from('products')
          .select('*, vendor:vendors(business_name)')
          .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
          .eq('is_active', true)
          .limit(10);

        setShops(vendorData || []);
        setProducts(productData || []);
      } catch (e) {
        console.error("Search error:", e);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(searchTimeout);
  }, [query]);

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

  return (
    <AppLayout showHeader={false}>
      <div className="px-4 py-4 space-y-4">
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
        </div>

        {!query ? (
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
            {shops.length > 0 && (
              <section>
                <h3 className="text-sm font-medium text-muted-foreground mb-3">
                  Shops ({shops.length})
                </h3>
                <div className="grid grid-cols-2 gap-3">
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
                <div className="space-y-2">
                  {products.map((product) => (
                    <Link
                      key={product.id}
                      to={`/shop/${product.vendor_id}`}
                      className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border/50"
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
                  No results for "{query}"
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
              </div>
            )}
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default SearchPage;
