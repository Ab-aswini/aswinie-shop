import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { MapPin, ChevronRight, Sparkles, TrendingUp, Store as StoreIcon } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { SearchBar } from "@/components/ui/SearchBar";
import { CategorySlider } from "@/components/ui/CategorySlider";
import { ShopCard } from "@/components/ui/ShopCard";
import { useVendors } from "@/hooks/useVendors";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

const HomePage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<string>();

  const { data: vendors, isLoading } = useVendors({ limit: 8 });
  
  const featuredShops = vendors?.slice(0, 4) || [];
  const nearbyShops = vendors?.slice(0, 4) || [];

  return (
    <AppLayout>
      <div className="px-4 py-4 space-y-6">
        {/* Location indicator */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">Bhubaneswar</span>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </div>
          {!user && (
            <Link to="/auth">
              <Button variant="outline" size="sm">Login</Button>
            </Link>
          )}
        </div>

        {/* Search bar */}
        <SearchBar onFocus={() => navigate("/search")} />

        {/* Categories */}
        <section>
          <h2 className="text-lg font-semibold mb-3">Browse Categories</h2>
          <CategorySlider 
            selected={selectedCategory} 
            onSelect={setSelectedCategory} 
          />
        </section>

        {/* Vendor Registration CTA */}
        {user && (
          <Link to="/vendor/register">
            <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-2xl p-4 border border-primary/20">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                  <StoreIcon className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">Own a shop?</h3>
                  <p className="text-sm text-muted-foreground">Register and reach more customers</p>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </div>
            </div>
          </Link>
        )}

        {/* Featured Shops */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-accent" />
              <h2 className="text-lg font-semibold">Featured Shops</h2>
            </div>
            <Link 
              to="/explore" 
              className="text-sm text-primary font-medium flex items-center gap-1"
            >
              See all
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          
          {isLoading ? (
            <div className="grid grid-cols-2 gap-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="aspect-[4/3] rounded-xl" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              ))}
            </div>
          ) : featuredShops.length > 0 ? (
            <div className="grid grid-cols-2 gap-3">
              {featuredShops.map((shop) => (
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
            <div className="text-center py-8 text-muted-foreground">
              <StoreIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No shops available yet</p>
              <p className="text-sm">Be the first to register!</p>
            </div>
          )}
        </section>

        {/* Nearby Shops */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold">Shops Near You</h2>
            </div>
            <Link 
              to="/explore" 
              className="text-sm text-primary font-medium flex items-center gap-1"
            >
              See all
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          
          {isLoading ? (
            <div className="grid grid-cols-2 gap-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="aspect-[4/3] rounded-xl" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              ))}
            </div>
          ) : nearbyShops.length > 0 ? (
            <div className="grid grid-cols-2 gap-3">
              {nearbyShops.map((shop) => (
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
          ) : null}
        </section>
      </div>
    </AppLayout>
  );
};

export default HomePage;
