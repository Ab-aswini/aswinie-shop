import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { MapPin, ChevronRight, Sparkles, TrendingUp } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { SearchBar } from "@/components/ui/SearchBar";
import { CategorySlider } from "@/components/ui/CategorySlider";
import { ShopCard } from "@/components/ui/ShopCard";
import { mockShops } from "@/data/mockData";

const HomePage = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<string>();

  const featuredShops = mockShops.slice(0, 4);
  const nearbyShops = mockShops.slice(2, 6);

  return (
    <AppLayout>
      <div className="px-4 py-4 space-y-6">
        {/* Location indicator */}
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium">Bhubaneswar</span>
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
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
          <div className="grid grid-cols-2 gap-3">
            {featuredShops.map((shop) => (
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
          <div className="grid grid-cols-2 gap-3">
            {nearbyShops.map((shop) => (
              <ShopCard
                key={shop.id}
                id={shop.id}
                name={shop.name}
                image={shop.image}
                rating={shop.rating}
                category={shop.category}
                location={shop.location}
              />
            ))}
          </div>
        </section>
      </div>
    </AppLayout>
  );
};

export default HomePage;
