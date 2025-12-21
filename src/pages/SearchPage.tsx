import { useState } from "react";
import { ArrowLeft, Clock } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { SearchBar } from "@/components/ui/SearchBar";
import { ShopCard } from "@/components/ui/ShopCard";
import { mockShops, mockProducts } from "@/data/mockData";

const recentSearches = ["Boutique", "Electronics", "Sweets", "Cafe"];

const SearchPage = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");

  const filteredShops = query
    ? mockShops.filter(
        shop =>
          shop.name.toLowerCase().includes(query.toLowerCase()) ||
          shop.category.toLowerCase().includes(query.toLowerCase())
      )
    : [];

  const filteredProducts = query
    ? mockProducts.filter(
        product =>
          product.name.toLowerCase().includes(query.toLowerCase()) ||
          product.category.toLowerCase().includes(query.toLowerCase())
      )
    : [];

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
                  onClick={() => setQuery(term)}
                  className="flex items-center gap-2 px-3 py-2 rounded-full bg-secondary text-secondary-foreground text-sm"
                >
                  <Clock className="w-3.5 h-3.5" />
                  {term}
                </button>
              ))}
            </div>
          </div>
        ) : (
          /* Search results */
          <div className="space-y-6">
            {filteredShops.length > 0 && (
              <section>
                <h3 className="text-sm font-medium text-muted-foreground mb-3">
                  Shops ({filteredShops.length})
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {filteredShops.map((shop) => (
                    <ShopCard
                      key={shop.id}
                      id={shop.id}
                      name={shop.name}
                      image={shop.image}
                      rating={shop.rating}
                      category={shop.category}
                    />
                  ))}
                </div>
              </section>
            )}

            {filteredProducts.length > 0 && (
              <section>
                <h3 className="text-sm font-medium text-muted-foreground mb-3">
                  Products ({filteredProducts.length})
                </h3>
                <div className="space-y-2">
                  {filteredProducts.map((product) => (
                    <Link
                      key={product.id}
                      to={`/product/${product.id}`}
                      className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border/50"
                    >
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-16 h-16 rounded-lg object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium truncate">{product.name}</h4>
                        <p className="text-primary font-semibold">
                          ₹{product.price.toLocaleString()}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {filteredShops.length === 0 && filteredProducts.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">
                  No results found for "{query}"
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default SearchPage;
