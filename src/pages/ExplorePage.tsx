import { useState } from "react";
import { Filter } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { CategorySlider } from "@/components/ui/CategorySlider";
import { ShopCard } from "@/components/ui/ShopCard";
import { mockShops } from "@/data/mockData";

const ExplorePage = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>();

  const filteredShops = selectedCategory
    ? mockShops.filter(shop => 
        shop.category.toLowerCase().includes(selectedCategory.toLowerCase())
      )
    : mockShops;

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
          onSelect={(id) => setSelectedCategory(id === selectedCategory ? undefined : id)}
        />

        {/* Results count */}
        <p className="text-sm text-muted-foreground">
          {filteredShops.length} shops found
        </p>

        {/* Shop grid */}
        <div className="grid grid-cols-2 gap-3">
          {filteredShops.map((shop) => (
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

        {filteredShops.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No shops found in this category</p>
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default ExplorePage;
